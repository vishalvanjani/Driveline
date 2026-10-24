import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
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

  const field = 'w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400';

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400 text-xl font-black text-slate-950">D</span>
          <div>
            <p className="text-xl font-semibold leading-tight">DriveLine</p>
            <p className="text-xs text-slate-400">Dealership inventory</p>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h1 className="text-lg font-semibold">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
            <input className={field} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Password</label>
            <input
              className={field}
              type="password"
              required
              minLength={8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>}
          </div>
          {error && <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
          <button type="submit" disabled={busy} className="rounded-md bg-amber-400 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50">
            {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Register'}
          </button>
          <p className="text-center text-sm text-slate-400">
            {isLogin ? (
              <>
                No account? <Link className="text-amber-300 hover:underline" to="/register">Register</Link>
              </>
            ) : (
              <>
                Already registered? <Link className="text-amber-300 hover:underline" to="/login">Log in</Link>
              </>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
