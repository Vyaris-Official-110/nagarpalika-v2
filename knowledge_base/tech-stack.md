# Tech Stack — Actual Codebase State

> Last updated: 2026-05-19 (P1+P2+P3+P7 complete — branch feat/p3-otr-registration)
> Source: Full codebase scan of Web/, Admin/, Server/
> **Current state:** P1 foundation, P2 public frontend, P3 OTR registration, P7 admin panel all shipped. Application/Fee/CallLetter citizen flows blocked.

---

## Project Structure

```
Nagarpalika/
├── Web/        Public-facing citizen portal (React + Vite)
├── Admin/      Admin panel frontend (React + Vite — repurposed from hms-admin)
├── Server/     REST API backend (Express + MongoDB — repurposed from hms-server)
└── knowledge_base/
```

---

## Web — Public-Facing Portal

| Item | Detail |
|------|--------|
| **Framework** | React 18.3.1 |
| **Build tool** | Vite 5.4.0 |
| **Router** | React Router DOM 6.26.0 |
| **Styling** | Vanilla CSS — `site.css` + `ojas-tokens.css` (CSS custom properties, no Tailwind/MUI) |
| **Fonts** | Noto Sans + Noto Sans Gujarati (Google Fonts) |
| **i18n** | Custom `LangContext` — EN / HI / GU, persisted in localStorage |
| **State** | React hooks only (useState, useContext) |
| **API calls** | Axios via `src/api/index.js` — `/api/v1/` prefix, `withCredentials: true` |
| **Dev port** | 5173 (Vite default) |
| **Entry** | `Web/index.html` → `src/main.jsx` → `src/App.jsx` |

### Routes

| Path | Component | Status |
|------|-----------|--------|
| `/` | `Home.jsx` | Static — hardcoded facts/news/services |
| `/about` | `About.jsx` | Static |
| `/careers` | `Careers.jsx` | **API-driven** — fetches from `GET /api/v1/advertisements` |
| `/notices` | `Notices.jsx` | **API-driven** — fetches from `GET /api/v1/notices` |
| `/help` | `Help.jsx` | **API-driven** — FAQ + contact form → `POST /api/v1/help-queries` |
| `/results` | `Results.jsx` | Static — form UI-only (not functional) |
| `/callletter` | `CallLetter.jsx` | Static — form UI-only (not functional) |
| `/contact` | `Contact.jsx` | Static — form UI-only (not functional) |

### Data Files

| File | Contents |
|------|----------|
| `src/data/marqueeItems.js` | 5 marquee ticker items |
| `src/data/i18n.js` | 40+ translation keys × 3 languages (EN/HI/GU) |
| `src/api/index.js` | Axios instance — base URL from `VITE_API_URL`, `withCredentials: true` |

### Routes (P3 added)

| Path | Component | Status |
|------|-----------|--------|
| `/` | `Home.jsx` | Static |
| `/about` | `About.jsx` | Static |
| `/careers` | `Careers.jsx` | API-driven |
| `/notices` | `Notices.jsx` | API-driven |
| `/help` | `Help.jsx` | API-driven |
| `/results` | `Results.jsx` | Static (UI-only) |
| `/callletter` | `CallLetter.jsx` | Static (UI-only) |
| `/contact` | `Contact.jsx` | Static (UI-only) |
| `/otr` | `Step1Aadhaar.jsx` | **P3 — OTR start** |
| `/otr/step/1–10` | `Step1–Step10.jsx` | **P3 — 10-step flow** |
| `/otr/find` | `FindRegistration.jsx` | **P3 — find reg ID** |

### Contexts & API Clients (P3 added)

| File | Purpose |
|------|---------|
| `src/context/CandidateAuthContext.jsx` | Candidate session — `candidate`, `login()`, `logout()`, `refetch()` |
| `src/api/otr.js` | OTR API calls (sendOtp, verifyOtp, saveStep, uploadPhoto, uploadSignature, submitRegistration, login, logout, findRegistration) |
| `src/components/LoginModal.jsx` | Candidate login modal (registrationId + password) |

### What Needs to Be Built (Phase 4+)

- `/apply` — job application flow (blocked Q#8)
- `/fee` — payment gateway (blocked Q#7, Q#2, no contract)

---

## Admin — Admin Panel Frontend

| Item | Detail |
|------|--------|
| **Framework** | React 18.2.0 |
| **Build tool** | Vite 7.3.1 |
| **Router** | React Router DOM 6.4.1 |
| **UI library** | Reactstrap 9 (Bootstrap 5 wrapper) |
| **Tables** | react-data-table-component 7.5.2 |
| **Forms** | Formik 2.2.9 + Yup 0.32.11 |
| **Charts** | Recharts 3.6.0 |
| **HTTP client** | Axios 0.26.0 (with interceptors) |
| **Styling** | SCSS (Bootstrap 5 + custom themes) |
| **State** | React Context API — AuthContext + MenuContext |
| **Auth** | Cookie session (`withCredentials: true`) — no JWT on client |
| **Dev port** | 3000 |
| **API base URL** | `VITE_API_URL` env var (defaults to `http://localhost:8000`) |
| **Build output** | `Admin/build/` → copied to `Server/out/admin/` on `npm run build` |

### Auth Flow

1. Login → `POST /api/v1/auth/company/login` or `/auth/employee/login`
2. Server sets HttpOnly session cookie
3. `AuthContext.verifyUserSession()` called on app mount → `GET /api/v1/auth/verify-session`
4. 401 response → interceptor clears localStorage, redirects to `/`
5. All API calls use `withCredentials: true` to send session cookie

### Contexts

| Context | Provides |
|---------|----------|
| `AuthContext` | `adminData`, `role`, `loading`, `getAdmin()`, `verifyUserSession()` |
| `MenuContext` | `menuData`, `employeeRoles`, `currentPagePermissions` (read/write/delete/edit/print/mail) |

### Permission System

- `MenuContext` fetches role-based menus from server (30-min cache)
- Every protected page checks `currentPagePermissions` before showing action buttons
- `AuthProtected.jsx` redirects to `/` if no session role

### Current Routes (Nagar Palika — P7 complete)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard` | `Dashboard.jsx` | Recruitment stats (activeAdvt, candidates, applications, feesCollected) |
| `/advertisement` | `Advertisements.jsx` | Advertisement list + publish/close/delete |
| `/advertisement/add` | `AdvertisementsForm.jsx` | Create advertisement |
| `/advertisement/:id/edit` | `AdvertisementsForm.jsx` | Edit advertisement |
| `/candidates` | `Candidates.jsx` | OTR candidate list + activate/deactivate |
| `/applications` | `Applications.jsx` | Application list + inline status update |
| `/fee-payments` | `FeePayments.jsx` | Fee payment list (read-only) |
| `/call-letters` | `CallLetters.jsx` | Call letter list + enable/disable |
| `/notice` | `Notices.jsx` | Notice list + publish/delete |
| `/notice/add` | `NoticesForm.jsx` | Create notice |
| `/employee` | `Employee.jsx` | Admin user management |
| `/employee-roles` | `EmployeeRoles.jsx` | Role permission matrix |
| `/department` | `Department.jsx` | Department CRUD |
| `/whatsapp` | `WhatsAppMessages.jsx` | WhatsApp message log |
| `/reports` | `Reports.jsx` | Recruitment reports (stub) |
| `/role-master` | `RoleMaster.jsx` | Role management |
| `/menu-master` | `MenuMaster.jsx` | Menu management |
| `/master-data` | `MasterData.jsx` | Master data (gender, category, etc.) |

### What Needs to Be Built (Phase 8+)

- Help queries admin inbox page (referenced in dashboard, route missing)
- Bulk ZIP export for call letters (P7 spec item, not yet implemented)
- Recruitment event email triggers (P8)

---

## Server — REST API Backend

| Item | Detail |
|------|--------|
| **Framework** | Express 4.21.2 |
| **Runtime** | Node.js ≥ 22 / Bun compatible |
| **Database** | MongoDB (Mongoose 8.11.0) |
| **Auth** | Express Session (connect-mongo, 24h TTL, HttpOnly cookie) |
| **Port** | 8000 (configurable via `PORT` env var) |
| **API prefix** | `/api/v1/` |
| **File uploads** | Multer + magic byte validation (file-type) + Sharp compression |
| **Input validation** | express-validator chains |
| **Security** | Helmet + CORS + express-mongo-sanitize + HPP + express-rate-limit |
| **Email** | Nodemailer (SMTP, DB-configured via admin panel) |
| **WhatsApp** | Meta Cloud API v21.0 (DB-configured via admin panel) |
| **Documentation** | Swagger UI at `/api-docs` (dev only) |
| **Logging** | Morgan (request log) + error log to `log/error.html` |

### Middleware Stack (in order)

1. Helmet + custom security headers
2. CORS (origins from `ALLOWED_ORIGINS` env var)
3. Body parser (10 MB limit)
4. `express-mongo-sanitize` (NoSQL injection prevention)
5. HPP (HTTP Parameter Pollution prevention)
6. Express Session (MongoDB-backed)
7. Morgan (dev logging)
8. Route handlers
9. Global error handler (no stack traces in production)

### Current Models (built — P1 complete)

| Model | File | Key Fields |
|-------|------|-----------|
| `Advertisement` | `models/Advertisement.js` | advtNo, postTitle, departmentId, postClass, payScale, vacancies, applicationFee, startDate, endDate, pdfPath, status (draft/published/closed), tenantId, isDeleted |
| `Candidate` | `models/Candidate.js` | registrationId, aadhaarHash (SHA-256, never returned in API), name, fatherName, dob, gender, category, nationality, religion, maritalStatus, exServiceman, motherTongue, mobile, altMobile, email, permanentAddress{}, currentAddress{}, qualification{}, languages[], phStatus, phType, phPercentage, photoPath, signaturePath, passwordHash, loginAttempts, lockoutUntil, otrStep, registrationCompleted, editWindowExpiresAt, isActive, tenantId |
| `Application` | `models/Application.js` | applicationRefNo, registrationId, advtNo, submittedAt, status (draft/submitted/fee_pending/fee_paid/shortlisted/rejected), tenantId, isDeleted |
| `FeePayment` | `models/FeePayment.js` | paymentId, applicationRefNo, amount, gatewayTxnId, mode, status (pending/success/failed/refunded), receiptPath, paidAt, tenantId |
| `CallLetter` | `models/CallLetter.js` | registrationId, advtNo, rollNumber, examDate, venue, availableFrom, enabled, tenantId |
| `Notice` | `models/Notice.js` | title, type (notice/circular/tender/press/recruitment/result/important_instruction), refNo, pdfPath, status (draft/published), publishedAt, expiresAt, tenantId |
| `HelpQuery` | `models/HelpQuery.js` | name, email, mobile, subject, message, status (open/in_progress/resolved), tenantId |
| `CompanyMaster` | `models/CompanyMaster.js` | Municipality config (kept from HMS) |
| `Employee` | `models/Employee.js` | Admin user (kept from HMS) |
| `RoleMaster` | `models/RoleMaster.js` | Admin roles |
| `Department` | `models/Department.js` | Department CRUD |
| `WhatsAppConfig/Message` | existing | Notification config + log |
| `EmailSetup/EmailFor/EmailTemplate` | existing | Email notification config |
| `MasterData` | existing | Gender, category, etc. |
| `MenuMaster/MenuGroup` | existing | Admin menu management |
| `Otp` | existing (updated) | TTL 300s; added `phone` (sparse), `type` enum (email_verify/aadhaar_otp/login_otp) |
| `Country/State/City` | existing | Location data |

### API Routes Built (Server)

| Prefix | Controller | Methods |
|--------|-----------|---------|
| `/api/v1/advertisements` | `advertisement.controller.js` | search (POST), getById, create, update, publish (PATCH), close (PATCH), delete |
| `/api/v1/candidates` | `candidate.controller.js` | search (POST), getById, toggleStatus (PATCH) |
| `/api/v1/applications` | `application.controller.js` | search (POST), getById, updateStatus (PATCH) |
| `/api/v1/fee-payments` | `feePayment.controller.js` | search (POST), getById |
| `/api/v1/call-letters` | `callLetter.controller.js` | search (POST), getById, update (PATCH) |
| `/api/v1/notices` | `notice.controller.js` | search (POST), create, getById, publish (PATCH), delete |
| `/api/v1/help-queries` | `helpQuery.controller.js` | create (public), search (POST, admin), updateStatus (PATCH) |
| `/api/v1/analytics` | `analytics.controller.js` | getDashboardStats (activeAdvt, totalCandidates, totalApplications, totalFeesCollected) |
| `/api/v1/otr/aadhaar/send-otp` (POST) | `otr.controller.js` | Rate-limited (3/hr/phone); stores OTP + session.otr; SMS via sms.service |
| `/api/v1/otr/aadhaar/verify-otp` (POST) | `otr.controller.js` | Verifies OTP; creates partial Candidate; session fixation prevention |
| `/api/v1/otr/login` (POST) | `otr.controller.js` | bcrypt verify; brute-force lockout (5 attempts → 15 min) |
| `/api/v1/otr/logout` (POST) | `otr.controller.js` | Session destroy |
| `/api/v1/otr/find` (POST) | `otr.controller.js` | Hash aadhaar, send regId via SMS if match; same response always (anti-enum) |
| `/api/v1/otr/me` (GET, auth) | `otr.controller.js` | Returns candidate profile (excludes passwordHash, aadhaarHash) |
| `/api/v1/otr/step/:step` (PUT, auth) | `otr.controller.js` | Saves steps 2–7 via whitelist; enforces edit window |
| `/api/v1/otr/upload/photo` (POST, auth) | `otr.controller.js` | Magic-byte MIME, WebP conversion, UUID filename, <2 MB |
| `/api/v1/otr/upload/signature` (POST, auth) | `otr.controller.js` | Same as photo, <1 MB |
| `/api/v1/otr/submit` (POST, auth) | `otr.controller.js` | reCAPTCHA verify; bcrypt 12 rounds; sets editWindowExpiresAt; SMS confirmation |

### New Files Added (P3)

| File | Purpose |
|------|---------|
| `middlewares/candidateAuth.js` | Protects OTR authenticated routes; attaches `req.candidate` |
| `services/sms.service.js` | SMS stub (logs in dev); production BSP wiring pending Q#9 |
| `utils/registrationId.js` | Atomic counter → `RP-{TENANT}-{YEAR}-{7DIGIT}` |

### Multi-Tenant Status

**Current:** Implemented for all recruitment models.
- `tenantMiddleware.js` — derives `req.tenantId` from `Host` header subdomain; dev override via `x-tenant-id` header
- All recruitment models (Advertisement, Candidate, Application, FeePayment, CallLetter, Notice, HelpQuery) include `tenantId` field and filter by it in every query
- Legacy admin models (Employee, Dept, MenuMaster, Role) remain single-tenant — acceptable while only one municipality uses admin panel

### Security Features Already Present

- ✅ bcrypt password hashing
- ✅ Session-based auth (HttpOnly, Secure, SameSite)
- ✅ Magic byte file validation (`file-type` library)
- ✅ Secure filenames (UUID-based)
- ✅ Image compression (Sharp → WebP)
- ✅ Input validation (express-validator)
- ✅ NoSQL injection prevention (express-mongo-sanitize)
- ✅ HPP protection
- ✅ Rate limiting (express-rate-limit)
- ✅ Security headers (Helmet + custom CSP)
- ✅ Swagger docs (dev only)
- ✅ OTP with TTL index (10-min auto-expire)
- ✅ Soft deletes (isDeleted flag)
- ✅ Audit fields (createdBy, updatedBy on all models)

### Security Gaps to Fix (Before Go-Live)

- ❌ No multi-tenant isolation (tenant_id missing from all models)
- ❌ No UIDAI Aadhaar OTP integration
- ❌ No payment gateway webhook HMAC verification
- ❌ `express-async-errors` not installed (unhandled promise rejections possible)
- ❌ JWT secrets defined but JWT not used for auth (inconsistency — remove or clarify)
- ❌ No append-only audit log table

---

## Environment Variables Summary

| File | Key Variables |
|------|--------------|
| `Web/.env` | `VITE_API_URL`, `VITE_APP_NAME` |
| `Admin/.env` | `VITE_API_URL`, `VITE_APP_NAME` |
| `Server/.env` | `DATABASE`, `PORT`, `NODE_ENV`, `SESSION_SECRET`, `ALLOWED_ORIGINS`, `JWT_*`, `WHATSAPP_*`, `SMS_*`, `SMTP_*`, `UIDAI_*`, `PAYMENT_GATEWAY_*`, `RECAPTCHA_SECRET_KEY` (P3 — optional, skips verify if absent) |

---

## Running the Project

```bash
# Web (public portal)
cd Web && npm install && npm run dev      # → http://localhost:5173

# Admin panel
cd Admin && npm install && npm run dev   # → http://localhost:3000

# Server
cd Server && npm install && npm run dev  # → http://localhost:8000
# API docs (dev): http://localhost:8000/api-docs
```

## Build & Deploy

```bash
# Build admin and copy to Server/out/admin/
cd Admin && npm run build

# Server serves:
# - API:          http://localhost:8000/api/v1/*
# - Admin UI:     http://localhost:8000/out/admin/ (static)
# - Web (separate Vite build or served independently)
```
