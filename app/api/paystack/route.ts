import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { amount, email, saleReference, items, userId, subtotal, tax, paymentMethod } = await req.json();

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || 'customer@EvansCouture.com',
        amount: Math.round(amount * 100), // Paystack uses pesewas
        reference: saleReference,
        currency: 'GHS',
        metadata: {
          items: JSON.stringify(items),
          userId,
          subtotal,
          tax,
          total: amount,
          paymentMethod: paymentMethod || 'card',
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return new Response(JSON.stringify({ error: 'Paystack error', details: data.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Paystack error:', error);
    return new Response(JSON.stringify({ error: 'Failed to initialize payment' }), { status: 500 });
  }
}
