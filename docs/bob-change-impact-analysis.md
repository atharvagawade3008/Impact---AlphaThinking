# Change-Impact Analysis

## Proposed Change
> Replace the existing JWT-based authentication flow with OAuth 2.0 authentication.

**Repository:** ShopFlow (`shopflow-demo/`)
**Analysis method:** Independent source-code inspection. Every claim below is grounded in a specific line, import statement, or structural observation in the actual files. No pre-existing impact documents were consulted.

---

## Summary Counts

| Category | Count |
|---|---|
| Directly affected files (likely require code changes) | 6 |
| Indirectly affected files (require review / testing) | 9 |
| Affected API routes | 7 |
| Affected modules | 3 core, 1 config |
| Security-sensitive areas | 5 |
| Tests requiring update or replacement | 5 |

---

## 1. Directly Affected Files

These files contain the JWT implementation that would be replaced or substantially rewritten.

---

### `shopflow-demo/src/utils/jwt.js`

**Impact level:** DIRECT — core of the current auth mechanism

**Why:** This file is the entire JWT implementation. It exports `signToken(user)` and `verifyToken(token)`, both of which call the `jsonwebtoken` library directly.

- `signToken` (line 5): encodes `{ sub: user.id, role: user.role }` using `process.env.JWT_SECRET` and `process.env.JWT_EXPIRES_IN`.
- `verifyToken` (line 11): calls `jwt.verify(token, secret())` and returns `{ id: Number(payload.sub), role: payload.role }`.

With OAuth 2.0, this file's role changes entirely: self-signed JWTs are replaced with tokens issued by an external authorization server. The token verification step would no longer use a local symmetric secret — it would validate an access token against the OAuth server (e.g., via introspection or public key verification). The file likely needs to be replaced or completely rewritten.

**Specific lines affected:** lines 1–14 (entire file)

**Downstream contract at risk:** The `{ id, role }` object that `verifyToken` currently returns is consumed directly by `authMiddleware.js` as `request.user`. If this shape changes, all protected controllers are also affected (see indirect section).

---

### `shopflow-demo/src/middleware/authMiddleware.js`

**Impact level:** DIRECT — the token-validation gate for all protected routes

**Why:** This file imports `verifyToken` from `utils/jwt.js` (line 1) and calls it on every protected request (line 13). It inspects the `Authorization` header for the `Bearer` scheme and writes `request.user = verifyToken(token)`.

Under OAuth 2.0 the token format changes (opaque token or JWT issued by the authorization server, not a locally signed JWT). The verification logic — currently a synchronous local `jwt.verify` — may become an async call to an OAuth introspection endpoint or a JWKS-based signature check. The `Bearer` scheme remains compatible, but the body of `requireAuth` changes substantially.

**Specific lines affected:**
- Line 1: import of `verifyToken` from `utils/jwt.js` — the imported function is being replaced
- Lines 5–16: the entire `requireAuth` function body

**Downstream contract at risk:** `request.user = verifyToken(token)` (line 13). All three protected route groups (`userRoutes`, `orderRoutes`, `paymentRoutes`) apply `router.use(requireAuth)` and all their controllers read `request.user.id`. If the shape of `request.user` changes, all downstream consumers break.

---

### `shopflow-demo/src/services/authService.js`

**Impact level:** DIRECT — the business logic for registration and login will fundamentally change

**Why:** The current `authService` owns both credential management and token issuance:

- `register` (lines 7–12): hashes a password with `bcrypt.hash`, creates a user row via `userModel.create`, then calls `signToken(user)` (line 11) to return a JWT immediately.
- `login` (lines 14–20): calls `userModel.findByEmail`, does `bcrypt.compare` against `password_hash`, then calls `signToken(user)` (line 19) to issue a token.

With OAuth 2.0, the application no longer issues tokens. Registration may still create a user record, but credential verification and token issuance are delegated to the external authorization server. The `signToken` import (line 3) is no longer needed. The `bcryptjs` calls and possibly the entire `login` method are removed or replaced by an OAuth callback/exchange handler.

**Specific lines affected:**
- Line 1: `bcryptjs` import — may be removed if password hashing is no longer the app's responsibility
- Line 3: `signToken` import from `utils/jwt.js` — removed
- Lines 7–20: both `register` and `login` method bodies change substantially

**Note:** Whether `userModel.create` is still called depends on whether ShopFlow maintains a local user record for each OAuth identity (common pattern). This is an architectural decision, not a certainty.

---

### `shopflow-demo/src/controllers/authController.js`

**Impact level:** DIRECT — its two handlers map directly onto the JWT-based register/login flow

**Why:** `authController.register` (line 4) calls `authService.register(request.body)` and returns the result as HTTP 201. `authController.login` (line 9) calls `authService.login(request.body)`. Both handlers are tightly coupled to the current request shape (`name`, `email`, `password`).

OAuth 2.0 replaces this flow with an authorization code exchange, token endpoint callbacks, or PKCE flows. The controller's two current methods (`register`, `login`) likely need to be replaced with OAuth-specific handlers (e.g., `initiateAuthorization`, `handleCallback`). The current handler signatures and response shapes no longer apply.

**Specific lines affected:** lines 1–12 (entire file)

---

### `shopflow-demo/src/routes/authRoutes.js`

**Impact level:** DIRECT — defines the HTTP endpoints and request validation for the current auth flow

**Why:** This file wires `POST /register` and `POST /login` with `validateBody` rules that check for `name`, `email`, and `password` fields (lines 7–15). These endpoints and their input schemas are specific to the credential-based JWT flow.

Under OAuth 2.0, the routes would change to redirect/callback endpoints (`GET /authorize`, `GET /callback`, `POST /token`). The `validateBody` middleware applied here validates fields (`name`, `email`, `password`) that no longer exist in the OAuth request shape.

**Specific lines affected:**
- Lines 7–11: `POST /register` route with `validateBody({name, email, password})`
- Lines 12–15: `POST /login` route with `validateBody({email, password})`
- Line 3: import of `validateBody` and `isEmail` — may change or be removed if request validation rules change

---

### `shopflow-demo/.env.example`

**Impact level:** DIRECT — documents the environment variables that configure the current auth mechanism

**Why:** The file currently declares `JWT_SECRET` and `JWT_EXPIRES_IN` (lines 2–3), which are the two environment variables read by `utils/jwt.js` (lines 3 and 7 of `jwt.js`). Both variables are JWT-specific.

OAuth 2.0 requires different configuration: OAuth client ID, client secret, authorization server URL, token introspection endpoint, redirect URIs. The existing JWT variables would be removed and replaced with OAuth-specific ones.

**Specific lines affected:** lines 2–3 (`JWT_SECRET`, `JWT_EXPIRES_IN`)

---

## 2. Indirectly Affected Files

These files do not implement authentication themselves but depend on the behaviour, output shape, or side-effects of the files listed above.

---

### `shopflow-demo/src/routes/userRoutes.js`

**Impact level:** INDIRECT — applies `requireAuth` middleware to its entire router

**Why:** Line 8 (`router.use(requireAuth)`) applies `requireAuth` from `authMiddleware.js` as a prefix middleware to all routes in this group. The route itself does not contain auth logic, but it depends entirely on `requireAuth` working correctly and on `request.user` being set to the expected `{ id, role }` shape before any handler runs.

If `authMiddleware.js` changes its verification logic asynchronously (e.g., awaiting a token introspection call), and if `requireAuth` changes from a synchronous to an asynchronous middleware, the route would still work without changes — but it must be regression-tested to confirm `request.user.id` is still set correctly before `userController.getProfile` and `userController.updateProfile` access it.

**Evidence:** `userRoutes.js` line 3 imports `requireAuth`; `userController.js` line 5 reads `request.user.id` without a null-guard.

---

### `shopflow-demo/src/routes/orderRoutes.js`

**Impact level:** INDIRECT — same `requireAuth` dependency pattern

**Why:** Line 8 (`router.use(requireAuth)`) applies `requireAuth` before all order handlers. `orderController.js` reads `request.user.id` on lines 5, 9, and 13. If `requireAuth` does not set `request.user` correctly under the new OAuth flow, all three order endpoints silently receive `undefined` as `userId`.

Additionally, `orderService.createOrder` passes `userId` to `userService.getProfile` (which does a DB lookup) and to `paymentService.preparePayment` (ownership check). A wrong or missing `userId` propagates through the entire order creation chain.

**Evidence:** `orderRoutes.js` line 8; `orderController.js` lines 5, 9, 13.

---

### `shopflow-demo/src/routes/paymentRoutes.js`

**Impact level:** INDIRECT — same `requireAuth` dependency pattern

**Why:** Line 8 (`router.use(requireAuth)`) gates all payment routes. `paymentController.js` passes `request.user.id` as `userId` on lines 8, 14, and 18. `paymentService` uses this `userId` as an ownership check in `getOwnedOrder` (which compares `order.userId !== userId`). An incorrect or absent `userId` from a changed `request.user` shape would incorrectly deny or grant access to payment records.

**Evidence:** `paymentRoutes.js` line 8; `paymentController.js` lines 8, 14, 18; `paymentService.js` line 8.

---

### `shopflow-demo/src/models/userModel.js`

**Impact level:** INDIRECT — `create` method signature may need review

**Why:** `authService.register` currently calls `userModel.create({ name, email, passwordHash })` (line 10 of `authService.js`). The `create` method in `userModel.js` (line 15) requires `passwordHash` as a mandatory field and inserts it into the `password_hash` column (line 17).

With OAuth 2.0, the application may no longer manage passwords. If `authService.register` is rewritten to create a user without a password hash (e.g., using a provider-assigned subject identifier), `userModel.create` would need a new signature that makes `passwordHash` optional or removes it. The method currently has no default for `passwordHash` and the SQL `INSERT` would fail without it.

**Evidence:** `userModel.js` line 15: `create({ name, email, passwordHash })`; line 17: `INSERT INTO users (name, email, password_hash)`.

---

### `shopflow-demo/src/db/schema.sql`

**Impact level:** INDIRECT — schema contains `password_hash NOT NULL` which conflicts with passwordless OAuth identity

**Why:** The `users` table (lines 1–8) includes `password_hash TEXT NOT NULL`. If OAuth replaces local password management entirely, this column becomes meaningless and its `NOT NULL` constraint would either require a dummy value or a schema migration. Additionally, an OAuth identity provider typically issues a unique subject identifier (`sub`) that the application must store to correlate OAuth identities to local user rows — no such column currently exists.

This is a schema-level design decision that would require a migration (`ALTER TABLE` or a new column like `oauth_subject`) and a corresponding change to `userModel.js`.

**Evidence:** `schema.sql` line 4: `password_hash TEXT NOT NULL`.

---

### `shopflow-demo/src/services/userService.js`

**Impact level:** INDIRECT — called by `authService` and all three protected route domains

**Why:** `userService.getProfile(userId)` is called by `orderService.createOrder` and `orderService.listOrders` (lines 10, 40 of `orderService.js`). It does a `userModel.findById(userId)` lookup and throws 404 if the user is not found.

If OAuth user provisioning changes when or how user rows are created (e.g., lazy creation on first OAuth callback rather than explicit registration), `userService.getProfile` could throw 404 for a legitimately authenticated OAuth user who has not yet been provisioned locally. The service logic itself does not change, but it must be reviewed to confirm the provisioning strategy is compatible.

**Evidence:** `userService.js` lines 5–8; `orderService.js` lines 10, 40.

---

### `shopflow-demo/tests/helpers.js`

**Impact level:** INDIRECT — test harness is deeply coupled to the current JWT and password-based auth

**Why:** Three critical dependencies in this file change under OAuth:

1. **Line 2:** `process.env.JWT_SECRET = 'test-secret'` — sets the JWT signing secret read by `utils/jwt.js`. Under OAuth, the signing key is managed by the authorization server; this override becomes irrelevant or must be replaced with a mock OAuth server configuration.
2. **Line 6:** `const { authService } = await import('../src/services/authService.js')` — imports `authService` specifically to call `authService.register` inside `createTestUser`.
3. **Lines 23–29:** `createTestUser()` calls `authService.register(...)` with `name`, `email`, and `password` fields and returns a `{ token }`. Tests that use `createTestUser()` depend on getting back a usable Bearer token this way. If `authService.register` no longer issues JWTs directly, this helper breaks and every test file that calls `createTestUser()` fails.

**Evidence:** `helpers.js` lines 2, 6, 23–29.

---

### `shopflow-demo/package.json`

**Impact level:** INDIRECT — dependency list must change

**Why:** The current `dependencies` include `jsonwebtoken` (line 21), which is used exclusively by `utils/jwt.js`. Under OAuth 2.0, `jsonwebtoken` may be removed (if token verification is delegated to the OAuth server) or replaced with a JWKS client library. Separately, `bcryptjs` (line 17) is used exclusively in `authService.js` for password hashing. If passwords are no longer managed by this application, `bcryptjs` can be removed.

New OAuth-related packages (e.g., a Passport.js OAuth strategy, an OAuth client library, or a JWKS URI fetcher) would need to be added.

**Evidence:** `package.json` lines 17, 21; cross-referenced with `utils/jwt.js` line 1 and `authService.js` line 1.

---

## 3. Affected Modules

| Module | Affected? | Reason |
|---|---|---|
| **Authentication** | YES — directly | JWT issuance and verification are the core of this change |
| **Middleware** | YES — directly | `authMiddleware.js` implements token verification |
| **Users** | YES — indirectly | User creation tied to password storage; `userModel.create` requires `passwordHash` |
| **Orders** | YES — indirectly | Depends on `request.user.id` from `authMiddleware`; `orderService` calls `userService` |
| **Payments** | YES — indirectly | Depends on `request.user.id` from `authMiddleware`; ownership checks in `paymentService` |
| **Products** | NO | `productRoutes.js` does not import or use `requireAuth`; product routes are public |
| **Database** | YES — indirectly | `password_hash NOT NULL` constraint in schema conflicts with passwordless OAuth identity |

---

## 4. Affected API Routes

| Method | Route | Why affected |
|---|---|---|
| `POST` | `/api/auth/register` | Current route validates `name`, `email`, `password` fields; the entire endpoint shape changes under OAuth |
| `POST` | `/api/auth/login` | Current route validates `email` and `password`; replaced by OAuth authorization/callback endpoints |
| `GET` | `/api/users/me` | Protected by `requireAuth`; must still work after `request.user` contract changes |
| `PUT` | `/api/users/me` | Protected by `requireAuth`; same concern |
| `POST` | `/api/orders` | Protected by `requireAuth`; passes `request.user.id` to `orderService` |
| `GET` | `/api/orders` | Protected by `requireAuth`; passes `request.user.id` to `orderService` |
| `GET` | `/api/orders/:id` | Protected by `requireAuth`; passes `request.user.id` to `orderService` |
| `POST` | `/api/payments` | Protected by `requireAuth`; passes `request.user.id` to `paymentService` |
| `GET` | `/api/payments/:id` | Protected by `requireAuth`; passes `request.user.id` to `paymentService` |
| `POST` | `/api/payments/:id/refund` | Protected by `requireAuth`; passes `request.user.id` to `paymentService` |

**Not affected:**
- `GET /api/products` — no auth middleware applied (`productRoutes.js` does not import `requireAuth`)
- `GET /api/products/:id` — same as above
- `GET /health` — inline handler in `app.js`, no auth dependency

---

## 5. Dependencies That Require Review

### D1 — `request.user` identity contract

**Files:** `authMiddleware.js` → `userController.js`, `orderController.js`, `paymentController.js`

`verifyToken` in `utils/jwt.js` line 13 returns `{ id: Number(payload.sub), role: payload.role }`. This exact shape is consumed without transformation by all three controllers via `request.user.id`. Under OAuth 2.0, the access token may not contain a numeric `sub` that maps directly to the local database `users.id`. The OAuth subject is typically an opaque or UUID-format string from the provider, not a SQLite autoincrement integer. Resolving the OAuth subject to a local integer user ID may require a database lookup in `requireAuth`, which is currently absent.

### D2 — `bcryptjs` password hashing / comparison

**Files:** `authService.js` lines 9, 16

`bcrypt.hash` and `bcrypt.compare` are called only in `authService`. If OAuth takes over credential management, these calls become dead code. However, if the migration is incremental (existing local users before migration), stored `password_hash` values in the database remain and a migration strategy is needed.

### D3 — `userModel.create` signature (mandatory `passwordHash`)

**Files:** `userModel.js` line 15; `schema.sql` line 4

`create({ name, email, passwordHash })` requires `passwordHash` and the column is `NOT NULL`. Any new user provisioning path that does not supply a password hash will fail at the SQL level with a constraint violation.

### D4 — Test token acquisition via `authService.register`

**Files:** `tests/helpers.js` lines 23–29; `tests/orders.test.js` line 9; `tests/payments.test.js` line 9

`createTestUser()` calls `authService.register(...)` and returns a `{ token }`. All test assertions in `orders.test.js` and `payments.test.js` use this token as a `Bearer` header. If `authService.register` no longer issues tokens, the test infrastructure has no mechanism to obtain a valid token.

### D5 — JWT environment configuration

**Files:** `.env.example` lines 2–3; `utils/jwt.js` lines 3, 7

`JWT_SECRET` and `JWT_EXPIRES_IN` are the only auth-related environment variables. Neither exists in OAuth 2.0 configuration. The OAuth implementation needs different environment variables, and all deployment environments must be updated.

---

## 6. Security-Sensitive Areas

### S1 — Token verification (`utils/jwt.js` → `authMiddleware.js`)

The current `verifyToken` uses a shared symmetric secret (`JWT_SECRET`). OAuth 2.0 uses asymmetric signatures (RSA/ECDSA) with public keys fetched from a JWKS endpoint, or opaque tokens verified via introspection. Both require network calls or key management that the current code has no infrastructure for. A misconfigured or absent verification step could allow unauthenticated access to all protected routes.

### S2 — Ownership checks in `paymentService.js`

`paymentService.js` lines 7–9 and line 46 verify that the requesting user owns the order being accessed by comparing `order.userId !== userId`. This `userId` comes from `request.user.id`, which ultimately comes from the verified token. If the OAuth migration changes how `request.user.id` is resolved (see D1), the ownership guard could be bypassed or incorrectly applied.

### S3 — Password hash in database schema

`schema.sql` line 4: `password_hash TEXT NOT NULL`. After migration, this column stores no meaningful data but still holds bcrypt hashes for any users who registered before the migration. These must be handled during migration — either nulled out (requiring a schema change) or left as orphaned sensitive data.

### S4 — `bcryptjs` removal without credential migration

`authService.js` login currently compares submitted passwords against stored `password_hash`. Removing this before migrating existing users means those users can no longer log in via any mechanism. An incremental migration strategy is required.

### S5 — Test secret (`JWT_SECRET = 'test-secret'`)

`tests/helpers.js` line 2 sets a predictable JWT secret. Under OAuth, if token generation for tests uses a mock OAuth server, the new secret/key must be equally unpredictable and must not leak into production configuration.

---

## 7. Tests That Should Be Updated or Added

### Must be rewritten

#### `tests/auth.test.js`
The entire test file exercises the current JWT register/login endpoints:
- Lines 9–11: `POST /api/auth/register` with `name`, `email`, `password` — endpoint changes entirely
- Lines 26–28: `POST /api/auth/login` with credentials — endpoint replaced by OAuth flow
- Lines 13–14: `assert.ok(registered.body.token)` — response shape changes under OAuth
- Line 15: `assert.equal('passwordHash' in registered.body.user, false)` — relevant only if `authService.register` still creates a user with a `passwordHash` field in the response

The entire file must be rewritten or replaced to test OAuth-specific flows: authorization redirect, callback handling, token exchange, token rejection.

### Must be reviewed and likely modified

#### `tests/helpers.js`
- Line 2: `process.env.JWT_SECRET = 'test-secret'` — must be replaced with OAuth test configuration
- Line 6: `await import('../src/services/authService.js')` — `authService` API changes substantially
- Lines 23–29: `createTestUser()` — calls `authService.register` to obtain a token. Must be rewritten to obtain tokens via a mock OAuth server or by directly constructing a token using the new verification keys

#### `tests/orders.test.js`
- Lines 9–11: calls `createTestUser()` from `helpers.js` to obtain a Bearer token. If `createTestUser()` is broken (see above), all assertions fail before they execute
- Lines 11–12 and 28–29: all protected requests use `Authorization: Bearer ${token}` — these will continue to work structurally if the new `requireAuth` still accepts Bearer tokens, but the token acquisition mechanism must be fixed

#### `tests/payments.test.js`
- Lines 9–13: calls `createTestUser()` for a token; same dependency as `orders.test.js`
- Lines 15–18, 22–30: all requests carry `Authorization: Bearer ${token}` — same structural comment as above

#### `tests/integration.test.js`
- Lines 9–12: calls `POST /api/auth/register` directly and reads `registration.body.token` from the response. Both the endpoint shape and the token-in-response pattern change under OAuth
- Line 12: `const authorization = { Authorization: \`Bearer ${registration.body.token}\` }` — if registration no longer directly returns a token, this entire setup fails

### No changes required

#### `tests/products.test.js`
This file makes no authenticated requests. All calls are unauthenticated `GET /api/products` and `GET /api/products/:id` requests, which `productRoutes.js` does not protect with `requireAuth`. No changes are needed.

### New tests to add

| Test description | Reason |
|---|---|
| OAuth authorization redirect produces correct `Location` header and state parameter | Verifies the new `/api/auth/authorize` (or equivalent) endpoint initiates the OAuth flow correctly |
| OAuth callback with valid authorization code returns authenticated session/token | Verifies the callback handler exchanges the code and provisions/retrieves the user |
| OAuth callback with invalid or expired code returns 401/400 | Verifies error handling in the callback flow |
| OAuth token with missing or invalid signature is rejected by `requireAuth` | Regression: `requireAuth` must still reject bad tokens after the JWT → OAuth change |
| OAuth token with expired `exp` claim is rejected by `requireAuth` | Token expiry must still be enforced |
| Authenticated access to `/api/users/me` works with a valid OAuth token | End-to-end smoke test for the new `request.user.id` population path |
| Cross-user access to an order is rejected (ownership check still works) | Ensures the `paymentService` and `orderService` ownership guards work with the new `userId` source |

---

## 8. Potential Risks

### Risk 1 — `request.user.id` type mismatch (HIGH)
**Evidence:** `utils/jwt.js` line 13 returns `id: Number(payload.sub)`. The OAuth provider's subject (`sub`) is typically a UUID string (e.g., `"google|abc123"`), not a number. `Number("google|abc123")` returns `NaN`. All downstream ownership checks (`order.userId !== userId`, `paymentService.js` line 8) would silently fail with `NaN` comparisons. Every protected domain (orders, payments, users) would be broken until a `userId` resolution strategy is implemented.

### Risk 2 — Database user provisioning gap (HIGH)
**Evidence:** `userService.getProfile(userId)` is called as a guard in `orderService.createOrder` (line 10) and `orderService.listOrders` (line 40). If OAuth user authentication succeeds but the local user row has not yet been created (e.g., first login after OAuth migration), `userService.getProfile` throws `AppError(404, 'User not found')`. Order and listing endpoints would return 404 for authenticated users who have not been locally provisioned.

### Risk 3 — `password_hash NOT NULL` blocks non-password user creation (HIGH)
**Evidence:** `schema.sql` line 4; `userModel.create` line 15. Any user provisioning path that does not supply a `bcryptjs` hash will fail with a SQLite constraint violation. This is a hard crash, not a graceful error.

### Risk 4 — Existing user credential loss (MEDIUM)
**Evidence:** `authService.js` lines 9, 16. Currently registered users have their passwords stored as `bcrypt` hashes. If the migration removes the login endpoint and the password comparison logic, those users can no longer authenticate. Without a migration strategy (e.g., link existing accounts to OAuth identities), all existing users lose access.

### Risk 5 — Token expiry and revocation semantics change (MEDIUM)
**Evidence:** `utils/jwt.js` line 7 sets `expiresIn: process.env.JWT_EXPIRES_IN || '1d'`. OAuth access tokens may have shorter expiry times (e.g., 1 hour) and use refresh tokens for renewal. The application currently has no refresh-token logic. If expiry shortens, callers may begin receiving 401s on long-lived sessions without understanding the new refresh mechanism.

### Risk 6 — Asynchronous `requireAuth` breaking Express middleware chain (MEDIUM)
**Evidence:** `authMiddleware.js` line 4: `requireAuth` is currently synchronous. OAuth token introspection or JWKS key fetching is asynchronous. Express 5 (in use — `package.json` line 19: `"express": "^5.1.0"`) supports async middleware natively, so this is lower risk than it would be in Express 4, but the change must be explicitly handled and tested.

### Risk 7 — Test suite produces false positives during transition (LOW–MEDIUM)
**Evidence:** `tests/helpers.js` line 2 hardcodes `JWT_SECRET = 'test-secret'`. If a partial migration leaves `utils/jwt.js` still in place and tests continue to use the hardcoded secret, tests will pass against the old JWT code while the new OAuth path is untested.

---

## 9. Areas That Should Be Regression-Tested

### R1 — Bearer token rejection for all protected routes
After the change, `GET /api/users/me`, `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`, `POST /api/payments`, `GET /api/payments/:id`, and `POST /api/payments/:id/refund` must all return HTTP 401 when called without a token or with a malformed/expired token.

**Current evidence of this behaviour:** `auth.test.js` line 29: `await request(app).get('/api/users/me').expect(401)` (no token). This test establishes the baseline; the equivalent must exist post-migration.

### R2 — `request.user.id` correctly propagates as a valid local database integer
After authentication, `request.user.id` must resolve to an integer that exists in the `users` table. Regression: call `GET /api/users/me` with a valid OAuth token and assert the response is the correct user profile, not a 404.

**Risk if broken:** All ownership checks in `paymentService.getOwnedOrder` and `orderService.getOrder` silently fail.

### R3 — Order creation still reserves stock and creates a payment record
The `POST /api/orders` flow crosses five services and four tables. Any disruption to `request.user.id` propagation breaks `userService.getProfile`, `paymentService.preparePayment`, and the ownership checks. Regression: create an order and assert `order.status === 'pending'`, `order.payment.status === 'pending'`, and that product stock decremented.

**Current evidence:** `tests/orders.test.js` lines 8–23.

### R4 — Payment ownership check still blocks cross-user access
`paymentService.getOwnedOrder` compares `order.userId !== userId`. Regression: authenticate as user A, create an order, then attempt to pay it as user B and assert HTTP 404.

### R5 — Refund flow still updates order status to `refunded`
`paymentService.refundPayment` calls `orderModel.updateStatus(payment.orderId, 'refunded')`. Regression: after a refund, assert `GET /api/orders/:id` returns `status === 'refunded'`.

**Current evidence:** `tests/payments.test.js` lines 28–30.

### R6 — Public product routes remain unauthenticated
`GET /api/products` and `GET /api/products/:id` must continue to work without any token. Regression: confirm both endpoints return 200 with no `Authorization` header.

**Current evidence:** `tests/products.test.js` (entire file makes unauthenticated requests).

### R7 — Full end-to-end checkout flow with OAuth token
Equivalent to `tests/integration.test.js`: register (or provision via OAuth) → browse products → create order → process payment → retrieve order history. All steps must succeed using tokens obtained through the new OAuth mechanism.

---

## Structured Reference

```
change_impact_analysis:
  proposed_change: "Replace JWT-based authentication with OAuth 2.0"
  repository: "shopflow-demo"

  directly_affected_files:
    - file: "src/utils/jwt.js"
      reason: "Contains the entire JWT sign/verify implementation; must be replaced under OAuth"
      lines_at_risk: "1-14 (entire file)"
    - file: "src/middleware/authMiddleware.js"
      reason: "Calls verifyToken from jwt.js; verification logic changes completely under OAuth"
      lines_at_risk: "1, 5-16"
    - file: "src/services/authService.js"
      reason: "Owns register/login logic, bcrypt password hashing, and signToken calls"
      lines_at_risk: "1, 3, 7-20"
    - file: "src/controllers/authController.js"
      reason: "Handlers map to credential-based register/login; both endpoints change under OAuth"
      lines_at_risk: "1-12 (entire file)"
    - file: "src/routes/authRoutes.js"
      reason: "Defines POST /register and POST /login with password-specific validation; endpoints replaced"
      lines_at_risk: "7-15"
    - file: ".env.example"
      reason: "Documents JWT_SECRET and JWT_EXPIRES_IN; both replaced by OAuth environment variables"
      lines_at_risk: "2-3"

  indirectly_affected_files:
    - file: "src/routes/userRoutes.js"
      reason: "Applies requireAuth via router.use(); depends on request.user being set correctly"
    - file: "src/routes/orderRoutes.js"
      reason: "Applies requireAuth; controllers pass request.user.id to orderService"
    - file: "src/routes/paymentRoutes.js"
      reason: "Applies requireAuth; controllers pass request.user.id to paymentService"
    - file: "src/models/userModel.js"
      reason: "create() requires passwordHash; schema has password_hash NOT NULL"
    - file: "src/db/schema.sql"
      reason: "password_hash TEXT NOT NULL conflicts with passwordless OAuth user provisioning"
    - file: "src/services/userService.js"
      reason: "Called by orderService as a guard; OAuth users may not be locally provisioned yet"
    - file: "tests/helpers.js"
      reason: "Sets JWT_SECRET; uses authService.register to obtain tokens for tests"
    - file: "tests/auth.test.js"
      reason: "Entire file tests JWT register/login; must be rewritten for OAuth"
    - file: "package.json"
      reason: "jsonwebtoken and bcryptjs dependencies may be removed; OAuth library must be added"

  affected_modules:
    - Authentication
    - Middleware
    - Users (indirectly)
    - Orders (indirectly)
    - Payments (indirectly)

  not_affected_modules:
    - Products (productRoutes.js has no requireAuth; productController and productService are untouched)

  affected_apis:
    directly:
      - "POST /api/auth/register"
      - "POST /api/auth/login"
    indirectly_protected_routes:
      - "GET /api/users/me"
      - "PUT /api/users/me"
      - "POST /api/orders"
      - "GET /api/orders"
      - "GET /api/orders/:id"
      - "POST /api/payments"
      - "GET /api/payments/:id"
      - "POST /api/payments/:id/refund"
    not_affected:
      - "GET /api/products"
      - "GET /api/products/:id"
      - "GET /health"

  risks:
    - id: R1
      severity: HIGH
      title: "request.user.id type mismatch (OAuth sub vs. SQLite integer)"
    - id: R2
      severity: HIGH
      title: "User provisioning gap: authenticated OAuth users may not have local rows"
    - id: R3
      severity: HIGH
      title: "password_hash NOT NULL blocks OAuth-provisioned user creation"
    - id: R4
      severity: MEDIUM
      title: "Existing users lose access if credential migration is not planned"
    - id: R5
      severity: MEDIUM
      title: "Token expiry semantics change; no refresh-token logic currently exists"
    - id: R6
      severity: MEDIUM
      title: "requireAuth becoming async must be explicitly handled"
    - id: R7
      severity: LOW
      title: "Partial migration may allow tests to pass against old JWT code"

  tests_requiring_update:
    must_rewrite:
      - "tests/auth.test.js"
      - "tests/helpers.js"
    must_review_and_likely_modify:
      - "tests/orders.test.js"
      - "tests/payments.test.js"
      - "tests/integration.test.js"
    no_changes_required:
      - "tests/products.test.js"
```
