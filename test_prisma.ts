import { PrismaClient } from './lib/generated/prisma';

const prisma = new PrismaClient();
async function main() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const users = await prisma.user.findMany({
      include: {
        sales: {
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            }
          }
        }
      },
      orderBy: { role: 'asc' }
    });
    console.log("Success", users.length);
  } catch (e: any) {
    console.error("Prisma Error:");
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
