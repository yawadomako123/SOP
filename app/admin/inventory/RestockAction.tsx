'use client';

import { useState, useTransition } from 'react';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { restockProduct } from './actions';

export default function RestockAction({ productId }: { productId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const qty = parseInt(amount, 10);
    if (!qty || qty <= 0) return;

    startTransition(async () => {
      const res = await restockProduct(productId, qty);
      if (res?.error) {
        alert(res.error);
      } else {
        setIsEditing(false);
        setAmount('');
      }
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Qty"
          min="1"
          className="w-16 h-8 px-2 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          autoFocus
          onKeyDown={(e) => {
             if(e.key === 'Enter') handleSave();
             if(e.key === 'Escape') setIsEditing(false);
          }}
        />
        <button 
          onClick={handleSave}
          disabled={isPending || !amount || parseInt(amount, 10) <= 0}
          className="flex items-center justify-center p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50 shadow-sm"
          title="Confirm Restock"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button 
          onClick={() => { setIsEditing(false); setAmount(''); }}
          disabled={isPending}
          className="flex items-center justify-center p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 shadow-sm"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-semibold text-xs rounded-lg hover:bg-primary hover:text-white transition-colors shadow-sm whitespace-nowrap"
    >
      <Plus className="w-3.5 h-3.5" />
      <span>Restock</span>
    </button>
  );
}
