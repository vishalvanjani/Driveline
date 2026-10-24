import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 font-black text-slate-950">D</span>
          <span className="text-lg font-semibold tracking-tight">DriveLine</span>
        </div>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-400 sm:inline">{user.email}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                user.role === 'ADMIN' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {user.role}
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
