import { useState, type FormEvent } from 'react';
import type { VehicleFilters } from '../types';

interface Props {
  onSearch: (filters: VehicleFilters) => void;
}

const EMPTY: VehicleFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export function SearchBar({ onSearch }: Props) {
  const [filters, setFilters] = useState<VehicleFilters>(EMPTY);

  const set = (key: keyof VehicleFilters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clear = () => {
    setFilters(EMPTY);
    onSearch(EMPTY);
  };

  const field = 'rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-amber-400';

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:grid-cols-6">
      <input className={field} placeholder="Make" value={filters.make} onChange={set('make')} />
      <input className={field} placeholder="Model" value={filters.model} onChange={set('model')} />
      <input className={field} placeholder="Category" value={filters.category} onChange={set('category')} />
      <input className={field} type="number" min={0} placeholder="Min price" value={filters.minPrice} onChange={set('minPrice')} />
      <input className={field} type="number" min={0} placeholder="Max price" value={filters.maxPrice} onChange={set('maxPrice')} />
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300">
          Search
        </button>
        <button type="button" onClick={clear} className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">
          Clear
        </button>
      </div>
    </form>
  );
}
