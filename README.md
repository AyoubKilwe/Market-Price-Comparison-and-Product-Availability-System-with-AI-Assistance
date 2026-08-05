# MarketEye

Market price comparison and product availability platform with customer, vendor,
administrator, and AI-assisted experiences.

## Local development

1. Copy `backend/.env.example` to `backend/.env` and configure its values.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Run `npm install` once in both `backend` and `frontend`.
4. Run `npm run dev` in `backend` and `frontend` using separate terminals.

## Railway deployment

This repository is an isolated monorepo. Deploy it as two Railway services connected
to the same GitHub repository.

### 1. Create the services

Create an empty Railway project, then add:

- `marketeye-backend`
- `marketeye-frontend`
- A Railway MongoDB database, or use an existing MongoDB Atlas database.

Connect both application services to this GitHub repository.

### 2. Configure the backend service

In backend service settings:

- Root Directory: `/backend`
- Railway Config File: `/backend/railway.toml`
- Generate a public domain.

Add these variables:

```env
MONGODB_URI=${{Mongo.MONGO_URL}}
JWT_SECRET=<a-long-random-secret>
GEMINI_API_KEY=<your-Gemini-key>
CLIENT_URL=https://<frontend-public-domain>
NODE_ENV=production
```

If the database service is not named `Mongo`, use its actual Railway service name in
the reference variable. If using Atlas, paste its connection string into
`MONGODB_URI`. Do not manually set `PORT`; Railway injects it.

Healthcheck path: `/health` (also defined in `backend/railway.toml`).

### 3. Configure the frontend service

In frontend service settings:

- Root Directory: `/frontend`
- Railway Config File: `/frontend/railway.toml`
- Generate a public domain.

Add this build-time variable:

```env
VITE_API_URL=https://<backend-public-domain>
```

Do not add a trailing slash. Redeploy the frontend whenever `VITE_API_URL` changes,
because Vite embeds it during the build.

Healthcheck path: `/health` (also defined in `frontend/railway.toml`).

### 4. Final deployment order

1. Deploy MongoDB.
2. Deploy the backend and confirm `https://<backend-domain>/health` returns JSON with
   `"status":"ok"`.
3. Set the backend `CLIENT_URL` to the exact frontend HTTPS domain.
4. Set frontend `VITE_API_URL` to the exact backend HTTPS domain.
5. Redeploy both services, then open the frontend domain.

If more than one frontend origin is needed, `CLIENT_URL` accepts a comma-separated
list such as `https://production.example.com,https://preview.example.com`.

Never commit `.env` files or expose `JWT_SECRET`, `GEMINI_API_KEY`, or database
credentials through a `VITE_` variable.
