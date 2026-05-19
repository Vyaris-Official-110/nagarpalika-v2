# Phase 3: OTR Registration (M2 + M7 Auth)

| Field | Value |
|-------|-------|
| **Phase** | 3 of 9 |
| **Status** | 🟢 Done |
| **Depends On** | Phase 1 (Candidate model + routes) · Phase 2 (nav restructure) |
| **Blocks** | Phase 4 (Application requires valid Registration ID) |
| **PRD Sections** | §5 M2 OTR Registration · §5 M7 Authentication · §9.1 Auth · §9.2 OTP · §9.3 Authorization |
| **Open Questions** | #9 (WhatsApp BSP — SMS stub active until resolved); swap UIDAI when AUA granted |

---

## Already Built ✅

| Item | Location |
|------|----------|
| OTP model (TTL 300s, `phone` sparse field, `type` enum) | `Server/models/Otp.js` |
| Secure file upload (magic byte, UUID rename, WebP compress) | `Server/middlewares/secureUpload.js` |
| bcrypt password hashing | `Server/controllers/v1/otr.controller.js` (12 rounds) |
| Input validation framework | `Server/middlewares/inputValidator.js` |
| WhatsApp infrastructure | `Server/services/whatsapp.service.js` |
| **Candidate model** (extended) | `Server/models/Candidate.js` — full OTR fields: address sub-schemas, qualification, languages, PH, auth, otrStep, editWindowExpiresAt |
| **candidateAuth middleware** | `Server/middlewares/candidateAuth.js` |
| **SMS service stub** | `Server/services/sms.service.js` |
| **Registration ID generator** | `Server/utils/registrationId.js` — atomic counter `RP-{TENANT}-{YEAR}-{7DIGIT}` |
| **OTR controller** | `Server/controllers/v1/otr.controller.js` — all 10 endpoints |
| **OTR routes** | `Server/routes/v1/otr.routes.js` mounted at `/api/v1/` |
| **CandidateAuthContext** | `Web/src/context/CandidateAuthContext.jsx` |
| **OTR API client** | `Web/src/api/otr.js` |
| **Steps 1–10 UI** | `Web/src/pages/Registration/Step1Aadhaar.jsx` through `Step10Preview.jsx` |
| **RegistrationLayout + stepper** | `Web/src/pages/Registration/RegistrationLayout.jsx` + `.otr-stepper` CSS |
| **FindRegistration page** | `Web/src/pages/Registration/FindRegistration.jsx` |
| **LoginModal** | `Web/src/components/LoginModal.jsx` |
| **App.jsx OTR routes** | `/otr`, `/otr/step/1–10`, `/otr/find`, `/registration/edit` |
| **EditRegistration page** | `Web/src/pages/Registration/EditRegistration.jsx` — step 1 always "View ▶" (Aadhaar immutable); step 2 notes name/DOB locked; 48h window enforced |
| **Header login button** | `Web/src/components/Header.jsx` — candidate-aware login/logout |

## Security Checklist (All Implemented ✅)

- ✅ Aadhaar SHA-256 only — raw never in DB or logs
- ✅ OTP: 6-digit, 300s TTL, max 3 attempts, rate-limited 3/hr/phone
- ✅ Photo/signature: magic-byte check, WebP re-encode, outside webroot, UUID filename
- ✅ Session fixation: `req.session.regenerate()` on OTP verify + every login
- ✅ Brute force: 5 failed attempts → 15-min lockout (server-side)
- ✅ Edit window: `editWindowExpiresAt` enforced server-side in every step + submit
- ✅ reCAPTCHA: server-side token verify at submit (skips if `RECAPTCHA_SECRET_KEY` absent — dev only)
- ✅ Enumeration prevention: `findRegistration` always returns same message

## Remaining Work 🔴 (External Dependencies)

### Pending External Wiring

#### Candidate Routes (`Server/routes/v1/otr.routes.js` — built)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/candidates/otp/aadhaar` | POST | None | Request Aadhaar OTP via UIDAI |
| `/candidates/otp/aadhaar/verify` | POST | None | Verify Aadhaar OTP |
| `/candidates/otp/phone` | POST | None | Send phone OTP (WhatsApp → SMS) |
| `/candidates/otp/phone/verify` | POST | None | Verify phone OTP |
| `/candidates/otp/email` | POST | None | Send email OTP |
| `/candidates/otp/email/verify` | POST | None | Verify email OTP |
| `/candidates/apply` | POST | Session (step 2+) | Submit each step's data |
| `/candidates/apply/photo` | POST | Session | Upload photo (multipart, secureUpload) |
| `/candidates/apply/signature` | POST | Session | Upload signature (multipart, secureUpload) |
| `/candidates/apply/submit` | POST | Session | Final submit + CAPTCHA verify |
| `/candidates/edit` | PATCH | Session / OTP | Edit allowed fields only |
| `/candidates/find` | POST | None | Find Reg ID by mobile+DOB or Aadhaar+DOB |
| `/candidates/auth/login` | POST | None | Login (Reg ID/Aadhaar + password) |
| `/candidates/auth/logout` | POST | Session | Invalidate session |
| `/candidates/auth/password/reset` | POST | OTP | Reset password |

#### Business Logic
- `aadhaar_hash + tenant_id` unique constraint enforces 1 Aadhaar = 1 Reg ID per tenant
- Multi-step state persisted server-side per session — user can resume after Aadhaar verification
- Edit window: `created_at + edit_window_hours < now()` — reject if expired
- Locked fields: Aadhaar hash, DOB, name — rejected at controller level even if client sends them

### Frontend — 10-Step OTR Flow (`Web/src/pages/Registration/`)

| Step | Route | Key Implementation |
|------|-------|--------------------|
| 1 | `/registration/apply/instructions` | Bilingual text. "I Agree" disabled until scroll-to-bottom. Server validates I-Agree session flag. |
| 2 | `/registration/apply/aadhaar` | Aadhaar input → UIDAI OTP → verify. Phone OTP (WhatsApp primary, SMS fallback). Password creation with policy validation. |
| 3 | `/registration/apply/personal` | Name, Father/Husband, DOB, gender, category (General/OBC/SC/ST/EWS), nationality, religion |
| 4 | `/registration/apply/communication` | Permanent + current address (same-as checkbox), OTP-verified mobile, optional alt mobile, OTP-verified email |
| 5 | `/registration/apply/other` | Marital status, PH status (type + % if yes), ex-serviceman, highest qualification |
| 6 | `/registration/apply/language` | Languages: Read/Write/Speak checkboxes per language, mother tongue |
| 7 | `/registration/apply/photo` | JPG/JPEG, max 50 KB, 3.5×4.5 cm. Preview + re-upload. |
| 8 | `/registration/apply/signature` | JPG/JPEG, max 20 KB, 3.5×1.5 cm. Preview + re-upload. |
| 9 | `/registration/apply/declaration` | Bilingual declaration text. Checkbox required. |
| 10 | `/registration/apply/submit` | Image CAPTCHA (server-side verified) → Registration ID displayed + sent via SMS + email |

**Multi-step state:** Store step data in React state + server session. On browser close/refresh, resume from last completed step if Aadhaar was verified.

### Edit Registration (`/registration/edit`)
- Access: Reg ID + DOB **or** Aadhaar + OTP
- Server checks: `edit_window_expires_at > now()` — reject if expired (server-side, not UI-gated)
- Editable: communication details, photo, signature, language details
- Locked UI: Aadhaar, DOB, name shown read-only
- Save requires OTP confirmation to registered mobile

### Find Registration ID (`/registration/find`)
- Input: Mobile + DOB **or** Aadhaar + DOB
- OTP verification → Reg ID sent to registered mobile + email (NOT displayed on screen)

### Login Modal (M7)
- Trigger: "Login / Register" nav button
- Fields: Registration ID **or** Aadhaar + Password
- On success: session cookie set (HttpOnly, Secure, SameSite=Strict)
- New session ID on login (session fixation prevention)
- Max 1 active session per candidate
- "Forgot Password": OTP → reset form
- Timeout: 30-min inactivity

---

## Acceptance Criteria

- 10-step flow completes end-to-end: Aadhaar OTP → Registration ID issued + SMS received
- Same Aadhaar on same tenant → second attempt rejected with clear error
- Photo > 50 KB or non-JPG → rejected server-side (not just client validation)
- Edit after window expired → 400 rejected with timestamp reason
- Login → session cookie set with correct flags (HttpOnly, Secure, SameSite=Strict)
- 5 failed logins → 15-min lockout enforced server-side
- Reg ID NOT displayed on Find page — delivered via SMS/email only

---

## Security Checklist

- [ ] Aadhaar: SHA-256 hash only stored; raw number never in DB or logs
- [ ] OTP: 6 digits, 5-min expiry, max 3 attempts, rate-limited 3/hour/phone, never in logs
- [ ] Photo/signature: magic-byte MIME check; re-encoded; stored outside webroot; UUID filename
- [ ] Session fixation: new session ID on every login
- [ ] Brute force: 5 failed attempts → 15-min lockout (server-side, not cookie-based)
- [ ] Edit window: enforced server-side via `edit_window_expires_at` timestamp
- [ ] CSRF tokens on all registration form submissions
- [ ] CAPTCHA: server-side token verified with provider API before step 10 processing
- [ ] Enumeration prevention: same response time + message for valid and invalid Aadhaar on OTP request
