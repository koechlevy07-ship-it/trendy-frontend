# Volleyball Analytics Platform - Mobile

React Native mobile application for the Volleyball Analytics Platform.

## Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── hooks/            # Custom hooks
│   ├── stores/           # State management
│   ├── api/              # API client
│   ├── utils/            # Helpers, formatters
│   ├── styles/           # Styles, theme
│   └── types/            # TypeScript types
├── android/              # Android native code
├── ios/                  # iOS native code
├── package.json
├── tsconfig.json
├── metro.config.js
├── babel.config.js
└── README.md
```

## Tech Stack

- **React Native** 0.74+ with TypeScript
- **Expo** (optional, for managed workflow)
- **React Navigation 6** - Navigation
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **React Native Reanimated** - Animations
- **React Native Gesture Handler** - Gestures
- **React Native Video** - Video playback

## Quick Start

```bash
cd mobile
npm install
npx expo start  # or npx react-native start
```

## Platform Setup

### iOS
```bash
cd ios && pod install
npx expo run:ios
```

### Android
```bash
npx expo run:android
```

## Environment Variables

Create `.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:8000
```

## Building

### Development
```bash
npx expo start --dev-client
```

### Production
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Testing

```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests (Detox)
npm run lint          # ESLint
npm run typecheck     # TypeScript check
```

## Deployment

- **EAS Build** for app store builds
- **Expo Updates** for OTA updates
- **TestFlight / Play Console** for distribution