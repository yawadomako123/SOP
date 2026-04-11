import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TransactionsClient from './TransactionsClient';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    redirect('/');
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sales = await prisma.sale.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: todayStart },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedSales = sales.map(s => ({
    id: s.id,
    totalAmount: s.totalAmount,
    paymentMethod: s.paymentMethod,
    paymentStatus: s.paymentStatus,
    createdAt: s.createdAt.toISOString(),
  }));

  return <TransactionsClient initialSales={serializedSales} />;
}
