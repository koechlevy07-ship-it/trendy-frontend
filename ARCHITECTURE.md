# Architecture — Trendy Wardrobe

This document describes the technical architecture of the Trendy Wardrobe platform. It should be kept up to date as the system evolves.

> **Scope note:** This version is based on the top-level file/folder listing visible on GitHub (`docs`, `routes`, `services`, `src`, `trendy-backend`, `trendy-frontend`, `package.json`, `package-lock.json`, `postcss.config.js`, `.gitignore`) plus the stack and feature list provided in project context. It has not been generated from a full clone/deep read of the codebase, so internal details (exact file trees, model schemas, route lists, middleware chain) are marked as **TBD** below and should be filled in from the actual source rather than assumed.

---

## 1. High-Level System Overview

```
┌─────────────────────┐        ┌──────────────────────┐        ┌───────────────────┐
│  Customer Storefront│        │   Admin Dashboard     │        │                    │
│  (trendy-frontend)  │◄──────►│   (trendy-frontend?)  │◄──────►│   MongoDB Atlas    │
└──────────┬───────────┘        └──────────┬────────────┘        └─────────▲──────────┘
           │            REST API (JWT)      │                              │
           └───────────────┬────────────────┘                              │
                            ▼                                              │
                   ┌──────────────────┐                                    │
                   │  Express Backend  │────────────────────────────────────┘
                   │  (trendy-backend) │
                   │  routes/ services/│
                   └──────────────────┘
```

- **Frontend:** Vanilla HTML/CSS/JS, deployed on Vercel.
- **Backend:** Node.js + Express REST API, deployed on Render.
- **Database:** MongoDB Atlas.
- **Auth:** JWT-based, with RBAC enforced server-side.

## 2. Repository Structure (top-level)

```
Trendy-New/
├── docs/              # Documentation
├── routes/            # Express route definitions (TBD: list of route files/endpoints)
├── services/          # Business logic / service layer (TBD: service breakdown)
├── src/               # Frontend source (TBD: confirm if this is shared/shared-components or storefront-specific)
├── trendy-backend/     # Backend app entry point(s) (TBD: confirm relationship to routes/ and services/)
├── trendy-frontend/    # Frontend app (storefront + admin dashboard — TBD: confirm if admin is separate or same app)
├── package.json
├── package-lock.json
├── postcss.config.js   # Suggests a CSS build/processing step beyond plain CSS3 — confirm PostCSS plugins in use
└── .gitignore
```

**Open questions to resolve and document here once confirmed:**
- Is `src/` part of `trendy-frontend`, or a separate shared module (e.g. shared utils/types)?
- Are the customer storefront and admin dashboard two separate apps under `trendy-frontend`, or one app with route-based access control?
- Does `trendy-backend` contain its own `routes/`/`services/`, or do the top-level `routes/`/`services/` belong to it directly?
- What does `postcss.config.js` process — is there a build step (e.g. Tailwind, autoprefixer) despite the "Vanilla CSS3" description?

## 3. Backend Architecture

### Layers (expected, standard Express pattern — confirm against actual code)

1. **Routes** (`routes/`) — HTTP endpoint definitions, delegate to controllers/services.
2. **Services** (`services/`) — business logic, DB interaction, external integrations.
3. **Models** — Mongoose schemas (location TBD — likely inside `trendy-backend/`).
4. **Middleware** — auth (JWT verification), RBAC checks, validation, error handling (location TBD).

### Authentication & Authorization

- **Auth:** JWT issued on login, verified per-request via middleware (TBD: confirm token storage — cookie vs. Authorization header — and refresh-token strategy).
- **RBAC:** Role and permission management exist as first-class admin features. Authorization should be enforced at the route/middleware level, not just hidden in the UI.

### API Conventions (target standard — confirm actual implementation matches)

- RESTful resource-based routes.
- Consistent response envelope (e.g. `{ success, data, error }` — confirm actual shape).
- Pagination, filtering, sorting, and search supported on list endpoints (products, orders, customers, reports).
- Proper HTTP status codes.
- Rate limiting on public/auth-sensitive endpoints.
- Centralized error handling middleware.

## 4. Data Layer

- **Database:** MongoDB Atlas.
- **Known domains (from feature list):** Products, Categories, Customers, Orders, Promotions, Coupons, Reports/Analytics, Settings, Media, Notifications, Roles, Permissions, Audit Logs, Departments, Sessions.
- **TBD:** actual schema definitions, indexes, and relationships between collections (e.g. Order → Customer, Order → Product line items).

> Recommendation: once schemas are confirmed, add an ER-style diagram or collection reference table here — this is high-value for onboarding and for avoiding duplicate/conflicting models.

## 5. Frontend Architecture

- **Stack:** Vanilla JS, no framework — component reuse relies on discipline (shared partials/templates or JS modules) rather than a framework's component system.
- **Storefront vs Admin:** TBD whether these are fully separate codebases/deployments or share a component layer.
- **State/Data fetching:** TBD — confirm pattern used for calling the backend API (fetch wrapper, shared API client module, etc.) so new features stay consistent.

## 6. Deployment

| Component | Platform | Trigger | Notes |
|---|---|---|---|
| Frontend | Vercel | TBD (push to `master`?) | Confirm build command / output dir |
| Backend | Render | TBD (push to `master`?) | Confirm start command, health check path |
| Database | MongoDB Atlas | N/A | Confirm network access rules / IP allowlist for Render |

**Environment variables (expected, confirm exact names in use):**
- `MONGODB_URI`
- `JWT_SECRET`
- Frontend API base URL (e.g. `VITE_API_URL` or hardcoded — confirm)
- Any third-party service keys (payments, email, media storage) — not yet documented.

## 7. Security Posture (target — confirm against implementation)

- JWT auth + RBAC on all protected routes.
- Password hashing (bcrypt or equivalent).
- Input validation on all endpoints.
- Helmet for HTTP header hardening.
- CORS restricted to known frontend origins.
- Rate limiting on auth and public endpoints.
- XSS/CSRF protections where applicable.
- Audit logs for admin actions (already listed as an implemented feature — confirm coverage).

## 8. Performance Considerations

- Database query optimization + indexing on frequently filtered fields (product search, order lookups).
- Image optimization/lazy loading on storefront.
- API response caching where appropriate (e.g. category/homepage CMS content).
- Frontend bundle/asset size kept lean given vanilla JS (no framework overhead, but watch for unminified/unbundled assets in production).

## 9. Maintenance Notes

- This file should be updated whenever:
  - A new top-level module/folder is added.
  - The routes/services boundary changes.
  - A new third-party integration (payments, shipping, email) is added.
  - Auth strategy changes.
- Keep `TBD` markers until confirmed — don't let assumed details silently become "documented fact."
