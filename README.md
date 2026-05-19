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

**Server** (`Server/.env`):

```env
DATABASE=mongodb://localhost:27017/nagarpalika
PORT=8000
NODE_ENV=development
SESSION_SECRET=your-long-random-secret
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Payment gateway (P5 — not yet integrated)
PAYMENT_GATEWAY_KEY=
PAYMENT_GATEWAY_SECRET=

# UIDAI Aadhaar OTP (P3 — requires empanelment)
UIDAI_AUA_CODE=
UIDAI_LICENSE_KEY=

# WhatsApp — Meta Cloud API v21.0 (P8)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Email — SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**Web** (`Web/.env`):

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Nagar Palika Recruitment Portal
```

**Admin** (`Admin/.env`):

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Nagar Palika Admin
```

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

Security baseline implemented:

- bcrypt password hashing
- HttpOnly session cookies (SameSite, Secure flags)
- Magic byte file type validation (`file-type` library)
- UUID-based filenames + Sharp → WebP compression
- express-validator input sanitization
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
