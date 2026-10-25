import { useEffect, useState } from 'react';
import { BarChart3, PieChart, TrendingUp, DollarSign, Package, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import type { DashboardKpis } from '../types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function AnalyticsPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getKpis();
        setKpis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw size={16} className="animate-spin text-amber-400" />
          <span>Computing financial and fleet metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6 text-center text-xs text-rose-300">
        {error ?? 'Analytics data unavailable'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Dealership Analytics</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time capital distribution, category weighting, and sales velocity
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-amber-400">
            <DollarSign size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Fleet Valuation</span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-100">{money.format(kpis.totalInventoryValue)}</p>
          <span className="text-xs text-slate-500">Total tied capital in inventory</span>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Realized Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">{money.format(kpis.totalRevenue)}</p>
          <span className="text-xs text-slate-500">From {kpis.unitsSold} customer purchases</span>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Package size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Turnaround Status</span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-100">{kpis.availableVehicles} in stock</p>
          <span className="text-xs text-slate-500">
            {kpis.lowStockCount} models below &le;{kpis.lowStockThreshold} units threshold
          </span>
        </div>
      </div>

      {/* Category Breakdown Deep Dive */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-amber-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100">Category Capital Allocation</h2>
            <p className="text-xs text-slate-400">Portfolio weighting by vehicle market segment</p>
          </div>
        </div>

        <div className="space-y-4">
          {kpis.categoryDistribution.map((cat) => {
            const pct =
              kpis.totalInventoryValue > 0
                ? Math.round((cat.inventoryValue / kpis.totalInventoryValue) * 100)
                : 0;
            return (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{cat.category}</span>
                    <span className="text-[11px] text-slate-500">({cat.modelCount} models · {cat.totalStock} units)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{money.format(cat.inventoryValue)}</span>
                    <span className="font-bold text-amber-400">({pct}%)</span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
