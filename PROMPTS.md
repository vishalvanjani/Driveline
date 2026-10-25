# Prompts

Raw, unedited AI chat logs for this project.

## Initial Specification Prompt

```markdown
You are setting up a complete full-stack project from the exact file contents provided below. Follow these rules strictly:

1. Create every file at the exact path shown after "===== FILE:" with the exact contents that follow it, up to the next "===== FILE:" marker. Do not add, remove, rename, or "improve" anything. Do not add extra dependencies.
2. Work from the root folder `car-dealership/`. Run `git init` there first.
3. Backend setup, in order:
   cd backend
   cp .env.example .env
   npm install
   npm run db:migrate   (press Enter if asked for a migration name)
   npm run db:seed
   npm test
   All backend tests must pass. If any fail, report the exact failure output to me and stop; do not rewrite the tests.
4. Frontend setup, in order:
   cd ../frontend
   cp .env.example .env
   npm install
   npm test
   npm run build
5. Git commits. Make these commits IN THIS ORDER so the history shows test-first development. Every commit message must have a one-line subject, then a blank line, then a short body, then a blank line, then the exact trailer line:
   Co-authored-by: Claude <AI@users.noreply.github.com>
   Use multiple -m flags (git commit -m "subject" -m "body" -m "Co-authored-by: Claude <AI@users.noreply.github.com>") so the trailer is in its own paragraph.

   Commit 1 — files: .gitignore, README.md, PROMPTS.md, backend/package.json, backend/package-lock.json, backend/tsconfig.json, backend/vitest.config.ts, backend/.env.example, backend/.gitignore, backend/prisma/schema.prisma, backend/prisma/migrations/, backend/prisma/seed.ts, backend/src/config.ts, backend/src/lib/, backend/src/app.ts, backend/src/server.ts
     subject: chore: scaffold Express + Prisma + Vitest backend
     body: Initial project skeleton generated with Claude.
   Commit 2 — files: backend/tests/setup.ts, backend/tests/helpers.ts, backend/tests/auth.test.ts
     subject: test(auth): add failing tests for register and login
     body: Red step. Tests written with Claude before any auth implementation.
   Commit 3 — files: backend/src/errors.ts, backend/src/middleware/, backend/src/modules/auth/
     subject: feat(auth): implement register/login with JWT and auth middleware
     body: Green step. Service, routes, error hierarchy and bearer-token middleware.
   Commit 4 — files: backend/tests/vehicles.test.ts
     subject: test(vehicles): add failing tests for protected vehicle CRUD and search
     body: Red step.
   Commit 5 — files: backend/src/modules/vehicles/vehicle.schemas.ts, backend/src/modules/vehicles/vehicle.service.ts, backend/src/modules/vehicles/vehicle.routes.ts
     subject: feat(vehicles): implement CRUD, search and admin-only delete
     body: Green step. Zod validation on bodies and query strings.
   Commit 6 — files: backend/tests/inventory.test.ts
     subject: test(inventory): add failing purchase/restock tests including a race test
     body: Red step. Includes a concurrency test that 5 purchases of 1 unit yield exactly 1 success.
   Commit 7 — files: (none new; this commit is a no-op if vehicle.service.ts already contains purchase/restock — in that case skip this commit)
   Commit 8 — files: frontend/ (everything except node_modules and dist)
     subject: feat(frontend): React + Tailwind SPA with auth, dashboard, search and admin tools
     body: Vite + React Router + Tailwind v4. Purchase button disabled at zero stock. VehicleCard unit tests included.

   Note on commit 3 vs 5: the vehicle module files are listed in commit 5, so for commit 3 add only the auth module, errors.ts and middleware. The app.ts committed in commit 1 imports the vehicle module, which is fine — the history is about narrative, not every commit being independently buildable.
6. When finished, print: the output of `npm test` from both backend and frontend, and `git log --oneline`.
7. Do not deploy anything. Do not write the "My AI Usage" section of the README — leave the placeholder for the human to write.
```

## Follow-up Directives

### User Prompt 2
```text
what do i need to do now
```

### User Prompt 3
```text
why cant you do that
```

### User Prompt 4
```text
yes go ahead and "My AI Usage" humanize this for me
```
