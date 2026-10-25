import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  BadgeDollarSign,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    { name: 'Inventory', to: '/inventory', icon: Car },
    { name: 'Sales & Ledger', to: '/sales', icon: BadgeDollarSign },
    ...(isAdmin ? [{ name: 'Customers', to: '/customers', icon: Users }] : []),
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800/80 bg-slate-950/95 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-black text-slate-950 shadow-lg shadow-amber-500/10">
            D
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="text-base font-bold tracking-tight text-slate-100">DriveLine</span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-amber-400">
                Auto Enterprise
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="grid h-7 w-7 place-items-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 font-semibold shadow-inner'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Footer */}
      {user && (
        <div className="border-t border-slate-800/80 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-slate-900/60 p-2.5 border border-slate-800/50 ${
              collapsed ? 'justify-center p-2' : ''
            }`}
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
              {user.email.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {user.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                      <ShieldAlert size={10} />
                      ADMIN
                    </span>
                  ) : (
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                      MEMBER
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
