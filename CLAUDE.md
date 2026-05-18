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
| P1 · Foundation | 🟢 Done | Models + middleware shipped. Next: add candidate/application/fee/callLetter controllers+routes in their respective phases | — |
| P2 · Public Frontend | 🟢 Done | Notice + HelpQuery models/controllers/routes; Careers + Notices pages fetch from API; dropdown nav with Registration + Online Application groups; Help page with FAQ + contact form | — |
| P3 · OTR Registration | 🔴 Not started | 10-step Aadhaar OTP registration flow (Server routes + Web UI) | Q#1 (edit window), Q#3 (Aadhaar method), UIDAI AUA empanelment |
| P4 · Application | 🔴 Not started | Apply flow + edit window + print PDF | **Q#8: form fields unresolved (HARD BLOCK)** |
| P5 · Fee Payment | 🔴 Not started | Payment gateway adapter + webhook HMAC + PDF receipt | Q#2 (online-only?), Q#7 (gateway choice), contract not signed |
| P6 · Call Letter | 🔴 Not started | Eligibility check + signed download token + admit card PDF | Depends on P4, P5 |
| P7 · Admin Panel | 🟢 Done | All 6 recruitment pages shipped (Advertisements CRUD, Candidates, Applications, FeePayments, CallLetters, Notices). Controllers + routes for candidates/applications/feePayments/callLetters. Dashboard replaced with recruitment stats. Analytics controller updated. | — |
| P8 · Notifications | 🟡 Partial | Recruitment event triggers + SMS fallback + UIDAI OTP wiring + email service | **Q#9: WhatsApp BSP not registered (HARD BLOCK)** |
| P9 · Security/Pentest | 🔴 Not started | Hardening checklist per PRD §9 + pentest scope + remediation SLA | Depends on P1–P8 |

### Open Blockers

| Q# | Question | Blocks |
|----|----------|--------|
| **Q#8** | Application form fields beyond OTR not confirmed by stakeholders | **P4 (HARD BLOCK)** |
| **Q#9** | WhatsApp BSP provider not registered by municipality | **P8 (HARD BLOCK)** |
| Q#1 | Edit window duration (48h or longer?) | P3 |
| Q#2 | Online fee only, or offline DD/challan too? | P5 |
| Q#3 | Aadhaar OTP-based or offline XML? | P3 |
| Q#4 | Shared or separate admin credentials per subdomain? | P7 |
| Q#7 | Payment gateway — Razorpay / PayGov / Paytm / state portal? | P5 |

### Update Protocol

After any implementation session:
1. Update Status: 🔴 not started → 🟡 partial → 🟢 done
2. Update Next Action to the immediate next concrete step
3. Remove resolved blockers; add newly discovered ones
4. Commit: `chore(claude): update task sheet`
