# ShopFlow

ShopFlow is a small, self-contained e-commerce REST API intended as a realistic code-analysis target. It demonstrates how authentication, users, products, orders, inventory, and payments depend on one another without relying on the IMPACT application or an external payment gateway.

## Stack

- Node.js 20+, JavaScript (ES modules), and Express 5
- SQLite through `better-sqlite3`
- JWT authentication and `bcryptjs` password hashing
- Node's built-in test runner and Supertest

## Run locally

```sh
npm install
Copy-Item .env.example .env
npm run seed
npm start
```

On macOS/Linux, use `cp .env.example .env` in place of `Copy-Item`. The server initializes the schema and seeds the product catalog on startup. The default database is `data/shopflow.sqlite`; override it with `SHOPFLOW_DB_PATH`.

Run in watch mode with `npm run dev`, and run all tests with `npm test`.

## API

All routes are prefixed with `/api`. Protected routes use `Authorization: Bearer <token>`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create an account and return a JWT |
| POST | `/auth/login` | Public | Verify credentials and return a JWT |
| GET, PUT | `/users/me` | User | Read or update the authenticated profile |
| GET | `/products` | Public | List products; supports `q`, `limit`, and `offset` |
| GET | `/products/:id` | Public | Read one product |
| POST | `/orders` | User | Reserve stock, create an order, and prepare payment |
| GET | `/orders` | User | List the authenticated user's orders |
| GET | `/orders/:id` | User | Read an owned order and its items |
| POST | `/payments` | User | Process payment for an owned pending order |
| GET | `/payments/:id` | User | Read an owned payment |
| POST | `/payments/:id/refund` | User | Refund a completed payment |

Register with `{ "name", "email", "password" }`. Create an order with `{ "items": [{ "productId", "quantity" }] }`. Creating an order reserves inventory and creates a pending payment; submit `{ "orderId" }` to `/payments` to process it. Prices are stored as integer cents and returned as decimal currency amounts.

## Architecture

Routes validate requests and delegate to controllers. Controllers call services, which coordinate models and shared utilities. Authentication flows through `authService`, `userModel`, and the JWT utility; protected routes pass through `authMiddleware`. `orderService` checks users and products, reserves inventory and creates order items in one SQLite transaction, then asks `paymentService` to create a payment intent. `paymentService` reads and updates order/payment models and delegates processing/refunds to the internal mock provider.

The SQLite schema is in `src/db/schema.sql`; `src/db/seed.js` inserts a repeatable sample catalog. Tests use an in-memory SQLite database and exercise the actual Express app and services.