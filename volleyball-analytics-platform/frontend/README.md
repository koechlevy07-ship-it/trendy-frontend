# Volleyball Analytics Platform - Frontend

React 18 + TypeScript + Vite frontend for the Volleyball Analytics Platform.

## Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state management
│   ├── hooks/            # Custom React hooks
│   ├── api/              # Generated API client (orval)
│   ├── utils/            # Helpers, formatters, constants
│   ├── styles/           # Tailwind, global styles
│   ├── types/            # Shared TypeScript types
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── Dockerfile
└── README.md
```

## Tech Stack

- **React 18** with TypeScript 5.4
- **Vite 5** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **React Router 6** - Routing
- **Recharts / ECharts** - Data visualization
- **Video.js** - Video playback with overlays
- **React Hook Form + Zod** - Form handling
- **React Hook Form** - Form management

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:visual` | Visual regression tests |

## Environment Variables

Create `.env.local` from `.env.example`:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_TITLE=Volleyball Analytics Platform
```

## Project Structure Details

### Components (`src/components/`)
- `common/` - Generic reusable components (Button, Card, Modal, etc.)
- `layout/` - Layout components (Header, Sidebar, Footer)
- `charts/` - Chart components (LineChart, BarChart, Heatmap, etc.)
- `forms/` - Form components with validation
- `video/` - Video player with overlays

### Pages (`src/pages/`)
- `Dashboard` - Main dashboard
- `Matches` - Match list and detail
- `LiveMatch` - Live match view
- `Teams` - Team management
- `Players` - Player profiles and stats
- `Analytics` - Advanced analytics
- `Reports` - Report generation
- `Settings` - User/organization settings

### Hooks (`src/hooks/`)
- `useAuth` - Authentication state
- `useWebSocket` - WebSocket connection management
- `useMatches` - Match data fetching
- `useStats` - Statistics computation
- `useVideo` - Video playback controls

### Stores (`src/stores/`)
- `authStore` - Authentication state
- `matchStore` - Live match state
- `uiStore` - UI state (modals, sidebars, etc.)

### API Client (`src/api/`)
Auto-generated from OpenAPI spec using Orval:
- Type-safe API calls
- Automatic request/response typing
- React Query integration

## Styling

- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming (light/dark mode)
- **Component-specific CSS** in `*.module.css` files
- **Design tokens** in `tailwind.config.js`

## Testing

- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Visual Regression**: Chromatic/Playwright
- **Type Checking**: `tsc --noEmit`

## Docker

```bash
# Development
docker build -t volley-frontend -f Dockerfile.dev .

# Production
docker build -t volley-frontend -f Dockerfile .
```

## Deployment

- Build output: `dist/`
- Deploy to: Vercel, Netlify, or Kubernetes
- Environment variables configured at build time