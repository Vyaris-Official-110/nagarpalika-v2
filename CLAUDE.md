# CLAUDE.md — NagarpalikaV2

## Project

Multi-tenant online recruitment portal for **Patan & Palanpur Municipal Councils**.
Stack: React 18 + Vite (Web · Admin) / Express + Mongoose (Server) / MongoDB
Obsidian vault at `knowledge_base/` is the canonical spec — always traverse via the protocol below.

---

## Knowledge Base Protocol

**Entry point: [`knowledge_base/INDEX.md`](knowledge_base/INDEX.md)**

Read INDEX.md first. Use its Quick Lookup Table to find the ONE file needed. Stop there.

| Task type | Read |
|-----------|------|
| Understanding requirements | `INDEX.md` → `prds/nagarpalika-recruitment-portal.md` (jump to section) |
| Starting / continuing a phase | `INDEX.md` → `phases/phase-N-*.md` for that phase only |
| Checking codebase state or gaps | `knowledge_base/tech-stack.md` |
| Deep SRS spec (last resort, PDF is expensive) | `Reference_Docs/NagarPalika.pdf` |

**Rules:**
- Never load more than 2 vault files per task
- Always read `tech-stack.md` before any `Server/` work
- Never read all phase files simultaneously — INDEX.md has the summaries

---

## Codebase Map

```
nagarpalika-v2/
├── Web/      Public citizen portal  — React 18 + Vite (port 5173)
├── Admin/    Admin panel           — React 18 + Vite + Reactstrap (port 3000)
└── Server/   REST API              — Express + MongoDB (port 8000)
              Entry: Server/server.js · API prefix: /api/v1/
```

### Dev Commands

| App | Command | Port |
|-----|---------|------|
| Web | `cd Web && npm run dev` | 5173 |
| Admin | `cd Admin && npm run dev` | 3000 |
| Server | `cd Server && npm run dev` | 8000 · API docs: /api-docs |

---

## Task Sheet

**Update this table at the end of every implementation session.**

| Phase | Status | Next Action | Blockers |
|-------|--------|-------------|----------|
| P1 · Foundation | 🟢 Done | All shipped: CSRF middleware, admin 15-min inactivity timeout, admin 2FA TOTP (otplib v12+), IP whitelist, bcrypt cost 12 everywhere, SiteConfig model + config routes, SameSite=Strict session cookie | — |
| P2 · Public Frontend | 🟢 Done | All PRD §5.1.2 nav gaps resolved: Registration dropdown (Apply(New OTR)/Edit Registration/Find Registration ID), Online Application dropdown (Apply Online/Edit Application/Print Application), Fee + Call Letter standalone. VM marquee pulls from `liveNotices` API (VM_ITEMS static fallback). Quick Links = 6 items per §5.1.6. Careers "Details" button → PDF endpoint (conditional on `pdfPath`). Help.jsx has `useLang()`. i18n.js 6 new nav keys (EN/HI/GU). | — |
| P3 · OTR Registration | 🟢 Done | 13 audit gaps resolved: /otr/instructions gate (gap 1), email OTP on step 3 (gap 2), FindRegistration two-step OTP (gap 3), password policy min 8+upper+digit+special (gap 4), reCAPTCHA on submit (gap 5), Verhoeff Aadhaar check (gap 6), Aadhaar login tab (gap 7), ForgotPassword page (gap 8), 30-min session inactivity (gap 9), edit confirm OTP (gap 10), /registration/edit/verify gate (gap 11), email confirm on submit (gap 12), step reorder matching PRD (gap 13). Candidate.emailVerified field added. | Swap UIDAI stub when AUA granted (Q#3); wire WhatsApp BSP when registered (Q#9) |
| P4 · Application | 🔴 Not started | Apply flow + edit window + print PDF | **Q#8: form fields unresolved (HARD BLOCK)** |
| P5 · Fee Payment | 🔴 Not started | Payment gateway adapter + webhook HMAC + PDF receipt | Q#2 (online-only?), Q#7 (gateway choice), contract not signed |
| P6 · Call Letter | 🔴 Not started | Eligibility check + signed download token + admit card PDF | Depends on P4, P5 |
| P7 · Admin Panel | 🟢 Done | 6 audit gaps resolved: all 16 PRD §5.8.2 advertisement fields + publish validation (gap 1); application export CSV/Excel/PDF via POST /applications/export (gap 2); notice publish/unpublish toggle PATCH /notices/:id/status (gap 3); express-rate-limit wired 100/min public + 50/min admin (gap 4); AuditLog model + fire-and-forget audit middleware on all admin write actions (gap 5); Super Admin lockout email alert (gap 6). Bulk ZIP async export stub only (blocked by P4). | — |
| P8 · Notifications | 🟡 Partial | Recruitment event triggers + SMS fallback + UIDAI OTP wiring + email service | **Q#9: WhatsApp BSP not registered (HARD BLOCK)** |
| P9 · Security/Pentest | 🔴 Not started | Hardening checklist per PRD §9 + pentest scope + remediation SLA | Depends on P1–P8 |

### Open Blockers

| Q# | Question | Blocks |
|----|----------|--------|
| **Q#8** | Application form fields beyond OTR not confirmed by stakeholders | **P4 (HARD BLOCK)** |
| **Q#9** | WhatsApp BSP provider not registered by municipality | **P8 (HARD BLOCK)** |
| Q#2 | Online fee only, or offline DD/challan too? | P5 |
| Q#4 | Shared or separate admin credentials per subdomain? | P7 |
| Q#7 | Payment gateway — Razorpay / PayGov / Paytm / state portal? | P5 |

### Update Protocol

After any implementation session:
1. Update Status column here: 🔴 not started → 🟡 partial → 🟢 done
2. Update Next Action to the immediate next concrete step
3. Remove resolved blockers; add newly discovered ones
4. **Sync `knowledge_base/INDEX.md`** — update Phase table Status + Remaining Work columns to match this task sheet
5. **Sync `knowledge_base/tech-stack.md`** — update whichever sections changed (routes, models, API calls status)
6. **Sync phase file(s) that changed** — for each phase whose status changed this session:
   - Update the `| **Status** |` header row in `knowledge_base/phases/phase-N-*.md`
   - Move completed items from `## Remaining Work 🔴` into `## Already Built ✅`
   - Add newly discovered gaps or deviations as notes at bottom of Remaining Work
   - PRD file (`prds/nagarpalika-recruitment-portal.md`) — only update if requirements changed
7. Commit all changed files: `chore(claude): update task sheet + vault sync`
