import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  PackageCheck,
  BadgeDollarSign,
  DollarSign,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import type { ActivityItem, DashboardKpis } from '../types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function OverviewPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpisData, activitiesData] = await Promise.all([api.getKpis(), api.getActivity()]);
      setKpis(kpisData);
      setActivities(activitiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw size={20} className="animate-spin text-amber-400" />
          <span className="text-sm">Calculating dealership metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-6 text-center text-rose-300">
        <p className="text-sm">{error ?? 'Unable to retrieve dashboard figures'}</p>
        <button
          onClick={fetchData}
          className="mt-3 rounded-lg bg-rose-900/60 px-4 py-2 text-xs font-semibold hover:bg-rose-800"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate percentage of healthy vs low vs out of stock
  const totalStockItems = kpis.totalVehicles || 1;
  const inStockCount = Math.max(0, kpis.totalVehicles - kpis.lowStockCount - kpis.outOfStockCount);
  const inStockPct = Math.round((inStockCount / totalStockItems) * 100);
  const lowStockPct = Math.round((kpis.lowStockCount / totalStockItems) * 100);
  const outOfStockPct = Math.round((kpis.outOfStockCount / totalStockItems) * 100);

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Inventory Value */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Inventory Value</span>
            <DollarSign size={16} className="text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-100">{money.format(kpis.totalInventoryValue)}</p>
          <span className="mt-1 block text-[11px] text-slate-400">Across {kpis.availableVehicles} units</span>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-400">{money.format(kpis.totalRevenue)}</p>
          <span className="mt-1 block text-[11px] text-slate-400">Customer sales</span>
        </div>

        {/* Units Sold */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Units Sold</span>
            <BadgeDollarSign size={16} className="text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-100">{kpis.unitsSold}</p>
          <span className="mt-1 block text-[11px] text-slate-400">Completed purchases</span>
        </div>

        {/* Available Stock */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Available Units</span>
            <PackageCheck size={16} className="text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-100">{kpis.availableVehicles}</p>
          <span className="mt-1 block text-[11px] text-slate-400">Ready for delivery</span>
        </div>

        {/* Catalogue Models */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Catalogue Models</span>
            <Car size={16} className="text-slate-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-100">{kpis.totalVehicles}</p>
          <span className="mt-1 block text-[11px] text-slate-400">Distinct vehicle lines</span>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Low Stock (&le;{kpis.lowStockThreshold})</span>
            <AlertTriangle size={16} className={kpis.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-500'} />
          </div>
          <p className="mt-2 text-xl font-bold text-amber-300">{kpis.lowStockCount}</p>
          <span className="mt-1 block text-[11px] text-slate-400">
            {kpis.outOfStockCount > 0 ? `${kpis.outOfStockCount} sold out` : 'Action required'}
          </span>
        </div>
      </div>

      {/* Charts & Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category Breakdown Chart */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Category Distribution & Stock Valuation</h2>
              <p className="text-xs text-slate-400">Calculated directly from real inventory assets</p>
            </div>
            <Link to="/inventory" className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:underline">
              Inventory <ArrowRight size={12} />
            </Link>
          </div>

          {kpis.categoryDistribution.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-500">No category records found in database.</p>
          ) : (
            <div className="space-y-4">
              {kpis.categoryDistribution.map((cat) => {
                const pct =
                  kpis.totalInventoryValue > 0
                    ? Math.round((cat.inventoryValue / kpis.totalInventoryValue) * 100)
                    : 0;
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat.category}</span>
                      <span className="text-slate-400">
                        {cat.totalStock} units · {money.format(cat.inventoryValue)} ({pct}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stock Health Multi-segment Bar */}
          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Fleet Stock Health</span>
              <span className="text-[11px] text-slate-400">
                {inStockCount} Healthy · {kpis.lowStockCount} Low (&le;{kpis.lowStockThreshold}) · {kpis.outOfStockCount} Sold Out
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${inStockPct}%` }}
                title={`In Stock: ${inStockPct}%`}
              />
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{ width: `${lowStockPct}%` }}
                title={`Low Stock: ${lowStockPct}%`}
              />
              <div
                className="bg-rose-500 transition-all duration-500"
                style={{ width: `${outOfStockPct}%` }}
                title={`Out of Stock: ${outOfStockPct}%`}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> In Stock ({inStockPct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Low Stock ({lowStockPct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Sold Out ({outOfStockPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Top Selling Models */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Flame size={15} className="text-amber-400" /> Top Selling Models
              </h2>
              <p className="text-xs text-slate-400">Ranked by sales volume</p>
            </div>
            <Link to="/sales" className="text-xs font-medium text-amber-400 hover:underline">
              Ledger
            </Link>
          </div>

          {kpis.topSellingModels.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-slate-500">
              <Car size={32} className="mb-2 opacity-30" />
              <p className="text-xs">No sales recorded yet.</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Purchases will rank here automatically.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {kpis.topSellingModels.map((item, idx) => (
                <div key={item.vehicleId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-800 text-xs font-bold text-amber-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-100">
                        {item.make} {item.model}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">{item.unitsSold} sold</span>
                    <span className="block text-[10px] text-slate-400">{money.format(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Recent Activity Log Feed */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">Recent Dealership Activity</h2>
          </div>
          <span className="text-xs text-slate-400">Database Event Stream</span>
        </div>

        {activities.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">No operations logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {activities.slice(0, 6).map((act) => {
              const getBadge = (action: string) => {
                switch (action) {
                  case 'PURCHASED':
                    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  case 'RESTOCKED':
                    return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
                  case 'CREATED':
                    return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
                  case 'DELETED':
                    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  default:
                    return 'bg-slate-800 text-slate-300 border-slate-700';
                }
              };

              return (
                <div key={act.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getBadge(act.action)}`}>
                      {act.action}
                    </span>
                    <span className="text-xs text-slate-200">{act.details}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(act.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
