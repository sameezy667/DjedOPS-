# DjedOps Dashboard

Mission-critical visualization interface for the Djed stablecoin protocol on the Ergo blockchain.

![Financial Brutalism Design](https://img.shields.io/badge/Design-Financial%20Brutalism-39FF14?style=for-the-badge)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## 🎯 Overview

DjedOps Dashboard provides real-time monitoring and simulation capabilities for the Djed algorithmic stablecoin protocol. The interface displays critical metrics including reserve ratios, price oracles, and transaction feeds with a distinctive **Financial Brutalism** design language.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Mode (Offline/Testing)

For offline demonstrations or judging environments without API access:

```bash
# Append ?demo=true to the URL
http://localhost:3000?demo=true
```

**Demo mode features:**
- Uses mock data from `public/mock-data.json`
- Simulates real-time updates
- Perfect for presentations and testing
- No external API dependencies

### Testing

Run all tests (41 unit tests):

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

### Production Build

```bash
npm run build
npm start
```

## 📊 Features

### Real-Time Monitoring
- **Reserve Ratio Display**: Live calculation of `(Base Reserves × ERG Price) / (SigUSD Supply × 100)`
- **System Status**: Visual indicator (NORMAL ≥400% | CRITICAL <400%)
- **Price Oracle**: Current ERG/USD price from Ergo Explorer API
- **Transaction Feed**: Live terminal-style event log

### 🎯 NEW: Arbitrage Sniper (Market Opportunity Detection)
Automated detection of arbitrage opportunities between protocol and DEX prices:

- **Real-Time Monitoring**: Compares protocol mint/redeem price vs DEX market price
- **Smart Signals**:
  - 🟢 **MINT DJED**: DEX price >0.5% above protocol (buy ERG, mint DJED, sell on DEX)
  - 🔴 **REDEEM DJED**: DEX price >0.5% below protocol (buy DJED on DEX, redeem for ERG)
  - ⚪ **NO CLEAR EDGE**: Spread within threshold
- **Visual Feedback**: Pulsing glow effects on profitable opportunities
- **Spread Calculation**: Live display of absolute and percentage differences

### 🛡️ NEW: Sentinel Mode (Peg Protection Bot)
Automated guardian that monitors critical conditions and triggers emergency protocols:

- **Configurable Triggers**:
  - Auto-redeem when reserve ratio < 400%
  - Volatility alerts on rapid price movements
  - Custom balance monitoring
- **Multi-Channel Notifications**:
  - Prominent in-app banner with pulsing alert
  - Browser notifications (if permitted)
  - Terminal feed event logging
  - Border flash visual effect
- **Pulsing Shield Icon**: Visual indicator when armed
- **Simulation Mode**: All actions are front-end only (no real transactions)

### 💥 NEW: Risk Scenarios (Preset Stress Tests)
One-click stress test scenarios for realistic failure mode testing:

- **FLASH CRASH**: Instant 50% price drop simulation
  - Tests protocol behavior during extreme market crashes
  - Immediate ratio recalculation
  
- **ORACLE FREEZE**: Simulate oracle feed failure
  - Locks price at current value
  - Disables manual slider
  - Warning banner: "ORACLE FEED UNRESPONSIVE"
  
- **BANK RUN**: Force reserve ratio below 400%
  - Instant CRITICAL state trigger
  - Full theme switch to red
  - Triggers Sentinel (if armed)
  - Tests emergency protocols

- **Reset to Live**: One-click return to normal state
- **Terminal Logging**: All scenarios logged with timestamps

### Interactive Price Simulation (Enhanced)
Click **"LAUNCH SIMULATION"** to access enhanced simulation tools:

1. **Manual Slider**: Adjust ERG price ($0.10 - $10.00)
2. **Risk Scenarios**: Three preset stress tests (see above)
3. **Real-Time Calculation**: See how different prices affect the reserve ratio
4. **Visual Feedback**: Watch the system status change between NORMAL (green) and CRITICAL (red)
5. **Keyboard Controls**: Use arrow keys to fine-tune the slider
6. **Mode Indicators**: Clear labeling of active scenarios

**Formula Verification:**
- Open browser console to see detailed calculation logs
- Format: `(baseReserves * price) / (sigUsdSupply * 100)`
- All intermediate values are displayed for transparency

### Responsive Design
- **Mobile-First**: Touch-optimized controls
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Accessibility**: WCAG AA compliant, keyboard navigation, ARIA labels

## 🎨 Design System

### Financial Brutalism Philosophy
High contrast, monospace data, terminal-inspired aesthetics with zero fluff.

#### Colors
- **Deep Void Black** (`#050505`) - Background
- **Obsidian** (`#080808`) - Surface
- **Neon Terminal Green** (`#39FF14`) - Primary/NORMAL state
- **Alert Red** (`#FF2A2A`) - CRITICAL state
- **Off-white** (`#E5E5E5`) - Primary text
- **Steel Grey** (`#888888`) - Secondary text

#### Typography
- **Display**: Unbounded, Inter (weights: 700, 900)
- **Monospace**: JetBrains Mono, Space Mono

#### Visual Effects
- CRT scanline overlay
- Hollow text effect (stroke with transparent fill)
- Green/Red glow text shadows
- Corner L-bracket decorations
- Backdrop blur on modals

## 🏗️ Tech Stack

- **Framework**: Next.js 14.2.33 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **Animations**: Framer Motion 12.23.25
- **State Management**: Zustand 5.0.9
- **Data Fetching**: SWR 2.3.7 with 10s refresh
- **Testing**: Jest + React Testing Library (41 tests passing)

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts, metadata, error boundary
│   ├── page.tsx            # Main dashboard page with demo mode toggle
│   ├── globals.css         # Global styles and design system variables
│   └── api/
│       └── djed/
│           └── route.ts    # CORS proxy for Ergo Explorer API
├── components/
│   ├── HeroSection.tsx              # Main dashboard section
│   ├── SimulationModal.tsx          # Interactive price simulation with scenarios
│   ├── ScenarioControls.tsx         # Risk scenario preset buttons (NEW)
│   ├── MarketOpportunityCard.tsx    # Arbitrage signal display (NEW)
│   ├── SentinelPanel.tsx            # Sentinel config & toggle UI (NEW)
│   ├── SentinelTrigger.tsx          # Trigger notifications & effects (NEW)
│   ├── SystemStatus.tsx             # NORMAL/CRITICAL status display
│   ├── TerminalFeed.tsx             # Transaction event log
│   ├── WalletBalance.tsx            # ERG balance display
│   ├── WalletConnect.tsx            # Wallet connection button
│   ├── ErrorBanner.tsx              # Error/warning display
│   ├── ErrorBoundary.tsx            # Global error catching
│   └── isolated/
│       ├── ReserveSun.tsx           # Health visualization (CSS-based)
│       └── DataGrid.tsx             # Data display grid
├── lib/
│   ├── calculations.ts              # Reserve ratio formulas with logging
│   ├── demo-service.ts              # Mock data management
│   ├── store.ts                     # Zustand state (+ sentinel, scenarios)
│   ├── types.ts                     # TypeScript interfaces (extended)
│   └── hooks/
│       ├── useDjedData.ts           # Data fetching hook
│       ├── useDexPrice.ts           # DEX price & arbitrage calc (NEW)
│       ├── usePageVisibility.ts     # Visibility detection
│       └── usePrefersReducedMotion.ts  # Motion preference
├── public/
│   └── mock-data.json      # Demo mode data
├── tailwind.config.ts      # Tailwind + Financial Brutalism theme
└── jest.config.js          # Testing configuration
```

## 🧪 Testing

All 41 tests passing:
- **Unit Tests**: Calculation functions with edge cases
- **Component Tests**: React component rendering and interactions
- **Integration Tests**: Simulation modal behavior
- **Property-Based Tests**: Using fast-check for exhaustive coverage

## 🔧 Development Notes

### API Integration
- **Live Mode**: Fetches from Ergo Explorer API via `/api/djed` proxy
- **Demo Mode**: Uses `public/mock-data.json` when `?demo=true`
- **CORS Handling**: Next.js API route proxies external requests
- **Error Handling**: Graceful fallback to demo data on API failures

### Performance Optimizations
- Code splitting with dynamic imports
- SWR deduplication (5s interval)
- Image optimization
- Bundle size monitoring

### Accessibility
- Keyboard navigation with visible focus indicators
- ARIA live regions for dynamic content
- Skip navigation link
- Reduced motion support
- Color contrast WCAG AA compliant

## 🧪 Testing & Documentation

### Run All Tests
```bash
npm test
```
All 41 tests passing ✅

### New Features Testing Guide
See **[NEW_FEATURES_TESTING.md](./NEW_FEATURES_TESTING.md)** for comprehensive testing guide including:
- Arbitrage Sniper usage and testing
- Sentinel Mode configuration and triggers
- Risk Scenarios step-by-step testing
- Integration test flows
- Common issues and fixes
- Demo scripts for presentations

### Quick Feature Reference

#### Arbitrage Sniper
- **Location**: Below HeroSection, titled "Arbitrage Monitor"
- **Signals**: MINT DJED (green) | REDEEM DJED (red) | NO CLEAR EDGE (gray)
- **Threshold**: ±0.5% spread between DEX and protocol price
- **Refresh**: Every 15 seconds

#### Sentinel Mode
- **Activation**: Click "SENTINEL MODE" button (top-right)
- **Config Options**: Auto-redeem, volatility alerts, balance tracking
- **Visual Indicators**: Pulsing green shield when armed
- **Trigger Conditions**: Reserve ratio < 400% (if enabled)
- **Notifications**: Banner, border flash, terminal log, browser notification

#### Risk Scenarios
- **Access**: Inside "LAUNCH SIMULATION" modal
- **FLASH CRASH**: -50% price, instant
- **ORACLE FREEZE**: Lock price, disable slider
- **BANK RUN**: Force ratio to 399%, trigger CRITICAL
- **Reset**: "RESET TO LIVE" button in scenario controls

## 🚀 Production Deployment

### Environment Variables
No environment variables required. All configuration is compile-time.

### Build Command
```bash
npm run build
```

### Output
Static export suitable for CDN deployment or Docker containerization.

### Demo Mode for Judging
For environments without external API access:
```
https://your-domain.com?demo=true
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This project follows strict Financial Brutalism design principles. All contributions should maintain:
- High contrast (3:1 minimum)
- Monospace fonts for data
- Terminal green (#39FF14) and alert red (#FF2A2A) color scheme
- Zero gradients, shadows only for functional glow effects
- Brutalist corner brackets on all containers

## 📚 Additional Documentation

- **[NEW_FEATURES_TESTING.md](./NEW_FEATURES_TESTING.md)** - Complete guide for new features
- **[SETUP.md](./SETUP.md)** - Development environment setup

## License

MIT
