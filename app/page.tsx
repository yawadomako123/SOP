'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace('/auth/sign-in');
      return;
    }

    const user = session.user as any;

    if (user.status === 'PENDING') {
      router.replace('/account/pending');
      return;
    }

    const role = (user.role as string)?.toLowerCase();
    if (role === 'admin') {
      router.replace('/admin');
    } else if (role === 'manager') {
      router.replace('/manager');
    } else {
      router.replace('/cashier');
    }
  }, [session, isPending, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}
