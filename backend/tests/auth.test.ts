import { describe, expect, it } from 'vitest';
import { api, createUser, PASSWORD } from './helpers.js';

const creds = { email: 'jane@example.com', password: PASSWORD };

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await api().post('/api/auth/register').send(creds);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: creds.email, role: 'USER' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('normalises the email so the same address cannot register twice', async () => {
    await api().post('/api/auth/register').send(creds);
    const res = await api().post('/api/auth/register').send({ ...creds, email: 'Jane@Example.com' });

    expect(res.status).toBe(409);
  });

  it('rejects an invalid email and short password with field errors', async () => {
    const res = await api().post('/api/auth/register').send({ email: 'nope', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('email');
    expect(res.body.details).toHaveProperty('password');
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    await createUser(creds.email);
    const res = await api().post('/api/auth/login').send(creds);

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(creds.email);
  });

  it('rejects a wrong password', async () => {
    await createUser(creds.email);
    const res = await api().post('/api/auth/login').send({ ...creds, password: 'WrongPass123' });

    expect(res.status).toBe(401);
  });

  it('rejects an unknown email with the same message as a wrong password', async () => {
    const res = await api().post('/api/auth/login').send(creds);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });
});
