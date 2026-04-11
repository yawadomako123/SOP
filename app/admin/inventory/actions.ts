'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function restockProduct(productId: string, amount: number) {
  if (!productId || amount <= 0 || isNaN(amount)) {
    return { error: 'Invalid restock amount.' };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: { increment: amount },
      },
    });

    // Revalidate paths to instantly refresh cache across all related dashboards automatically
    revalidatePath('/admin/inventory');
    revalidatePath('/manager/reports');
    revalidatePath('/cashier');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to restock product:', error);
    return { error: 'Failed to complete the restock operation.' };
  }
}
