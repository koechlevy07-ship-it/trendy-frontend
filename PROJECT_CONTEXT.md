# Project Context — Trendy Wardrobe

This document is the single reference for business context, scope, and current status. GitHub (this repository) is the source of truth for code; this file is the source of truth for *why* the code exists.

---

## 1. Business

| | |
|---|---|
| **Project Name** | Trendy Wardrobe |
| **Industry** | Luxury Fashion E-commerce |
| **Target Market** | Kenya (initial), expanding to East Africa |
| **Currency** | Kenyan Shilling (KSh) |
| **Language** | English |
| **Benchmark Competitors** | Zara, Nike, H&M, ASOS, Farfetch, Shopify Plus |

## 2. Primary Product Categories

- Trendy Trenchcoats
- Trendy Wardrobe
- Trendy Shoes

New categories must be supportable without schema rework — category taxonomy should stay data-driven, not hardcoded.

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| VCS | GitHub |

## 4. Current Development Status

### Already implemented (do not rebuild — extend/improve only with approval)

- Customer storefront
- Admin dashboard
- Authentication
- RBAC (role-based access control)
- CMS / homepage management
- Products & categories
- Customers & orders
- Promotions & coupons
- Reports & analytics
- Settings
- Media upload
- Notifications
- Role management
- Permission management
- Audit logs
- Department management
- Session management

### Status of the above (fill in as verified)

> This section should be kept current as features are audited. Mark each as ✅ Working / ⚠️ Partial / ❌ Broken / 🔲 Not yet verified.

| Feature | Status | Notes |
|---|---|---|
| Customer storefront | 🔲 | |
| Admin dashboard | 🔲 | |
| Authentication (JWT) | 🔲 | |
| RBAC | 🔲 | |
| CMS | 🔲 | |
| Products & Categories | 🔲 | |
| Orders | 🔲 | |
| Promotions & Coupons | 🔲 | |
| Reports & Analytics | 🔲 | |
| Settings | 🔲 | |
| Media Upload | 🔲 | |
| Notifications | 🔲 | |
| Audit Logs | 🔲 | |
| Payments | 🔲 | Payment provider not yet confirmed |
| Shipping | 🔲 | Shipping logic/provider not yet confirmed |
| Emails | 🔲 | Email provider not yet confirmed |

## 5. Known Gaps / Open Items

- Payment methods not yet specified — needs confirmation (e.g. M-Pesa, card via Stripe/Flutterwave/Paystack).
- Shipping requirements not yet specified.
- Third-party integrations not yet documented.
- AI features (if any) not yet scoped.
- `.env.example` not confirmed to exist in repo root.
- CI/CD pipeline (GitHub Actions or platform auto-deploy) not yet documented.

## 6. Development Rules (binding for all contributors, human or AI)

1. This is an existing enterprise project — never restart or scaffold from scratch.
2. Always analyze the relevant code before implementing.
3. Reuse existing components, services, APIs, and DB models — never duplicate.
4. Never redesign approved UI (see `DESIGN_BIBLE.md`).
5. Never replace working architecture without explicit approval.
6. No placeholder implementations, no TODOs left in shipped code.
7. Work in logical phases; stop and confirm before starting the next phase.

## 7. Definition of Done (project-level)

The project is considered complete only when:

- All customer-facing features work end-to-end.
- All admin features work end-to-end.
- Authentication, payments, shipping, emails, and notifications are functional.
- Analytics and settings are functional.
- Media/image uploads work correctly.
- Database is stable with proper indexing and validation.
- Deployment (Vercel + Render) is verified and reproducible.
- Performance is optimized (queries, caching, bundle size, image loading).
- Security has been hardened (JWT, RBAC, input validation, rate limiting, CORS, Helmet, XSS/CSRF protections, audit logs).
- Responsive design is verified across breakpoints.
- No critical bugs remain open.
