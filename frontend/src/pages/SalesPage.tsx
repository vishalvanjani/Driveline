import { useEffect, useState } from 'react';
import { BadgeDollarSign, Download, Search, RefreshCw, Car, Calendar, User } from 'lucide-react';
import { api } from '../api/client';
import type { SaleRecord } from '../types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function SalesPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSales();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve sales records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSales();
  }, []);

  const filteredSales = sales.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.vehicleMake.toLowerCase().includes(q) ||
      s.vehicleModel.toLowerCase().includes(q) ||
      s.buyerEmail.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.pricePaid, 0);
  const avgSale = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0;

  const exportCsv = () => {
    if (sales.length === 0) return;
    const headers = ['Sale ID', 'Vehicle Make', 'Vehicle Model', 'Category', 'Price Paid (USD)', 'Buyer Email', 'Date'];
    const rows = sales.map((s) => [
      s.id,
      s.vehicleMake,
      s.vehicleModel,
      s.vehicleCategory,
      s.pricePaid,
      s.buyerEmail,
      new Date(s.createdAt).toISOString(),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `driveline_sales_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Customer Sales Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified transactional purchase audit trail linking inventory and user accounts
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={sales.length === 0}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Realized Revenue</span>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{money.format(totalRevenue)}</p>
          <span className="text-[10px] text-slate-500">From customer sales</span>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Completed Transactions</span>
          <p className="mt-1 text-2xl font-bold text-slate-100">{sales.length}</p>
          <span className="text-[10px] text-slate-500">Atomic purchase receipts</span>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Average Transaction Size</span>
          <p className="mt-1 text-2xl font-bold text-amber-300">{money.format(avgSale)}</p>
          <span className="text-[10px] text-slate-500">Gross deal volume</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
            placeholder="Search by buyer email, vehicle model, or invoice ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={fetchSales}
          className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
          title="Refresh Ledger"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw size={16} className="animate-spin text-amber-400" />
            <span>Loading ledger records...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6 text-center text-xs text-rose-300">
          {error}
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/30 p-8 text-center">
          <BadgeDollarSign size={36} className="text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">No transactions recorded</h3>
          <p className="text-xs text-slate-500 mt-1">Purchases executed in inventory will appear in this ledger.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-4 py-3.5">Vehicle Acquired</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Sale Price</th>
                  <th className="px-4 py-3.5">Customer / Buyer</th>
                  <th className="px-5 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                      #{s.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-100 flex items-center gap-1.5">
                      <Car size={13} className="text-amber-400 shrink-0" />
                      <span>{s.vehicleMake} {s.vehicleModel}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        {s.vehicleCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400 text-sm">
                      {money.format(s.pricePaid)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-500" />
                        <span>{s.buyerEmail}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[11px] text-slate-400">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar size={11} className="text-slate-500" />
                        <span>{new Date(s.createdAt).toLocaleString()}</span>
                      </div>
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
