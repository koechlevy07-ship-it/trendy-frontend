# Trendy Wardrobe — Complete System Audit Report (Round 2)

Date: 2026-08-02
Status: AUDIT COMPLETE — no code changes made yet. Fixes to follow this report.

## Scope

End-to-end audit of admin dashboard, backend, APIs, database, storefront, and synchronization. No redesign; branding/colors/fonts/spacing/business logic untouched. Report generated before any changes, per project rules.

## Environments Audited

| Component | URL / Repo | Branch |
|-----------|-----------|--------|
| Frontend/Admin (Vercel, live) | https://trendy-frontend-ashen.vercel.app | frontend/master `01488ab` |
| Frontend source | C:\Users\koech\Documents\trendy-frontend-audit | master = audit-fixes-1 |
| Backend (Render, live) | https://trendy-backend-jq27.onrender.com/api | deploy-main |
| Backend source | C:\Users\koech\Documents\New OpenCode Project | deploy-main |
| DB | MongoDB Atlas via `MONGODB_URI` on Render | — |

Live health at audit time: frontend 200, admin 200, backend `/api/health` 200, categories 200 (3), products 200, hero `/api/homepage/hero` 200 (3 slides).

---

## PHASE 1 — ADMIN DASHBOARD CRAWL (35 sidebar tabs + login)

Method: static loader/panel analysis (admin_static_audit) + live CDP crawl of all 35 tabs (crawl_admin35) against the deployed admin. **No ReferenceErrors, no JS crashes, on any tab.** Console noise is 403/404 from the unauthenticated probe hitting admin-only endpoints.

| # | Tab (data-section) | Panel | Loader | Endpoints | Verdict |
|---|--------------------|-------|--------|-----------|---------|
| 1 | dashboard | OK | loadDashboardData | /admin/dashboard | **OK** (401 unauth = expected) |
| 2 | products | OK | loadProducts | /admin/products, /admin/products/stats | **OK** |
| 3 | categories | OK | loadCategories | /categories, /categories/stats | **OK** |
| 4 | orders | OK | loadOrders+stats | /orders/admin/all, /orders/admin/statistics | **OK** |
| 5 | customers | OK | loadCustomers+stats | /users/admin, /users/admin/statistics | **OK** |
| 6 | inventory | OK | loadInventory+stats | /inventory, /inventory/stats | **OK** |
| 7 | sellers | OK | `()=>{}` | — | **EMPTY PAGE** — no loader, no data, only 48 chars of content |
| 8 | coupons | OK | loadCoupons+stats | /coupons/admin, /coupons/admin/stats | **OK** |
| 9 | hero-banners | OK | loadHeroSlides | /homepage | **OK** |
| 10 | catalogues | OK | loadCatalogues | /homepage/catalogues | **OK** |
| 11 | featured-collections | OK | loadFeaturedCollections | /homepage | **OK (see Phase 4 gap)** |
| 12 | testimonials | OK | loadTestimonials | /cms/testimonials | **OK** |
| 13 | reviews | OK | loadReviews+stats | /reviews/admin/all, /reviews/admin/stats | **OK** |
| 14 | contacts | OK | loadContacts+stats | /contact/admin, /contact/admin/stats | **OK** |
| 15 | social-links | OK | loadSocialLinks | /social-links | **OK** |
| 16 | logo-favicon (Branding) | OK | loadBrandingData | /settings/branding | **OK** |
| 17 | media-library | OK | loadMediaLibrary | /media, /media/search, /media/upload | **OK** |
| 18 | wishlist-analytics | OK | loadWishlistAnalytics | *(none — static placeholder)* | **PLACEHOLDER** — never calls `/admin/wishlist/stats` (endpoint exists) |
| 19 | loyalty | OK | loadLoyaltyData | /loyalty/admin/loyalty | **OK** |
| 20 | promotions | OK | loadPromotions | /coupons/promotions/admin | **OK** |
| 21 | flash-sales | OK | loadFlashSales | /promo/flash-sales | **OK** |
| 22 | marketing | OK | loadMarketingData | /marketing/dashboard, /marketing/campaigns, **/marketing/test-email 404** | **PARTIAL** |
| 23 | newsletter | OK | loadNewsletter+stats | **/newsletter/subscribers 404, /newsletter/stats 404, /newsletter/import 404, DELETE /newsletter/subscribers/:id 404** | **BROKEN** |
| 24 | gift-cards | OK | loadGiftCards | /promo/gift-cards | **OK** |
| 25 | promo-banners | OK | loadPromoBanners | /promo/banners | **OK** |
| 26 | featured-products | OK | loadFeaturedProducts | /products?featured=true, /products/bulk/update | **OK** |
| 27 | homepage-cms | OK | loadHomepageCMS | /cms/homepage-sections (admin-only) | **OK** |
| 28 | website-content | OK | loadWebsiteContent | **/content/pages 404** | **BROKEN** |
| 29 | search | **PANEL MISSING** | loadSearchData | *(static placeholder)* | **BROKEN PAGE** — no `panel-search` div at all; nav clicks silently show nothing |
| 30 | seo | OK | loadSEO | /settings/seo | **OK** (sitemap button calls missing /sitemap/generate) |
| 31 | popups | OK | loadPopups | **/popups 404, /popups/stats 404** | **BROKEN** |
| 32 | rbac | OK | loadRBAC | *(static "coming soon" placeholder)* | **PLACEHOLDER** — Settings tab holds the real RBAC UI |
| 33 | reports | OK | loadAnalyticsDashboard | **/analytics/kpi 404, /analytics/sales 404, /analytics/charts 404, /analytics/report/:tab 404, /analytics/live 404** | **BROKEN** — entire Analytics page dead |
| 34 | payments | OK | `()=>{}` | — | **EMPTY PAGE** — no loader, 77 chars of content |
| 35 | settings | OK | loadSystemSettings | /system/settings, /system/security, /system/roles, /system/admin-users, /system/backups, /system/audit-logs | **OK** (RBAC write actions 500 — see Phase 2) |

### Admin login
Login page renders; `POST /auth/login` works for valid admins. Default seed credentials `admin@trendy.com / Admin123!` **fail on production** (401) — the seed was not run against the production DB or the password was changed. Requires owner-provided credentials for full E2E.

### Storefront pages (Phase 1 continuation)
All 13 pages load with no JS exceptions (verified in prior sweep + re-verified device run): index, product-details, cart, checkout, wishlist, account, order-confirmation, contact, about, privacy, terms, 404, admin. Live smoke: home 200, product-details 200.

---

## PHASE 2 — COMPLETE BACKEND AUDIT

Method: full source read of all 32 route files + server.js + middleware + models; live probes against every flagged path; automated endpoint-diff (endpoint_diff2.mjs) cross-referencing every frontend call (224 unique paths) against 952 registered backend routes.

### A. Missing endpoints — frontend calls, backend returns 404 (live-confirmed)

| # | Endpoint | Called by | Impact |
|---|----------|-----------|--------|
| 1 | GET `/api/analytics/kpi` | admin Reports | Analytics page dead |
| 2 | GET `/api/analytics/sales` | admin Reports | " |
| 3 | GET `/api/analytics/charts` | admin Reports | " |
| 4 | GET `/api/analytics/report/:tab` | admin Reports | " |
| 5 | GET `/api/analytics/live` | admin Reports | " |
| 6 | GET `/api/newsletter/subscribers` | admin Newsletter | Newsletter page dead |
| 7 | GET `/api/newsletter/stats` | admin Newsletter | " |
| 8 | POST `/api/newsletter/import` | admin Newsletter | " |
| 9 | DELETE `/api/newsletter/subscribers/:id` | admin Newsletter | " |
| 10 | GET/PUT `/api/content/pages` (+ /:id CRUD) | admin Website Content | page dead |
| 11 | PUT `/api/sitemap/generate` | admin SEO button | sitemap action dead |
| 12 | GET/PUT `/api/popups`, GET `/api/popups/stats` | admin Popups | page dead |
| 13 | POST `/api/marketing/test-email` | admin Marketing | test email dead (correct path exists: `/marketing/send-test`) |
| 14 | POST `/api/users/2fa/setup` | storefront account.js | 2FA feature dead |
| 15 | POST `/api/users/2fa/verify` | storefront account.js | " |
| 16 | POST `/api/users/2fa/disable` | storefront account.js | " |

All live-verified: these return `404 Route ... not found` while real protected endpoints return `401 No token provided`.

### B. Routes that 500 (broken validation) — RBAC admin management

`middleware/validate.js` exports no `adminUser`, `role`, `department`, or `securityPolicy` schemas, but `routes/rbac.routes.js` references them → request-time `TypeError` → **500 on every one of these** (Settings → Users & Roles):
- POST/PUT `/api/rbac/admin-users` (create/update admin users)
- POST/PUT `/api/rbac/roles`
- POST/PUT `/api/rbac/departments`
- PUT `/api/rbac/security-policy`

Additional `rbac.routes.js` bugs:
- `PUT /admin-users/:id` and `DELETE /admin-users/:id` duplicate earlier routes (lines 52/55) — dead, first-match wins.
- `GET /api/rbac/departments/:id` nested path becomes `/api/rbac/api/rbac/...` — dead (line 66).
- `permissionMiddleware.checkPermission(...)` router.use at lines 104-109 is declared AFTER all routes — never executes.

### C. Route shadowing — customer features broken

- `coupons.routes.js`: `GET /my` (line 736) declared after `GET /:id` (line 345, requireAdmin) → customers get 403 for "my coupons".
- `coupons.routes.js`: `GET /promotions/active` (line 764) declared after `GET /promotions/:id` (line 654, requireAdmin) → anonymous users get 403 for active promotions.

### D. Dead / never-mounted module

- `search.routes.js` requires ESM-only `escape-string-regexp@5` → crashes at require during server boot; server logs "Failed to mount" and continues. **The entire /search module (autocomplete, recommendations) is absent.** Storefront search works via `/products?search=` (separate route) so customer impact is limited; admin Search tab is a placeholder anyway.

### E. Route file not serving public content

- `cms.routes.js` applies router-level `requireAdmin` to ALL 15 routes (line 9), including public-facing `GET /testimonials` — public testimonials unviewable (no current storefront consumer, so impact low today).

### F. Status-code / error-handling / CORS / JWT summary

| Check | Result |
|-------|--------|
| 404 handler | Custom JSON 404 (server.js:158) — good |
| Error middleware | Uses `err.status/statusCode`, leaks raw messages in 500 responses (server.js:162) |
| Controllers | Consistent try/catch → 500 `{success:false,message}`; raw error text leaked |
| CORS | Restricted to vercel.app + localhost (server.js:29-45) — good; `credentials:true` |
| JWT | `jwt.verify(token, JWT_SECRET)`, header Bearer (middleware/auth.js:13) — good |
| Rate limiting | `/api` limiter 500/15min anon, 2000/15min authed (server.js:54-71) — no double-count (fixed in round 1); auth-limit inversion is a minor tuning point |
| Validation | Only auth/product/order/contact/review/qa/coupon schemas exist; most admin writes are unvalidated |
| helmet, mongoSanitize, compression | Present — good |

---

## PHASE 3 — DATABASE AUDIT

Method: model review (45 model files) + live API cross-checks. Existing data intact; no destructive queries run.

| Finding | Detail | Impact |
|---------|--------|--------|
| `models/Seller.js` | 0 bytes — empty file | Sellers tab has no data source at all |
| Order field mismatch | `Order` uses field `user`, but `services/fraudService.js` queries `{ userId }` and orphaned `controllers/orderController.js` filters by `userId` → wrong results / CastError | Fraud checks wrong |
| `Settings` model | missing `backupHistory`, `contactEmail`, `vatRate` fields that the settings engine reads | Backups list empty; some settings reads vacuous |
| `AbandonedCart.findRecoverable` | two duplicate `$or` keys (lines 287/291) — second overwrites first | emailsSent filter silently dropped |
| `User` model | no `roleId` / `department` fields (but `permission.js` reads `user.roleId`) | RBAC permission checks 500 |
| `Subscriber.lists` | refs a `'List'` model that doesn't exist | unregistered ref, harmless |
| `search.routes.js` / `escape-string-regexp@5` | ESM dep not compatible with CommonJS require | module never mounts |
| `templateRenderer.js` | orphaned dead code; requires `handlebars` not in package.json | unused |
| Indexes | `User` has email/status/role/text indexes; Product/Category/Order indexes not audited for missing compound query indexes | performance |

Product/Category/Users/Orders/Reviews/Hero/Notifications/Settings collections all read correctly through live APIs (categories 3, products list, hero 3 slides).

---

## PHASE 4 — ADMIN → STOREFRONT SYNCHRONIZATION AUDIT

Verified working sync (admin writes → storefront reads, same collection):

| Admin action | Admin writes | Storefront reads | Sync |
|--------------|--------------|------------------|------|
| Add/edit/delete product, price, stock, status | /products CRUD, /products/bulk/* | /products, /products/:id, /products/featured, flash-sale | ✅ |
| Categories | /categories CRUD | /categories | ✅ |
| Hero slides | PUT /homepage (heroSlides) | GET /homepage/hero (active, sorted) | ✅ |
| Catalogues | /homepage/catalogue/:id | GET /homepage/catalogues | ✅ |
| Featured products | /products/bulk/update {featured} | /products/featured | ✅ |
| Branding (logo/favicon/colors/fonts) | PUT /settings/branding | /settings/branding consumed by storefront shell | ✅ |
| Social links | PUT /social-links | GET /social-links | ✅ |
| Announcement bar | PUT /settings (announcementText) | /settings | ✅ |
| Reviews moderation | /reviews/:id/status | /reviews/product/:id | ✅ |

Sync gaps:

| Gap | Detail | Severity |
|-----|--------|----------|
| **Featured Collections (homepage) not rendered on storefront** | Admin `featured-collections` tab writes `homepage.featuredCollections`, but **no storefront JS reads it** (grep: zero matches for featuredCollections outside admin). Dead admin feature. | Medium |
| Service-worker staleness | `/api/homepage/hero`, `/api/catalogues`, `/api/settings`, `/api/categories`, `/api/social-links` cached stale-while-revalidate with **24h expiry** (sw.js:14) → returning visitors may see old hero/catalogues/branding for up to a day after an admin change. | Medium |
| Unpublished products leak | `GET /api/products/:id` (product.routes.js:319) returns drafts/drafts to anyone (no `status:'published'` filter, unlike `/slug/:slug`). Drafts can leak to storefront by URL. | Security |
| Products semi-cache | `/api/products` cached 5min SWR — acceptable for price changes to propagate within 5 min. | Low |

Storefront checkouts use live product data (`/cart/validate-stock`, product re-fetch at line 1041 cart.js). No hardcoded prices found in checkout.

---

## PHASE 5 — RESPONSIVENESS AUDIT (12 viewports)

Method: CDP metric sweep (device_admin.mjs) over admin + storefront (index, product-details, checkout, account) at 320×568, 360×640, 375×667, 390×844, 414×896, 768×1024, 820×1180, 1024×1366, 1280×720, 1366×768, 1440×900, 1920×1080.

- **Zero page-level horizontal scroll on any route at any viewport.**
- Admin flagged items are all by-design: dashboard tables have `min-width` inside scrollable `.table-wrapper` (intentional); off-canvas sidebar sits translated off-screen left on mobile (intentional drawer). Desktop 1024×1366+ admin is completely clean (0 issues).
- Storefront clean; remaining flags are by-design chips/tabs/line-clamps (documented in round-1 report).
- Mobile hamburger navigation works; sidebar closes after tab selection (navigateTo line 3329).

**Verdict: no responsiveness defects to fix.**

---

## PHASE 6 — SECURITY AUDIT

| # | Finding | Severity | Location |
|---|---------|----------|----------|
| 1 | `authenticateToken` does not check `user.status` — suspended/blocked users keep API access until token expiry | High | middleware/auth.js:5-23 |
| 2 | RBAC permission middleware reads non-existent `user.roleId` → 500 CastError for non-admins | High | middleware/permission.js:15; models/User.js (no roleId) |
| 3 | Login bypasses account-security stack: no lockout (SecurityPolicy.maxLoginAttempts unused), no 2FA, no session cap, no audit | High | routes/auth.routes.js:44 (direct User.findOne + bcrypt.compare) |
| 4 | `GET /api/products/:id` exposes unpublished/draft products publicly | High | product.routes.js:319 |
| 5 | `PUT /qa/:id/helpful` public; `PUT /reviews/:id/helpful` token-only — spam/abuse vectors | Medium | qa.routes.js:88, reviews.routes.js:136 |
| 6 | `GET /api/rbac/...` validate schemas missing → 500 (7 admin-user/role/department endpoints) | High | middleware/validate.js |
| 7 | 500 responses leak raw error messages | Low | controllers + server.js:162 |
| 8 | Rate limit inversion (authed 2000 vs anon 500) | Low | server.js:54-71 |
| 9 | Upload validation: **good** — admin-only, 5MB images / 50MB videos, MIME whitelist, Cloudinary streaming | ✅ | upload.routes.js |
| 10 | Password hashing: bcrypt(10) used in seed; login uses bcrypt.compare | ✅ | auth.routes.js |
| 11 | CORS: allowlist (vercel.app + localhost), helmet, mongoSanitize, compression | ✅ | server.js |
| 12 | RBAC dead code: permission middleware never executes (declared after routes) | Medium | rbac.routes.js:104-109 |

---

## PHASE 7 — PERFORMANCE AUDIT

| Check | Result |
|-------|--------|
| API response times (live) | 290–830ms per request on Render (cold-start dominated). First-hit after idle can take several seconds (free-tier cold start). |
| Cloudinary integration | Configured (upload.routes.js); product images loaded with `w_800` (mobile) / `w_1600` (desktop) transforms (round-1 fix); lazy benefits present. |
| Service worker | Robust multi-cache SW (static/dynamic/image/API-SWR with expiries, offline fallback, push). See Phase 4 staleness note. |
| JS/CSS bundle | `npm run build` minifies (round 1). No terser errors. |
| JS runtime errors | 0 ReferenceErrors across all 35 admin tabs; storefront clean. |
| Network failures | admin `safeFetch` wrappers catch per-call; loaders degrade gracefully (toast) — no crash loops. |
| Memory leaks | No obvious leak patterns in loaders; repeated tab navigation re-renders tables (no global event duplication found). |

---

## PHASE 8 — END-TO-END TESTING

**BLOCKED on valid admin credentials.** Default seed credentials (`admin@trendy.com / Admin123!`) return 401 on production. Everything E2E-dependent (authenticated admin crawl, add/edit product, publish, order flow) requires owner credentials or a provisioning step. Recommended: owner supplies test admin credentials, or run `seed.js` against production (not recommended), or provide DB access to create a test admin.

---

## FINDINGS RANKED BY SEVERITY

### Critical (broken core admin pages / security)
1. **Analytics/Reports page entirely dead** — 5 missing `/analytics/*` endpoints (A1–A5).
2. **Newsletter page entirely dead** — 4 missing `/newsletter/*` endpoints (A6–A9).
3. **Popups page dead** — missing `/popups`, `/popups/stats` (A12).
4. **Website Content page dead** — missing `/content/pages` (A10).
5. **RBAC admin-user/role/department management 500s** — missing validate schemas (B).
6. **Draft products publicly exposed** by ID (Sec 4).
7. **Suspended/blocked users keep API access** (Sec 1).

### High
8. **Coupons shadowing** — `GET /my`, `GET /promotions/active` unreachable for customers (C).
9. **Login security stack bypassed** — no lockout/2FA/session cap (Sec 3).
10. **Marketing test-email dead** — `/marketing/test-email` vs existing `/marketing/send-test` (A13).
11. **SEO sitemap generate dead** — `/sitemap/generate` missing (A11).

### Medium
12. **3 admin tabs non-functional**: `sellers` and `payments` (empty loaders `()=>{}`), `search` (missing panel div) (P1 #7/#34/#29).
13. **2 placeholder tabs not wired to real data**: `wishlist-analytics` (endpoint `/admin/wishlist/stats` exists but unused), `rbac` (placeholder; real RBAC lives inside Settings) (P1 #18/#32).
14. **Search module never mounts** (ESM dep crash) (2D).
15. **Featured Collections not rendered on storefront** (Phase 4 gap).
16. **Order user/userId mismatch** in fraudService (Phase 3).
17. **RBAC permission middleware broken** (reads user.roleId) + never executes (Sec 2/12).
18. **2FA endpoints missing** for advertised storefront account feature (A14–A16).
19. **Settings model missing fields** (backups/contact/vat) (Phase 3).
20. **AbandonedCart duplicate $or** drops emailsSent filter (Phase 3).

### Low
21. 500s leak raw error text (Sec 7).
22. `/cms/*` all admin-only incl. public testimonials (2E).
23. Rate-limit inversion (Sec 8).
24. SW 24h API staleness for hero/catalogues/branding (Phase 4).
25. `Seller.js` 0 bytes (no sellers data model) (Phase 3).

---

## PROPOSED FIX PLAN (no changes made yet — awaiting approval / in order)

**Backend (deploy-main), each fix tested via live API before the next:**
1. Add the 16 missing endpoints: analytics (kpi/sales/charts/report/live), newsletter (subscribers/stats/import, DELETE :id), content/pages CRUD, sitemap/generate, popups + stats, marketing/test-email alias, users 2fa setup/verify/disable.
2. Fix RBAC validate schemas (add the 4 missing schemas) + route duplication + permission middleware placement.
3. Reorder coupons routes (`/my` and `/promotions/active` before `/:id`).
4. Add `status:'published'` filter to public `GET /products/:id` (preserve admin access via a second authenticated route or query flag).
5. Check `user.status` in `authenticateToken` (reject suspended/blocked/deleted).
6. Guard `permission.js` when `user.roleId` missing.
7. Pin `escape-string-regexp@4.x` to restore `/search` module (no behavior change).
8. Fix fraudService/orderController to use `Order.user`.
9. Add missing `Settings` model fields + fix `AbandonedCart` `$or`.

**Frontend (audit-fixes-1), each fix verified in build + live:**
10. Wire the 3 empty tabs to existing/added endpoints: Sellers (list via new `/users?role=seller` or graceful empty state), Payments (load from `/system/settings` payment methods — already implemented), Search (add `panel-search` div + wire to `/search/analytics` if added, else a functional empty state).
11. Wire Wishlist Analytics to `/admin/wishlist/stats` (endpoint already exists).
12. No layout/CSS changes needed (Phase 5 clean).

**Optional/recommended (not changes):** shorten SW API_STATIC expiry for hero/catalogues/branding to improve sync freshness; render Featured Collections on the storefront in a follow-up.

---
*All evidence in this report was gathered read-only against the live systems and the source repos. No data was modified.*
