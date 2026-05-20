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
| **App.jsx OTR routes** | `/otr`, `/otr/step/1–10`, `/otr/find`, `/registration/edit`, `/otr/instructions`, `/registration/edit/verify`, `/otr/password/reset` |
| **EditRegistration page** | `Web/src/pages/Registration/EditRegistration.jsx` — step 1 always "View ▶"; step 2 locked-field note; 48h window; edit confirm OTP (gap 10) |
| **Header login button** | `Web/src/components/Header.jsx` — candidate-aware login/logout |
| **InstructionsStep (gap 1)** | `Web/src/pages/Registration/InstructionsStep.jsx` — scroll-to-bottom gate, "I Agree" → `/otr` |
| **Step5OtherDetails (gap 13)** | `Web/src/pages/Registration/Step5OtherDetails.jsx` — marital, PH, ex-serviceman, qualification, mother tongue |
| **StepDeclaration (gap 13)** | `Web/src/pages/Registration/StepDeclaration.jsx` — bilingual declaration, checkbox gate, step 9 |
| **ForgotPassword (gap 8)** | `Web/src/pages/Registration/ForgotPassword.jsx` — regid+DOB → OTP → new password |
| **EditVerify (gap 11)** | `Web/src/pages/Registration/EditVerify.jsx` — regid+DOB or aadhaar+OTP gate before EditRegistration |
| **LoginModal — Aadhaar tab (gap 7)** | `Web/src/components/LoginModal.jsx` — tab toggle regid/aadhaar; Forgot Password button |
| **FindRegistration — two-step (gap 3)** | `Web/src/pages/Registration/FindRegistration.jsx` — mobile+DOB or aadhaar+DOB → OTP → same response (enumeration safe) |
| **Candidate.emailVerified field** | `Server/models/Candidate.js` — Boolean, default false; set true on email OTP verify |
| **Email service (gap 12)** | `Server/services/email.service.js` — nodemailer, dev logs only, prod SMTP_* env vars |
| **Verhoeff Aadhaar check (gap 6)** | `Server/controllers/v1/otr.controller.js` — `verhoeffCheck()` on all Aadhaar inputs |
| **Password policy (gap 4)** | `Server/controllers/v1/otr.controller.js` — `validatePassword()` min 8 + upper + digit + special |
| **30-min inactivity (gap 9)** | `Server/middlewares/candidateAuth.js` — INACTIVITY_MS check + lastActivity refresh |
| **Step 3 Email OTP (gap 2)** | `Web/src/pages/Registration/Step3Contact.jsx` — sendEmailOtp + verifyEmailOtp gate |
| **reCAPTCHA on submit (gap 5)** | `Web/src/pages/Registration/Step10Preview.jsx` — VITE_RECAPTCHA_SITE_KEY dynamic load |
| **Edit confirm OTP (gap 10)** | `Server/controllers/v1/otr.controller.js` — `editConfirmSendOtp`, `editConfirmVerifyOtp` |
| **Edit verify access (gap 11)** | `Server/controllers/v1/otr.controller.js` — `editVerifyAccessSend`, `editVerifyAccessOtp` |
| **OTR step order per PRD (gap 13)** | Steps 7=Photo, 8=Signature, 9=Declaration, 5=OtherDetails; old Step7Physical removed |

## Security Checklist (All Implemented ✅)

- ✅ Aadhaar SHA-256 only — raw never in DB or logs
- ✅ OTP: 6-digit, 300s TTL, max 3 attempts, rate-limited 3/hr/phone
- ✅ Photo/signature: magic-byte check, WebP re-encode, outside webroot, UUID filename
- ✅ Session fixation: `req.session.regenerate()` on OTP verify + every login
- ✅ Brute force: 5 failed attempts → 15-min lockout (server-side)
- ✅ Edit window: `editWindowExpiresAt` enforced server-side in every step + submit
- ✅ reCAPTCHA: server-side token verify at submit (skips if `RECAPTCHA_SECRET_KEY` absent — dev only)
- ✅ Enumeration prevention: `findRegistration` always returns same message

## Remaining Work 🔴 (External Dependencies Only)

All code is complete. Only external wiring remains:

| Item | Blocks | Owner |
|------|--------|-------|
| Swap UIDAI stub with real AUA credentials (Step 1 Aadhaar OTP) | Live Aadhaar verify | Municipality (Q#3) |
| Register WhatsApp BSP, wire `whatsapp.service.js` | SMS notifications | Municipality (Q#9) |
| Set `SMTP_*` env vars for production email delivery | Email OTP, Reg ID email | DevOps |
| Set `RECAPTCHA_SECRET_KEY` + `VITE_RECAPTCHA_SITE_KEY` in prod | Step 10 CAPTCHA | DevOps |

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

- ✅ Aadhaar: SHA-256 hash only stored; raw number never in DB or logs
- ✅ Aadhaar: Verhoeff checksum validated on all inputs (gap 6)
- ✅ OTP: 6 digits, 5-min expiry, max 3 attempts, rate-limited 3/hour/phone, never in logs
- ✅ Photo/signature: magic-byte MIME check; re-encoded; stored outside webroot; UUID filename
- ✅ Session fixation: new session ID on every login
- ✅ Brute force: 5 failed attempts → 15-min lockout (server-side, not cookie-based)
- ✅ 30-min inactivity timeout enforced server-side (gap 9)
- ✅ Edit window: enforced server-side via `editWindowExpiresAt` timestamp
- ✅ CSRF tokens on all registration form submissions
- ✅ CAPTCHA: reCAPTCHA v2 server-side token verified before step 10 submit (gap 5)
- ✅ Enumeration prevention: same response for valid/invalid on find, reset, editVerify flows
- ✅ Password policy: min 8 + uppercase + digit + special character (gap 4)
- ✅ Single-session enforcement: activeSessionId per candidate
