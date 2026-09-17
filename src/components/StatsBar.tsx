import { Package, CheckCircle2, DollarSign, ShoppingCart } from 'lucide-react';
import type { Grocery } from '@/lib/types';

type Props = {
  groceries: Grocery[];
};

export default function StatsBar({ groceries }: Props) {
  const total = groceries.length;
  const purchased = groceries.filter((g) => g.purchased).length;
  const pending = total - purchased;
  const totalCost = groceries
    .reduce((sum, g) => sum + g.price * g.quantity, 0);

  const cards = [
    {
      label: 'Total Items',
      value: total,
      icon: <Package className="h-5 w-5" />,
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      label: 'To Buy',
      value: pending,
      icon: <ShoppingCart className="h-5 w-5" />,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      label: 'Purchased',
      value: purchased,
      icon: <CheckCircle2 className="h-5 w-5" />,
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      label: 'Total Cost',
      value: `$${totalCost.toFixed(2)}`,
      icon: <DollarSign className="h-5 w-5" />,
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.text}`}
            >
              {card.icon}
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-800">{card.value}</p>
          <p className="text-xs font-medium text-slate-500">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
