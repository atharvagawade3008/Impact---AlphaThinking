# ShopFlow Architecture

## 1. Project Overview

ShopFlow is a small REST API for an e-commerce demo. It supports account registration and login, profile management, a seeded product catalog, order creation and history, and mock payment processing and refunds. Creating an order reserves available product stock and creates a pending payment; a separate payment request completes it.

The project is a standalone analysis target. Its stack is Node.js 20+, JavaScript ES modules, Express 5, SQLite through `better-sqlite3`, `bcryptjs` for password hashing, `jsonwebtoken` for JWTs, and `dotenv` for environment configuration. Tests use Node's built-in test runner and Supertest. There is no frontend framework or external payment gateway in this repository.

The server entry point initializes the database and seed catalog before listening. The Express app parses JSON, mounts route groups, and finishes with not-found and error middleware. Route modules validate selected inputs and connect controllers to services. Services contain the domain coordination; models execute SQLite queries and map rows into API-facing objects.

## 2. Repository Structure

```text
shopflow-demo/
├── .env.example
├── .gitignore
├── ARCHITECTURE.md
├── README.md
├── package-lock.json
├── package.json
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   └── paymentModel.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   └── paymentService.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── paymentRoutes.js
│   ├── providers/
│   │   └── mockPaymentProvider.js
│   └── utils/
│       ├── errors.js
│       └── jwt.js
└── tests/
    ├── helpers.js
    ├── auth.test.js
    ├── products.test.js
    ├── orders.test.js
    ├── payments.test.js
    └── integration.test.js
```

The default SQLite file is created at `data/shopflow.sqlite` at runtime; the database files are ignored by Git. `SHOPFLOW_DB_PATH` can select another path, or `:memory:` for an in-memory database.

## 3. Module Responsibilities

| Module | Responsibility | Important Files |
| --- | --- | --- |
| Authentication | Validate registration/login inputs, hash and compare passwords, issue and verify JWTs. | `src/routes/authRoutes.js`, `src/controllers/authController.js`, `src/services/authService.js`, `src/utils/jwt.js`, `src/middleware/authMiddleware.js` |
| Users | Find users, expose profile data without password hashes, and update name/email. | `src/models/userModel.js`, `src/services/userService.js`, `src/controllers/userController.js`, `src/routes/userRoutes.js` |
| Products | Search/list products, fetch by ID, map cents to currency amounts, and decrement stock conditionally. | `src/models/productModel.js`, `src/services/productService.js`, `src/controllers/productController.js`, `src/routes/productRoutes.js` |
| Orders | Validate ownership and order items, calculate totals, reserve inventory transactionally, persist order items, and list/fetch a user's orders. It also requests a pending payment intent. | `src/models/orderModel.js`, `src/services/orderService.js`, `src/controllers/orderController.js`, `src/routes/orderRoutes.js` |
| Payments | Prepare and process order payments, check amounts and ownership, refund completed payments, and update order status through an internal provider abstraction. | `src/models/paymentModel.js`, `src/services/paymentService.js`, `src/providers/mockPaymentProvider.js`, `src/controllers/paymentController.js`, `src/routes/paymentRoutes.js` |
| Database | Open SQLite, enable foreign keys and WAL, apply the schema, and insert catalog seed products. | `src/config/database.js`, `src/db/schema.sql`, `src/db/seed.js` |
| Middleware | Require a valid Bearer JWT on protected route groups, validate selected request fields/IDs, and format 404/application/unhandled errors. | `src/middleware/authMiddleware.js`, `src/middleware/validationMiddleware.js`, `src/middleware/errorMiddleware.js`, `src/utils/errors.js` |
| Tests | Exercise the Express app and real services against seeded in-memory SQLite, including a customer checkout integration flow. | `tests/helpers.js`, `tests/auth.test.js`, `tests/products.test.js`, `tests/orders.test.js`, `tests/payments.test.js`, `tests/integration.test.js` |

## 4. API Architecture

Feature API routes below are mounted under `/api`; the health check is mounted directly at `/health`. The `Controller` and `Service` columns name the handlers/services called by the route. `GET /health` is implemented inline in `src/app.js`, so it has no controller or service.

| Method | Endpoint | Controller | Service | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/health` | Inline in `app.js` | — | Return `{ "status": "ok" }`. |
| POST | `/auth/register` | `authController.register` | `authService.register` | Create a user and return the user and JWT. |
| POST | `/auth/login` | `authController.login` | `authService.login` | Verify credentials and return the user and JWT. |
| GET | `/users/me` | `userController.getProfile` | `userService.getProfile` | Retrieve the authenticated user's profile. |
| PUT | `/users/me` | `userController.updateProfile` | `userService.updateProfile` | Update the authenticated user's name and/or email. |
| GET | `/products` | `productController.list` | `productService.listProducts` | List/search products; accepts `q`, `limit`, and `offset`. |
| GET | `/products/:id` | `productController.getById` | `productService.getProductById` | Retrieve a product. |
| POST | `/orders` | `orderController.create` | `orderService.createOrder` | Reserve stock, create an order/items, and prepare a pending payment. |
| GET | `/orders` | `orderController.list` | `orderService.listOrders` | List orders belonging to the authenticated user. |
| GET | `/orders/:id` | `orderController.getById` | `orderService.getOrder` | Retrieve an order belonging to the authenticated user. |
| POST | `/payments` | `paymentController.process` | `paymentService.processPayment` | Process payment for an owned order; body requires `orderId`, with optional `amount`. |
| GET | `/payments/:id` | `paymentController.getById` | `paymentService.getPayment` | Retrieve a payment for an owned order. |
| POST | `/payments/:id/refund` | `paymentController.refund` | `paymentService.refundPayment` | Refund a completed payment for an owned order. |

The auth and product route groups are public. The user, order, and payment route groups apply `requireAuth` to the whole router. Request validation is attached to selected auth, profile, order, payment, and ID routes.

## 5. Service Relationships

These arrows describe imports and calls present in the current source:

```text
authRoutes -> authController -> authService -> userModel -> database
                                      |             |
                                      |             +-> bcryptjs password hash/compare
                                      +-> jwt utility

userRoutes -> authMiddleware -> jwt utility
           -> userController -> userService -> userModel -> database

productRoutes -> productController -> productService -> productModel -> database

orderRoutes -> authMiddleware
            -> orderController -> orderService
                                   |-> userService -> userModel -> database
                                   |-> productService -> productModel -> database
                                   |-> database transaction
                                   |-> orderModel -> database
                                   +-> paymentService.preparePayment

paymentRoutes -> authMiddleware
              -> paymentController -> paymentService
                                       |-> orderModel -> database
                                       |-> paymentModel -> database
                                       +-> mockPaymentProvider
```

`paymentService` also calls `orderModel.updateStatus` after successful processing or refund. `src/config/database.js` reads and executes `src/db/schema.sql`; `src/db/seed.js` calls database initialization and inserts sample products. Models obtain the shared SQLite connection from the database module.

## 6. Database Structure

The schema is defined in `src/db/schema.sql`. Every table has an integer autoincrement primary key named `id`.

| Table | Important fields | Foreign keys and constraints |
| --- | --- | --- |
| `users` | `name`, `email`, `password_hash`, `role`, `created_at` | `email` is unique and case-insensitive. `role` is `customer` or `admin`, defaulting to `customer`. |
| `products` | `name`, `description`, `price_cents`, `stock`, `created_at` | `price_cents` and `stock` must be non-negative. |
| `orders` | `user_id`, `status`, `total_amount_cents`, `created_at` | `user_id` references `users.id`. Status is `pending`, `paid`, or `refunded`. |
| `order_items` | `order_id`, `product_id`, `product_name`, `quantity`, `price_cents` | `order_id` references `orders.id` with `ON DELETE CASCADE`; `product_id` references `products.id`. Quantity must be positive. Product name and unit price are stored as order-time snapshots. |
| `payments` | `order_id`, `amount_cents`, `status`, `transaction_reference`, `created_at` | `order_id` references `orders.id` and is unique, allowing at most one payment row per order. Status is `pending`, `succeeded`, `refunded`, or `failed`. |

Relationship summary:

```text
users 1 -> many orders
orders 1 -> many order_items
products 1 -> many order_items
orders 1 -> zero-or-one payments
```

Prices and totals are stored as integer cents. Models convert them to decimal amounts when returning API objects. The schema also creates indexes on `orders.user_id`, `order_items.order_id`, and `payments.order_id`.

## 7. Authentication Flow

**Registration:** `POST /api/auth/register` validates name, email, and password. `authService.register` checks for an existing email, hashes the password with `bcryptjs` (10 rounds), creates the user through `userModel`, then signs a JWT. The model's public user mapping does not expose `password_hash`.

**Login:** `POST /api/auth/login` validates email and password. `authService.login` retrieves the database record, compares the submitted password with `password_hash` using bcrypt, retrieves the public user representation, and signs a JWT using `src/utils/jwt.js`.

**Protected request:** The client sends `Authorization: Bearer <token>`. `requireAuth` calls `verifyToken`, then attaches `{ id, role }` to `request.user`; invalid or missing tokens produce a 401 error. The route's controller uses that identity when calling the relevant service. JWT verification itself does not fetch the user from the database; services such as `userService` and `orderService` perform user lookups where their operations require one.

## 8. Order and Payment Flow

1. An authenticated client selects products from the public catalog and posts product IDs and quantities to `POST /api/orders`.
2. `orderService.createOrder` checks that the user exists, validates quantities, loads current product prices, combines duplicate product IDs, and calculates a total in cents.
3. Inside a SQLite transaction, it decrements each product's stock through `productService` and creates the order and item snapshots through `orderModel`. A stock failure throws an error and rolls the transaction back.
4. After the transaction commits, `orderService` calls `paymentService.preparePayment`, which verifies order ownership and creates a pending payment row. The order is still `pending`; order creation does not charge it.
5. The client posts the order ID, and optionally the expected amount, to `POST /api/payments`. `paymentService.processPayment` checks order ownership and amount, then calls the mock provider. On success it marks the payment `succeeded` and the order `paid`.
6. An owned successful payment can be refunded through `POST /api/payments/:id/refund`. The mock provider returns a refund result; the payment becomes `refunded` and the order status is updated to `refunded`.

The current mock provider returns success for payment processing and a refund result for refunds; it does not contact an external payment service.

## 9. Dependency Overview

```text
HTTP app
  -> route groups
      -> request validation / authentication middleware
      -> controllers
          -> services
              -> models -> SQLite connection -> schema
              -> payment service -> mock payment provider

auth service -> bcryptjs + user model + JWT utility
order service -> user service + product service + order model
              -> SQLite transaction + payment service (payment intent)
payment service -> order model + payment model + mock payment provider
```

This is a dependency summary, not an additional runtime module. In particular, there is no separate inventory service, authorization/role middleware, payment gateway client, or repository/ORM layer in the current code.

## 10. Important Files for Change-Impact Analysis

“Likely dependents” lists direct importers or nearby behavior/tests that use the file's contract; it is not a claim of a generated dependency map.

| File | Why it matters | Likely dependents |
| --- | --- | --- |
| `src/app.js` | Mounts route groups and global error handling. | `src/server.js`; Supertest suites importing the app. |
| `src/routes/authRoutes.js` | Defines registration/login paths and input validation. | `src/app.js`, `authController.js`, `tests/auth.test.js`. |
| `src/services/authService.js` | Owns password hashing/verification and token issuance during auth flows. | `authController.js`, `tests/helpers.js`, auth/integration tests. |
| `src/utils/jwt.js` | Defines token claims, secret, and expiry used by signing and verification. | `authService.js`, `authMiddleware.js`. |
| `src/middleware/authMiddleware.js` | Establishes the Bearer-token and `request.user` contract for protected routes. | `userRoutes.js`, `orderRoutes.js`, `paymentRoutes.js`. |
| `src/models/userModel.js` | Maps and persists user identity and credential fields. | `authService.js`, `userService.js`. |
| `src/services/productService.js` | Exposes product lookup and conditional stock reservation. | `productController.js`, `orderService.js`. |
| `src/models/productModel.js` | Implements catalog queries, price mapping, and stock decrement. | `productService.js`. |
| `src/config/database.js` | Owns the shared SQLite connection and schema initialization. | All four models, `orderService.js`, `seed.js`, `server.js`, test helper. |
| `src/db/schema.sql` | Defines persisted tables, constraints, indexes, and relationships. | `database.js` initialization; models and services depend on its schema contract. |
| `src/services/orderService.js` | Coordinates user/product checks, stock transaction, order creation, and payment intent. | `orderController.js`, `tests/orders.test.js`, `tests/integration.test.js`. |
| `src/models/orderModel.js` | Persists order/item snapshots and changes order status. | `orderService.js`, `paymentService.js`. |
| `src/services/paymentService.js` | Enforces order ownership/amount checks and coordinates payment/refund status. | `paymentController.js`, `orderService.js`, payment/integration tests. |
| `src/models/paymentModel.js` | Persists payment records and their transaction references/statuses. | `paymentService.js`. |
| `src/providers/mockPaymentProvider.js` | Implements the payment/refund provider contract currently consumed by the payment service. | `paymentService.js`. |

## 11. Common Change Scenarios

These are impact estimates based on current imports and behavior; they describe areas to inspect, not changes made here.

| Scenario | Likely areas affected in this repository |
| --- | --- |
| Replace JWT authentication with OAuth | Auth routes/controller/service, `authMiddleware.js`, `utils/jwt.js`, environment configuration, and auth/integration tests. The protected route groups depend on the middleware contract. No OAuth implementation currently exists. |
| Change product pricing or price representation | Product schema/seed, `productModel.js` price mapping, product API tests, `orderService.js` total and item snapshots, and `paymentService.js` amount validation. Order and payment amounts are currently derived from integer cents. |
| Change inventory reservation during checkout | `orderService.js` transaction and product lookups, `productService.js`/`productModel.js` stock decrement, `orderModel.js` writes, and order/integration tests. Reservation currently occurs during order creation. |
| Change payment processing or refunds | `paymentService.js`, `mockPaymentProvider.js` provider contract, `paymentModel.js`, order status transitions in `orderModel.js`, payment routes/controller as needed, and payment/integration tests. |
| Add role-based authorization | `authMiddleware.js` and the user/order/payment route groups or their controllers; potentially JWT role claims and tests. A role is stored and included in JWT claims, but current middleware checks token validity only and does not enforce roles. |
