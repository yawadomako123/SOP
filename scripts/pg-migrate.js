const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, name FROM product WHERE "categoryId" IS NULL');
  console.log(`Found ${res.rows.length} products with null categoryId`);

  for (const product of res.rows) {
    const categoryName = `Category - ${product.name} - ${product.id.substring(0, 5)}`;
    
    // Check if category exists
    let catRes = await client.query('SELECT id FROM category WHERE name = $1', [categoryName]);
    let categoryId;
    
    if (catRes.rows.length === 0) {
      const id = 'cl' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
      const now = new Date();
      await client.query('INSERT INTO category (id, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4)', [id, categoryName, now, now]);
      categoryId = id;
    } else {
      categoryId = catRes.rows[0].id;
    }

    await client.query('UPDATE product SET "categoryId" = $1 WHERE id = $2', [categoryId, product.id]);
    console.log(`Updated product '${product.name}' with new category ID '${categoryId}'`);
  }
  
  await client.end();
  console.log('Migration complete.');
}

main().catch(err => {
    console.error(err);
    client.end();
});
