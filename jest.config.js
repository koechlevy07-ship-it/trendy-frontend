# Trendy Wardrobe Backend — Production Readiness & Deployment

## 1. Before first deploy

- [ ] MongoDB Atlas cluster created (M0 free tier is fine to start) — **must be a replica set**, which Atlas provides by default. Checkout, order cancellation, and coupon redemption all use MongoDB transactions and will fail on a standalone (non-replica-set) database.
- [ ] Atlas network access configured to allow Render's IPs (or `0.0.0.0/0` if using Atlas's serverless/PL connection — tighten later once Render's static outbound IPs are known).
- [ ] Cloudinary account created; note cloud name, API key, API secret.
- [ ] Safaricom Daraja app created at https://developer.safaricom.co.ke for M-Pesa (sandbox first, then apply for production/Go-Live credentials — this takes Safaricom several business days, plan ahead).
- [ ] SMTP provider chosen for transactional email (e.g. SendGrid, Mailgun, or Gmail SMTP for low volume).
- [ ] Africa's Talking account created for SMS (if SMS notifications are wanted at launch).
- [ ] Meta Business/WhatsApp Cloud API set up (if WhatsApp notifications are wanted at launch) — optional, can ship without it.

## 2. Environment variables

Copy `.env.example` to `.env` locally, and set the same keys in Render's dashboard (or via `render.yaml` sync) for production. Required (server won't boot without these): `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. Everything else is optional — the relevant feature (M-Pesa, email, SMS, WhatsApp) simply stays disabled until configured, rather than crashing the server.

**Never commit `.env` to git.** It's already in `.gitignore` and `.dockerignore`.

## 3. Deploying the backend (Render)

**Option A — render.yaml (recommended):** Render can read `render.yaml` from the repo root and provision the service automatically ("Blueprint" deploy). Push `render.yaml` to the repo, then create a new Blueprint in the Render dashboard pointing at this repo.

**Option B — manual:** Create a new Web Service in Render, point it at this repo with root directory `trendy-backend`, build command `npm ci --omit=dev`, start command `node src/server.js`, health check path `/api/health`. Add the environment variables from `.env.example` manually.

Either way, after the first deploy, copy the generated Render URL and:
- Set `MPESA_CALLBACK_URL` to `https://<your-render-url>/api/payments/mpesa/callback`.
- Set `FRONTEND_URL` once the Vercel frontend is deployed, so CORS allows it.

## 4. CI/CD

`.github/workflows/backend-ci.yml` runs on every PR/push touching `trendy-backend/`: syntax-checks all source files and runs the Jest test suite. `.github/workflows/deploy-backend.yml` triggers a Render deploy hook after CI passes on `main`/`master`.

**Setup required:** in Render, open the service → Settings → Deploy Hook, copy the URL, and add it as a repository secret named `RENDER_DEPLOY_HOOK_URL` (Repo Settings → Secrets and variables → Actions). Until that secret is set, the deploy workflow no-ops safely instead of failing.

**Important:** these workflow files currently live at `trendy-backend/.github/workflows/`. GitHub only runs workflows from `.github/workflows/` **at the repository root** — move (not copy) that `.github/` folder to the root of `Trendy-New` when merging this in, or the workflows won't trigger at all.

## 5. Local development

```bash
cd trendy-backend
cp .env.example .env      # fill in at least MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run dev                # nodemon, auto-restarts on change
```

Or with Docker (includes a local Mongo replica set so transactions work the same as production):

```bash
docker compose up
```

## 6. Running tests

```bash
npm test
```

Unit tests (`tests/unit/`) cover pure logic — slugify, coupon discount math, product stock virtuals — and run instantly with no dependencies. Integration tests (`tests/integration/`) spin up an in-memory MongoDB via `mongodb-memory-server` and exercise real HTTP requests through the full Express pipeline (currently: the auth flow). Extend this pattern — one integration test file per domain (`products.test.js`, `checkout.test.js`, etc.) — as new features are added; checkout's transaction logic in particular deserves integration coverage before this is considered launch-ready.

## 7. Security checklist status

| Item | Status |
|---|---|
| Password hashing (bcrypt) | ✅ |
| JWT auth + refresh token rotation | ✅ |
| RBAC (customer/admin/super_admin) | ✅ |
| Rate limiting (global + tighter on auth) | ✅ |
| Helmet security headers | ✅ |
| NoSQL injection sanitization | ✅ |
| HTTP parameter pollution protection | ✅ |
| CORS scoped to frontend origin | ✅ |
| Input validation (express-validator) | ✅ on auth/cart/orders/products — extend to remaining admin-write endpoints (categories, CMS, coupons, shipping zones) as they mature |
| Audit logging for sensitive admin actions | ✅ role changes, order status overrides — extend to product/price/coupon edits next |
| Secrets never committed | ✅ `.env` gitignored, `render.yaml` uses `sync: false` for real secrets |
| Dependency vulnerability scanning | ✅ `npm audit` runs in CI (non-blocking — review output manually, don't ignore it) |
| HTTPS | Handled by Render/Vercel automatically — no action needed |
| Automated tests | ⚠️ Started (auth flow + core business logic) — not yet comprehensive; checkout, RBAC boundary cases, and payment callback handling still need coverage |

## 8. Known gaps / explicitly not yet built

Being upfront rather than implying more is done than actually is:

- No frontend consumes this API yet — the repo's frontend is still the original design-system foundation.
- M-Pesa, SMTP, SMS, and WhatsApp integrations are real code against real APIs, but **untested against live credentials** — verify each in sandbox/staging before relying on them in production.
- No load/performance testing has been done.
- No image/CDN caching strategy beyond what Cloudinary provides by default.
- Card payment gateway is referenced in `Order.paymentMethod` enum but has no actual integration yet — only M-Pesa and cash-on-delivery are functional.
