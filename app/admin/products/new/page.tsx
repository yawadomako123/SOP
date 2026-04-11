import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AddProductForm from './AddProductForm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground mt-1">Register a new item into the store catalog</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
        <AddProductForm categories={categories} />
      </div>
    </div>
  );
}
