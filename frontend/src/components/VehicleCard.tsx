import { Fuel, Gauge, Hash, Calendar, Sparkles } from 'lucide-react';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  busy?: boolean;
  lowStockThreshold?: number;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function VehicleCard({
  vehicle,
  isAdmin,
  busy = false,
  lowStockThreshold = 2,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
}: Props) {
  const soldOut = vehicle.quantity === 0;
  const isLowStock = !soldOut && vehicle.quantity <= lowStockThreshold;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-black/40">
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles size={11} />
              {vehicle.category}
            </span>
            <h3 className="mt-0.5 text-lg font-bold tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors">
              {vehicle.year ? `${vehicle.year} ` : ''}
              {vehicle.make} {vehicle.model}
            </h3>
          </div>

          {/* Stock Health Badge */}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              soldOut
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : isLowStock
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {soldOut ? 'Sold out' : isLowStock ? `Low stock (${vehicle.quantity})` : `${vehicle.quantity} in stock`}
          </span>
        </div>

        {/* Optional Specs Chips */}
        {(vehicle.fuelType || vehicle.mileage !== undefined || vehicle.vin) && (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
            {vehicle.fuelType && (
              <span className="flex items-center gap-1 rounded-md bg-slate-800/70 px-2 py-0.5">
                <Fuel size={11} /> {vehicle.fuelType}
              </span>
            )}
            {vehicle.mileage !== undefined && vehicle.mileage !== null && (
              <span className="flex items-center gap-1 rounded-md bg-slate-800/70 px-2 py-0.5">
                <Gauge size={11} /> {vehicle.mileage.toLocaleString()} mi
              </span>
            )}
            {vehicle.vin && (
              <span className="flex items-center gap-1 rounded-md bg-slate-800/70 px-2 py-0.5 font-mono text-[10px]">
                <Hash size={10} /> {vehicle.vin.slice(0, 8)}...
              </span>
            )}
          </div>
        )}

        {/* Price Display */}
        <div className="mt-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Drive-Away Price</span>
          <p className="text-2xl font-black text-amber-300">{money.format(vehicle.price)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 space-y-2.5">
        <button
          onClick={() => onPurchase(vehicle)}
          disabled={soldOut || busy}
          className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/10 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
        >
          {soldOut ? 'Sold out' : busy ? 'Processing Order…' : 'Purchase'}
        </button>

        {isAdmin && (
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-xs">
            <button
              onClick={() => onEdit?.(vehicle)}
              className="rounded-lg border border-slate-700 bg-slate-800/60 py-1.5 font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => onRestock?.(vehicle)}
              className="rounded-lg border border-slate-700 bg-slate-800/60 py-1.5 font-medium text-amber-300 transition hover:bg-slate-800"
            >
              Restock
            </button>
            <button
              onClick={() => onDelete?.(vehicle)}
              className="rounded-lg border border-rose-900/60 bg-rose-950/20 py-1.5 font-medium text-rose-300 transition hover:bg-rose-900/50 hover:text-rose-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
