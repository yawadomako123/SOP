import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        barcode: true,
        category: {
          select: { name: true }
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const mappedProducts = products.map(p => ({
      ...p,
      category: p.category?.name || 'Uncategorized',
    }));

    return new Response(JSON.stringify(mappedProducts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
    });
  }
}
