import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
}

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    console.log('Session:', session);

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log('User from DB:', user);

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      });
    }

    // Return user with default role if not set
    const userWithRole: UserWithRole = {
      ...user,
      role: (user as Partial<UserWithRole>).role || 'CASHIER', // Default to CASHIER if no role
    };
    
    return new Response(JSON.stringify(userWithRole), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), {
      status: 500,
    });
  }
}
