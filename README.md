# EShop Backend (NestJS + Postgres)

This backend mirrors the API contract used by the Flutter EShop app in `../Flutter-TDD-Clean-Architecture-E-Commerce-App`.

## Quick Start (Local)

1. Copy env file:

```bash
cp .env.example .env
```

2. Install deps:

```bash
npm install
```

3. Run Postgres locally (or via Docker) and then seed:

```bash
npm run seed
```

4. Start the API:

```bash
npm run start:dev
```

The API runs on `http://localhost:4000` by default.

## Admin Panel Guide

The admin UI is embedded and served by NestJS (static files).

### Access

- URL: `http://localhost:4000/admin`

### Default Admin Credentials

These are created during `npm run seed`:

- Email: `admin@eshop.com`
- Password: `admin123`

You can override them in `.env`:

```
ADMIN_EMAIL=admin@eshop.com
ADMIN_PASSWORD=admin123
```

### Features

- Products: create/update/delete, manage price tags and images
- Categories: create/update/delete
- Orders: view and update status
- Users: view and update role (ADMIN / CUSTOMER)

### Notes

- Use the admin sign-in (`POST /admin/auth/sign-in`) to get a bearer token.
- The UI stores the token in `localStorage` and attaches it to admin API calls.
- If you change the admin credentials, re-run `npm run seed` or update the user in DB.

## Quick Start (Docker)

```bash
docker compose up --build
```

Once the containers are up, seed the database:

```bash
docker compose exec api npm run seed
```

## Default Demo User

- Email: `demo@eshop.com`
- Password: `password123`

## Admin Panel

The admin UI is embedded and served by NestJS:

- URL: `http://localhost:4000/admin`
- Default admin (from `.env`):
  - Email: `admin@eshop.com`
  - Password: `admin123`

## API Endpoints (Matching Mobile App)

- `POST /authentication/local/sign-up`
- `POST /authentication/local/sign-in`
- `GET /categories`
- `GET /products?keyword=&pageSize=&page=&categories=[...]`
- `POST /carts` (Bearer token)
- `POST /carts/sync` (Bearer token)
- `GET /delivery-info` (Bearer token)
- `POST /users/delivery-info` (Bearer token)
- `PUT /users/delivery-info` (Bearer token)
- `GET /orders` (Bearer token)
- `POST /orders` (Bearer token)

## Admin API Endpoints

- `POST /admin/auth/sign-in`
- `GET /admin/summary` (Bearer admin token)
- `GET /admin/products` (Bearer admin token)
- `POST /admin/products` (Bearer admin token)
- `PUT /admin/products/:id` (Bearer admin token)
- `DELETE /admin/products/:id` (Bearer admin token)
- `GET /admin/categories` (Bearer admin token)
- `POST /admin/categories` (Bearer admin token)
- `PUT /admin/categories/:id` (Bearer admin token)
- `DELETE /admin/categories/:id` (Bearer admin token)
- `GET /admin/orders` (Bearer admin token)
- `PUT /admin/orders/:id/status` (Bearer admin token)
- `GET /admin/users` (Bearer admin token)
- `PUT /admin/users/:id/role` (Bearer admin token)

## Mobile App Base URL

Update the Flutter base URL in `Flutter-TDD-Clean-Architecture-E-Commerce-App/lib/core/constant/strings.dart` to point to your backend, for example:

- `http://localhost:4000` (emulator)
- `http://<your-lan-ip>:4000` (physical device)

## Notes

- The backend uses TypeORM with `DB_SYNC=true` by default for fast local iteration. Disable it in production.
