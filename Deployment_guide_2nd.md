# VPS deployment guide — iconichishab.com (2nd site on same VPS)

This guide deploys **iconichishab.com** as a **second, independent** instance of the same codebase on the **same VPS** that already runs **ieaccount.com**.

## Architecture: before vs. after

**Before (single site):**

```
Internet ──▶ :80/:443 ──▶ [erp_nginx] ──▶ erp_frontend / erp_backend / erp_mysql
                              (ieaccount.com)
```

**After (two sites):**

```
Internet ──▶ :80/:443 ──▶ [host_nginx]  (new shared reverse proxy on the host)
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
     [ieaccount stack]              [hishab stack]
     frontend:3000                  frontend:3100
     backend:5000                   backend:5100
     mysql (internal)               mysql (internal)
     (ieaccount.com)                (iconichishab.com)
```

> **Key change:** We install a **host-level Nginx** that owns ports 80/443 and reverse-proxies to each Docker stack by domain. Each stack's own internal Nginx is **removed** (or remapped to internal-only ports) because two containers cannot both bind to the host's port 80/443.

---

## 0. Pre-flight — what you already have

Confirm the following before starting:

| Item | Expected |
|------|----------|
| VPS | Ubuntu 24.04 with Docker + Compose v2 |
| ieaccount.com | Running via `docker compose` at `/var/www/ieaccount` |
| Root `.env` | Present at `/var/www/ieaccount/.env` with `DB_*`, `VITE_API_URL`, etc. (see `.env.example`) |
| `backend/.env` | Present — Compose uses `env_file: ./backend/.env` for the API container |
| Firewall | UFW allowing 22, 80, 443 |
| DNS | ieaccount.com → VPS IP in Cloudflare |
| SSL | Let's Encrypt cert for ieaccount.com |

---

## Phase 1 — Reconfigure the existing ieaccount.com stack

Before deploying the second site, we must free ports 80/443 from any **Docker-bound** Nginx (if you still use it) and hand them to a **host-level reverse proxy**.

The **current repository** `docker-compose.yml` already:

- Binds **frontend** to `127.0.0.1:3000:3000` and **backend** to `127.0.0.1:5000:5000`
- Does **not** include `nginx` or `certbot` services (TLS is on the host)

If your VPS already tracks this repo, **skip** the YAML edits below and go straight to **1.3**. Only apply **1.2** if your server still has an older compose file (`expose:` only, or in-compose `nginx` / `certbot`).

### 1.1 Stop the existing stack

```bash
cd /var/www/ieaccount
docker compose down
```

### 1.2 Modify ieaccount's `docker-compose.yml` (legacy deployments only)

**If** your file still uses `expose:` for frontend/backend and/or includes `nginx` / `certbot` services:

1. **Remove the `nginx` and `certbot` services** (or comment them out) — the host Nginx will handle TLS + routing.
2. **Bind frontend and backend to localhost** so host Nginx can reach them.

Edit `/var/www/ieaccount/docker-compose.yml`:

```bash
nano /var/www/ieaccount/docker-compose.yml
```

**Changes to make:**

#### a) Frontend — bind host port 3000

Replace:

```yaml
    expose:
      - "3000"
```

With:

```yaml
    ports:
      - "127.0.0.1:3000:3000"
```

#### b) Backend — bind host port 5000

Replace:

```yaml
    expose:
      - "5000"
```

With:

```yaml
    ports:
      - "127.0.0.1:5000:5000"
```

#### c) Comment out or remove the `nginx` service

Add `#` to every line under the `nginx:` service block (or delete it entirely). The host Nginx replaces it.

#### d) Comment out or remove the `certbot` service

Same — host-level Certbot replaces it.

#### e) Remove `certbot_conf` and `certbot_www` volumes

Remove those two entries from the `volumes:` section at the bottom (keep `mysql_data`).

### 1.3 Bring the ieaccount stack back up

Ensure **both** `/var/www/ieaccount/.env` and `/var/www/ieaccount/backend/.env` exist before starting (see `.env.example` files). If `docker compose` prints warnings like `The "DB_USER" variable is not set`, the root `.env` is missing or incomplete — fix that first (see [Troubleshooting](#troubleshooting)).

```bash
cd /var/www/ieaccount
docker compose up -d
```

Verify the services are healthy and the ports are listening on localhost:

```bash
docker compose ps
curl -s http://127.0.0.1:5000/   # should hit backend (HTTP 200 JSON)
curl -s http://127.0.0.1:3000/   # should hit frontend (Vite dev)
```

If `frontend` fails with **dependency backend failed to start**, the **backend** container is not passing its health check — see [Troubleshooting](#troubleshooting).

---

## Phase 2 — Install host-level Nginx + Certbot

### 2.1 Install Nginx on the host

```bash
sudo apt update
sudo apt install -y nginx
```

Verify Nginx is running:

```bash
sudo systemctl status nginx
```

> ⚠️ **If Nginx fails to start** because port 80 is still in use by a Docker container, ensure you've stopped the old `erp_nginx` container (`docker compose down` from step 1.1).

### 2.2 Install Certbot (snap method — recommended for Ubuntu 24.04)

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

---

## Phase 3 — Migrate ieaccount.com SSL to host Nginx

### 3.1 Copy existing Let's Encrypt certs from Docker volume to host

The ieaccount.com certs live inside the Docker volume `certbot_conf`. We need to copy them out:

```bash
# Find the volume mount path
docker volume inspect ieaccount_certbot_conf | grep Mountpoint
```

This will show something like `/var/lib/docker/volumes/ieaccount_certbot_conf/_data`. Copy the certs to the standard host location:

```bash
sudo cp -rL /var/lib/docker/volumes/ieaccount_certbot_conf/_data/ /etc/letsencrypt/
sudo chown -R root:root /etc/letsencrypt
```

Verify:

```bash
sudo ls /etc/letsencrypt/live/ieaccount.com/
# Should show: fullchain.pem  privkey.pem  cert.pem  chain.pem  README
```

> **Alternative:** If the certs are expired or you prefer a clean start, skip this step and issue fresh certs in Phase 5 for both domains.

### 3.2 Create Nginx site config for ieaccount.com

```bash
sudo nano /etc/nginx/sites-available/ieaccount.com
```

Paste:

```nginx
# ieaccount.com — reverse proxy to Docker stack (localhost:3000 / localhost:5000)

server {
    listen 80;
    server_name ieaccount.com www.ieaccount.com;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ieaccount.com www.ieaccount.com;

    ssl_certificate     /etc/letsencrypt/live/ieaccount.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ieaccount.com/privkey.pem;
    ssl_session_cache   shared:SSL_IE:10m;
    ssl_session_timeout 10m;

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (Vite dev server)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ieaccount.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default   # remove default catch-all
```

### 3.3 Test and reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Verify ieaccount.com still works:

```bash
curl -I https://ieaccount.com
```

---

## Phase 4 — Deploy iconichishab.com (the new stack)

### 4.1 DNS — Cloudflare

1. Log in to Cloudflare → add the site **`iconichishab.com`** (or it may already be there).
2. Go to **DNS → Records** and create an **A record**:
   - **Name:** `@`
   - **IPv4:** your VPS public IP (same as ieaccount.com)
   - **Proxy status:** **DNS only (grey cloud)** — for initial cert issuance
3. Optional: **CNAME** `www` → `@` (also grey cloud).
4. Wait for DNS propagation (check with `dig iconichishab.com`).

### 4.2 Clone the repo into a new directory

```bash
cd /var/www
git clone https://github.com/YOUR_ORG/YOUR_REPO.git iconichishab
cd iconichishab
```

> Use the same PAT or SSH key you used for the first clone.

### 4.3 Configure `.env` files

#### Root `.env`

```bash
cp .env.example .env
nano .env
```

Set the values — **critical differences from ieaccount**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DOMAIN` | `iconichishab.com` | New domain |
| `VITE_API_URL` | `https://iconichishab.com/api/v1` | After SSL is set up |
| `DB_ROOT_PASSWORD` | `<NEW strong password>` | **Different** from ieaccount |
| `DB_NAME` | `hishab_accounts` | **Different** DB name |
| `DB_USER` | `hishab_user` | **Different** DB user |
| `DB_PASSWORD` | `<NEW strong password>` | **Different** from ieaccount |
| `NODE_ENV` | `development` | Same as ieaccount |
| `CORS_ORIGINS` | `https://iconichishab.com` | New domain |

#### Backend `.env`

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

- Set `AUTH_TOKEN`, `REFRESH_TOKEN`, `OTP_TOKEN` to **new unique secrets** (different from ieaccount).
- Set `CLIENT_URL` to `https://iconichishab.com`.
- Set `CORS_ORIGINS` to `https://iconichishab.com`.
- Set Cloudinary, email credentials as needed (can share with ieaccount or use separate ones).

**`DATABASE_URL` in `backend/.env`:** Compose **overrides** this at runtime with `mysql://${DB_USER}:${DB_PASSWORD}@db:3306/${DB_NAME}` from the **root** `.env`. Keep `backend/.env` aligned for local runs; for Docker, the important part is that root `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are correct.

**Passwords and connection strings:** If `DB_PASSWORD` contains characters such as `@`, `:`, `/`, `#`, or `%`, the constructed URL can break unless those characters are **percent-encoded** in the password portion. Simplest fix on a new deploy: use a long random **alphanumeric** `DB_PASSWORD` (and matching value in root `.env`).

### 4.4 Modify `docker-compose.yml` for the second instance

This is the **most critical step**. We must change container names, volume names, network name, and port mappings to avoid conflicts with the ieaccount stack.

The **current repository** already uses `ports:` (localhost-bound) for frontend and backend, not `expose:`. Edit the **port numbers** and names below; if you somehow still have `expose:` on the server, replace it with the `ports:` blocks shown.

```bash
nano docker-compose.yml
```

Make these changes:

#### a) Container names — replace all `erp_` prefixes with `hishab_`

| Service | Old `container_name` | New `container_name` |
|---------|---------------------|---------------------|
| db | `erp_mysql` | `hishab_mysql` |
| backend | `erp_backend` | `hishab_backend` |
| frontend | `erp_frontend` | `hishab_frontend` |
| prisma-studio | `erp_prisma_studio` | `hishab_prisma_studio` |

#### b) Frontend — bind host **port 3100** → container 3000

Set (or replace `127.0.0.1:3000:3000` with):

```yaml
    ports:
      - "127.0.0.1:3100:3000"
```

#### c) Backend — bind host **port 5100** → container 5000

Set (or replace `127.0.0.1:5000:5000` with):

```yaml
    ports:
      - "127.0.0.1:5100:5000"
```

#### d) Remove/comment out the `nginx` and `certbot` services entirely

The host Nginx handles these, same as ieaccount.

#### e) Remove `certbot_conf` and `certbot_www` volumes

From the volumes section at the bottom, keep only `mysql_data` and **rename it**:

```yaml
volumes:
  hishab_mysql_data:
    driver: local
```

And update the `db` service volume reference:

```yaml
    volumes:
      - hishab_mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
```

#### f) Rename the network

```yaml
networks:
  hishab-network:
    driver: bridge
```

Update **every service** to use `hishab-network` instead of `erp-network`.

#### g) Prisma Studio — different port

```yaml
    ports:
      - "127.0.0.1:5556:5555"    # 5556 on host to avoid conflict with ieaccount's 5555
```

### 4.5 Complete modified `docker-compose.yml` reference

For clarity, here's what the final file should look like (Nginx/Certbot removed, ports/names changed):

```yaml
services:

  db:
    image: mysql:8.0
    container_name: hishab_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE:      ${DB_NAME}
      MYSQL_USER:          ${DB_USER}
      MYSQL_PASSWORD:      ${DB_PASSWORD}
    volumes:
      - hishab_mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    networks:
      - hishab-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost",
             "-u", "root", "--password=${DB_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  backend:
    build:
      context: ./backend
      target: development
    container_name: hishab_backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      DATABASE_URL: "mysql://${DB_USER}:${DB_PASSWORD}@db:3306/${DB_NAME}"
      NODE_ENV:     ${NODE_ENV:-development}
      PORT:         5000
      CORS_ORIGINS: ${CORS_ORIGINS:-}
    ports:
      - "127.0.0.1:5100:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
      - /app/dist
    depends_on:
      db:
        condition: service_healthy
    networks:
      - hishab-network
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "require('http').get('http://127.0.0.1:5000/',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))",
        ]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 60s
    command: >
      sh -c "
        echo 'Running Prisma migrations...' &&
        npx prisma migrate deploy &&
        echo 'Starting server...' &&
        npm run dev
      "

  frontend:
    build:
      context: ./frontend
      target: development
    container_name: hishab_frontend
    restart: unless-stopped
    environment:
      VITE_API_URL: ${VITE_API_URL}
    ports:
      - "127.0.0.1:3100:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - hishab-network

  prisma-studio:
    build:
      context: ./backend
      target: development
    container_name: hishab_prisma_studio
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      DATABASE_URL: "mysql://${DB_USER}:${DB_PASSWORD}@db:3306/${DB_NAME}"
    ports:
      - "127.0.0.1:5556:5555"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
    networks:
      - hishab-network
    command: npx prisma studio --port 5555 --browser none
    profiles:
      - tools

volumes:
  hishab_mysql_data:
    driver: local

networks:
  hishab-network:
    driver: bridge
```

### 4.6 Build and start the new stack

Confirm root `.env` and `backend/.env` exist **before** `up -d`. The **frontend** service waits for **backend** to become **healthy** (`depends_on` + health check on `http://127.0.0.1:5000/` inside the backend container). If migrations fail or the API never listens, backend stays unhealthy and Compose reports **dependency backend failed to start** when starting frontend.

```bash
cd /var/www/iconichishab
docker compose build
docker compose up -d
```

Verify:

```bash
docker compose ps
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5100/   # expect 200
curl -s http://127.0.0.1:3100/   # hishab frontend (HTML)
```

If anything fails:

```bash
docker compose logs backend --tail 200
docker compose logs db --tail 80
```

---

## Phase 5 — Host Nginx config for iconichishab.com + SSL

### 5.1 Create Nginx site config (HTTP-only first)

```bash
sudo nano /etc/nginx/sites-available/iconichishab.com
```

Paste the **HTTP-only** version first (for cert issuance):

```nginx
# iconichishab.com — HTTP-only (until Let's Encrypt cert is issued)

server {
    listen 80;
    server_name iconichishab.com www.iconichishab.com;

    # ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Temporary: serve directly over HTTP until cert is ready
    location /api {
        proxy_pass http://127.0.0.1:5100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/iconichishab.com /etc/nginx/sites-enabled/
sudo mkdir -p /var/www/certbot   # ensure webroot exists
sudo nginx -t
sudo systemctl reload nginx
```

Verify HTTP works:

```bash
curl -I http://iconichishab.com
```

### 5.2 Issue Let's Encrypt certificate

> ⚠️ **Ensure Cloudflare is on grey cloud (DNS only)** for iconichishab.com during this step.

```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d iconichishab.com \
  -d www.iconichishab.com \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --non-interactive
```

Verify:

```bash
sudo ls /etc/letsencrypt/live/iconichishab.com/
```

### 5.3 Update Nginx config to HTTPS

```bash
sudo nano /etc/nginx/sites-available/iconichishab.com
```

Replace the entire file with:

```nginx
# iconichishab.com — HTTPS reverse proxy to Docker stack

server {
    listen 80;
    server_name iconichishab.com www.iconichishab.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name iconichishab.com www.iconichishab.com;

    ssl_certificate     /etc/letsencrypt/live/iconichishab.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iconichishab.com/privkey.pem;
    ssl_session_cache   shared:SSL_HISHAB:10m;
    ssl_session_timeout 10m;

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (Vite dev server)
    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5.4 Update `.env` → HTTPS

Now that SSL is working, update the root `.env` if you initially set HTTP:

```bash
cd /var/www/iconichishab
nano .env
```

Set `VITE_API_URL=https://iconichishab.com/api/v1`, then recreate the frontend:

```bash
docker compose up -d --force-recreate frontend
```

Verify HTTPS:

```bash
curl -I https://iconichishab.com
```

---

## Phase 6 — Cloudflare (after HTTPS works)

1. In Cloudflare DNS for **iconichishab.com**, switch A and CNAME records to **Proxied (orange cloud)**.
2. **SSL/TLS** → set mode to **Full (strict)**.
3. Optionally enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.

Repeat the same for **ieaccount.com** if you haven't already after migration.

---

## Phase 7 — Certificate auto-renewal

Since we moved from Dockerized Certbot to host-level Certbot (snap), renewal is **automatic**:

```bash
# Check timer is active
sudo systemctl list-timers | grep certbot
```

Snap Certbot sets up a systemd timer that runs `certbot renew` twice daily. After renewal, Nginx needs a reload. Add a deploy hook:

```bash
sudo nano /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

```bash
#!/bin/bash
systemctl reload nginx
```

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

This covers cert renewal for **both** ieaccount.com and iconichishab.com.

---

## Verification checklist

| Check | Command |
|-------|---------|
| Both stacks running | `docker compose -f /var/www/ieaccount/docker-compose.yml ps` and `docker compose -f /var/www/iconichishab/docker-compose.yml ps` |
| Backend HTTP 200 (per stack) | ieaccount: `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5000/` → **200**; iconichishab: same for port **5100** |
| ieaccount.com HTTPS | `curl -I https://ieaccount.com` |
| iconichishab.com HTTPS | `curl -I https://iconichishab.com` |
| Host Nginx healthy | `sudo systemctl status nginx` |
| No port conflicts | `sudo ss -tlnp | grep -E ':80|:443|:3000|:3100|:5000|:5100'` |
| Separate databases | `docker exec hishab_mysql mysql -u root -p -e "SHOW DATABASES;"` |
| Certbot renewal | `sudo certbot renew --dry-run` |

---

## Ongoing maintenance

### Deploy updates — ieaccount.com

```bash
cd /var/www/ieaccount
git pull
docker compose build
docker compose up -d
```

### Deploy updates — iconichishab.com

```bash
cd /var/www/iconichishab
git pull
docker compose build
docker compose up -d
```

### Logs

```bash
# ieaccount
docker compose -f /var/www/ieaccount/docker-compose.yml logs -f --tail=200 backend

# iconichishab
docker compose -f /var/www/iconichishab/docker-compose.yml logs -f --tail=200 backend

# Host Nginx
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

### Database backups

```bash
# ieaccount
docker exec erp_mysql mysqldump -u root -p"PASSWORD" erp_accounts > ieaccount-backup-$(date +%F).sql

# iconichishab
docker exec hishab_mysql mysqldump -u root -p"PASSWORD" hishab_accounts > hishab-backup-$(date +%F).sql
```

---

## Quick reference — port mapping

| Service | ieaccount.com | iconichishab.com |
|---------|---------------|------------------|
| Frontend (host) | `127.0.0.1:3000` | `127.0.0.1:3100` |
| Backend (host) | `127.0.0.1:5000` | `127.0.0.1:5100` |
| Prisma Studio | `127.0.0.1:5555` | `127.0.0.1:5556` |
| MySQL | Internal only | Internal only |
| Host Nginx | `:80` / `:443` (routes by domain) | `:80` / `:443` (routes by domain) |

---

## Quick reference — order of operations

1. **Modify ieaccount stack** — remove Docker Nginx/Certbot, expose ports to localhost.
2. **Install host Nginx** — reverse proxy for ieaccount.com (restore HTTPS).
3. **Cloudflare DNS** — A record for iconichishab.com → same VPS IP (grey cloud).
4. **Clone repo** → `/var/www/iconichishab` → configure **root** `.env` + **`backend/.env`** (required before a healthy backend).
5. **Modify `docker-compose.yml`** — rename containers/volumes/network, change ports (`3100` / `5100` on host).
6. **`docker compose build && docker compose up -d`** — if frontend fails with **dependency backend failed to start**, read backend logs first (`docker compose logs backend`).
7. **Host Nginx** — HTTP config for iconichishab.com.
8. **`certbot certonly`** — issue SSL cert.
9. **Host Nginx** — upgrade to HTTPS config → `nginx -t && systemctl reload nginx`.
10. **Update `.env`** — `VITE_API_URL` to HTTPS → `docker compose up -d --force-recreate frontend`.
11. **Cloudflare** — orange cloud + Full (strict) for iconichishab.com.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **`dependency backend failed to start`** (often when bringing up **frontend**) | **Meaning:** `frontend` depends on `backend` with `condition: service_healthy`. Backend must respond **HTTP 200** on `/` inside the container after `prisma migrate deploy` and `npm run dev`. **Check:** `docker compose logs backend --tail 200` in the project directory. Typical causes: missing or incomplete **root** `.env` (`DB_ROOT_PASSWORD`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `VITE_API_URL`); missing **`backend/.env`**; **`DB_PASSWORD` breaking the URL** (special characters — use encoding or alphanumeric password); **`npx prisma migrate deploy`** failing; MySQL not healthy (`docker compose logs db`). **Quick test:** `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5000/` (ieaccount) or `:5100` (iconichishab) on the host — expect **200**. |
| **`The "DB_USER" variable is not set`** (Compose warnings) | Create **`/var/www/<project>/.env`** from `.env.example` and set all `DB_*` and `VITE_API_URL` values. Re-run `docker compose up -d`. |
| **`bind: address already in use`** on port 80/443 | The old Docker Nginx is still running. `docker compose down` the old stack first, or ensure `erp_nginx` container is removed. |
| **502 Bad Gateway** for iconichishab.com | Check `docker compose ps` in `/var/www/iconichishab`. Ensure backend is healthy. Check ports: `curl http://127.0.0.1:5100/`. |
| **Let's Encrypt fails** | Confirm DNS A record exists for iconichishab.com (grey cloud). Port 80 open. Check `sudo nginx -t` for config errors. |
| **Wrong site shows for a domain** | Check `server_name` in both `/etc/nginx/sites-available/*.com` files. Run `sudo nginx -t && sudo systemctl reload nginx`. |
| **CORS errors** | Ensure `CORS_ORIGINS` in both root and backend `.env` files use the correct `https://iconichishab.com` origin. |
| **Mixed content / API errors** | `VITE_API_URL` must be `https://iconichishab.com/api/v1` after cert issuance. Recreate frontend after change. |
| **Database collision** | Each stack has its own named volume (`mysql_data` vs `hishab_mysql_data`) and its own DB name. They are fully isolated. |

---

*Last updated for Ubuntu 24.04, Docker Compose v2, host-level Nginx + Certbot (snap), two-site VPS setup. Aligned with repository `docker-compose.yml` (localhost `ports`, no in-compose Nginx; frontend depends on healthy backend).*
