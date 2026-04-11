'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const price = parseFloat(formData.get('price') as string);
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const barcode = formData.get('barcode') as string;

  if (!name || !categoryId || isNaN(price) || isNaN(quantity) || !barcode) {
    return { error: 'Please fill out all fields correctly.' };
  }

  try {
    await prisma.product.create({
      data: {
        name,
        categoryId,
        price,
        quantity,
        barcode,
      },
    });
  } catch (error: any) {
    console.error('Failed to create product:', error);
    if (error.code === 'P2002') {
      return { error: 'A product with this barcode already exists.' };
    }
    return { error: 'Failed to create product. Please try again.' };
  }

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function deleteProduct(productId: string) {
  if (!productId) {
    return { error: 'Product ID is required.' };
  }

  try {
    // Guard: block deletion if the product has been sold — it's part of sales history
    const salesCount = await prisma.saleItem.count({
      where: { productId },
    });

    if (salesCount > 0) {
      return {
        error: `Cannot delete — this product appears in ${salesCount} sale record(s). Set its quantity to 0 to hide it from the POS instead.`,
      };
    }

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    revalidatePath('/cashier');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete product:', error);
    return { error: 'Failed to delete the product. Please try again.' };
  }
}

