import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { reference } = await params;

    // Check if sale already exists for this reference
    const existingSale = await prisma.sale.findFirst({
      where: { paystackRef: reference },
    });

    if (existingSale) {
      return new Response(JSON.stringify({
        verified: true,
        status: existingSale.paymentStatus,
        saleId: existingSale.id,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Call Paystack Verify API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return new Response(JSON.stringify({
        verified: false,
        status: 'pending',
        paystackStatus: paystackData.data?.status || 'unknown',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Payment confirmed — create the sale from metadata
    const metadata = paystackData.data.metadata;

    if (!metadata?.items || !metadata?.userId) {
      return new Response(JSON.stringify({
        error: 'Missing metadata in Paystack response',
      }), { status: 400 });
    }

    const items = typeof metadata.items === 'string'
      ? JSON.parse(metadata.items)
      : metadata.items;

    const sale = await prisma.sale.create({
      data: {
        totalAmount: parseFloat(metadata.total),
        paymentMethod: metadata.paymentMethod || 'card',
        paymentStatus: 'paid',
        paystackRef: reference,
        userId: metadata.userId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          })),
        },
      },
    });

    // Decrement stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    console.log(`[Verify] Sale ${sale.id} created from reference ${reference}`);

    return new Response(JSON.stringify({
      verified: true,
      status: 'paid',
      saleId: sale.id,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Verify error:', error);
    return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 500 });
  }
}
