import type { AuthResult, Vehicle, VehicleFilters, VehicleInput } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const SESSION_KEY = 'dealership.session';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
  }

  /** Human-readable message that includes field-level validation errors if present. */
  describe(): string {
    if (!this.details) return this.message;
    const fields = Object.entries(this.details).map(([field, msgs]) => `${field}: ${msgs.join(', ')}`);
    return fields.length ? fields.join(' · ') : this.message;
  }
}

function currentToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthResult).token : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = currentToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'Request failed', body.details);
  return body as T;
}

const json = (data: unknown) => JSON.stringify(data);

export const api = {
  register: (email: string, password: string) =>
    request<AuthResult>('/api/auth/register', { method: 'POST', body: json({ email, password }) }),
  login: (email: string, password: string) =>
    request<AuthResult>('/api/auth/login', { method: 'POST', body: json({ email, password }) }),

  listVehicles: () => request<Vehicle[]>('/api/vehicles'),
  searchVehicles: (filters: VehicleFilters) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
    return request<Vehicle[]>(`/api/vehicles/search?${params.toString()}`);
  },
  createVehicle: (data: VehicleInput) => request<Vehicle>('/api/vehicles', { method: 'POST', body: json(data) }),
  updateVehicle: (id: string, data: Partial<VehicleInput>) =>
    request<Vehicle>(`/api/vehicles/${id}`, { method: 'PUT', body: json(data) }),
  deleteVehicle: (id: string) => request<void>(`/api/vehicles/${id}`, { method: 'DELETE' }),
  purchaseVehicle: (id: string) => request<Vehicle>(`/api/vehicles/${id}/purchase`, { method: 'POST' }),
  restockVehicle: (id: string, quantity: number) =>
    request<Vehicle>(`/api/vehicles/${id}/restock`, { method: 'POST', body: json({ quantity }) }),
};
