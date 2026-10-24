import { useState, type FormEvent } from 'react';
import type { VehicleInput } from '../types';

interface Props {
  initial?: VehicleInput;
  busy?: boolean;
  onSubmit: (data: VehicleInput) => void;
  onCancel: () => void;
}

const BLANK: VehicleInput = { make: '', model: '', category: '', price: 0, quantity: 0 };

export function VehicleForm({ initial = BLANK, busy = false, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<VehicleInput>(initial);

  const text = (key: 'make' | 'model' | 'category') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const num = (key: 'price' | 'quantity') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const field = 'w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-400';
  const label = 'block text-xs font-medium text-slate-400 mb-1';

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div>
        <label className={label}>Make</label>
        <input className={field} required value={form.make} onChange={text('make')} />
      </div>
      <div>
        <label className={label}>Model</label>
        <input className={field} required value={form.model} onChange={text('model')} />
      </div>
      <div>
        <label className={label}>Category</label>
        <input className={field} required value={form.category} onChange={text('category')} placeholder="Sedan, SUV, Truck…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Price (USD)</label>
          <input className={field} type="number" min={1} step="1" required value={form.price || ''} onChange={num('price')} />
        </div>
        <div>
          <label className={label}>Quantity</label>
          <input className={field} type="number" min={0} step="1" required value={form.quantity} onChange={num('quantity')} />
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50">
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
