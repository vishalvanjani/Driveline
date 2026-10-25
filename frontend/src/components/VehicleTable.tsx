import { Sparkles, Fuel } from 'lucide-react';
import type { Vehicle } from '../types';

interface Props {
  vehicles: Vehicle[];
  isAdmin: boolean;
  busyId: string | null;
  lowStockThreshold?: number;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function VehicleTable({
  vehicles,
  isAdmin,
  busyId,
  lowStockThreshold = 2,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Vehicle Model</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Specification</th>
              <th className="px-4 py-3.5">Price</th>
              <th className="px-4 py-3.5">Inventory</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {vehicles.map((v) => {
              const soldOut = v.quantity === 0;
              const isLowStock = !soldOut && v.quantity <= lowStockThreshold;
              const isBusy = busyId === v.id;

              return (
                <tr key={v.id} className="transition-colors hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-medium text-slate-100">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-100">
                        {v.year ? `${v.year} ` : ''}
                        {v.make} {v.model}
                      </span>
                      {v.vin && <span className="font-mono text-[10px] text-slate-500">VIN: {v.vin}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                      <Sparkles size={10} />
                      {v.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    <div className="flex items-center gap-2">
                      {v.fuelType && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Fuel size={11} className="text-slate-500" /> {v.fuelType}
                        </span>
                      )}
                      {v.mileage !== undefined && v.mileage !== null && (
                        <span className="text-[11px]">{v.mileage.toLocaleString()} mi</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-amber-300 text-sm">
                    {money.format(v.price)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-200">
                    {v.quantity} units
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        soldOut
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isLowStock
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {soldOut ? 'Sold out' : isLowStock ? 'Low stock' : 'In stock'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onPurchase(v)}
                        disabled={soldOut || isBusy}
                        className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                      >
                        {soldOut ? 'Sold out' : isBusy ? 'Buying…' : 'Purchase'}
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEdit?.(v)}
                            className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onRestock?.(v)}
                            className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs text-amber-300 hover:bg-slate-800"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() => onDelete?.(v)}
                            className="rounded-lg border border-rose-900/60 bg-rose-950/20 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-900/50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
