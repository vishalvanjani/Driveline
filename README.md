# Car Dealership Inventory System

A full-stack inventory system for a car dealership, built test-first.

- **Backend:** Node.js 20, TypeScript, Express 4, Prisma, SQLite (file-backed; swap to PostgreSQL by changing the datasource), JWT auth, Zod validation, Vitest + Supertest.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, React Router.

## Features

- Register / login with JWT-protected API.
- Dashboard listing all vehicles with search and filtering by make, model, category and price range.
- Purchase a vehicle (atomic stock decrement; button disabled when sold out).
- Admin users can add, edit, delete and restock vehicles. The admin role is only assignable via the seed script or the database, never via registration.

## API

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | /api/auth/register | – | Creates a USER account |
| POST | /api/auth/login | – | Returns `{ user, token }` |
| GET | /api/vehicles | Bearer | List all vehicles |
| GET | /api/vehicles/search | Bearer | `make`, `model`, `category`, `minPrice`, `maxPrice` |
| POST | /api/vehicles | Bearer | Add a vehicle |
| PUT | /api/vehicles/:id | Bearer | Partial update |
| DELETE | /api/vehicles/:id | Admin | |
| POST | /api/vehicles/:id/purchase | Bearer | Decrements quantity by 1; 409 if out of stock |
| POST | /api/vehicles/:id/restock | Admin | Body `{ "quantity": n }` |

## Running locally

### Backend

```bash
cd backend
cp .env.example .env      # set JWT_SECRET
npm install
npm run db:migrate
npm run db:seed           # creates admin@dealership.test / Admin1234!
npm run dev               # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

### Tests

```bash
cd backend && npm test            # or npm run test:coverage
cd frontend && npm test
```

## Test report

<!-- Paste the output of `npm run test:coverage` from backend and `npm test` from frontend here. -->

## Screenshots

<!-- Add screenshots of login, dashboard, search, and the admin tools. -->

## My AI Usage

<!-- REQUIRED. Write this yourself. Cover: which tools you used, how you used them (be specific), and your honest reflection on how it affected your workflow — what it sped up, where you had to intervene, what you learned. -->
