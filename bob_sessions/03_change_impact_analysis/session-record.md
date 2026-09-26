# Session 03 — Change-Impact Analysis

## Task Given to Bob

> "Analyze the impact of the following proposed change to the ShopFlow repository:
> Replace the existing JWT-based authentication flow with OAuth 2.0 authentication.
>
> For every source file in shopflow-demo/, determine whether it is:
> - Directly affected (will require code changes)
> - Indirectly affected (downstream of a changed contract, requires review/testing)
> - Unaffected
>
> For each affected file, explain specifically WHY it is affected — citing the actual
> import, function call, or data contract that creates the dependency.
> Identify all affected API routes, risks, and tests.
> Base every finding on the actual source code. Do not invent impact.
> Save as: docs/bob-change-impact-analysis.md"

## What Bob Did

Bob re-read every ShopFlow source file with the proposed change as the lens, tracing
the blast radius of replacing `utils/jwt.js` and `middleware/authMiddleware.js` through
the entire dependency graph established in Session 02.

For each file, Bob applied a structured classification:
- Is the JWT implementation directly contained in this file?
- Does this file import from a file that will change?
- Does this file rely on a contract (`request.user.id`, `authService.register`) that
  will change?
- Does this file contain tests that exercise the changed code paths?

Bob then analyzed each risk dimension: type safety (`Number(payload.sub)`), database
constraints (`password_hash TEXT NOT NULL`), test infrastructure (`createTestUser()`),
and API surface changes.

## Output Produced

**Artifact:** `docs/bob-change-impact-analysis.md`

### Summary counts from the analysis

| Category | Count |
|----------|-------|
| Directly affected files | 6 |
| Indirectly affected files | 9 |
| Affected API routes | 7 |
| Risks identified | 7 (RISK-001 through RISK-007) |
| Test scenarios identified | 13 |

### Directly affected files identified by Bob

| File | Why directly affected |
|------|----------------------|
| `src/utils/jwt.js` | Contains entire JWT implementation (`signToken`, `verifyToken`) — both functions must be replaced |
| `src/middleware/authMiddleware.js` | Imports `verifyToken`; entire `requireAuth` body changes from sync local verify to async OAuth verify |
| `src/services/authService.js` | Owns `register` and `login`; both methods replaced by OAuth callback/provisioning flow |
| `src/controllers/authController.js` | Handlers tightly coupled to credential-based request shape; replaced by OAuth handlers |
| `src/routes/authRoutes.js` | `POST /register` and `POST /login` endpoints replaced by OAuth-specific routes |
| `.env.example` | `JWT_SECRET` and `JWT_EXPIRES_IN` replaced by OAuth client credentials and callback URIs |

### Key risks identified

| Risk ID | Title | Severity |
|---------|-------|---------|
| RISK-001 | `request.user.id` will be NaN under OAuth (`Number("google\|abc123") === NaN`) | HIGH |
| RISK-002 | User provisioning gap — 404 on order creation for unprovisioned OAuth user | HIGH |
| RISK-003 | `password_hash TEXT NOT NULL` prevents OAuth user creation | HIGH |
| RISK-004 | Existing user credential loss | MEDIUM |
| RISK-005 | Token expiry semantics change / no refresh logic | MEDIUM |
| RISK-006 | `requireAuth` async correctness — forgotten `await` silently skips verification | MEDIUM |
| RISK-007 | Partial migration produces false-positive tests | LOW |

## Why This Session Matters for IMPACT

This session is the analytical heart of the IMPACT golden demo. The findings produced
here are what the Risk Analysis page, Test Recommendations page, and Release Readiness
page all display. The 6 directly affected files form the Impact Map's Level 1. The 9
indirectly affected files form Levels 2–3. The 7 risks feed the Risk Analysis page.
The 13 test scenarios feed the Test Recommendations page.

Every IMPACT display that shows a finding can be traced to a specific sentence or
table row in `docs/bob-change-impact-analysis.md`.

## Screenshot / Session Transcript

The IBM Bob environment does not retain interactive session transcripts or screenshots
after the session ends. The session output is preserved entirely in the artifact:

**→ `docs/bob-change-impact-analysis.md`** (present in repository)

This file is the session evidence.
