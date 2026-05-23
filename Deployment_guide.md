# VPS deployment guide — ieaccount.com

This guide walks you from a fresh **Ubuntu 24.04 LTS** VPS to a running **Dockerized** stack:

- **Frontend:** React (Vite) — dev server behind Nginx  
- **Backend:** Express (TypeScript) + Prisma  
- **Database:** MySQL 8 (internal Docker network only)  
- **Edge:** Nginx (ports 80/443) + Let’s Encrypt (Certbot container)

Project references: root [`docker-compose.yml`](docker-compose.yml), [`nginx/entrypoint.sh`](nginx/entrypoint.sh), [`nginx/templates/http.conf`](nginx/templates/http.conf), [`nginx/templates/https.conf`](nginx/templates/https.conf).

---

## 1. Prerequisites

- A **VPS** with Ubuntu 24.04 and **root or sudo** SSH access.
- Your **VPS public IPv4** (and IPv6 if you use it).
- Domain **`ieaccount.com`** at your registrar, **nameservers pointed to Cloudflare** (Cloudflare shows the zone as “Active”).
- A **GitHub** repository with this project (HTTPS clone with a **Personal Access Token (PAT)**, or SSH clone with a deploy key — this guide uses HTTPS + PAT as the default).
- An **email address** for Let’s Encrypt registration (notifications only).

**Security note:** Use strong, unique passwords for MySQL and app secrets. Never commit `.env` files.

---

## 2. DNS and Cloudflare (do this early)

### 2.1 Add records in Cloudflare

1. Log in to Cloudflare → select **`ieaccount.com`** → **DNS** → **Records**.
2. Add an **A** record:
   - **Name:** `@` (apex) **or** your chosen hostname (e.g. `app` if you use `app.ieaccount.com`).
   - **IPv4 address:** your VPS public IP.
   - **Proxy status:** **DNS only (grey cloud)** for the **first certificate issuance** (recommended). You can switch to **Proxied (orange cloud)** after HTTPS works (see [section 10](#10-cloudflare-proxy-after-https-works)).

3. Optional **www:** add a **CNAME** `www` → `@` (or A record if you prefer), also **grey cloud** initially if you include `www` in the certificate.

4. Wait until DNS propagates (often minutes; use `dig` or an online DNS checker).

### 2.2 Why grey cloud first?

- Let’s Encrypt **HTTP-01** validation must reach **your VPS on port 80**. With **grey cloud**, traffic goes straight to the server — simplest path for the first cert.
- After the cert works, you can enable **orange cloud** and set SSL mode to **Full (strict)** (see [section 10](#10-cloudflare-proxy-after-https-works)).

---

## 3. Initial SSH login and non-root user

From your **local machine** (replace placeholders):

```bash
ssh root@YOUR_VPS_IP
```

### 3.1 Create a sudo user (recommended)

```bash
adduser deploy
usermod -aG sudo deploy
```

### 3.2 SSH key authentication (recommended)

On your **local** machine, if you do not have a key yet:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

On the **server** (as `root` or `deploy` after you copy your key):

```bash
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
# Paste your public key into authorized_keys
nano /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

Test login as `deploy`:

```bash
ssh deploy@YOUR_VPS_IP
```

### 3.3 Harden SSH (optional but recommended)

Edit `/etc/ssh/sshd_config`:

- `PermitRootLogin no`
- `PasswordAuthentication no` (only after key login works)

Then:

```bash
sudo systemctl reload ssh
```

---

## 4. System update and base packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates ufw
```

---

## 5. Firewall (UFW)

Allow SSH first, then HTTP/HTTPS, then enable:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

**Important:** Confirm SSH is allowed before `ufw enable` or you may lock yourself out.

---

## 6. Install Docker Engine and Compose plugin

Follow Docker’s official docs for Ubuntu, or use this common sequence:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Add your user to the `docker` group (logout/login required afterward):

```bash
sudo usermod -aG docker $USER
```

Verify:

```bash
docker --version
docker compose version
```

---

## 7. Clone the repository from GitHub

Choose a directory (example: `/var/www/ieaccount`):

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
```

### 7.1 HTTPS clone with a Personal Access Token (PAT)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** — create a token with **repo** scope (for private repos).
2. Clone (GitHub will prompt for password — use the **token** as the password):

```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO.git ieaccount
cd ieaccount
```

### 7.2 SSH clone (alternative)

Add your SSH public key to GitHub, then:

```bash
git clone git@github.com:YOUR_ORG/YOUR_REPO.git ieaccount
cd ieaccount
```

---

## 8. Environment configuration

### 8.1 Root `.env` (Compose / Nginx / Vite)

Copy the example and edit:

```bash
cp .env.example .env
nano .env
```

Set at minimum (adjust to your DNS choice):

| Variable | Example / notes |
|----------|------------------|
| `DOMAIN` | `ieaccount.com` **or** `app.ieaccount.com` — must match **DNS** and **certificate** names |
| `VITE_API_URL` | `https://YOUR_DOMAIN/api/v1` — must match how users open the site (HTTPS after certs) |
| `DB_*` | Strong passwords; `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_ROOT_PASSWORD` |
| `NODE_ENV` | `development` for current compose profile (Vite + `npm run dev` on backend) |
| `CORS_ORIGINS` | Optional; e.g. `https://YOUR_DOMAIN` |

### 8.2 Backend `backend/.env`

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

- Set **`AUTH_*`**, **`REFRESH_*`**, **`OTP_*`**, email, Cloudinary, and **`CLIENT_URL`** to your public site URL, e.g. `https://YOUR_DOMAIN`.
- **`DATABASE_URL`:** In Docker, `docker-compose.yml` **overrides** `DATABASE_URL` to use the `db` service — keep the example format for local reference; the running container uses the Compose value.

Never commit `.env` or `backend/.env`.

---

## 9. First start (HTTP-only until certs exist)

Nginx’s [`nginx/entrypoint.sh`](nginx/entrypoint.sh) uses **HTTP-only** [`nginx/templates/http.conf`](nginx/templates/http.conf) until Let’s Encrypt files exist at `/etc/letsencrypt/live/${DOMAIN}/`.

Build and start (from project root):

```bash
docker compose build
docker compose up -d
```

Check containers:

```bash
docker compose ps
docker compose logs -f --tail=100 nginx
```

Open in a browser: `http://YOUR_DOMAIN` (or `http://YOUR_VPS_IP` only if DNS is not ready — **Let’s Encrypt needs the correct hostname**, so wait for DNS).

---

## 10. Issue the first Let’s Encrypt certificate

The `certbot` service in [`docker-compose.yml`](docker-compose.yml) runs a **renewal loop** only. For the **first** certificate, run a **one-off** `certbot certonly` using the **same webroot** as Nginx (`/var/www/certbot`).

Replace `YOUR_DOMAIN` and email:

```bash
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d YOUR_DOMAIN \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --non-interactive
```

- Add **`-d www.YOUR_DOMAIN`** if you created DNS for `www` and want it on the same cert.
- Ensure **port 80** is reachable from the internet and **Cloudflare is grey cloud** for that hostname during issuance (recommended).

### 10.1 Reload Nginx to enable HTTPS

After certs exist, [`nginx/entrypoint.sh`](nginx/entrypoint.sh) will switch to [`nginx/templates/https.conf`](nginx/templates/https.conf) on next start:

```bash
docker compose restart nginx
```

Verify:

```bash
curl -I https://YOUR_DOMAIN
```

Update root `.env` **`VITE_API_URL`** to `https://YOUR_DOMAIN/api/v1` if you had HTTP temporarily, then recreate frontend so Vite sees the variable:

```bash
docker compose up -d --force-recreate frontend
```

---

## 11. Cloudflare proxy (after HTTPS works)

1. In Cloudflare DNS, set the **A** (and **CNAME** for `www` if used) to **Proxied (orange cloud)**.
2. **SSL/TLS** → set mode to **Full (strict)** (visitor ↔ Cloudflare encrypted; Cloudflare ↔ your origin uses your Let’s Encrypt cert).
3. Optionally enable **Always Use HTTPS** and **Automatic HTTPS Rewrites** in Cloudflare.

If validation or mixed-content issues appear, confirm **`VITE_API_URL`** and **`CORS_ORIGINS`** use `https://` and your exact public hostname.

---

## 12. Verification checklist

| Check | Command / action |
|-------|-------------------|
| Containers running | `docker compose ps` |
| Nginx | `docker compose logs nginx` — no TLS path errors |
| Backend health | `curl -sS http://127.0.0.1` from host won’t hit backend directly; use `curl -I https://YOUR_DOMAIN/api/...` per your API |
| HTTPS | Browser shows valid cert; `curl -I https://YOUR_DOMAIN` |
| DB | Only exposed inside Docker network (no MySQL port published — good) |

---

## 13. Ongoing maintenance

### 13.1 Deploy updates from Git

```bash
cd /var/www/ieaccount   # or your path
git pull
docker compose build
docker compose up -d
```

### 13.2 Logs

```bash
docker compose logs -f --tail=200 backend
docker compose logs -f --tail=200 frontend
docker compose logs -f --tail=200 nginx
```

### 13.3 Certificate renewal

The **`certbot`** container runs `certbot renew` on a schedule. Nginx may need a reload after renewal in some setups; if you notice expiry warnings, add a post-renewal hook or periodically:

```bash
docker compose restart nginx
```

### 13.4 Database backup (example)

MySQL data lives in the **`mysql_data`** volume. Example dump (run from host):

```bash
docker compose exec db mysqldump -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME" > backup-$(date +%F).sql
```

Store backups **off-server** securely.

### 13.5 Optional: Prisma Studio (dev only)

```bash
docker compose --profile tools up -d prisma-studio
```

Bound to `127.0.0.1:5555` — use SSH tunnel; do not expose publicly.

---

## 14. Troubleshooting

| Symptom | Things to check |
|--------|-------------------|
| **502 / bad gateway** | `docker compose ps`; backend/frontend logs; DB healthy (`docker compose logs db`). |
| **Let’s Encrypt fails** | DNS A record points to this VPS; **grey cloud** during issuance; port **80** open; `docker compose logs nginx` for ACME path. |
| **HTTPS works by IP but not domain** | `DOMAIN` in `.env` matches certificate name; DNS propagation. |
| **CORS / API errors in browser** | `VITE_API_URL` must be `https://.../api/v1`; `CORS_ORIGINS` includes your origin. |
| **Locked out of SSH** | Use provider console/VNC; fix `ufw` and `sshd_config`. |
| **`open backend.Dockerfile: no such file`** | Pull latest `main`; backend/frontend use standard `Dockerfile` names. Run `git pull` from the project root on the VPS. |
| **`DATABASE_*` / `DB_*` variable is not set** | Root `.env` must define **`DB_NAME`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_ROOT_PASSWORD`** (see [`.env.example`](.env.example)). `DATABASE_URL` in Compose is built from those same **`DB_*`** names — do not use a separate `DATABASE_USER` unless you fork the compose file. |

---

## 15. Quick reference — order of operations

1. Cloudflare **A** record → VPS IP (**grey cloud**).  
2. VPS: user, updates, **UFW**, **Docker**.  
3. **Clone** repo → **`.env`** + **`backend/.env`**.  
4. **`docker compose up -d`** (HTTP first).  
5. **`docker compose run ... certbot certonly`** → **`docker compose restart nginx`**.  
6. Set **`VITE_API_URL`** to HTTPS → **recreate frontend**.  
7. Optional: Cloudflare **orange cloud** + **Full (strict)**.

---

*Last updated for Ubuntu 24.04, Docker Compose v2, and the repository’s `docker-compose.yml` layout.*
