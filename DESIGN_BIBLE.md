# Design Bible — Trendy Wardrobe

This is the final, approved design language for Trendy Wardrobe. It applies to both the **Customer Storefront** and the **Admin Dashboard**.

**This document is binding.** No page, component, or feature may deviate from it or introduce a second UI style without explicit approval. When in doubt, match existing approved pages rather than inventing new patterns.

> ⚠️ This file currently captures the design *principles* stated for the project. Exact tokens (hex values, font families, spacing scale in px/rem) should be pulled from the live CSS in `src/`/`trendy-frontend/` and pasted in below so this document matches the shipped code exactly, rather than approximating it.

---

## 1. Design Philosophy

- Premium, editorial, luxury-fashion feel — not a generic storefront template.
- Restraint over density: generous whitespace, uncluttered layouts.
- Gold as an accent, not a dominant color — used to signal premium actions, highlights, and brand moments.
- Consistency across customer-facing and admin surfaces, even though their functional needs differ.

## 2. Core Visual Language

| Element | Standard |
|---|---|
| Background | White, premium/clean |
| Accent Color | Luxury gold |
| Typography | Elegant, editorial-feel typefaces |
| Spacing | Large, generous — avoid cramped layouts |
| Animation | Premium, subtle (fades, gentle transitions — not bouncy/playful) |
| Layout | Modern, fully responsive |

## 3. Color Palette

> Fill in exact hex/HSL values from the live stylesheet.

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#FFFFFF` (confirm) | Primary background |
| `--color-accent-gold` | *TBD from CSS* | Buttons, highlights, luxury accents |
| `--color-text-primary` | *TBD* | Body/heading text |
| `--color-text-secondary` | *TBD* | Muted/secondary text |
| `--color-border` | *TBD* | Dividers, card borders |
| `--color-error` | *TBD* | Form/validation errors |
| `--color-success` | *TBD* | Confirmations |

## 4. Typography

> Fill in exact font-family names, weights, and size scale from the live CSS.

| Role | Font | Weight | Size (approx) |
|---|---|---|---|
| Display / Hero | *TBD* | *TBD* | *TBD* |
| H1 | *TBD* | *TBD* | *TBD* |
| H2 | *TBD* | *TBD* | *TBD* |
| Body | *TBD* | *TBD* | *TBD* |
| Small / Caption | *TBD* | *TBD* | *TBD* |

## 5. Spacing

> Fill in the actual spacing scale (e.g. 4/8/16/24/32/48/64px) once confirmed from CSS variables.

- Use a consistent spacing scale across storefront and admin.
- Prefer generous section padding over dense stacking — this is a stated brand requirement, not just a default.

## 6. Components

### Product Cards
- Luxury presentation: clean image, minimal metadata, gold accent on hover/CTA.
- Consistent aspect ratio across grids.

### Buttons
- Primary actions use the gold accent (fill or outline — confirm which is standard).
- Secondary/tertiary actions stay neutral (white/black/gray) to keep gold meaningful.

### Forms
- Clear labels, inline validation, accessible error states.
- Consistent input styling across storefront checkout/account and admin dashboard forms.

### Tables (Admin)
- Used for products, orders, customers, promotions, reports.
- Must support sorting/filtering/pagination consistently (see `ARCHITECTURE.md` for API contract).

### Navigation
- **Header:** consistent across all storefront pages.
- **Footer:** consistent across all storefront pages.
- **Admin Nav:** consistent across all dashboard sections (Products, Orders, Customers, Promotions, Reports, Analytics, Settings, Roles/Permissions, Audit Logs, Departments).

### Icons
- Consistent icon set/style — confirm library in use (e.g. custom SVGs vs. an icon font/library) and standardize.

## 7. Responsive Behavior

- Fully responsive across mobile, tablet, desktop.
- Storefront must be mobile-first given the target market's device usage patterns.
- Admin dashboard should be usable on tablet at minimum; desktop is primary.

## 8. Accessibility

- Semantic HTML throughout.
- Sufficient color contrast, especially gold-on-white and gold-on-dark combinations — verify against WCAG AA.
- Keyboard navigation and visible focus states on all interactive elements.
- ARIA labels on icon-only controls (admin dashboard especially).

## 9. Rules

1. Never introduce a second visual style, competing color palette, or alternate component pattern.
2. Never redesign an approved page — extend it within the existing system.
3. New components must be built from the existing tokens/patterns above, not ad hoc.
4. If a new pattern is genuinely needed (no existing equivalent), propose it for approval before shipping — don't ship silently.

---

**Next step:** populate the `TBD` values above by pulling the actual CSS variables/tokens from `src/` (or wherever the stylesheet lives) so this file is a source of truth rather than an approximation.
