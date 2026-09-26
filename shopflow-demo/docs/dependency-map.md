# ShopFlow Dependency Map

This map describes the current ShopFlow repository only. It is an evaluation artifact for this repository version; a replacement ShopFlow implementation needs its own map. Edges below come from JavaScript imports or, for the schema, the explicit runtime file read in `src/config/database.js`.

## High-Level Graph

```text
src/app.js
  -> route groups -> controllers -> services -> models -> SQLite connection
       |                 |            |                         |
       |                 |            |                         +-> src/db/schema.sql
       |                 |            +-> service/model coordination
       |                 +-> validation and, on protected route groups, auth middleware
       +-> not-found and error middleware

src/server.js -> app + database initialization + seed
```

This is a simplified view. Some controllers call one service; orchestration between domains happens inside `orderService` and `paymentService`.

## Domain Relationships

```text
Authentication
authRoutes -> authController -> authService -> userModel -> database
                                      |             +-> bcryptjs
                                      +-> JWT utility -> jsonwebtoken

Protected requests
user/order/payment routes -> authMiddleware -> JWT utility
                                              +-> AppError

Users
userRoutes -> userController -> userService -> userModel -> database
                                      ^
                                      | called by orderService

Products
productRoutes -> productController -> productService -> productModel -> database
                                           ^
                                           | called by orderService

Orders
orderRoutes -> orderController -> orderService
                                    |-> userService
                                    |-> productService
                                    |-> database transaction
                                    |-> orderModel -> database
                                    +-> paymentService.preparePayment

Payments
paymentRoutes -> paymentController -> paymentService
                                         |-> orderModel (ownership and status)
                                         |-> paymentModel -> database
                                         +-> mockPaymentProvider
```

`paymentService` updates order status through `orderModel`; it does not import `orderService`. `orderService` directly imports and calls `paymentService` to create the order's pending payment record. The provider is internal and mock-only.

## File-Level Dependencies

The table lists direct in-repository dependencies. External packages and Node built-ins are noted in the relationship column, not counted as file edges. A schema read is included as a resource dependency even though it is not an ES module import. **Count: 54 direct in-repository file/resource relationships.**

| Source File | Depends On | Relationship |
|-------------|------------|--------------|
| `src/app.js` | `src/routes/authRoutes.js`; `src/routes/userRoutes.js`; `src/routes/productRoutes.js`; `src/routes/orderRoutes.js`; `src/routes/paymentRoutes.js`; `src/middleware/errorMiddleware.js` | Mounts route groups and terminal 404/error handlers. Also uses Express. |
| `src/server.js` | `src/app.js`; `src/config/database.js`; `src/db/seed.js` | Initializes database, seeds catalog, then starts the app. Also loads `dotenv/config`. |
| `src/config/database.js` | `src/db/schema.sql` | Reads and executes this SQL during initialization; also owns the shared SQLite connection. Uses `better-sqlite3` and Node filesystem/path/url built-ins. |
| `src/db/seed.js` | `src/config/database.js` | Calls schema initialization and uses the shared database to insert products. Also loads dotenv and Node path/url built-ins. |
| `src/middleware/authMiddleware.js` | `src/utils/jwt.js`; `src/utils/errors.js` | Verifies Bearer tokens and forwards authentication errors. |
| `src/middleware/errorMiddleware.js` | `src/utils/errors.js` | Uses `AppError` to select HTTP status and response message. |
| `src/middleware/validationMiddleware.js` | `src/utils/errors.js` | Converts body and ID validation failures into `AppError`. |
| `src/models/userModel.js` | `src/config/database.js` | Runs user create/find/update SQL through the shared connection. |
| `src/models/productModel.js` | `src/config/database.js` | Runs catalog, lookup, and conditional stock-decrement SQL. |
| `src/models/orderModel.js` | `src/config/database.js` | Persists orders/items, reads order history, and updates order status. |
| `src/models/paymentModel.js` | `src/config/database.js` | Persists, reads, and updates payments. |
| `src/services/authService.js` | `src/models/userModel.js`; `src/utils/jwt.js`; `src/utils/errors.js` | Uses the user model for credentials/accounts, JWT signing for sessions, and application errors. Also uses `bcryptjs`. |
| `src/services/userService.js` | `src/models/userModel.js`; `src/utils/errors.js` | Implements profile retrieval/update and missing/duplicate-user errors. |
| `src/services/productService.js` | `src/models/productModel.js`; `src/utils/errors.js` | Implements product lookup/list behavior and stock-reservation errors. |
| `src/services/orderService.js` | `src/config/database.js`; `src/models/orderModel.js`; `src/services/productService.js`; `src/services/userService.js`; `src/services/paymentService.js`; `src/utils/errors.js` | Coordinates user/product checks, a SQLite inventory/order transaction, order reads, and payment-intent creation. |
| `src/services/paymentService.js` | `src/models/orderModel.js`; `src/models/paymentModel.js`; `src/providers/mockPaymentProvider.js`; `src/utils/errors.js` | Verifies order ownership, runs provider processing/refunds, and updates payment and order states. |
| `src/controllers/authController.js` | `src/services/authService.js` | Delegates register/login requests and chooses the register response status. |
| `src/controllers/userController.js` | `src/services/userService.js` | Delegates profile retrieval and update. |
| `src/controllers/productController.js` | `src/services/productService.js` | Parses list query parameters and delegates catalog operations. |
| `src/controllers/orderController.js` | `src/services/orderService.js` | Delegates order create/list/read using the authenticated user ID. |
| `src/controllers/paymentController.js` | `src/services/paymentService.js` | Delegates payment process/read/refund using request data and user ID. |
| `src/routes/authRoutes.js` | `src/controllers/authController.js`; `src/middleware/validationMiddleware.js` | Wires validated registration/login requests. Also uses Express Router. |
| `src/routes/userRoutes.js` | `src/controllers/userController.js`; `src/middleware/authMiddleware.js`; `src/middleware/validationMiddleware.js` | Protects profile routes and validates optional profile fields. Also uses Express Router. |
| `src/routes/productRoutes.js` | `src/controllers/productController.js`; `src/middleware/validationMiddleware.js` | Wires public catalog routes and validates product IDs. Also uses Express Router. |
| `src/routes/orderRoutes.js` | `src/controllers/orderController.js`; `src/middleware/authMiddleware.js`; `src/middleware/validationMiddleware.js` | Protects order routes and validates item lists/IDs. Also uses Express Router. |
| `src/routes/paymentRoutes.js` | `src/controllers/paymentController.js`; `src/middleware/authMiddleware.js`; `src/middleware/validationMiddleware.js` | Protects payment routes and validates payment input/IDs. Also uses Express Router. |
| `src/providers/mockPaymentProvider.js` | — | No local module dependencies; uses Node's `node:crypto` `randomUUID` and implements process/refund results. |
| `src/utils/errors.js` | — | Defines `AppError`; no local module dependencies. |
| `src/utils/jwt.js` | — | Uses external `jsonwebtoken` to sign/verify claims; no local module dependencies. |
| `src/db/schema.sql` | — | SQL schema resource, not an imported JavaScript module; read by `src/config/database.js`. |

### Reverse Relationships

- A change to `src/services/productService.js` can affect `src/services/orderService.js`, which imports it for product lookup and stock reservation.
- A change to `src/services/userService.js` can affect `src/services/orderService.js`, which checks the user during order creation and listing.
- A change to `src/services/paymentService.js` can affect `src/services/orderService.js`, which calls `preparePayment` after order creation.
- A change to `src/models/orderModel.js` can affect both `src/services/orderService.js` and `src/services/paymentService.js`.
- A change to `src/middleware/authMiddleware.js` can affect the user, order, and payment route groups that apply it.

## Module-Level Graph

This is a domain-level summary, not every import or an assertion that each domain has a separate package/service layer.

```text
Authentication -> Users -> Orders
Products ----------------> Orders -> Payments
                              ^         |
                              +---------+  (payment flow reads/updates order)

Protected route groups -> Authentication middleware -> JWT utility
Models and orderService -> shared database connection -> SQLite schema
```

The source-backed domain links are: `authService -> userModel`, `orderService -> userService`, `orderService -> productService`, `orderService -> paymentService`, and `paymentService -> orderModel`. There is no `paymentService -> orderService` import.

## API Surface

All routes except `/health` are mounted under `/api` in `src/app.js`.

| Method | Endpoint | Route group |
|---|---|---|
| GET | `/health` | Inline in `src/app.js` |
| POST | `/api/auth/register` | Auth |
| POST | `/api/auth/login` | Auth |
| GET | `/api/users/me` | Users (protected) |
| PUT | `/api/users/me` | Users (protected) |
| GET | `/api/products` | Products |
| GET | `/api/products/:id` | Products |
| POST | `/api/orders` | Orders (protected) |
| GET | `/api/orders` | Orders (protected) |
| GET | `/api/orders/:id` | Orders (protected) |
| POST | `/api/payments` | Payments (protected) |
| GET | `/api/payments/:id` | Payments (protected) |
| POST | `/api/payments/:id/refund` | Payments (protected) |

## Common Change Scenarios

The detailed machine-readable counterpart is [`change-impact-ground-truth.json`](change-impact-ground-truth.json). Direct files are the likely implementation touchpoints; indirect files are contracts, consumers, or tests to review. Existing inventory reservation and full-refund support are explicitly treated as existing behavior.

### SCN-001: Replace JWT Authentication with OAuth 2.0

- **Direct:** `src/services/authService.js`, `src/middleware/authMiddleware.js`, `src/utils/jwt.js`, `src/controllers/authController.js`, `src/routes/authRoutes.js`, `.env.example`.
- **Indirect:** `src/routes/userRoutes.js`, `src/routes/orderRoutes.js`, `src/routes/paymentRoutes.js`; `tests/auth.test.js`, `tests/integration.test.js`, `tests/helpers.js`, `tests/orders.test.js`, `tests/payments.test.js`.
- **Modules/APIs:** Authentication and protected User/Order/Payment routes; existing register/login and protected endpoints.
- **Risk/tests:** Identity-to-`request.user` contract, callback/configuration, invalid/expired credentials. Verify successful and rejected OAuth flows plus access to protected routes. OAuth callbacks are not current APIs.

### SCN-002: Change Password Hashing Implementation

- **Direct:** `src/services/authService.js`, `package.json`, `package-lock.json` if the hashing package changes.
- **Indirect:** `src/models/userModel.js`; `tests/auth.test.js`, `tests/integration.test.js`, `tests/orders.test.js`, `tests/payments.test.js`.
- **Modules/APIs:** Authentication and Users; `POST /api/auth/register`, `POST /api/auth/login`.
- **Risk/tests:** Existing stored hash compatibility and failed-login behavior. Verify new hashes, existing credential verification/migration policy, wrong passwords, and duplicate registration.

### SCN-003: Add Role-Based Authorization

- **Direct:** `src/middleware/authMiddleware.js`, `src/routes/userRoutes.js`, `src/routes/orderRoutes.js`, `src/routes/paymentRoutes.js`.
- **Indirect:** `src/utils/jwt.js`, `src/services/authService.js`, `src/models/userModel.js`; `tests/auth.test.js`, `tests/orders.test.js`, `tests/payments.test.js`, `tests/integration.test.js`.
- **Modules/APIs:** Middleware, Authentication, Users, Orders, Payments; protected `/api/users/me`, `/api/orders...`, and `/api/payments...` endpoints.
- **Risk/tests:** Role is already stored and included in JWT claims, but current middleware only verifies tokens and does not enforce roles. Verify permitted and denied roles for each protected route, including invalid/missing role claims.

### SCN-004: Change Product Pricing Calculation

- **Direct:** `src/models/productModel.js`, `src/services/orderService.js`.
- **Indirect:** `src/services/productService.js`, `src/models/orderModel.js`, `src/services/paymentService.js`, `src/controllers/productController.js`; `tests/products.test.js`, `tests/orders.test.js`, `tests/payments.test.js`, `tests/integration.test.js`.
- **Modules/APIs:** Products, Orders, Payments; `GET /api/products`, `GET /api/products/:id`, `POST /api/orders`, order reads, and `POST /api/payments`.
- **Risk/tests:** The product model maps integer cents to decimal prices, order creation snapshots those prices and totals in cents, and payment processing compares the submitted amount to the order total. Verify rounding, totals, persisted snapshots, and payment amount validation.

### SCN-005: Change Inventory Reservation During Order Creation

- **Direct:** `src/services/orderService.js`, `src/services/productService.js`, `src/models/productModel.js`.
- **Indirect:** `src/config/database.js`, `src/models/orderModel.js`, `src/db/schema.sql`, `src/routes/orderRoutes.js`; `tests/orders.test.js`, `tests/products.test.js`, `tests/integration.test.js`.
- **Modules/APIs:** Products and Orders; `GET /api/products`, `GET /api/products/:id`, `POST /api/orders`, and order reads.
- **Risk/tests:** Reservation already occurs inside a database transaction. Verify insufficient-stock rollback, duplicate product quantities, competing requests, and consistency between stock and created order items.

### SCN-006: Change Payment Processing Flow

- **Direct:** `src/services/paymentService.js`, `src/providers/mockPaymentProvider.js`, `src/models/paymentModel.js`, `src/models/orderModel.js`.
- **Indirect:** `src/controllers/paymentController.js`, `src/routes/paymentRoutes.js`, `src/services/orderService.js`, `src/db/schema.sql`; `tests/payments.test.js`, `tests/orders.test.js`, `tests/integration.test.js`.
- **Modules/APIs:** Payments and Orders; `POST /api/payments`, payment reads, order creation and reads.
- **Risk/tests:** Amount/ownership checks, idempotent repeat requests, provider errors, and keeping payment/order statuses consistent. Verify success, failure, retry, wrong amount, and cross-user access.

### SCN-007: Extend Existing Refunds to Support Partial Refunds

- **Direct:** `src/services/paymentService.js`, `src/providers/mockPaymentProvider.js`, `src/models/paymentModel.js`, `src/models/orderModel.js`, `src/controllers/paymentController.js`, `src/routes/paymentRoutes.js`, `src/db/schema.sql` if partial amounts/statuses are persisted.
- **Indirect:** `src/services/orderService.js`; `tests/payments.test.js`, `tests/orders.test.js`, `tests/integration.test.js`.
- **Modules/APIs:** Payments and Orders; `POST /api/payments/:id/refund`, payment reads, and order reads. The existing refund endpoint currently accepts no partial amount.
- **Risk/tests:** Refund bounds, repeated/over-refund handling, payment/order status semantics, and persisted totals. Verify partial, full, repeated, and over-limit refunds.

### SCN-008: Change the Order Status Workflow

- **Direct:** `src/db/schema.sql`, `src/models/orderModel.js`, `src/services/paymentService.js`.
- **Indirect:** `src/services/orderService.js`, `src/models/paymentModel.js`; `tests/orders.test.js`, `tests/payments.test.js`, `tests/integration.test.js`.
- **Modules/APIs:** Orders and Payments; order create/list/detail, payment processing, payment reads, and refunds.
- **Risk/tests:** The schema currently allows `pending`, `paid`, and `refunded`; payment processing and refunds update the order via `orderModel`. Verify legal transitions, repeated operations, persisted values, and API responses across the full checkout flow.
