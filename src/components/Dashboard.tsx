import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Loader2, Trash2, ListChecks } from 'lucide-react';
import type { User, Grocery, GroceryInput } from '@/lib/types';
import {
  listGroceries,
  createGrocery,
  updateGrocery,
  deleteGrocery,
} from '@/lib/api';
import Navbar from './Navbar';
import StatsBar from './StatsBar';
import GroceryCard from './GroceryCard';
import GroceryFormModal from './GroceryFormModal';

type Props = {
  user: User;
  onLogout: () => void;
};

type Filter = 'all' | 'pending' | 'purchased';

export default function Dashboard({ user, onLogout }: Props) {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Grocery | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [clearConfirm, setClearConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listGroceries(user.id);
      setGroceries(items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Grocery) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (input: GroceryInput) => {
    if (editing) {
      const updated = await updateGrocery(editing.id, input);
      if (updated) {
        setGroceries((prev) =>
          prev.map((g) => (g.id === updated.id ? updated : g))
        );
      }
    } else {
      const created = await createGrocery(user.id, input);
      setGroceries((prev) => [created, ...prev]);
    }
  };

  const handleToggle = async (item: Grocery) => {
    const updated = await updateGrocery(item.id, { purchased: !item.purchased });
    if (updated) {
      setGroceries((prev) =>
        prev.map((g) => (g.id === updated.id ? updated : g))
      );
    }
  };

  const handleDelete = async (id: number) => {
    await deleteGrocery(id);
    setGroceries((prev) => prev.filter((g) => g.id !== id));
  };

  const handleClearPurchased = async () => {
    const purchased = groceries.filter((g) => g.purchased);
    await Promise.all(purchased.map((g) => deleteGrocery(g.id)));
    setGroceries((prev) => prev.filter((g) => !g.purchased));
    setClearConfirm(false);
  };

  const filtered = useMemo(() => {
    return groceries.filter((g) => {
      if (filter === 'pending' && g.purchased) return false;
      if (filter === 'purchased' && !g.purchased) return false;
      if (
        search &&
        !g.name.toLowerCase().includes(search.toLowerCase()) &&
        !g.category.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [groceries, filter, search]);

  const purchasedCount = groceries.filter((g) => g.purchased).length;

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Welcome back, {user.name.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your grocery list and track your shopping.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsBar groceries={groceries} />
        </div>

        {/* Controls */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none backdrop-blur-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filters */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              {(['all', 'pending', 'purchased'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                    filter === f
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Add button */}
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-105 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Clear purchased bar */}
        {purchasedCount > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5">
            <p className="text-sm font-medium text-emerald-700">
              {purchasedCount} item{purchasedCount > 1 ? 's' : ''} purchased
            </p>
            {clearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Clear all?</span>
                <button
                  onClick={handleClearPurchased}
                  className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setClearConfirm(false)}
                  className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Clear purchased
              </button>
            )}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="mt-3 text-sm text-slate-400">Loading your list...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <ListChecks className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-700">
              {groceries.length === 0
                ? 'Your grocery list is empty'
                : 'No items match your filters'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {groceries.length === 0
                ? 'Start by adding your first item.'
                : 'Try a different search or filter.'}
            </p>
            {groceries.length === 0 && (
              <button
                onClick={handleAdd}
                className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-105"
              >
                <Plus className="h-5 w-5" />
                Add your first item
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <GroceryCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <GroceryFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
