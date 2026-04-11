'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createProduct } from '../actions';
import { Save, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useHardwareScanner } from '@/components/hooks/useHardwareScanner';

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), {
  ssr: false,
});

interface Category {
  id: string;
  name: string;
}

export default function AddProductForm({ categories }: { categories: Category[] }) {
  const [state, action, isPending] = useActionState(createProduct, null);
  const [barcode, setBarcode] = useState('');

  // Hardware scanner fills the barcode field automatically
  useHardwareScanner((code) => setBarcode(code));

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">Product Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            placeholder="e.g. Cola 500ml"
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
        </div>
        
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-2">Category</label>
          <select 
            id="categoryId" 
            name="categoryId" 
            required 
            defaultValue=""
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow appearance-none"
          >
            <option value="" disabled>Select a category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">Price (GH₵)</label>
            <input 
              type="number" 
              id="price" 
              name="price" 
              step="0.01" 
              min="0"
              required 
              placeholder="0.00"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-2">Stock Quantity</label>
            <input 
              type="number" 
              id="quantity" 
              name="quantity" 
              min="0"
              required 
              placeholder="0"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
          </div>
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium mb-2">Barcode (SKU)</label>
          {/* Camera button + text input share the same controlled value; name attr preserved for server action */}
          <div className="flex gap-2 items-stretch">
            <input 
              type="text" 
              id="barcode" 
              name="barcode" 
              required 
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type barcode"
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono transition-shadow"
            />
            <BarcodeScanner
              onScan={(code) => setBarcode(code)}
              buttonVariant="icon"
              buttonClassName="px-4 border border-border rounded-lg bg-background hover:bg-secondary"
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Use a hardware scanner, click the camera icon, or type manually.
          </p>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-border flex items-center justify-end gap-3">
        <button 
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2.5 text-sm font-medium hover:bg-secondary border border-transparent rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[150px]"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isPending ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
