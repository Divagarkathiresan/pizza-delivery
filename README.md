# Pizza Delivery Application

A full-stack pizza delivery application (React frontend + Node/Express/MongoDB backend) with user authentication, order processing, inventory management and payments integration.

## Features
- User registration, login, password reset
- Create and manage orders (cart, address, checkout)
- Inventory initialization and threshold checks (cron job)
- Admin routes for managing inventory and orders
- Payment integration (Razorpay) and email notifications

## Repository structure

- `Backend/` — Express API server, MongoDB models, routes and utilities
- `Frontend/my-app/` — React single-page application (Create React App)

## Prerequisites
- Node.js (16+ recommended)
- npm or yarn
- MongoDB instance (local or Atlas)

## Backend — Setup & Run

1. Change to the backend directory:

	cd Backend

2. Install dependencies:

	npm install

3. Create a `.env` file in `Backend/` with the following example variables:

	MONGO_URI=<your-mongo-connection-string>
	ADMIN_EMAIL=<optional-admin-email>
	ADMIN_PASSWORD=<optional-admin-password>
	FRONTEND_URL=http://localhost:3000
	PORT=5000

4. Seed inventory (optional):

	npm run seed:inventory

5. Run the server (development):

	npm run dev

Or to run in production mode:

	npm start

The backend listens on `PORT` (default 5000). The main entry is `server.js` which exposes these route groups:

- `POST /api/auth/*` — authentication (register/login/forgot/reset)
- `POST/GET /api/orders/*` — create and retrieve orders
- `/api/admin/*` — admin-only management endpoints
- `/api/payments/*` — payment webhooks/handlers

## Frontend — Setup & Run

1. Change to the frontend app:

	cd Frontend/my-app

2. Install dependencies:

	npm install

3. Start the development server:

	npm start

4. Build for production:

	npm run build

The React app runs on port 3000 by default and expects the backend API to be available at the URL configured by `FRONTEND_URL` in the backend `.env` (default `http://localhost:3000`). If the backend runs on a different host/port, update `FRONTEND_URL` accordingly.

## Notes & Scripts

- Backend scripts are defined in `Backend/package.json`:
  - `start` — run `node server.js`
  - `dev` — run `nodemon server.js`
  - `seed:inventory` — seed example inventory data
- Frontend scripts are standard Create React App scripts in `Frontend/my-app/package.json` (`start`, `build`, `test`)

## Environment / Secrets
Keep sensitive values out of source control. Typical variables used by the backend are:
- `MONGO_URI` — MongoDB connection string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — optional admin user created on first run
- `FRONTEND_URL` — allowed CORS origin for frontend

## Development workflow
1. Start MongoDB (local or ensure Atlas is accessible).
2. Run the backend (`cd Backend && npm run dev`).
3. Run the frontend (`cd Frontend/my-app && npm start`).
4. Use the app in the browser at `http://localhost:3000`.

## Troubleshooting
- If MongoDB connection fails, ensure `MONGO_URI` is correct and reachable.
- Check console output for server log messages and seed script errors.

## Next steps (suggested)
- Add a short `docker-compose.yml` to run backend + MongoDB together.
- Add tests and CI for both frontend and backend.

## License
This project currently has no license specified.

---
Updated README to include setup and usage instructions.
