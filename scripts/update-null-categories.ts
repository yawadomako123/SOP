import { prisma } from '../lib/prisma';

async function main() {
  const products: any[] = await prisma.$queryRaw`SELECT id, name FROM "product" WHERE "categoryId" IS NULL`;
  console.log(`Found ${products.length} products with null categoryId`);

  for (const product of products) {
    const categoryName = `Category - ${product.name} - ${product.id.substring(0, 5)}`;
    
    let category = await prisma.category.findUnique({
      where: { name: categoryName }
    });

    if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName }
        });
    }

    await prisma.$executeRaw`UPDATE "product" SET "categoryId" = ${category.id} WHERE id = ${product.id}`;
    console.log(`Updated product '${product.name}' with new category '${category.name}'`);
  }
  console.log('Done migrating null categories.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
