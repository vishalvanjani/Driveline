import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  busy?: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function VehicleCard({ vehicle, isAdmin, busy = false, onPurchase, onEdit, onDelete, onRestock }: Props) {
  const soldOut = vehicle.quantity === 0;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{vehicle.category}</p>
          <h3 className="text-lg font-semibold">
            {vehicle.make} {vehicle.model}
          </h3>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            soldOut ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
          }`}
        >
          {soldOut ? 'Sold out' : `${vehicle.quantity} in stock`}
        </span>
      </div>

      <p className="text-2xl font-bold text-amber-300">{money.format(vehicle.price)}</p>

      <button
        onClick={() => onPurchase(vehicle)}
        disabled={soldOut || busy}
        className="rounded-md bg-amber-400 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
      >
        {soldOut ? 'Sold out' : busy ? 'Working…' : 'Purchase'}
      </button>

      {isAdmin && (
        <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-xs">
          <button onClick={() => onEdit?.(vehicle)} className="rounded-md border border-slate-700 py-1.5 hover:bg-slate-800">
            Edit
          </button>
          <button onClick={() => onRestock?.(vehicle)} className="rounded-md border border-slate-700 py-1.5 hover:bg-slate-800">
            Restock
          </button>
          <button onClick={() => onDelete?.(vehicle)} className="rounded-md border border-rose-900 py-1.5 text-rose-300 hover:bg-rose-950">
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
