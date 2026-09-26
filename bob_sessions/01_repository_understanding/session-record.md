# Session 01 — Repository Understanding

## Task Given to Bob

> "You are analyzing the ShopFlow repository as a software-maintenance assistant.
> FIRST inspect the repository. Do not modify any source files.
> Understand the actual: folder structure, application entry points, routes, controllers,
> services, models, middleware, database layer, tests, important dependencies.
> Create a concise repository architecture summary. For each major module explain:
> 1. its responsibility, 2. important files, 3. what other modules it depends on,
> 4. what modules depend on it.
> Do not invent relationships. Base every relationship on the actual code/imports.
> Save the summary as: docs/bob-repository-analysis.md"

## What Bob Did

Bob inspected the ShopFlow repository (`shopflow-demo/`) by reading every source file
and mapping each module's imports, exports, and responsibilities. Bob also identified
the two sub-projects in the workspace (the IMPACT React SPA and the ShopFlow demo API)
and documented how they relate.

Key files Bob read to produce the analysis:

- `shopflow-demo/src/server.js` — application entry point
- `shopflow-demo/src/app.js` — Express application and route mounting
- `shopflow-demo/src/routes/` — all 5 route files
- `shopflow-demo/src/controllers/` — all 5 controllers
- `shopflow-demo/src/services/` — all 5 services
- `shopflow-demo/src/models/` — all 4 models
- `shopflow-demo/src/middleware/` — auth, validation, error middleware
- `shopflow-demo/src/utils/` — jwt.js, errors.js
- `shopflow-demo/src/config/database.js`
- `shopflow-demo/src/db/schema.sql` and `seed.js`
- `shopflow-demo/tests/` — all test files
- `shopflow-demo/package.json`

## Output Produced

**Artifact:** `docs/bob-repository-analysis.md`

The analysis documents:

1. **Two-project workspace structure** — IMPACT React SPA (`src/`) and ShopFlow Demo API
   (`shopflow-demo/`), sharing no runtime code
2. **Complete folder tree** with role annotations for every directory
3. **Application entry points** — `server.js` boots the DB and starts Express; `app.js`
   mounts all routes
4. **All 5 route groups** — auth, users, products, orders, payments — with their
   middleware chains
5. **Layered architecture map** — routes → controllers → services → models → database,
   each layer's responsibility stated
6. **Middleware** — `requireAuth` (JWT verification), `validateBody`, `errorMiddleware`
7. **Database layer** — SQLite via `better-sqlite3`, schema DDL, seed script
8. **Test suite** — 5 test files and their coverage domains
9. **Key dependencies** — `jsonwebtoken`, `bcryptjs`, `better-sqlite3`, Node.js test runner
10. **Module dependency table** — for each module: responsibility, important files,
    depends-on, depended-upon-by

## Why This Session Matters for IMPACT

The repository understanding session established the factual ground truth about ShopFlow
that all subsequent sessions depend on. Without accurately knowing the structure — that
`requireAuth` is a shared middleware used by three route groups, that `utils/jwt.js`
is the single source of token verification, that `password_hash TEXT NOT NULL` exists
in the schema — the change-impact analysis could not be grounded in specific lines and
files.

The Impact Map's dependency layers in IMPACT directly reflect the layered structure
Bob identified here.

## Screenshot / Session Transcript

The IBM Bob environment does not retain interactive session transcripts or screenshots
after the session ends. The session output is preserved entirely in the artifact:

**→ `docs/bob-repository-analysis.md`** (30 KB, present in repository)

This file is the session evidence.
