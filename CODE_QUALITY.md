# DjedOps - Code Quality & Architecture

## 📐 Architecture Overview

This Next.js 14 application follows a clean architecture pattern with clear separation of concerns:

```
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── isolated/          # Pure components with no global state
│   └── __tests__/         # Component unit tests
├── lib/                    # Business logic & utilities
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Pure utility functions
│   ├── constants.ts       # Application constants
│   ├── types.ts           # TypeScript type definitions
│   └── store.ts           # Zustand global state
├── public/                 # Static assets
└── stories/               # Storybook component stories
```

## 🎯 Code Quality Standards

### TypeScript Best Practices

1. **Strict Type Safety**
   - All functions have explicit return types
   - No `any` types (use `unknown` when necessary)
   - Interfaces over types for objects
   - Const assertions for immutable data

2. **Component Props**
   ```typescript
   // ✅ Good: Explicit interface
   interface ComponentProps {
     title: string;
     count: number;
     onAction: () => void;
   }
   
   // ❌ Avoid: Inline types
   function Component({ title, count }: { title: string; count: number }) {}
   ```

### Component Design

1. **Isolated Components** (`components/isolated/`)
   - No global state dependencies
   - Accept all data via props
   - Fully testable in isolation
   - Example: `DataGrid.tsx`, `ReserveSun.tsx`

2. **Container Components**
   - Manage state and side effects
   - Connect to global store
   - Handle API calls
   - Example: `HeroSection.tsx`

3. **Naming Conventions**
   - Components: PascalCase (`HeroSection.tsx`)
   - Hooks: camelCase with `use` prefix (`useDjedData.ts`)
   - Utils: camelCase (`dsiCalculator.ts`)
   - Constants: SCREAMING_SNAKE_CASE

### State Management

**Zustand Store** (`lib/store.ts`)
- Single source of truth for global state
- Selectors for performance optimization
- Immutable state updates

```typescript
// ✅ Good: Selective subscription
const displayRatio = useAppStore(state => state.displayRatio);

// ❌ Avoid: Full store subscription
const store = useAppStore();
```

### Constants & Configuration

All magic numbers are centralized in `lib/constants.ts`:

```typescript
import { RESERVE_RATIO, API_CONFIG } from '@/lib/constants';

// ✅ Good
if (ratio < RESERVE_RATIO.CRITICAL_THRESHOLD) { ... }

// ❌ Avoid
if (ratio < 400) { ... }
```

### Error Handling

1. **API Calls**
   - SWR for data fetching with automatic retry
   - Error boundaries for component crashes
   - User-friendly error messages

2. **Runtime Errors**
   - Defensive programming with null checks
   - Early returns for invalid states
   - Console warnings for development

### Performance

1. **Code Splitting**
   - Dynamic imports for heavy components
   - Lazy loading for modals and charts

2. **Memoization**
   - `useMemo` for expensive calculations
   - `useCallback` for event handlers passed as props
   - React.memo for pure components

3. **Performance Mode**
   - Reduced animations for low-end devices
   - Configurable via `highPerformanceMode` flag

## 📝 Documentation Standards

### JSDoc Comments

All public functions must have JSDoc:

```typescript
/**
 * Calculates the reserve ratio for the Djed protocol
 * 
 * @param baseReserves - Total ERG held in reserve pool
 * @param oraclePrice - Current ERG price in USD
 * @param sigUsdCirculation - Total SigUSD in circulation
 * @returns Reserve ratio as a percentage
 * 
 * @example
 * const ratio = calculateReserveRatio(1000000, 1.45, 500000);
 * // Returns: 290.0
 */
export function calculateReserveRatio(
  baseReserves: number,
  oraclePrice: number,
  sigUsdCirculation: number
): number {
  // Implementation
}
```

### Component Documentation

```typescript
/**
 * HeroSection - Main hero section of the dashboard
 * 
 * Features:
 * - Two-column responsive layout
 * - Real-time data display with animations
 * - Interactive 3D visualization
 * 
 * @component
 * @example
 * <HeroSection
 *   reserveRatio={870}
 *   baseReserves={15000000}
 *   oraclePrice={1.45}
 *   systemStatus="NORMAL"
 * />
 */
```

## 🧪 Testing

### Unit Tests

Located in `__tests__/` directories alongside source files.

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

### Test Coverage Requirements

- Utilities: 100% coverage
- Business logic: 90%+ coverage
- Components: 70%+ coverage

## 🚀 Build & Deployment

### Development

```bash
npm run dev                # Start dev server
npm run lint              # Lint check
npm run build             # Production build
```

### Environment Variables

None required for basic functionality. Optional:
- `NEXT_PUBLIC_API_URL` - Custom API endpoint

## 📦 Dependencies

### Production
- `next` - React framework
- `react` / `react-dom` - UI library
- `zustand` - State management
- `swr` - Data fetching
- `framer-motion` - Animations
- `lucide-react` - Icons

### Development
- `typescript` - Type safety
- `tailwindcss` - Styling
- `jest` - Testing framework
- `@testing-library/react` - Component testing

## 🔐 Security

1. **Input Validation**
   - All user inputs are sanitized
   - Type checking at runtime for API responses

2. **XSS Prevention**
   - React's built-in XSS protection
   - No `dangerouslySetInnerHTML` usage

3. **Dependencies**
   - Regular `npm audit` checks
   - Automated Dependabot updates

## 🎨 Styling Conventions

### Tailwind CSS

```tsx
// ✅ Good: Semantic grouping
<div className="
  flex items-center gap-4
  px-6 py-4
  bg-void border border-terminal
  rounded-lg
  hover:bg-terminal/10
  transition-colors
">

// ❌ Avoid: Random order
<div className="flex rounded-lg transition-colors hover:bg-terminal/10 gap-4 bg-void px-6 items-center border-terminal py-4 border">
```

### Color System

Use Tailwind config variables:
- `bg-void` - Background black
- `text-terminal` - Terminal green
- `text-alert` - Critical red
- `text-textPrimary` - Default text

## 🤝 Contributing

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] All functions have JSDoc comments
- [ ] Constants used instead of magic numbers
- [ ] Unit tests for new logic
- [ ] No console.log in production code
- [ ] Responsive design tested
- [ ] Performance impact evaluated
- [ ] Accessibility standards met (ARIA labels)

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-feature

# Commit with conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"

# Push and create PR
git push origin feature/new-feature
```

## 📊 Performance Metrics

- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Bundle Size: < 500KB (gzipped)

## 🐛 Debugging

### Common Issues

1. **Hydration Errors**
   - Cause: Server/client mismatch
   - Solution: Use `'use client'` directive

2. **State Not Updating**
   - Cause: Zustand selector issue
   - Solution: Check selector function

3. **API Errors**
   - Check `?demo=true` for offline mode
   - Verify API endpoints in Network tab

---

**Last Updated:** December 13, 2025
**Maintained By:** The Stable Order
**License:** GPL v3
