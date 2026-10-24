import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import { Modal } from '../components/Modal';
import { Navbar } from '../components/Navbar';
import { SearchBar } from '../components/SearchBar';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleForm } from '../components/VehicleForm';
import { useAuth } from '../context/AuthContext';
import type { Vehicle, VehicleFilters, VehicleInput } from '../types';

type Notice = { kind: 'error' | 'success'; text: string };

export function DashboardPage() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);

  /** Runs an API action, surfacing errors and logging out on an expired token. */
  const run = useCallback(
    async (action: () => Promise<void>, success?: string) => {
      try {
        await action();
        if (success) setNotice({ kind: 'success', text: success });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return logout();
        setNotice({ kind: 'error', text: err instanceof ApiError ? err.describe() : 'Could not reach the server' });
      }
    },
    [logout],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const hasFilters = Object.values(filters).some(Boolean);
    await run(async () => {
      setVehicles(hasFilters ? await api.searchVehicles(filters) : await api.listVehicles());
    });
    setLoading(false);
  }, [filters, run]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const replace = (updated: Vehicle) => setVehicles((vs) => vs.map((v) => (v.id === updated.id ? updated : v)));

  const purchase = async (vehicle: Vehicle) => {
    setBusyId(vehicle.id);
    await run(async () => replace(await api.purchaseVehicle(vehicle.id)), `Purchased ${vehicle.make} ${vehicle.model}`);
    setBusyId(null);
  };

  const create = async (data: VehicleInput) => {
    setSaving(true);
    await run(async () => {
      const created = await api.createVehicle(data);
      setVehicles((vs) => [created, ...vs]);
      setAdding(false);
    }, 'Vehicle added');
    setSaving(false);
  };

  const update = async (data: VehicleInput) => {
    if (!editing) return;
    setSaving(true);
    await run(async () => {
      replace(await api.updateVehicle(editing.id, data));
      setEditing(null);
    }, 'Vehicle updated');
    setSaving(false);
  };

  const remove = async (vehicle: Vehicle) => {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model}?`)) return;
    await run(async () => {
      await api.deleteVehicle(vehicle.id);
      setVehicles((vs) => vs.filter((v) => v.id !== vehicle.id));
    }, 'Vehicle deleted');
  };

  const restock = async (vehicle: Vehicle) => {
    const input = window.prompt(`Restock ${vehicle.make} ${vehicle.model} — how many units?`, '1');
    if (input === null) return;
    const quantity = Number(input);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setNotice({ kind: 'error', text: 'Enter a whole number of at least 1' });
      return;
    }
    await run(async () => replace(await api.restockVehicle(vehicle.id, quantity)), `Restocked ${quantity} unit(s)`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-sm text-slate-400">
              {loading ? 'Loading…' : `${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'}`}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setAdding(true)} className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300">
              + Add vehicle
            </button>
          )}
        </div>

        <SearchBar onSearch={setFilters} />

        {notice && (
          <p
            role="status"
            className={`rounded-md px-3 py-2 text-sm ${
              notice.kind === 'error' ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'
            }`}
          >
            {notice.text}
          </p>
        )}

        {!loading && vehicles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
            No vehicles match. Try clearing the filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={isAdmin}
                busy={busyId === v.id}
                onPurchase={purchase}
                onEdit={setEditing}
                onDelete={remove}
                onRestock={restock}
              />
            ))}
          </div>
        )}
      </main>

      {adding && (
        <Modal title="Add vehicle" onClose={() => setAdding(false)}>
          <VehicleForm busy={saving} onSubmit={create} onCancel={() => setAdding(false)} />
        </Modal>
      )}
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
            }}
            onSubmit={update}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
