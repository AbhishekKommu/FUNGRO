import { Check, Pencil, Trash2 } from 'lucide-react';
import type { Grocery } from '@/lib/types';

type Props = {
  item: Grocery;
  onToggle: (item: Grocery) => void;
  onEdit: (item: Grocery) => void;
  onDelete: (id: number) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  Fruits: 'bg-red-100 text-red-600',
  Vegetables: 'bg-green-100 text-green-600',
  Dairy: 'bg-blue-100 text-blue-600',
  'Meat & Fish': 'bg-rose-100 text-rose-600',
  Bakery: 'bg-amber-100 text-amber-600',
  Beverages: 'bg-cyan-100 text-cyan-600',
  Snacks: 'bg-orange-100 text-orange-600',
  Frozen: 'bg-sky-100 text-sky-600',
  Household: 'bg-violet-100 text-violet-600',
  Other: 'bg-slate-100 text-slate-600',
};

export default function GroceryCard({ item, onToggle, onEdit, onDelete }: Props) {
  const catColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other;

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-2xl border bg-white/80 p-3.5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md sm:p-4 ${
        item.purchased
          ? 'border-slate-200/40 opacity-60'
          : 'border-slate-200/60'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item)}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          item.purchased
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 bg-white hover:border-emerald-400'
        }`}
      >
        {item.purchased && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`truncate text-sm font-semibold ${
              item.purchased
                ? 'text-slate-400 line-through'
                : 'text-slate-800'
            }`}
          >
            {item.name}
          </h3>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${catColor}`}
          >
            {item.category}
          </span>
          <span className="text-xs text-slate-400">
            {item.quantity} {item.unit}
          </span>
          <span className="text-xs font-medium text-slate-500">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="hidden text-right sm:block">
        <p className="text-sm font-bold text-slate-700">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(item)}
          title="Edit"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          title="Delete"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
