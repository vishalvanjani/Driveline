import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Props {
  mode: 'login' | 'register';
}

export function AuthPage({ mode }: Props) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const isLogin = mode === 'login';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.describe() : 'Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400';

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 font-black text-2xl text-slate-950 shadow-xl shadow-amber-500/10">
            D
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-100">DriveLine Auto Enterprise</h2>
          <p className="text-xs text-slate-400 mt-1">Premium Dealership Fleet & Inventory Platform</p>
        </div>

        {/* Card */}
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="border-b border-slate-800/80 pb-3">
            <h1 className="text-lg font-bold text-slate-100">{isLogin ? 'Operator Access' : 'Register Operator Account'}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLogin ? 'Enter your credentials to manage inventory and sales' : 'Create an account to explore dealership vehicles'}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Operator Email</label>
            <input
              className={field}
              type="email"
              required
              autoComplete="email"
              placeholder="e.g. admin@dealership.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Secure Password</label>
            <input
              className={field}
              type="password"
              required
              minLength={8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && <p className="mt-1 text-xs text-slate-500">Minimum 8 characters required.</p>}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 px-3.5 py-2.5 text-xs font-medium text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 font-bold text-slate-950 shadow-md shadow-amber-500/10 transition hover:from-amber-300 hover:to-amber-400 disabled:opacity-50"
          >
            <span>{busy ? 'Authenticating…' : isLogin ? 'Access Platform' : 'Create Account'}</span>
            {!busy && <ArrowRight size={15} />}
          </button>

          {isLogin && (
            <div className="mt-1 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <span className="block text-[11px] text-slate-400">Demo Seed Account</span>
              <code className="text-xs text-amber-300 font-mono">admin@dealership.test / Admin1234!</code>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            {isLogin ? (
              <>
                No operator account?{' '}
                <Link className="font-semibold text-amber-300 hover:underline" to="/register">
                  Register
                </Link>
              </>
            ) : (
              <>
                Already registered?{' '}
                <Link className="font-semibold text-amber-300 hover:underline" to="/login">
                  Log in
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
