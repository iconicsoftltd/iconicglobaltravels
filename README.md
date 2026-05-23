# IE Account (ERP / Accounting)

Monorepo: **Express + Prisma + MySQL** API (`backend/`) and **React + Vite** UI (`frontend/`).

## Docker on Ubuntu VPS (development mode)

**Full VPS setup** (OS hardening, firewall, Cloudflare, clone, TLS): see [`Deployment_guide.md`](Deployment_guide.md).

Internal testing uses **bind-mounted source**, **ts-node-dev** + **Vite** behind **Nginx**, optional **Let’s Encrypt** TLS.

### Prerequisites

- Docker + Docker Compose v2
- DNS `A` (or `AAAA`) record for your **DOMAIN** pointing to the VPS public IP
- Root `.env` copied from [`.env.example`](.env.example) (set `DOMAIN`, `VITE_API_URL`, DB passwords)

### First-time setup

1. Copy env files:
   - `cp .env.example .env` and edit values.
   - `cp backend/.env.example backend/.env` and set secrets; **PORT** is overridden to `5000` by Compose.
2. Align **VITE_API_URL** with how users reach the API, e.g. `https://your-domain.com/api/v1` (must include `/api/v1` — see `backend/src/app.ts`).
3. Set **CORS_ORIGINS** in root `.env` (and/or `backend/.env`) to your site origin, e.g. `https://your-domain.com`.
4. Build and start:
   ```bash
   docker compose --env-file .env build
   docker compose --env-file .env up -d
   ```
5. **TLS (Let’s Encrypt)** — after HTTP works on port 80 (`certbot` service overrides entrypoint; use `certbot` explicitly):
   ```bash
   docker compose run --rm --entrypoint certbot certbot certonly \
     --webroot -w /var/www/certbot \
     -d your-domain.com \
     --email you@example.com \
     --agree-tos \
     --non-interactive
   docker compose restart nginx
   ```
   Nginx switches to HTTPS when `/etc/letsencrypt/live/<DOMAIN>/fullchain.pem` exists (see `nginx/entrypoint.sh`).
6. Update **VITE_API_URL** to `https://...` if you started with HTTP, then recreate the frontend container:
   ```bash
   docker compose --env-file .env up -d frontend
   ```

### Deploying code changes

```bash
chmod +x deploy.sh   # once, on the VPS
./deploy.sh
```

No image rebuild is needed for source edits (bind mounts). Rebuild when dependencies change:

```bash
docker compose --env-file .env up -d --build backend   # or frontend
```

### Services

| Service        | Notes |
|----------------|--------|
| **nginx**      | Public ports **80**, **443** |
| **backend**    | Internal only; API at `/api/...` via Nginx |
| **frontend**   | Internal only; Vite on **3000** |
| **db**         | MySQL; **not** published to the host |
| **certbot**    | Renews certs periodically (webroot) |
| **prisma-studio** | `docker compose --profile tools up -d` — bound to **127.0.0.1:5555** |

### Optional tools profile

```bash
docker compose --profile tools up -d prisma-studio
```

## Local development (without Docker)

See `backend/README.md` and `frontend/README.md`.
# iconicglobaltravels
