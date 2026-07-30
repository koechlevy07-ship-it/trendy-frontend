# Trendy Wardrobe — Full Platform Audit

## Overview

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | https://trendy-backend-jq27.onrender.com | 32 routes mounted, marketing.routes.js was failing |
| Frontend | https://trendy-frontend-ashen.vercel.app | Live, PWA-enabled |
| Database | MongoDB Atlas | Connected |

---

## Fixed Issues

### P0 — Syntax errors in model files (blocked marketing route)

| File | Error | Fix |
|------|-------|-----|
| `models/Subscriber.js:487` | `Unexpected token ')'` — missing `]` in `this.aggregate([...])` | Added closing `]` before `)` |
| `models/CustomerSegment.js:290` | `Identifier 'val' already declared` — duplicate `const val` in `buildFilterCondition` | Removed redundant lines 290-291 |

Both copies (root `models/` and `trendy-backend/models/`) fixed and syntax-verified.

### P1 — Mobile JS crashes (previously fixed)

Fixed in `js/app.js` and `public/js/app.js`:
- Null checks on all DOM references before `.addEventListener()` etc.
- Polling → event-driven `renderProducts`
- `window.gtag` guard
- Parallax visibility check
- Cart validation for undefined items
- Duplicate event listener prevention via `replaceChild` cloning
- Toast animation bug fix

### P1 — Frontend repo overwrite recovery (previously fixed)

Subtree push to Vercel accidentally overwrote frontend repo with different CSS/HTML. Restored to commit `adaabd5`, then re-applied only JS fixes on top.

---

## Open Issues

### P1 — M-Pesa production configuration (blocker)

**Files**: `services/paymentService.js`, `routes/checkout.routes.js:683`

| Env Var | Current Value | Required |
|---------|--------------|----------|
| `MPESA_CONSUMER_KEY` | not set | Daraja production consumer key |
| `MPESA_CONSUMER_SECRET` | not set | Daraja production consumer secret |
| `MPESA_PASSKEY` | not set | Daraja production passkey |
| `MPESA_SHORTCODE` | `174379` (sandbox) | Actual PayBill `880100` |
| `MPESA_BASE_URL` | `https://sandbox.safaricom.co.ke` | `https://api.safaricom.co.ke` |
| `MPESA_CALLBACK_URL` | placeholder `https://your-domain.com/...` | `https://trendy-backend-jq27.onrender.com/api/payment/callback/mpesa` |

**Action**: Apply for Daraja Go Live, then set all 6 env vars on Render dashboard. The code implementation is correct — STK push, query, and callback handlers are all present.

### P2 — CORS allows all origins

**File**: `server.js:35`
```js
return callback(null, true);  // always allows any origin
```
The preceding checks for `.vercel.app` and `localhost` are dead code. Fix to only allow known origins:
```js
const allowedOrigins = [
  'https://trendy-frontend-ashen.vercel.app',
  /\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/
];
```

### P2 — Deprecated Mongoose options

**File**: `server.js:83-84`
```js
useNewUrlParser: true,
useUnifiedTopology: true
```
These are no-ops in Mongoose 7+ and can be removed.

### P2 — Rate limiter skips authenticated requests

**File**: `server.js:53`
```js
skip: (req) => req.headers.authorization
```
Anyone with a valid token bypasses the 500/15min rate limit entirely. Should apply a higher limit for authenticated users instead of skipping.

### P2 — Auth helper functions duplicated across all JS files

`getToken`, `getUser`, `setAuth`, `clearAuth`, `escHtml`, `showToast`, `getImageUrl` are copy-pasted in every file:
- `js/app.js` (7 definitions)
- `js/cart.js` (4)
- `js/checkout.js` (4)
- `js/product-details.js` (4)
- `js/account.js` (3)
- `js/wishlist.js` (3)
- `js/order-confirmation.js` (2)
- `js/admin.js` (multiple in admin/index.html)

Later files overwrite earlier ones' definitions at runtime. Create a `js/shared.js` loaded first on every page to define these once.

### P3 — Touch targets too small at 320px

**File**: `css/styles.css:2454`
```css
.product-card .product-info .card-actions .add-to-cart { height: 30px; font-size: 9px; }
.product-card .product-info .card-actions .buy-now { height: 30px; min-width: 30px; }
```
WCAG minimum recommendation is 44x44px. At 320px screen width, buttons are 30px.

### P3 — Product container padding too tight at 390px

**File**: `css/styles.css:2515`
```css
.products-section .container { padding: 0 6px; }
```
Only 6px padding each side on a 390px screen. At 576px it's `8px` (more padding on wider screen).

### P3 — Products grid gap too tight at 390px

**File**: `css/styles.css:2516`
```css
.products-grid { gap: 6px; }
```
6px between product cards looks cramped.

### P3 — Google Analytics placeholder ID

All HTML files use `G-XXXXXXXXXX`. Set the real GA4 measurement ID.

### P3 — Placeholder bank account number

`XXXXXXXXX` placeholder used for bank transfer instructions.

### P4 — app.js loaded on every page

`js/app.js` (4009 lines) runs on all pages (index, cart, checkout, account, etc.) but most of its code is homepage-specific. Consider splitting into page-specific modules.

### P4 — Product descriptions set via innerHTML

**File**: `js/product-details.js:463`
Description text from API is set via `innerHTML` without sanitization. Use `escHtml()` or DOMPurify.

### P4 — Service worker Cache.put() network error

Non-blocking Vercel infrastructure issue with `/.well-known/vercel/jwe` returning 503.

---

## Architecture Summary

### Backend Stack
- **Runtime**: Express.js on Node 26.5.1 (Render)
- **Database**: MongoDB Atlas via Mongoose
- **Auth**: JWT tokens stored in localStorage
- **Payments**: M-Pesa STK Push (Daraja API) + Stripe + PayPal (in code, only M-Pesa is active)
- **Orchestration**: Single monolithic Express app, 32 route files auto-mounted

### Frontend Stack
- **Hosting**: Vercel static SPA
- **CSS**: 7 separate CSS files (3461 lines in styles.css alone)
- **JS**: 7 separate JS files + admin inline (4009 lines in app.js alone)
- **PWA**: Service worker + manifest.json
- **Images**: Cloudinary (auto-optimized via `f_auto,q_80,w_*`)

### Database
- Products, users, orders, categories, reviews, coupons, cart, wishlist, newsletters, campaigns, customer segments, promos, slides

---

## Final Action Items (Priority Order)

| Priority | Action | Effort |
|----------|--------|--------|
| P1 | Set M-Pesa production env vars on Render | 30 min |
| P1 | Deploy model fixes to Render (git push) | 5 min |
| P2 | Fix CORS to restrict origins | 10 min |
| P2 | Remove deprecated Mongoose options | 2 min |
| P2 | Fix rate limiter skip logic | 5 min |
| P2 | Extract shared JS module | 1-2 hrs |
| P3 | Fix touch targets at 320px | 10 min |
| P3 | Adjust padding/gap at 390px | 5 min |
| P3 | Set real Google Analytics ID | 5 min |
| P4 | Sanitize product description innerHTML | 5 min |
