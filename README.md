# Trendy Wardrobe

Luxury fashion e-commerce platform for the Kenyan market, built to expand into East Africa.

**Status:** Active development — existing enterprise codebase. This is not a prototype; do not restart or redesign.

---

## Overview

Trendy Wardrobe is a full-stack luxury fashion storefront with a companion admin dashboard, covering catalog management, promotions, RBAC, CMS-driven content, analytics, and reporting.

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Auth:** JWT
- **Deployment:** Frontend on Vercel, Backend on Render

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for structure, [`DESIGN_BIBLE.md`](./DESIGN_BIBLE.md) for UI/UX standards, and [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) for business context and current feature status.

## Repository Structure

```
Trendy-New/
├── docs/              # Project documentation
├── routes/            # Express route definitions
├── services/          # Backend business logic / service layer
├── src/               # Frontend source
├── trendy-backend/    # Backend application
├── trendy-frontend/   # Frontend application
├── package.json
├── package-lock.json
├── postcss.config.js
└── .gitignore
```

> Note: this tree reflects the top-level GitHub listing. See `ARCHITECTURE.md` for caveats — a full internal file tree hasn't been documented yet.

## Getting Started

```bash
# Clone
git clone https://github.com/koechlevy07-ship-it/Trendy-New.git
cd Trendy-New

# Install dependencies
npm install

# Environment variables
cp .env.example .env   # fill in MongoDB URI, JWT secret, etc.

# Run backend (from trendy-backend, if applicable)
npm run dev

# Run frontend
# served via trendy-frontend / src, deployed to Vercel
```

> If an `.env.example` doesn't exist yet, one should be added — see open items in `PROJECT_CONTEXT.md`.

## Core Features (existing — do not rebuild)

- Customer storefront
- Admin dashboard
- Authentication & RBAC
- CMS / homepage management
- Products & categories
- Customers & orders
- Promotions & coupons
- Reports & analytics
- Settings, media upload, notifications
- Role & permission management, audit logs, department management, session management

## Development Rules

1. Analyze existing code before making changes.
2. Reuse existing components, services, APIs, and models.
3. Never redesign approved UI — see `DESIGN_BIBLE.md`.
4. Never rewrite working code without explicit approval.
5. Ship production-ready code only — no placeholders, no TODOs left in.
6. Work in logical, reviewable phases.

## Deployment

| Layer    | Platform | Notes |
|----------|----------|-------|
| Frontend | Vercel   | Auto-deploys from `master` (confirm branch/workflow) |
| Backend  | Render   | Auto-deploys from `master` (confirm branch/workflow) |
| Database | MongoDB Atlas | Connection via `MONGODB_URI` env var |

## License

Proprietary — all rights reserved (confirm/update if a license is intended).
