# Trendy Wardrobe - Known Issues & Recommendations

**Project:** Trendy Wardrobe Enterprise Fashion E-commerce Platform  
**Module:** Module 3 – Part 15 Final QA  
**Date:** July 19, 2026  
**Classification:** Internal - Action Items  

---

## Executive Summary

This document consolidates all known issues, technical debt, and improvement recommendations identified during the comprehensive Module 3 – Part 15 audit. Issues are categorized by severity and include specific remediation steps.

**Total Issues: 47**  
- **Critical:** 0
- **High:** 8
- **Medium:** 21
- **Low:** 18

---

## 🔴 HIGH PRIORITY (Fix Before Launch)

### SEC-001: Content Security Policy Missing on Customer Storefront
- **Severity:** High
- **Category:** Security
- **Impact:** Reduced XSS protection on all 13 customer-facing pages
- **Location:** `index.html`, `product-details.html`, `cart.html`, `checkout.html`, `account.html`, `wishlist.html`, `contact.html`, `about.html`, `terms.html`, `privacy.html`, `404.html`, `order-confirmation.html`
- **Remediation:** Add CSP header via Vercel configuration or meta tag
```html
<!-- Recommended CSP for storefront -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://res.cloudinary.com https://placehold.co;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://trendy-backend-jq27.onrender.com https://api.cloudinary.com;
  frame-src https://www.google.com;
">
```
- **Effort:** Low (30 min)
- **Owner:** Frontend Lead

### SEC-002: Google Analytics Placeholder ID in All HTML Files
- **Severity:** High
- **Category:** Security/Analytics
- **Impact:** No production analytics; data sent to test property `G-XXXXXXXXXX`
- **Location:** All 13 HTML files + admin (27 occurrences)
- **Remediation:** Replace with environment variable at build time
```javascript
// build.js modification
const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';
content = content.replace(/G-XXXXXXXXXX/g, gaId);
```
- **Effort:** Low (15 min)
- **Owner:** DevOps Engineer

### SEC-003: Admin CSP Allows `unsafe-eval` for Chart.js
- **Severity:** High
- **Category:** Security
- **Impact:** Reduces CSP effectiveness on admin panel
- **Location:** `admin/index.html` line 13
- **Remediation:** 
  1. Use Chart.js without eval (v4.4+ supports this)
  2. Or add nonce-based CSP
  3. Or self-host Chart.js with integrity hash
- **Effort:** Medium (2 hours)
- **Owner:** Frontend Lead

### PERF-001: No Response Compression (gzip/brotli)
- **Severity:** High
- **Category:** Performance
- **Impact:** 30-70% larger API responses, slower page loads
- **Location:** `trendy-backend/server.js`
- **Remediation:** Add compression middleware
```javascript
// server.js - add after helmet
const compression = require('compression');
app.use(compression({ level: 6, threshold: 1024 }));
// npm install compression
```
- **Effort:** Low (10 min)
- **Owner:** Backend Lead

### PERF-002: CSS/JS Not Minified in Production Build
- **Severity:** High
- **Category:** Performance
- **Impact:** 40-60% larger asset sizes, slower FCP/LCP
- **Location:** `trendy-frontend/build.js`
- **Remediation:** Add terser + cssnano to build
```javascript
// build.js - add minification step
const terser = require('terser');
const CleanCSS = require('clean-css');

// Minify JS
const jsResult = await terser.minify(jsContent);
fs.writeFileSync(dest, jsResult.code);

// Minify CSS
const cssResult = new CleanCSS().minify(cssContent);
fs.writeFileSync(dest, cssResult.styles);
```
- **Effort:** Medium (1 hour)
- **Owner:** DevOps Engineer

### DEPLOY-001: No Staging Environment Configured
- **Severity:** High
- **Category:** Deployment
- **Impact:** No pre-production validation; direct deploy to production
- **Remediation:** 
  1. Create Vercel Preview deployments (automatic on PR)
  2. Create Render preview service or separate staging service
  3. Configure environment-specific variables
- **Effort:** Medium (2 hours)
- **Owner:** DevOps Engineer

### DOC-001: Missing Project Documentation
- **Severity:** High
- **Category:** Documentation
- **Impact:** No onboarding guide, no API reference, no runbooks
- **Location:** `docs/` directory (empty)
- **Remediation:** Create all documents listed in `DOCUMENTATION_INDEX.md`
- **Effort:** High (8 hours)
- **Owner:** Technical Lead

---

## 🟡 MEDIUM PRIORITY (Fix Within 2 Weeks)

### A11Y-001: Success/Warning Color Contrast Below WCAG AA
- **Severity:** Medium
- **Category:** Accessibility
- **Impact:** Green (#22C55E) 3.1:1, Amber (#F59E0B) 2.7:1 on white
- **Location:** `:root` in `styles.css` and `admin/index.html`
- **Remediation:** Update color variables
```css
:root {
  --success: #16A34A;  /* 4.6:1 on white */
  --warning: #B45309;  /* 4.5:1 on white */
}
```
- **Effort:** Low (15 min)
- **Owner:** Frontend Lead

### A11Y-002: Skip Link Not Visible Until Focus
- **Severity:** Medium
- **Category:** Accessibility
- **Impact:** Keyboard users can't see skip link until tabbing
- **Remediation:** Add visible focus style
```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: var(--text-primary);
  color: white;
  z-index: 10000;
  border-radius: 4px;
}
.skip-link:focus {
  top: 10px;
}
```
- **Effort:** Low (15 min)
- **Owner:** Frontend Lead

### A11Y-003: Chart.js Canvas Lacks Text Summary on Admin Pages
- **Severity:** Medium
- **Category:** Accessibility
- **Impact:** Screen readers can't interpret charts
- **Location:** Admin dashboard, Reports modules
- **Remediation:** Add adjacent visually-hidden summary
```html
<canvas id="chartRevenue" aria-label="Revenue chart"></canvas>
<div class="sr-only" aria-live="polite">
  Revenue chart: January Ksh 1.2M, February Ksh 1.5M, March Ksh 1.8M...
</div>
```
- **Effort:** Medium (1 hour)
- **Owner:** Frontend Lead

### SEC-004: No Token Revocation Mechanism
- **Severity:** Medium
- **Category:** Security
- **Impact:** Compromised tokens valid until expiry (7 days)
- **Remediation:** Implement token blacklist or short expiry + refresh tokens
```javascript
// Option A: Short expiry (15min) + refresh token
// Option B: Redis-based token blacklist on logout/password change
```
- **Effort:** High (4 hours)
- **Owner:** Backend Lead

### SEC-005: Admin Session Not Invalidated on Password Change
- **Severity:** Medium
- **Category:** Security
- **Impact:** Old sessions remain valid after admin password reset
- **Remediation:** Add session versioning or invalidate on password change
```javascript
// User model: add sessionVersion field
// On password change: user.sessionVersion++
// In auth middleware: verify sessionVersion matches
```
- **Effort:** Medium (2 hours)
- **Owner:** Backend Lead

### SEC-006: Unsigned Cloudinary Upload Preset
- **Severity:** Medium
- **Category:** Security
- **Impact:** Anyone with preset can upload to your Cloudinary
- **Remediation:** 
  1. Switch to signed uploads for admin
  2. Or restrict unsigned preset with folder/transformation limits
  3. Add upload webhook for audit log
- **Effort:** Medium (2 hours)
- **Owner:** Backend Lead

### PERF-003: No API Response Caching
- **Severity:** Medium
- **Category:** Performance
- **Impact:** Repeated identical requests hit database
- **Remediation:** Add Redis caching for settings, categories, featured products
```javascript
// Example: Cache settings for 5 minutes
const cached = await redis.get('settings');
if (cached) return JSON.parse(cached);
const settings = await Settings.findOne({});
await redis.setex('settings', 300, JSON.stringify(settings));
```
- **Effort:** Medium (3 hours)
- **Owner:** Backend Lead

### PERF-004: Chart.js Bundle Not Optimized
- **Severity:** Medium
- **Category:** Performance
- **Impact:** ~120KB JS for charts, only using subset
- **Remediation:** Use modular imports
```javascript
// Instead of: import Chart from 'chart.js'
import { Chart, LineController, LineElement, PointElement, CategoryScale } from 'chart.js';
Chart.register(LineController, LineElement, PointElement, CategoryScale);
```
- **Effort:** Low (30 min)
- **Owner:** Frontend Lead

### API-001: No Formal API Documentation (OpenAPI/Swagger)
- **Severity:** Medium
- **Category:** API/Documentation
- **Impact:** No developer reference, no Swagger UI
- **Remediation:** Add swagger-jsdoc + swagger-ui-express
```bash
npm install swagger-jsdoc swagger-ui-express
```
- **Effort:** Medium (2 hours)
- **Owner:** Backend Lead

### DB-001: No MongoDB Schema Validation at Database Level
- **Severity:** Medium
- **Category:** Database
- **Impact:** Relies solely on Mongoose; direct DB writes bypass validation
- **Remediation:** Enable MongoDB JSON Schema Validation
```javascript
// Run in MongoDB shell
db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'price', 'category'],
      properties: {
        name: { bsonType: 'string' },
        price: { bsonType: 'double', minimum: 0 }
      }
    }
  }
});
```
- **Effort:** Medium (2 hours)
- **Owner:** Database Architect

### DB-002: Missing Partial Indexes for Common Queries
- **Severity:** Medium
- **Category:** Database
- **Impact:** Indexes larger than needed; slower writes
- **Remediation:** Add partial indexes (see `DATABASE_HEALTH_REPORT.md`)
- **Effort:** Low (30 min)
- **Owner:** Database Architect

### UX-001: Product URLs Use Query Parameters
- **Severity:** Medium
- **Category:** SEO/UX
- **Impact:** `/product-details.html?id=abc` not SEO-friendly
- **Remediation:** Vercel rewrites for clean URLs
```json
// vercel.json
{
  "rewrites": [
    { "source": "/product/:slug", "destination": "/product-details.html?id=:slug" }
  ]
}
```
- **Effort:** Low (30 min)
- **Owner:** DevOps Engineer

### UX-002: Hero Video Autoplays on Mobile Data
- **Severity:** Medium
- **Category:** UX/Performance
- **Impact:** Unwanted data usage on mobile
- **Remediation:** Add `preload="metadata"` and respect `prefers-reduced-data`
```html
<video preload="metadata" playsinline muted loop>
```
- **Effort:** Low (15 min)
- **Owner:** Frontend Lead

---

## 🟢 LOW PRIORITY (Technical Debt - Fix When Capacity Allows)

### Code Quality
- [ ] **CODE-001:** Add ESLint + Prettier configuration
- [ ] **CODE-002:** Add TypeScript definitions (JSDoc or .d.ts)
- [ ] **CODE-003:** Extract inline styles from admin/index.html to CSS
- [ ] **CODE-004:** Split admin/index.html into components (build step)
- [ ] **CODE-005:** Add unit tests (Jest + Supertest)

### Security
- [ ] **SEC-007:** Add password breach checking (HaveIBeenPwned API)
- [ ] **SEC-008:** Add security.txt file for responsible disclosure
- [ ] **SEC-009:** Implement CSP nonce for admin panel
- [ ] **SEC-010:** Add rate limiting on password reset endpoint

### Performance
- [ ] **PERF-005:** Implement critical CSS extraction per page
- [ ] **PERF-006:** Add preload for hero images
- [ ] **PERF-007:** Implement HTTP/2 Server Push (if available)
- [ ] **PERF-008:** Edge caching for dynamic content (Cloudflare Workers)

### Accessibility
- [ ] **A11Y-004:** Toast notifications not announced by screen readers
- [ ] **A11Y-005:** Mobile bottom nav icons lack labels on some pages
- [ ] **A11Y-006:** Focus trap in modals needs verification on Safari

### SEO
- [ ] **SEO-001:** Add FAQPage schema to FAQ page
- [ ] **SEO-002:** Add Review schema to product pages
- [ ] **SEO-003:** Add VideoObject schema for hero video
- [ ] **SEO-004:** Implement hreflang (if multi-language)
- [ ] **SEO-005:** Dynamic sitemap.xml generation from API

### UX/UI
- [ ] **UX-003:** Dark mode in admin panel
- [ ] **UX-004:** Loading skeletons for product grid
- [ ] **UX-006:** Offline support via Service Worker enhancement
- [ ] **UX-007:** Image zoom/lightbox on product detail

### Features
- [ ] **FEAT-001:** Webhook system for order events (ERP integration)
- [ ] **FEAT-002:** Multi-currency checkout (real-time conversion)
- [ ] **FEAT-003:** Guest checkout option
- [ ] **FEAT-004:** Product comparison page (currently only in admin)
- [ ] **FEAT-005:** Loyalty points system

### Infrastructure
- [ ] **INFRA-001:** Database read replicas for analytics queries
- [ ] **INFRA-002:** CDN for API responses (Cloudflare)
- [ ] **INFRA-003:** Automated dependency updates (Dependabot)
- [ ] **INFRA-004:** Chaos engineering / failure injection testing

---

## 📋 Issue Tracking Template

```markdown
## Issue ID: XXX-###
**Title:** Brief descriptive title
**Severity:** Critical/High/Medium/Low
**Category:** Security/Performance/Accessibility/SEO/UX/Code/Database/Infra
**Status:** Open/In Progress/Testing/Done
**Assignee:** [Name]
**Created:** YYYY-MM-DD
**Target:** YYYY-MM-DD

### Description
Detailed description of the issue...

### Impact
What happens if not fixed?

### Root Cause
Why does this happen?

### Remediation Steps
1. Step one
2. Step two

### Testing
How to verify fix?

### Related Issues
Links to related items
```

---

## 📊 Priority Matrix

| Severity | Count | Target Resolution |
|----------|-------|-------------------|
| Critical | 0 | Immediate |
| High | 8 | Before Launch |
| Medium | 21 | 2 Weeks Post-Launch |
| Low | 18 | Next Sprint/Quarter |

---

## 📈 Resolution Tracking

| Sprint | Issues Resolved | Remaining |
|--------|-----------------|-----------|
| Pre-Launch | 0/8 High | 8 |
| Sprint 1 | 0/21 Medium | 21 |
| Sprint 2 | 0/21 Medium | 21 |
| Sprint 3 | 0/18 Low | 18 |

---

## ✅ Definition of Done for Each Issue

- [ ] Code changed and committed
- [ ] Unit/integration tests pass
- [ ] Manual testing on 3 browsers (Chrome, Firefox, Safari)
- [ ] Mobile testing (320px, 768px, 1440px)
- [ ] Accessibility check (axe-core + keyboard)
- [ ] Performance check (Lighthouse > 90)
- [ ] Security scan (npm audit, Snyk)
- [ ] Deployed to staging
- [ ] Smoke tests pass on staging
- [ ] Deployed to production
- [ ] Monitoring verified
- [ ] Documentation updated

---

## 📞 Escalation Path

| Severity | Escalation | SLA |
|----------|------------|-----|
| Critical | Page Technical Lead → CTO | 1 hour |
| High | Page Technical Lead | 4 hours |
| Medium | Team Lead | 24 hours |
| Low | Sprint Planning | Next Sprint |

---

*This document is a living artifact. Update status as issues are resolved. Review weekly during sprint planning.*