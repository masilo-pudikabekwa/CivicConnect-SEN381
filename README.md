# CivicConnect-SEN381
SEN381 Integrated Team Project: CivicConnect - A Community Service Request Management Platform.


CivicConnect is a web platform where citizens report civic issues (roads, water, electricity and so on) and civic personnel review and track them through to resolution. This repository contains the **M2 Architecture, Technology & Initial Design Baseline**. It is an early, traceable vertical slice of the core reporting workflow, not the finished application.

The engineering reasoning (ASRs, ADRs, RTM, risks) lives in the Project Engineering Document (PED v2.0). This README explains the software that exists and how to run and continue it.

## Current implementation status

| Req | Description | Status | Evidence |
|---|---|---|---|
| FR-01 | Citizen submits a report | Implemented | `POST /api/reports`, `report.service.js#submit` |
| FR-02 | Minimum data set (category, description, location) | Implemented | `report.validation.js`, `tests/report.validation.test.js` |
| FR-03 | Confirmation with unique reference number | Implemented | `report.service.js#newReference`, UI message |
| FR-04 | Citizen views status + last-updated date | Implemented | `GET /api/reports/:reference` |
| FR-05 | Staff change status via valid transitions only | Implemented | `report.status.js`, `report.repository.prisma.js#updateStatus` |
| FR-06 | Staff filter/sort reports | In Development (status/category/date sort done; no paging) | `GET /api/reports` |
| FR-07 | Register and log in | Implemented | `modules/auth/*` |
| FR-08 | Role-based access (Citizen / Personnel / Admin) | Implemented | `auth.middleware.js#requireRole` |
| FR-09 | Admin manages accounts and roles | Planned (role re-read per request is in place; staff are created via script) | `auth.service.js#authenticate`, `scripts/create-staff.js` |
| FR-10 | Email notification on status change | Planned / Deferred | none |
| NFR-03 | Password policy + salted hash | Implemented | bcrypt cost 10, `tests/auth.api.test.js` |
| NFR-05 | Validate input before persisting | Implemented | `report.validation.js`, DB column limits |
| NFR-01/02/04/06 | Performance, usability, availability, scale | Planned (verification not yet run) | none |

## Technology and versions

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | >= 20 LTS (developed on 23.8.0) |
| Web framework | Express | 5.2.1 |
| Database | PostgreSQL | 16 (any 14+) |
| ORM / migrations | Prisma + @prisma/client | 6.19.3 |
| Auth | bcryptjs / jsonwebtoken | 3.0.3 / 9.0.3 |
| Security headers | helmet | 8.3.0 |
| Config | dotenv | 16.6.1 |
| Tests | Jest / Supertest | 29.7.0 / 7.3.0 |
| Frontend | Plain HTML/CSS/JS served by Express | none |

`npm audit` reports a high-severity advisory in `deepmerge-ts`, pulled in by the **Prisma CLI's** config loader (a dev dependency). It isn't part of the running application. The suggested "fix" downgrades Prisma, so it is tracked and not force-applied.

## Architecture in one picture

A **modular monolith**: one Node process, one PostgreSQL database. Each module is split into three logical layers.

```
Browser (public/)  --HTTP/JSON-->  routes  -->  service (business rules)  -->  repository  -->  PostgreSQL
                                   auth.routes    auth.service                  user.repository.prisma
                                   report.routes  report.service + report.status  report.repository.prisma
```

## Repository structure

```
prisma/
  schema.prisma                 Data model: User, Report, StatusChange (+ enums)
  migrations/…_init/            Initial SQL migration
src/
  server.js                     Entry point: reads config, picks repositories, starts HTTP
  app.js                        Composition root: buildApp({ repos }) wires repos -> services -> routes
  repositories.js               Chooses Prisma or in-memory repositories
  config.js                     Environment configuration (fails fast on missing secrets)
  common/errors.js              Error types + uniform error response
  modules/
    auth/                       Registration, login, JWT sessions, role guard (FR-07, FR-08, NFR-03)
    users/                      User repositories (Prisma + in-memory)
    reports/                    Report submission, lookup, listing, status lifecycle (FR-01..FR-06)
public/                         Minimal browser UI (citizen + personnel views)
scripts/create-staff.js         Creates PERSONNEL/ADMIN accounts until the FR-09 admin UI exists
tests/                          Unit + API tests (run without a database)
```

## Design decisions applied in code

**1. Repository pattern with dependency injection** (`src/modules/*/*.repository.*.js`, `src/app.js`)
- *Problem:* business rules such as validation, transitions and access checks must be testable without a live database, and the persistence technology shouldn't leak into the services.
- *Approach:* services receive `{ reportRepo }` / `{ userRepo }` objects. There are two implementations of each contract: Prisma/PostgreSQL for real runs and in-memory for tests and demos. `buildApp({ repos })` is the single place where they are wired.
- *Trade-off:* two implementations have to stay in sync. If the in-memory version drifts, tests could pass while PostgreSQL behaves differently, so a DB-backed integration test is on the TODO list.

**2. State pattern (table-driven state machine) for the report lifecycle** (`src/modules/reports/report.status.js`)
- *Problem:* FR-05 allows only valid status changes (`Resolved -> Submitted` must be rejected). If each caller re-implements the rules, they drift (FE-03).
- *Approach:* one `TRANSITIONS` table is the single source of truth. The service calls `canTransition()`, the API returns `allowedNext` for each report, and the UI only offers those options.
- *Trade-off:* adding a status needs changes to the table, the Prisma enum and a migration. Per-state behaviour (for example "notify on RESOLVED") will need a hook in the service later.

**Supporting data-integrity decision:** `updateStatus` runs the status update and the `StatusChange` audit insert in **one transaction**. The update is conditional on the old status (`WHERE id = ? AND status = ?`), so of two concurrent staff edits, the second fails with `409 Conflict` instead of silently overwriting the first.

## API (initial interface: in-process REST/JSON)

All errors use the shape `{ "error": { "code", "message", "fields"? } }`. Authenticated calls send `Authorization: Bearer <token>`.

| Method | Path | Who | Result |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | 201 `{id,email,role:"CITIZEN"}` · 400 invalid · 409 duplicate |
| POST | `/api/auth/login` | anyone | 200 `{token,user}` · 401 generic error |
| GET | `/api/auth/me` | logged in | current user |
| GET | `/api/reports/meta` | anyone | categories + transition table |
| POST | `/api/reports` | CITIZEN | 201 report with `reference`, `status:"SUBMITTED"` · 400 with field errors |
| GET | `/api/reports/:reference` | owner or staff | 200 report · 404 otherwise |
| GET | `/api/reports?status=&category=&sort=newest\|oldest` | PERSONNEL/ADMIN | 200 list (max 200) |
| PATCH | `/api/reports/:reference/status` | PERSONNEL/ADMIN | 200 · 422 invalid transition · 409 concurrent change |
| GET | `/api/health` | anyone | `{status:"ok"}` |

## Getting started

### Prerequisites
- Node.js 20 or newer, and npm
- A PostgreSQL database. **Optional:** you can run without one (see "Quick demo").

### 1. Install
```bash
npm install
cp .env.example .env      # then edit .env: set JWT_SECRET to a long random string
```

### 2a. Quick demo without a database
Set `USE_MEMORY_REPO=true` in `.env`. You can also add `DEMO_STAFF_EMAIL` and `DEMO_STAFF_PASSWORD` to get a personnel login. Then run:
```bash
npm run dev
```
Open http://localhost:3000, register as a citizen, submit a report, then log in as the demo staff account to move it through its statuses. Data is lost on restart.

### 2b. Run with PostgreSQL
1. Get a database: either `docker compose up -d` (uses `docker-compose.yml`), or create a free PostgreSQL instance (for example Neon or Supabase) and copy its connection string.
2. Set `DATABASE_URL` in `.env` and keep `USE_MEMORY_REPO=false`.
3. Apply the schema and create a staff account:
   ```bash
   npx prisma migrate deploy
   node scripts/create-staff.js staff@example.com StaffPass1 PERSONNEL
   npm run dev
   ```

### Tests
```bash
npm test
```
Runs 38 unit and API tests against the in-memory repositories (no database needed). They cover FR-01 to FR-08, NFR-03 and NFR-05.

## Configuration

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port (default 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Token signing secret. **Required**; the server refuses to start with the placeholder |
| `JWT_EXPIRES_IN` | Session lifetime (default `8h`) |
| `USE_MEMORY_REPO` | `true` = no database, in-memory data |
| `DEMO_STAFF_EMAIL` / `DEMO_STAFF_PASSWORD` | Memory mode only: seed a PERSONNEL account |

`.env` is git-ignored. Never commit real credentials (risk R-007 / FE-06).

## Traceability example (end to end)

FR-05 (valid status transitions only)
→ ASR: data integrity and accountability of issue handling (N04, FE-03)
→ Architecture: `reports` module, service layer owns the rule
→ Data: `Report.status` enum + append-only `StatusChange` table, transactional update with an optimistic status check
→ Design: State pattern (`report.status.js`) + Repository pattern (`report.repository.prisma.js`)
→ Technology: Express 5 + PostgreSQL via Prisma `$transaction`
→ Application: `PATCH /api/reports/:reference/status`, staff table in `public/app.js`
→ Verification: `tests/report.status.test.js`, `tests/reports.api.test.js` ("FR-05 …" cases)

## Known limitations / TODO
- FR-09 admin UI for managing accounts and roles is not built. Staff accounts are created with `scripts/create-staff.js`.
- FR-10 email notifications are deferred (risk R-008).
- No pagination on the staff list (capped at 200).
- No DB-backed integration tests yet. The Prisma repositories are verified manually against PostgreSQL.
- There's no CI pipeline yet. `npm test` is the repeatable check to run before every PR.
- The deployment target isn't chosen yet (FE-05). The app is a single stateless Node process plus managed PostgreSQL, configured only through environment variables.
- The detailed privacy/access model (ED-003 / DEF-01) is still open. For now, citizens can only see their own reports.
