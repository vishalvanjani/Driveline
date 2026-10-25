import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Car,
  Plus,
  LayoutGrid,
  List,
  Search,
  FilterX,
  AlertTriangle,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';
import { api, ApiError } from '../api/client';
import { Modal } from '../components/Modal';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleTable } from '../components/VehicleTable';
import { VehicleForm } from '../components/VehicleForm';
import { useAuth } from '../context/AuthContext';
import type { Vehicle, VehicleFilters, VehicleInput } from '../types';

type Notice = { kind: 'error' | 'success'; text: string };

const EMPTY_FILTERS: VehicleFilters = {
  make: '',
  model: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function InventoryPage() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<VehicleFilters>(EMPTY_FILTERS);
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modals
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [restocking, setRestocking] = useState<Vehicle | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const lowStockThreshold = 2;

  const run = useCallback(
    async (action: () => Promise<void>, success?: string) => {
      try {
        await action();
        if (success) setNotice({ kind: 'success', text: success });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return logout();
        setNotice({ kind: 'error', text: err instanceof ApiError ? err.describe() : 'Server communication failed' });
      }
    },
    [logout],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    await run(async () => {
      const data = await api.searchVehicles({
        ...filters,
        ...(activeSearch ? { make: activeSearch } : {}),
      });
      setVehicles(data);
    });
    setLoading(false);
  }, [filters, activeSearch, run]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const replace = (updated: Vehicle) =>
    setVehicles((vs) => vs.map((v) => (v.id === updated.id ? updated : v)));

  const handlePurchase = async (vehicle: Vehicle) => {
    setBusyId(vehicle.id);
    await run(async () => {
      const updated = await api.purchaseVehicle(vehicle.id);
      replace(updated);
    }, `Successfully purchased 1 unit of ${vehicle.make} ${vehicle.model}`);
    setBusyId(null);
  };

  const handleCreate = async (data: VehicleInput) => {
    setSaving(true);
    await run(async () => {
      const created = await api.createVehicle(data);
      setVehicles((vs) => [created, ...vs]);
      setAdding(false);
    }, 'New vehicle added to catalog');
    setSaving(false);
  };

  const handleUpdate = async (data: VehicleInput) => {
    if (!editing) return;
    setSaving(true);
    await run(async () => {
      const updated = await api.updateVehicle(editing.id, data);
      replace(updated);
      setEditing(null);
    }, 'Vehicle specs successfully updated');
    setSaving(false);
  };

  const handleRemove = async (vehicle: Vehicle) => {
    if (!window.confirm(`Permanently delete ${vehicle.make} ${vehicle.model} from catalog?`)) return;
    await run(async () => {
      await api.deleteVehicle(vehicle.id);
      setVehicles((vs) => vs.filter((v) => v.id !== vehicle.id));
    }, `${vehicle.make} ${vehicle.model} removed from database`);
  };

  const handleRestockSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!restocking || restockAmount < 1) return;
    setSaving(true);
    await run(async () => {
      const updated = await api.restockVehicle(restocking.id, restockAmount);
      replace(updated);
      setRestocking(null);
      setRestockAmount(1);
    }, `Restocked ${restockAmount} units of ${restocking.make} ${restocking.model}`);
    setSaving(false);
  };

  // Quick stats
  const totalUnits = vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const lowStockCount = vehicles.filter((v) => v.quantity > 0 && v.quantity <= lowStockThreshold).length;

  const categories = Array.from(new Set(vehicles.map((v) => v.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Page Header with Live Counters & Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Vehicle Inventory</h1>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-300">
                <Car size={13} className="text-amber-400" />
                {loading ? '…' : `${vehicles.length} models (${totalUnits} units)`}
              </span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
                  <AlertTriangle size={12} />
                  {lowStockCount} low stock
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time dealership fleet directory with atomic purchase verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid/Table Switcher */}
          <div className="flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'table' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Data Table View"
            >
              <List size={16} />
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 transition hover:from-amber-300 hover:to-amber-400"
            >
              <Plus size={15} />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-lg space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* Quick Search */}
          <div className="relative lg:col-span-2">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
              placeholder="Search make or model..."
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
              value={filters.category ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined }))}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
              value={filters.status ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
            >
              <option value="">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt;{lowStockThreshold})</option>
              <option value="low_stock">Low Stock (&le;{lowStockThreshold})</option>
              <option value="out_of_stock">Sold Out (0)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters((f) => ({ ...f, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
              }}
            >
              <option value="createdAt-desc">Recently Added</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="quantity-desc">Highest Stock</option>
              <option value="name-asc">Model Name (A-Z)</option>
            </select>
          </div>

          {/* Price Range inputs & Clear */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min $"
              className="w-1/2 rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs outline-none focus:border-amber-400"
              value={filters.minPrice ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value || undefined }))}
            />
            <input
              type="number"
              placeholder="Max $"
              className="w-1/2 rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs outline-none focus:border-amber-400"
              value={filters.maxPrice ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value || undefined }))}
            />
          </div>
        </div>

        {/* Clear Filters helper */}
        {(activeSearch || Object.values(filters).some((v) => v !== '' && v !== 'createdAt' && v !== 'desc')) && (
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
            <span className="text-slate-400">Filters active</span>
            <button
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setActiveSearch('');
              }}
              className="flex items-center gap-1 text-amber-400 hover:underline"
            >
              <FilterX size={12} /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Notice Message Banner */}
      {notice && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
            notice.kind === 'error'
              ? 'border-rose-800/50 bg-rose-950/30 text-rose-300'
              : 'border-emerald-800/50 bg-emerald-950/30 text-emerald-300'
          }`}
        >
          {notice.kind === 'error' ? <AlertTriangle size={15} /> : <PackageCheck size={15} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Main Inventory Presentation: Grid or Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RotateCcw size={16} className="animate-spin text-amber-400" />
            <span>Loading vehicles...</span>
          </div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/30 p-8 text-center">
          <Car size={36} className="text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">No vehicles match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or price boundaries.</p>
          <button
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setActiveSearch('');
            }}
            className="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              isAdmin={isAdmin}
              busy={busyId === v.id}
              lowStockThreshold={lowStockThreshold}
              onPurchase={handlePurchase}
              onEdit={setEditing}
              onDelete={handleRemove}
              onRestock={setRestocking}
            />
          ))}
        </div>
      ) : (
        <VehicleTable
          vehicles={vehicles}
          isAdmin={isAdmin}
          busyId={busyId}
          lowStockThreshold={lowStockThreshold}
          onPurchase={handlePurchase}
          onEdit={setEditing}
          onDelete={handleRemove}
          onRestock={setRestocking}
        />
      )}

      {/* Add Vehicle Modal */}
      {adding && (
        <Modal title="Add New Vehicle to Catalog" onClose={() => setAdding(false)}>
          <VehicleForm busy={saving} onSubmit={handleCreate} onCancel={() => setAdding(false)} />
        </Modal>
      )}

      {/* Edit Vehicle Modal */}
      {editing && (
        <Modal title={`Edit ${editing.make} ${editing.model}`} onClose={() => setEditing(null)}>
          <VehicleForm
            busy={saving}
            initial={{
              make: editing.make,
              model: editing.model,
              category: editing.category,
              price: editing.price,
              quantity: editing.quantity,
              year: editing.year ?? undefined,
              vin: editing.vin ?? undefined,
              mileage: editing.mileage ?? undefined,
              fuelType: editing.fuelType ?? undefined,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* Restock Modal */}
      {restocking && (
        <Modal
          title={`Restock ${restocking.make} ${restocking.model}`}
          onClose={() => setRestocking(null)}
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            <p className="text-xs text-slate-400">
              Current in-stock inventory: <strong className="text-slate-200">{restocking.quantity} units</strong>.
              Enter the batch quantity to add.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Units to Procure / Restock
              </label>
              <input
                type="number"
                min={1}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setRestocking(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
              >
                {saving ? 'Restocking…' : 'Confirm Restock'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
