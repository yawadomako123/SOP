'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name || name.trim() === '') {
    return;
  }

  try {
    await prisma.category.create({
      data: { name: name.trim() },
    });
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products/new');
  } catch (error: any) {
    console.error('Failed to create category', error);
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products/new');
  } catch (error: any) {
    console.error('Failed to delete category', error);
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string;

  if (!name || name.trim() === '') {
    return;
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/admin/products/new');
  } catch (error: any) {
    console.error('Failed to update category', error);
  }
}
