# Nagar Palika Online Recruitment Portal

A multi-tenant online recruitment portal for **Patan Municipal Council** and **Palanpur Municipal Council** (Gujarat, India). Citizens can browse job advertisements, register via Aadhaar OTR, apply for positions, pay fees, and download call letters. Administrators manage the full recruitment lifecycle through a dedicated panel.

Modelled on [OJAS](https://ojas.gujarat.gov.in) — bilingual English + Gujarati.

---

## Architecture

```
nagarpalika-v2/
├── Web/      Public citizen portal   — React 18 + Vite            (port 5173)
├── Admin/    Admin panel             — React 18 + Vite + Reactstrap (port 3000)
└── Server/   REST API backend        — Express + MongoDB           (port 8000)
```

**Multi-tenant:** Single codebase, isolated data per municipality subdomain.
`patan.domain.gov.in` and `palanpur.domain.gov.in` share the server; `tenantId` is derived from the `Host` header and scoped to every database query.

---

## Tech Stack

### Web (Public Portal)

| | |
|--|--|
| Framework | React 18.3 + Vite 5.4 |
| Router | React Router DOM 6.26 |
| Styling | Vanilla CSS — `site.css` + `ojas-tokens.css` (CSS custom properties) |
| Fonts | Noto Sans + Noto Sans Gujarati (Google Fonts) |
| i18n | Custom `LangContext` — EN / HI / GU, persisted in localStorage |
| HTTP | Axios — `/api/v1/` prefix, `withCredentials: true` |

### Admin Panel

| | |
|--|--|
| Framework | React 18.2 + Vite |
| UI | Reactstrap 9 (Bootstrap 5) |
| Tables | react-data-table-component |
| Forms | Formik + Yup |
| Charts | Recharts |
| Auth | Cookie session (HttpOnly, no client-side JWT) |

### Server (REST API)

| | |
|--|--|
| Runtime | Node.js ≥ 22 |
| Framework | Express 4.21 |
| Database | MongoDB via Mongoose 8.11 |
| Auth | Express Session — connect-mongo, 24h TTL |
| File uploads | Multer + magic byte validation + Sharp (WebP compression) |
| Validation | express-validator |
| Security | Helmet, CORS, express-mongo-sanitize, HPP, express-rate-limit |
| API Docs | Swagger UI at `/api-docs` (dev only) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 22
- MongoDB (local or Atlas)

### 1. Clone

```bash
git clone https://github.com/Vyaris-Official-110/nagarpalika-v2.git
cd nagarpalika-v2
```

### 2. Environment variables

Each app requires a `.env` file. Copy the `.env.example` provided in each directory and fill in your values.

**Server** (`Server/.env`) — required groups:

| Group | Variables needed |
|-------|-----------------|
| Database | MongoDB connection URI, port |
| App | Node environment, session secret, allowed CORS origins |
| Payment gateway | API key + secret (P5 — not yet integrated) |
| Aadhaar / UIDAI | AUA credentials (P3 — requires UIDAI empanelment) |
| WhatsApp | Meta Cloud API credentials (P8) |
| Email | SMTP host, port, credentials |

**Web & Admin** (`Web/.env`, `Admin/.env`) — required:

| Variable | Value |
|----------|-------|
| API base URL | URL of the running Server instance |
| App name | Display name shown in the UI |

> **Never commit `.env` files.** They are gitignored. See the [Security](#security) section.

### 3. Install and run

```bash
# Server
cd Server && npm install && npm run dev
# API:        http://localhost:8000
# Swagger:    http://localhost:8000/api-docs

# Public portal (new terminal)
cd Web && npm install && npm run dev
# http://localhost:5173

# Admin panel (new terminal)
cd Admin && npm install && npm run dev
# http://localhost:3000
```

---

## Features

### Public Portal

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Home — notices, quick links, ticker | Live |
| `/about` | About the portal | Live |
| `/careers` | Job advertisements (API-driven) | Live |
| `/notices` | Official notices/circulars (API-driven) | Live |
| `/help` | FAQ + contact form (API-driven) | Live |
| `/callletter` | Call letter download | UI stub |
| `/results` | Exam results | UI stub |
| `/contact` | Contact page | UI stub |

### Admin Panel

| Route | Purpose |
|-------|---------|
| `/dashboard` | Recruitment stats — active ads, candidates, applications, fees collected |
| `/advertisement` | Advertisement CRUD — create, publish, close |
| `/candidates` | OTR candidate list — activate/deactivate |
| `/applications` | Application list — inline status updates |
| `/fee-payments` | Fee payment records (read-only) |
| `/call-letters` | Call letter management — enable/disable |
| `/notice` | Notice management — create, publish |
| `/employee` | Admin user management |
| `/employee-roles` | Role permission matrix |
| `/department` | Department CRUD |

### API (Server `/api/v1/`)

| Endpoint | Description |
|----------|-------------|
| `POST /advertisements/search` | List/filter advertisements |
| `GET /advertisements/:id` | Get advertisement by ID |
| `POST /advertisements` | Create advertisement (admin) |
| `PATCH /advertisements/:id/publish` | Publish advertisement (admin) |
| `POST /candidates/search` | List/filter candidates (admin) |
| `PATCH /candidates/:id/toggle-status` | Activate/deactivate candidate (admin) |
| `POST /applications/search` | List/filter applications (admin) |
| `PATCH /applications/:id/status` | Update application status (admin) |
| `POST /fee-payments/search` | List/filter fee payments (admin) |
| `POST /call-letters/search` | List/filter call letters (admin) |
| `POST /notices/search` | List/filter notices |
| `PATCH /notices/:id/publish` | Publish notice (admin) |
| `POST /help-queries` | Submit help query (public) |
| `GET /analytics/dashboard` | Dashboard stats (admin) |

Full documentation available at `/api-docs` when `NODE_ENV=development`.

---

## Data Model

| Model | Key Fields |
|-------|-----------|
| `Advertisement` | advtNo, postTitle, departmentId, vacancies, applicationFee, startDate, endDate, status (`draft`/`published`/`closed`), tenantId |
| `Candidate` | registrationId, aadhaarHash (SHA-256), name, dob, gender, category, photoPath, signaturePath, isActive, tenantId |
| `Application` | applicationRefNo, registrationId, advtNo, status (`draft`/`submitted`/`fee_pending`/`fee_paid`/`shortlisted`/`rejected`), tenantId |
| `FeePayment` | paymentId, applicationRefNo, amount, gatewayTxnId, status (`pending`/`success`/`failed`/`refunded`), receiptPath, tenantId |
| `CallLetter` | registrationId, advtNo, rollNumber, examDate, venue, enabled, tenantId |
| `Notice` | title, type (`notice`/`circular`/`tender`/`press`/`recruitment`/`result`), pdfPath, publishedAt, expiresAt, tenantId |
| `HelpQuery` | name, email, mobile, subject, message, status (`open`/`in_progress`/`resolved`), tenantId |

---

## Security

### Repository — What Must Never Be Committed

**Never commit these files.** Verify `.gitignore` covers all of them:

```
# Secrets
**/.env
**/.env.*
!**/.env.example

# Uploads (contain citizen PII — photos, signatures, PDFs)
Server/uploads/
Server/out/

# Logs
Server/log/

# Build artifacts
**/dist/
**/build/
Admin/build/
```

Before any push, scan for accidental secrets:

```bash
git diff --cached | grep -iE "(password|secret|token|key|aadhaar|DATABASE=mongodb)" 
```

If a secret was committed and pushed — **rotate it immediately**. Removing from history is not enough if the commit was ever pushed.

### Environment Variables

- **Never hardcode** secrets, connection strings, or API keys in source code.
- All secrets live in `.env` files — which are gitignored.
- For production: use a secrets manager (AWS Secrets Manager, HashiCorp Vault, or the hosting provider's env var injection) instead of `.env` files on disk.
- `SESSION_SECRET` must be at least 64 random characters. Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- Rotate all secrets if a `.env` file is ever accidentally committed or shared.

### MongoDB Hardening

Do not run MongoDB with default settings in production:

```bash
# 1. Enable authentication (mongod.conf)
security:
  authorization: enabled

# 2. Bind to localhost only — never expose port 27017 to the internet
net:
  bindIp: 127.0.0.1

# 3. Create a dedicated DB user with least-privilege access
db.createUser({
  user: "nagarpalika_app",
  pwd: "<strong-random-password>",
  roles: [{ role: "readWrite", db: "nagarpalika" }]
})

# 4. Use connection string with credentials
DATABASE=mongodb://nagarpalika_app:<password>@127.0.0.1:27017/nagarpalika
```

- Never use the `root` or `admin` user in the application connection string.
- Enable MongoDB audit logging in production.
- Take daily backups — the `knowledge_base/` SRS requires 30-day retention.

### Server / OS Hardening

```bash
# Disable password-based SSH — keys only
PasswordAuthentication no

# Firewall: expose only what's needed
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP → redirect to HTTPS
ufw allow 443/tcp     # HTTPS
ufw deny 27017/tcp    # MongoDB — never public
ufw deny 8000/tcp     # Express — sit behind nginx, not directly exposed
ufw enable

# Run Node as a non-root user
useradd -m nagarpalika
# Run the app as this user via PM2 or systemd
```

- Keep OS and Node.js patched. Subscribe to Node.js security advisories.
- Use `pm2` or `systemd` to manage the process — never run with `sudo node`.

### HTTPS / nginx

Terminate TLS at nginx. Never expose Express directly on port 443:

```nginx
server {
    listen 443 ssl http2;
    server_name patan.domain.gov.in palanpur.domain.gov.in;

    ssl_certificate     /etc/letsencrypt/live/domain.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain.gov.in/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

### Admin Panel Access

- IP-whitelist `/out/admin/` and all `/api/v1/auth/` admin routes in nginx.
- The SRS requires admin panel to be accessible only from municipal office IPs.
- Enable admin 2FA before go-live (P9 hardening task).

### Sensitive Data in the Codebase

| Data | Where | Protection |
|------|-------|-----------|
| Aadhaar numbers | `Candidate.aadhaarHash` | SHA-256 hash only — raw number never stored |
| Citizen photos/signatures | `Server/uploads/` | UUID filenames, not guessable; serve via authenticated route |
| Session tokens | Express session store (MongoDB) | HttpOnly + Secure cookies; never in URL or logs |
| Payment transaction IDs | `FeePayment.gatewayTxnId` | Stored, never logged to console |
| OTPs | `Otp` model (MongoDB TTL) | 10-minute auto-expiry; never returned in API responses |

**Never log PII.** Morgan request logs must not include request bodies. Verify:

```javascript
// server.js — safe: logs method + URL only, not body
app.use(morgan('dev'));
```

### Dependency Security

```bash
# Audit all three packages
cd Server && npm audit
cd Web && npm audit  
cd Admin && npm audit

# Fix automatically where safe
npm audit fix
```

Run `npm audit` before every production deployment. Do not ignore HIGH or CRITICAL advisories.

### Production Go-Live Checklist

- [ ] All `.env` files gitignored and not on any public server
- [ ] `NODE_ENV=production` set (disables Swagger, enables secure cookies)
- [ ] MongoDB auth enabled, port 27017 firewalled
- [ ] HTTPS enforced, HTTP redirects to HTTPS
- [ ] Admin panel IP-whitelisted in nginx
- [ ] `SESSION_SECRET` is 64+ random characters
- [ ] `npm audit` shows no HIGH/CRITICAL issues
- [ ] Swagger UI disabled (automatic when `NODE_ENV=production`)
- [ ] File upload directory (`Server/uploads/`) not web-accessible directly
- [ ] Daily backup cron configured with 30-day retention
- [ ] Error responses do not include stack traces (automatic in production mode)
- [ ] P9 security pentest completed and remediation signed off

### Implemented Security Features (Codebase)

- bcrypt password hashing
- HttpOnly session cookies (SameSite, Secure flags)
- Magic byte file type validation (`file-type` library)
- UUID-based filenames + Sharp → WebP compression
- express-validator input sanitization on all routes
- express-mongo-sanitize (NoSQL injection prevention)
- HTTP Parameter Pollution protection
- Rate limiting on all endpoints
- Helmet + custom CSP security headers
- OTP with 10-minute TTL auto-expiry (MongoDB TTL index)
- Soft deletes + audit fields (createdBy/updatedBy) on all models
- Multi-tenant isolation via `tenantId` on all recruitment models

---

## Build and Deploy

```bash
# Build admin panel (output copied to Server/out/admin/)
cd Admin && npm run build

# Server serves:
#   API:      /api/v1/*
#   Admin UI: /out/admin/  (static)
#
# Web portal is built and served separately (Vite build or CDN).
```

For multi-subdomain deployment, configure nginx to route both subdomains to the same Express instance. The `tenantMiddleware` handles data isolation from the `Host` header.

---

## Development Status

| Phase | Description | Status |
|-------|-------------|--------|
| P1 · Foundation | Server, models, middleware, API skeleton | ✅ Complete |
| P2 · Public Frontend | Public portal pages, API integration | ✅ Complete |
| P3 · OTR Registration | 10-step Aadhaar OTP registration flow | 🔴 Blocked |
| P4 · Application | Apply flow, edit window, print PDF | 🔴 Blocked |
| P5 · Fee Payment | Payment gateway, webhook HMAC, receipts | 🔴 Blocked |
| P6 · Call Letter | Eligibility check, signed download token | ⏳ Awaiting P4+P5 |
| P7 · Admin Panel | Full recruitment admin UI | ✅ Complete |
| P8 · Notifications | WhatsApp → SMS → Email stack | 🟡 Partial |
| P9 · Security & Pentest | Hardening checklist + pentest | 🔴 Not started |

**Active blockers:**
- **P3/P4** — Application form fields beyond OTR not confirmed by stakeholders
- **P3** — UIDAI AUA empanelment required for Aadhaar OTP
- **P5** — Payment gateway contract not yet signed (Razorpay / PayGov / state portal TBD)
- **P8** — WhatsApp Business API registration pending by municipality

---

## License

Private — Patan Municipal Council & Palanpur Municipal Council. Not for public distribution.
