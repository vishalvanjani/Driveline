import { useEffect, useState } from 'react';
import { Users, Search, RefreshCw, ShieldAlert, ShoppingBag, DollarSign } from 'lucide-react';
import { api } from '../api/client';
import type { CustomerSummary } from '../types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve customer accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => c.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Customer Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered dealership client accounts, authorization roles and lifetime purchase values
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
            placeholder="Search by customer email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={fetchCustomers}
          className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
          title="Refresh Customer List"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw size={16} className="animate-spin text-amber-400" />
            <span>Loading customer directory...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6 text-center text-xs text-rose-300">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Customer Identity</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Vehicles Purchased</th>
                  <th className="px-4 py-3.5">Total Spend</th>
                  <th className="px-5 py-3.5 text-right">Account Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-medium text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300">
                          {c.email.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-100">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.role === 'ADMIN'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {c.role === 'ADMIN' && <ShieldAlert size={10} />}
                        {c.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag size={13} className="text-slate-400" />
                        <span>{c.purchaseCount} vehicles</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign size={13} className="text-emerald-500" />
                        <span>{money.format(c.totalSpent)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[11px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
