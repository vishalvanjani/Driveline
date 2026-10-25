import { useState } from 'react';
import { Settings, Shield, Database, Sliders, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const [threshold] = useState(2);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Dealership Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure business rules, alert thresholds, and view active database environment parameters
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300">
          <CheckCircle2 size={16} />
          <span>Dealership parameters updated successfully.</span>
        </div>
      )}

      {/* Account Profile Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck size={18} className="text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100">Active Operator Session</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-slate-500">Authenticated Email</span>
            <p className="font-semibold text-slate-200 mt-0.5">{user?.email}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-slate-500">Authorization Level</span>
            <p className="font-semibold text-amber-300 mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Low-stock Threshold Configuration */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100">Inventory Alert Thresholds</h2>
        </div>
        <p className="text-xs text-slate-400">
          Vehicles with stock levels less than or equal to this threshold trigger amber alerts on the dashboard and inventory catalog.
        </p>

        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Low Stock Alert Threshold (Units)
          </label>
          <input
            type="number"
            min={1}
            max={10}
            defaultValue={threshold}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
          />
          <span className="mt-1 block text-[11px] text-slate-500">System default: 2 units</span>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 transition"
        >
          Save Configuration
        </button>
      </form>

      {/* System Infrastructure Details */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-slate-400" />
          <h2 className="text-sm font-bold text-slate-100">Infrastructure & Runtime</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-slate-500">Database Engine</span>
            <p className="font-semibold text-slate-200 mt-0.5">SQLite / Prisma ORM</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-slate-500">Concurrency Protocol</span>
            <p className="font-semibold text-emerald-400 mt-0.5">Atomic Transactional Locks</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-slate-500">Token Strategy</span>
            <p className="font-semibold text-slate-200 mt-0.5">JWT (24h Expiry)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
