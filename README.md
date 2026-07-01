# Click Shop Backend (NestJS + Postgres)

A robust NestJS backend for the Click Shop mobile application. It features a complete administrative dashboard, manual payment verification system, and product management.

## 🚀 Features

- **Authentication**: JWT-based auth for both Customers and Admin.
- **Product Management**: Full CRUD for products, categories, price tags, and multi-image support.
- **Order Management**: Real-time order tracking with status updates (Pending, Confirmed, Shipped, etc.).
- **Dynamic Payment Configuration**: Admin can update JazzCash/EasyPaisa numbers directly from the dashboard, which instantly updates the Flutter app.
- **Manual Payment Workflow**: Optimized for manual verification (Reference-based) of mobile wallet payments.
- **Admin Dashboard**: Embedded web UI served at `/admin` for easy store management.
- **Docker Support**: Containerized setup with PostgreSQL.

## 🛠️ Quick Start (Local)

1. **Environment Setup**:
   Copy `.env.example` to `.env` and update your database credentials.
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build & Seed Database**:
   Initializes the database with default admin, products, and contact settings.
   ```bash
   npm run build
   npm run seed
   ```

4. **Start the API**:
   ```bash
   npm run start:dev
   ```
   The API will be available at `http://localhost:4000`.

## 🐳 Docker Setup

Run the entire stack (API + Database) using Docker Compose:
```bash
docker-compose up --build
```
Once the containers are running, seed the database:
```bash
docker-compose exec api npm run seed
```

## 📊 Admin Dashboard

Access the embedded admin panel:
- **URL**: `http://localhost:4000/admin`
- **Default Credentials** (From `.env`):
  - **Email**: `admin@clickshop.com`
  - **Password**: `admin123`

### Dashboard Tabs:
- **Products**: Manage catalog and pricing.
- **Categories**: Organize product collections.
- **Orders**: Monitor and update order fulfillment status.
- **Users**: Manage user roles (Admin/Customer).
- **Contact**: Update JazzCash & EasyPaisa numbers used for mobile payments.

## 📱 Mobile App Integration

Update the `baseUrl` in your Flutter app (`lib/core/constant/strings.dart`):
- **Emulator**: `http://10.0.2.2:4000`
- **Physical Device**: `http://<your-lan-ip>:4000`
- **Production**: Your deployed URL (e.g., Railway or Heroku).

## 🌍 Deployment (Railway/Heroku)

Ensure you set the following environment variables on your cloud provider:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `DB_SSL=true` (Required for most cloud DB providers)
- `DB_SYNC=true` (Enable for first run to create tables)
- `JWT_SECRET`: A strong secret key for tokens.

## 📜 API Overview

### Customer API
- `POST /authentication/local/sign-up`
- `POST /authentication/local/sign-in`
- `GET /categories`
- `GET /products`
- `GET /settings/contact` (Dynamic payment numbers)
- `GET /orders` (Bearer Token)
- `POST /orders/checkout` (Bearer Token)

### Admin API
- `POST /admin/auth/sign-in`
- `GET /admin/summary`
- `GET /admin/settings`
- `PUT /admin/settings`
- `PUT /admin/orders/:id/status`

---
Developed for the **Click Shop** E-Commerce Ecosystem.
