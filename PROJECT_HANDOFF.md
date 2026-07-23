# Trendy Wardrobe — Full Project Handoff

## Overview

Luxury fashion e-commerce platform (Trench Coats, Wardrobe, Shoes) targeting Kenya market.
- **Frontend**: Static HTML/CSS/JS SPA — Vercel
- **Backend**: Node.js/Express 5 — Render
- **Database**: MongoDB Atlas
- **Admin**: Embedded SPA inside frontend repo

---

## Live URLs

| Service | URL |
|---------|-----|
| **Storefront** | https://trendy-frontend-ashen.vercel.app |
| **Admin Dashboard** | https://trendy-frontend-ashen.vercel.app/admin/ |
| **Backend API** | https://trendy-backend-jq27.onrender.com/api |
| **Health Check** | https://trendy-backend-jq27.onrender.com/api/health |

### Credentials

| Account | Email | Password |
|---------|-------|----------|
| **Admin** | admin@trendywardrobe.com | admin123 |

---

## GitHub Repos

| Repo | Branch | Purpose |
|------|--------|---------|
| `koechlevy07-ship-it/Trendy-New` | master | **Monorepo** (all code lives here) |
| `koechlevy07-ship-it/trendy-backend` | main | **Render deployment** (pulls from here) |
| `koechlevy07-ship-it/trendy-frontend` | master | **Vercel deployment** (pulls from here) |

**IMPORTANT**: Code is developed in the monorepo (`Trendy-New`), then pushed to the separate repos for deployment. All three repos must stay in sync.

---

## Directory Structure

```
New OpenCode Project/              ← Git root (Trendy-New monorepo)
├── trendy-backend/                ← Backend (Node.js/Express)
│   ├── server.js                  ← Entry point — loads all routes dynamically
│   ├── package.json
│   ├── seed.js                    ← Database seeder
│   ├── .env.example               ← Environment template
│   ├── controllers/               ← Business logic
│   │   ├── adminController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── settingsController.js
│   ├── middleware/                 ← Express middleware
│   │   ├── auth.js                ← JWT authentication
│   │   ├── permission.js          ← RBAC permission checks
│   │   └── validate.js            ← Request validation
│   ├── models/                    ← Mongoose schemas (46 models)
│   ├── routes/                    ← API routes (32 files)
│   ├── services/                  ← Business services (13 files)
│   └── utils/
│       └── helpers.js
│
├── trendy-frontend/               ← Frontend (Static HTML/JS/CSS)
│   ├── index.html                 ← Homepage
│   ├── product-details.html       ← Product page
│   ├── cart.html, checkout.html   ← Shopping flow
│   ├── account.html               ← User dashboard
│   ├── wishlist.html, about.html, contact.html
│   ├── 404.html, terms.html, privacy.html
│   ├── order-confirmation.html
│   ├── js/                        ← Frontend JS (7 files)
│   │   ├── app.js                 ← Main app logic (~3400 lines)
│   │   ├── product-details.js
│   │   ├── cart.js, checkout.js
│   │   ├── account.js, wishlist.js
│   │   └── order-confirmation.js
│   ├── css/                       ← Styles (7 files)
│   ├── admin/                     ← Admin dashboard SPA
│   │   ├── index.html             ← Monolithic admin (~7000 lines)
│   │   └── assets/js/rbac.js
│   ├── build.js                   ← Copies to public/ for Vercel
│   ├── vercel.json                ← Vercel config (rewrites, headers)
│   ├── sw.js                      ← Service worker (cache v7)
│   ├── manifest.json, manifest.webmanifest
│   ├── package.json
│   └── public/                    ← Build output (auto-generated)
│
├── PROJECT_HANDOFF.md             ← This file
└── .gitignore
```

---

## Backend Architecture

### Entry Point: `server.js`

- Dynamically loads ALL route files from `routes/` directory
- Mounts each at `/api/{routeName}` AND `/api/{routeName}s` (plural alias)
- Special alias: `category` → `categories` (irregular plural)
- Rate limiter: 500 req/15min, skips authenticated requests
- CORS: allows all `*.vercel.app` origins + localhost
- Promo scheduler starts on MongoDB connect (every 5 min)

### Models (46)

**Core E-commerce:**
- `Product.js` — Full product model with 20+ fields (sizes, colors, UK sizes, preOrder, limitedPieces, flashSale, etc.)
- `Category.js` — Category with displayOrder, SEO fields, mega menu support
- `Order.js` — Orders with timeline, refund tracking, admin notes
- `Cart.js`, `Checkout.js` — Shopping cart & checkout
- `User.js` — User accounts with auth

**Content/Marketing:**
- `Coupon.js` — 10+ discount types, BOGO, bundle, scheduling
- `Promotion.js` — Promotion rules (flash_sale, seasonal, holiday)
- `FlashSale.js` — Flash sales with products[], scheduling, auto-status
- `GiftCard.js` — Gift cards with code gen, balance, redemption
- `PromoBanner.js` — Banners with location/targeting/A-B tracking
- `CouponUsage.js` — Coupon usage analytics
- `PromoAnalytics.js` — Daily aggregated analytics

**Loyalty/Marketing:**
- `Loyalty.js` — 7 models: LoyaltyTransaction, LoyaltyReward, Referral, Achievement, UserAchievement, LoyaltyTier, LoyaltySettings
- `Campaign.js` — Email campaigns
- `Subscriber.js` — Newsletter subscribers
- `EmailTemplate.js` — Email templates
- `CustomerSegment.js` — Customer segmentation

**Commerce Support:**
- `Inventory.js`, `Seller.js`, `ShippingZone.js` (referenced)
- `Review.js`, `QuestionAnswer.js` — Product reviews & Q&A
- `Wishlist.js`, `Compare.js`, `RecentlyViewed.js`
- `Newsletter.js`, `Contact.js`, `ContactMessage.js`, `FAQ.js`

**System:**
- `Settings.js`, `SocialLinks.js`, `Role.js`
- `Session.js`, `SecurityPolicy.js`, `LoginAttempt.js`, `Device.js`
- `AuditLog.js`, `Notification.js`
- `Homepage.js`, `HomepageSection.js`, `ContentVersion.js`, `Search.js`
- `Device.js`

### Routes (32)

All auto-mounted by `server.js` at both `/api/{name}` and `/api/{name}s`:

| Route | Base Path | Key Endpoints |
|-------|-----------|---------------|
| `auth.routes.js` | `/api/auth` | register, login, refresh, logout |
| `product.routes.js` | `/api/products` | CRUD, featured, related, search, flash-sale |
| `category.routes.js` | `/api/categories` | CRUD, with product counts |
| `order.routes.js` | `/api/orders` | CRUD, admin/all, admin/statistics, admin/bulk |
| `cart.routes.js` | `/api/cart` | add, update, remove, clear, sync |
| `checkout.routes.js` | `/api/checkout` | create order from cart |
| `users.routes.js` | `/api/users` | profile, admin CRUD |
| `admin.routes.js` | `/api/admin` | dashboard stats, products |
| `coupons.routes.js` | `/api/coupons` | CRUD, validation, bulk, promotions CRUD + toggle |
| `promo.routes.js` | `/api/promo` | flash-sales, gift-cards, banners CRUD + public |
| `loyalty.routes.js` | `/api/loyalty` | tiers, rewards, referrals, admin |
| `marketing.routes.js` | `/api/marketing` | campaigns, templates, subscribers, segments, dashboard |
| `reviews.routes.js` | `/api/reviews` | CRUD, helpful voting |
| `qa.routes.js` | `/api/qa` | product Q&A |
| `wishlist.routes.js` | `/api/wishlist` | add, remove, check, count, sync |
| `compare.routes.js` | `/api/compare` | add, remove, list |
| `recently-viewed.routes.js` | `/api/recently-viewed` | track, list |
| `search.routes.js` | `/api/search` | full-text, suggestions, trending |
| `homepage.routes.js` | `/api/homepage` | CMS sections |
| `cms.routes.js` | `/api/cms` | pages, content |
| `inventory.routes.js` | `/api/inventory` | stock management |
| `analytics.routes.js` | `/api/analytics` | sales, customer, product analytics |
| `notification.routes.js` | `/api/notifications` | CRUD, read, mark-all |
| `contact.routes.js` | `/api/contact` | submit, admin list |
| `newsletter.routes.js` | `/api/newsletter` | subscribe, unsubscribe |
| `faq.routes.js` | `/api/faq` | CRUD |
| `settings.routes.js` | `/api/settings` | site settings |
| `social-links.routes.js` | `/api/social-links` | CRUD |
| `system.routes.js` | `/api/system` | health, reset data |
| `upload.routes.js` | `/api/upload` | Cloudinary image upload |
| `media.routes.js` | `/api/media` | media library |
| `rbac.routes.js` | `/api/rbac` | roles, permissions, departments, sessions, security, audit |

### Services (13)

| Service | Purpose |
|---------|---------|
| `authService.js` | JWT token generation, password hashing |
| `userService.js` | User CRUD operations |
| `emailService.js` | Gmail SMTP email notifications |
| `paymentService.js` | Payment processing (M-Pesa, cards) |
| `shippingService.js` | Shipping calculation |
| `taxService.js` | Tax calculation |
| `fraudService.js` | Fraud detection |
| `securityService.js` | Security checks |
| `sessionService.js` | Session management |
| `auditService.js` | Audit logging |
| `rbacService.js` | Role-based access control |
| `promoScheduler.js` | Auto-activate/expire promos every 5 min |
| `templateRenderer.js` | Email/notification templates |

### Middleware (3)

| File | Purpose |
|------|---------|
| `auth.js` | JWT verification (`authenticateToken`) |
| `permission.js` | Role checks (`requireAdmin`) |
| `validate.js` | Request body validation |

---

## Frontend Architecture

### Pages (13 HTML files)

| Page | File | JS Logic |
|------|------|----------|
| Homepage | `index.html` | `js/app.js` (loadProducts, loadNewArrivals, loadBestSellers, search, etc.) |
| Product Details | `product-details.html` | `js/product-details.js` (product display, reviews, Q&A, related) |
| Cart | `cart.html` | `js/cart.js` (cart management, recommended products) |
| Checkout | `checkout.html` | `js/checkout.js` (payment methods, coupon apply, order placement) |
| Account | `account.html` | `js/account.js` (profile, orders, wishlist, addresses) |
| Wishlist | `wishlist.html` | `js/wishlist.js` (wishlist management) |
| Order Confirmation | `order-confirmation.html` | `js/order-confirmation.js` |
| About | `about.html` | — |
| Contact | `contact.html` | — |
| 404 | `404.html` | — |
| Terms | `terms.html` | — |
| Privacy | `privacy.html` | — |
| Admin | `admin/index.html` | Monolithic SPA (~7000 lines) |

### API Configuration

All frontend JS uses:
```javascript
const API_URL = 'https://trendy-backend-jq27.onrender.com/api';
```

### Service Worker (`sw.js`)

- Cache version: `v7`
- Caches static assets on install
- Ignores CDN/Cloudinary requests
- Handles fetch failures gracefully

### Build Process

```bash
# From trendy-frontend/
node build.js    # Copies source to public/ for Vercel
```

Vercel config (`vercel.json`):
- Build: `npm run build` → runs `node build.js`
- Output: `public/`
- All page rewrites configured (admin, product-details, cart, checkout, etc.)

### Admin Dashboard (`admin/index.html`)

Monolithic SPA (~7000 lines). Sidebar sections:

**Main:** Dashboard, Products, Categories, Orders, Customers
**Content:** Contacts, Reviews
**Management:** Inventory, Payments, Reports, Coupons
**System:** Hero Banners, Catalogues, Social Links, Settings
**Promotions:** Flash Sales, Gift Cards, Promo Banners, Promotions, Loyalty, Marketing
**Also:** Search, Newsletter, Featured Products, Homepage CMS, Website Content, SEO, Popups, RBAC

### External Services

- **Cloudinary**: Image uploads (cloud: `vbnlibtl`, preset: `trendy-wardrobe`)
- **Vercel Analytics**: Web analytics tracking

---

## Environment Variables (Backend)

Required (from `.env.example`):
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLIENT_URL=https://trendy-frontend-ashen.vercel.app
PORT=5000
```

Optional:
```
CLOUDINARY_CLOUD_NAME=vbnlibtl
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
NODE_ENV=production
```

---

## Deployment Workflow

### Making Changes

1. Edit files in the monorepo (`New OpenCode Project/trendy-backend/` or `trendy-frontend/`)
2. Run build if frontend changed: `cd trendy-frontend && node build.js`
3. Push to deployment repos:

```bash
# Backend
cd trendy-backend
git init
git remote add deploy https://github.com/koechlevy07-ship-it/trendy-backend.git
git fetch deploy main --depth=1
git checkout -f -b main deploy/main
# (copy your changes over the checkout)
git add -A && git commit -m "your message" && git push deploy main

# Frontend
cd trendy-frontend
git init
git remote add deploy https://github.com/koechlevy07-ship-it/trendy-frontend.git
git fetch deploy master --depth=1
git checkout -f -b master deploy/master
# (copy your changes over the checkout)
git add -A && git commit -m "your message" && git push deploy master
```

4. Push to monorepo:
```bash
cd "New OpenCode Project"
git add trendy-backend/ trendy-frontend/
git commit -m "your message"
git push origin master
```

**NOTE**: `git add` from the parent repo may fail with "unpopulated submodule" error. The `trendy-backend` and `trendy-frontend` dirs were converted from gitlinks to regular dirs. If this breaks, you may need to work from the subdirectory git repos directly.

### Auto-Deploy

- **Render**: Auto-deploys on push to `koechlevy07-ship-it/trendy-backend` main branch
- **Vercel**: Auto-deploys on push to `koechlevy07-ship-it/trendy-frontend` master branch

---

## Known Issues & Gotchas

### Route Mounting
The dynamic route loader in `server.js` mounts routes at both singular (`/api/product`) and plural (`/api/products`) paths. For irregular plurals, there's a `pluralAliases` map:
```javascript
const pluralAliases = { category: 'categories' };
```
If you add a new route file, check if its plural form is irregular and add to this map.

### Rate Limiting
- 500 requests per 15 minutes
- Authenticated requests (with `Authorization` header) are skipped
- The admin dashboard fires ~15+ API calls on load, so rate limiting was a recurring issue

### CORS
- Allows all `*.vercel.app` domains and `localhost`
- The `origin` callback returns `true` for all origins (wide open for now)

### Service Worker Caching
If making frontend changes and they don't appear, the service worker cache may be stale. The version is in `sw.js` (`v7`). Bump it to force cache refresh.

### Admin Dashboard
The admin is a single monolithic HTML file (`admin/index.html`, ~7000 lines). All JS is inline. When editing:
- Search for function names like `loadDashboard`, `loadProducts`, `loadCategories`, etc.
- Forms use `escHtml()` for XSS protection
- All CRUD operations use `authFetch()` which includes JWT token
- API URLs are built from `API_URL` constant at top of script

### Git Submodule Issue
The parent repo (`Trendy-New`) originally tracked `trendy-backend` and `trendy-frontend` as gitlinks (submodules). These were converted to regular directories. This can cause issues with `git add` from the parent. Workaround: initialize separate git repos in each subdirectory when pushing to deployment repos.

---

## Module Progress (as of Jul 24, 2026)

### Completed

**Module 1: Foundation**
- Product catalog, categories, search, filtering
- User auth (register/login/JWT)
- Shopping cart, checkout, orders
- Wishlist, compare, recently viewed
- Homepage CMS, hero banners
- Admin dashboard (products, categories, orders, customers)

**Module 2: Commerce**
- Reviews & Q&A system
- Inventory management
- Order management (cancel, refund, timeline)
- Payment processing
- Email notifications (Gmail SMTP)
- Cloudinary image uploads
- Settings management
- Newsletter, contact forms, FAQ

**Module 3: Enterprise**
- RBAC (roles, permissions, departments)
- Security (sessions, login attempts, audit log)
- Analytics dashboard
- Fraud detection
- Tax & shipping services
- Content versioning
- Search (full-text, trending, suggestions)
- Device management

**Module 4 (In Progress): Promotions & Marketing**
- Part 7 (COMPLETED): Flash sales, gift cards, promo banners, coupon usage tracking, promo scheduler, loyalty system, marketing dashboard
- Parts 1-6: Coupons CRUD, promotions CRUD

### Next: Module 4 Part 8+
TBD — remaining promotions/marketing features

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5.2.1 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) |
| Security | Helmet, CORS, rate limiting, mongo-sanitize |
| Image Upload | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Admin | Inline SPA (no build step) |
| Hosting | Vercel (frontend) + Render (backend) |
| CDN | Cloudinary (images) |
| Package Manager | npm |
