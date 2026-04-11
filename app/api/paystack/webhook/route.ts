import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const signature = headersList.get('x-paystack-signature');
    const body = await req.text();

    // Verify the webhook is actually from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    const event = JSON.parse(body);

    // Only handle successful charges
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const metadata = event.data.metadata;

      // Guard: check if a sale with this reference already exists (prevent duplicates)
      const existingSale = await prisma.sale.findFirst({
        where: { paystackRef: reference },
      });

      if (existingSale) {
        // Already processed — just ensure status is 'paid'
        if (existingSale.paymentStatus !== 'paid') {
          await prisma.sale.update({
            where: { id: existingSale.id },
            data: { paymentStatus: 'paid' },
          });
        }
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Create the sale record from metadata
      if (metadata?.items && metadata?.userId) {
        const items = JSON.parse(metadata.items);

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

        // Decrement stock for each item
        for (const item of items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        console.log(`[Webhook] Sale ${sale.id} created from Paystack ref ${reference}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook failed' }), { status: 500 });
  }
}
