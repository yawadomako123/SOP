import "dotenv/config";
import { prisma } from "../lib/prisma";
const productsData = [
  { id: 'PROD-001', name: 'Wireless Headphones', category: 'Electronics', quantity: 120, price: 150.00, barcode: "100000000001" },
  { id: 'PROD-002', name: 'Coffee Maker', category: 'Appliances', quantity: 30, price: 85.50, barcode: "100000000002" },
  { id: 'PROD-003', name: 'Running Shoes', category: 'Apparel', quantity: 45, price: 120.99, barcode: "100000000003" },
  { id: 'PROD-004', name: 'Smart Watch', category: 'Electronics', quantity: 200, price: 299.00, barcode: "100000000004" },
  { id: 'PROD-005', name: 'Water Bottle', category: 'Accessories', quantity: 2, price: 25.00, barcode: "100000000005" }, // Low stock
  { id: 'PROD-006', name: 'Yoga Mat', category: 'Fitness', quantity: 55, price: 35.50, barcode: "100000000006" },
  { id: 'PROD-007', name: 'Desk Lamp', category: 'Home', quantity: 4, price: 45.00, barcode: "100000000007" }, // Low stock
  { id: 'PROD-008', name: 'Mechanical Keyboard', category: 'Electronics', quantity: 25, price: 89.99, barcode: "100000000008" },
  { id: 'PROD-009', name: 'Ergonomic Mouse', category: 'Electronics', quantity: 40, price: 59.99, barcode: "100000000009" },
  { id: 'PROD-010', name: 'Noise Cancelling Earbuds', category: 'Electronics', quantity: 15, price: 119.50, barcode: "100000000010" },
  { id: 'PROD-011', name: 'Blender', category: 'Appliances', quantity: 22, price: 49.99, barcode: "100000000011" },
  { id: 'PROD-012', name: 'Microwave Oven', category: 'Appliances', quantity: 10, price: 145.00, barcode: "100000000012" },
  { id: 'PROD-013', name: 'Cotton T-Shirt', category: 'Apparel', quantity: 100, price: 15.00, barcode: "100000000013" },
  { id: 'PROD-014', name: 'Denim Jeans', category: 'Apparel', quantity: 60, price: 45.00, barcode: "100000000014" },
  { id: 'PROD-015', name: 'Backpack', category: 'Accessories', quantity: 3, price: 65.00, barcode: "100000000015" }, // Low stock
  { id: 'PROD-016', name: 'Dumbbell Set', category: 'Fitness', quantity: 12, price: 80.00, barcode: "100000000016" },
  { id: 'PROD-017', name: 'Office Chair', category: 'Home', quantity: 7, price: 199.99, barcode: "100000000017" },
  { id: 'PROD-018', name: 'Standing Desk', category: 'Home', quantity: 5, price: 350.00, barcode: "100000000018" }, // Low stock
  { id: 'PROD-019', name: 'Notebook', category: 'Stationery', quantity: 150, price: 5.50, barcode: "100000000019" },
  { id: 'PROD-020', name: 'Gel Pens (Pack of 10)', category: 'Stationery', quantity: 85, price: 12.00, barcode: "100000000020" }
];

const usersData = [
  { id: 'USR-ADMIN', name: 'Admin User', email: 'admin@shoprite.com', role: 'ADMIN' as const, emailVerified: true },
  { id: 'USR-MANAGER', name: 'Manager User', email: 'manager@shoprite.com', role: 'MANAGER' as const, emailVerified: true },
  { id: 'USR-CASHIER', name: 'Cashier User', email: 'cashier@shoprite.com', role: 'CASHIER' as const, emailVerified: true }
];

async function main() {
  console.log("Starting comprehensive database seed...");

  // 1. Clear existing data to prevent duplicates (cascades or deleteMany in order)
  console.log("Cleaning up existing data...");
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.product.deleteMany({});
  
  // NOTE: Better-Auth users might have Cascade relations to Session/Account, but we'll try standard delete
  // We'll just delete the 3 specific users we create to avoid destroying real accounts if any existed
  await prisma.user.deleteMany({
    where: {
      email: { in: usersData.map(u => u.email) }
    }
  });

  // 2. Seed Users
  console.log("Seeding Users...");
  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    createdUsers.push(user);
    console.log(`- Created User: ${user.name} (${user.role})`);
  }

  // 3. Seed Products
  console.log("\nSeeding Products...");
  const createdProducts = [];
  for (const p of productsData) {
    const product = await prisma.product.create({ data: p });
    createdProducts.push(product);
  }
  console.log(`- Created ${createdProducts.length} Products`);

  // 4. Seed Sales
  console.log("\nSeeding Sales...");
  const pastDays = 7;
  const numSales = 35; // Generate 35 sales over the last 7 days
  const now = new Date();
  
  // Only Cashier and Manager should make sales usually
  const saleUsers = [createdUsers[1], createdUsers[2]];

  let totalSalesGenerated = 0;

  for (let i = 0; i < numSales; i++) {
    // Generate a random date within the last 7 days
    const randomDaysAgo = Math.random() * pastDays;
    const saleDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
    
    // Pick a random user
    const randomUser = saleUsers[Math.floor(Math.random() * saleUsers.length)];

    // Determine how many items in this sale (1 to 4)
    const numItems = Math.floor(Math.random() * 4) + 1;
    
    // Pick random products for the sale
    const saleItems = [];
    let totalAmount = 0;
    
    // We'll shuffle the products array to pick random distinct ones
    const shuffledProducts = [...createdProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffledProducts.slice(0, numItems);

    for (const product of selectedProducts) {
      const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 of this item
      const price = product.price;
      saleItems.push({
        productId: product.id,
        quantity,
        price
      });
      totalAmount += price * quantity;
    }

    // Create the Sale and SaleItems in a transaction using nested create
    await prisma.sale.create({
      data: {
        totalAmount,
        createdAt: saleDate,
        userId: randomUser.id,
        items: {
          create: saleItems
        }
      }
    });

    totalSalesGenerated++;
  }

  console.log(`- Created ${totalSalesGenerated} Sales with nested SaleItems`);
  console.log("\n✅ Comprehensive Seeding finished successfully.");
}

main()
  .then(async () => {
    // We explicitly exit so the connection pool does not hang the process
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Seeding failed:");
    console.error(e);
    process.exit(1);
  });
