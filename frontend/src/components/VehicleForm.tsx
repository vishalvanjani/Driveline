import { useState, type FormEvent } from 'react';
import type { VehicleInput } from '../types';

interface Props {
  initial?: VehicleInput;
  busy?: boolean;
  onSubmit: (data: VehicleInput) => void;
  onCancel: () => void;
}

const BLANK: VehicleInput = {
  make: '',
  model: '',
  category: '',
  price: 0,
  quantity: 0,
  year: undefined,
  vin: '',
  mileage: undefined,
  fuelType: '',
};

export function VehicleForm({ initial = BLANK, busy = false, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<VehicleInput>({
    ...BLANK,
    ...initial,
  });

  const text = (key: keyof VehicleInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value || undefined }));

  const num = (key: keyof VehicleInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value ? Number(e.target.value) : undefined }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const field =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400';
  const label = 'block text-xs font-semibold text-slate-300 mb-1';

  return (
    <form onSubmit={submit} className="grid gap-4 max-h-[80vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Make *</label>
          <input className={field} required value={form.make} onChange={text('make')} placeholder="e.g. Porsche, Toyota" />
        </div>
        <div>
          <label className={label}>Model *</label>
          <input className={field} required value={form.model} onChange={text('model')} placeholder="e.g. 911 GT3, RAV4" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Category *</label>
          <input
            className={field}
            required
            value={form.category}
            onChange={text('category')}
            placeholder="Coupe, Sedan, SUV, Truck, Electric…"
          />
        </div>
        <div>
          <label className={label}>Model Year</label>
          <input
            className={field}
            type="number"
            min={1920}
            max={2030}
            value={form.year ?? ''}
            onChange={num('year')}
            placeholder="e.g. 2024"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Drive-Away Price (USD) *</label>
          <input
            className={field}
            type="number"
            min={1}
            step="1"
            required
            value={form.price || ''}
            onChange={num('price')}
            placeholder="e.g. 45000"
          />
        </div>
        <div>
          <label className={label}>Stock Quantity *</label>
          <input
            className={field}
            type="number"
            min={0}
            step="1"
            required
            value={form.quantity}
            onChange={num('quantity')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Powertrain / Fuel</label>
          <select
            className={field}
            value={form.fuelType ?? ''}
            onChange={text('fuelType')}
          >
            <option value="">Unspecified</option>
            <option value="Gasoline">Gasoline</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
            <option value="Plug-in Hybrid">Plug-in Hybrid</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>
        <div>
          <label className={label}>Mileage (miles)</label>
          <input
            className={field}
            type="number"
            min={0}
            value={form.mileage ?? ''}
            onChange={num('mileage')}
            placeholder="e.g. 1500"
          />
        </div>
      </div>

      <div>
        <label className={label}>Vehicle Identification Number (VIN)</label>
        <input
          className={field}
          value={form.vin ?? ''}
          onChange={text('vin')}
          placeholder="17-character VIN (optional)"
          maxLength={17}
        />
      </div>

      <div className="mt-2 flex justify-end gap-2 border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 transition hover:from-amber-300 hover:to-amber-400 disabled:opacity-50"
        >
          {busy ? 'Saving Vehicle…' : 'Save Vehicle'}
        </button>
      </div>
    </form>
  );
}
