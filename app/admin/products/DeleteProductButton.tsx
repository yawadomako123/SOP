'use client';

import { useState, useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteProduct } from './actions';

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (res?.error) {
        alert(res.error);
      }
      setShowConfirm(false);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Delete &quot;{productName}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center justify-center px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="flex items-center justify-center px-2 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded hover:bg-secondary transition-colors disabled:opacity-50 shadow-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 font-semibold text-xs rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm whitespace-nowrap"
      title={`Delete ${productName}`}
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>Delete</span>
    </button>
  );
}
