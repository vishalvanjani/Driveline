import { useLocation } from 'react-router-dom';
import { LogOut, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AppHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return { title: 'Executive Overview', subtitle: 'Live Dealership Performance & Fleet Valuation' };
      case '/inventory':
        return { title: 'Vehicle Inventory', subtitle: 'Stock Availability, Catalogue Management & Procurement' };
      case '/sales':
        return { title: 'Sales Ledger', subtitle: 'Historical Customer Transactions & Financial Records' };
      case '/customers':
        return { title: 'Customer Directory', subtitle: 'Registered Dealership Accounts & Lifetime Spend' };
      case '/analytics':
        return { title: 'Fleet Analytics', subtitle: 'Valuation Distributions, Pricing Segments & Inventory Health' };
      case '/settings':
        return { title: 'System Settings', subtitle: 'Dealership Parameters, Thresholds & Account Configuration' };
      default:
        return { title: 'DriveLine Platform', subtitle: 'Automotive Dealership Management System' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-base font-bold text-slate-100">{title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Status Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-900/40 bg-emerald-950/30 px-2.5 py-1 text-xs text-emerald-400">
          <Activity size={12} className="animate-pulse text-emerald-400" />
          <span className="text-[11px] font-medium">SQLite Engine Connected</span>
        </div>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-xs text-slate-400">{user.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100"
            >
              <LogOut size={13} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
