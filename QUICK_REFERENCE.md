# DjedOPS Dashboard - Quick Reference

## 🚀 Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🔗 URLs

- **Development:** http://localhost:3000
- **Demo Mode:** http://localhost:3000?demo=true
- **Storybook:** (after installation) http://localhost:6006

## 📱 Testing Responsive Design

Test at these viewport sizes:
- **Mobile:** < 768px (iPhone, Android phones)
- **Tablet:** 768px - 1024px (iPad, tablets)
- **Desktop:** > 1024px (laptops, desktops)

Use browser DevTools responsive mode to test various devices.

## ⌨️ Keyboard Navigation

- **Tab:** Navigate between interactive elements
- **Enter/Space:** Activate buttons
- **Escape:** Close modals
- **Arrow Keys:** Adjust slider in simulation modal
- **Skip to main:** Press Tab on page load to reveal skip link

## 🎨 Component Overview

### Core Components
- **HeroSection:** Main dashboard area with metrics and 3D visualization
- **SystemStatus:** Displays NORMAL/CRITICAL status
- **DataGrid:** Shows reserve ratio, base reserves, oracle price
- **ReserveSun:** 3D wireframe sphere visualization
- **TerminalFeed:** Auto-scrolling transaction log
- **SimulationModal:** Interactive price simulation tool

### Utility Components
- **ErrorBanner:** Displays errors, warnings, stale data indicators
- **ErrorBoundary:** Global error catching and recovery
- **WalletConnect:** Nautilus wallet integration (future feature)

## 🎯 Features Implemented

### ✅ Responsive Design
- Mobile-first approach
- Touch-optimized controls
- Adaptive layouts
- Responsive typography

### ✅ Error Handling
- Network error recovery
- Stale data detection
- Demo mode fallback
- Global error boundary

### ✅ Accessibility
- Keyboard navigation
- ARIA labels
- Screen reader support
- Focus management
- High contrast colors
- Reduced motion support

### ✅ Performance
- Code splitting
- Dynamic imports
- 3D rendering optimization
- Bundle size optimization
- Efficient caching (SWR)
- 10-second data refresh

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Tests failing
```bash
# Update snapshots if needed
npm test -- -u

# Run specific test file
npm test -- calculations.test.ts
```

### API errors in demo mode
- Check that `public/mock-data.json` exists
- App will use fallback data if file is missing
- Look for fallback data indicator in UI

### 3D visualization not showing
- Ensure browser supports WebGL
- Check browser console for errors
- Try different browser (Chrome, Firefox recommended)

## 📊 Data Sources

### Live Mode
- **Oracle Price:** Ergo Explorer API
- **Reserves:** SigmaUSD contract address
- **Update Interval:** 10 seconds

### Demo Mode
- **Data Source:** `/public/mock-data.json`
- **Fallback:** Hardcoded demo data if file missing
- **Transactions:** Static transaction history

## 🎨 Design System

### Colors
- **Void:** #050505 (deep black background)
- **Obsidian:** #080808 (surface color)
- **Terminal:** #39FF14 (neon green primary)
- **Alert:** #FF2A2A (danger red)
- **Text Primary:** #E5E5E5 (off-white)
- **Text Secondary:** #888888 (steel grey)

### Typography
- **Display:** Unbounded/Inter (headings, buttons)
- **Mono:** JetBrains Mono/Space Mono (data, code)

### Effects
- CRT scanline overlay
- Corner L-bracket decorations
- Green/red glow effects
- Hollow text for headers
- Smooth animations

## 📝 Environment Variables

Currently no environment variables required. Future additions:
- `NEXT_PUBLIC_API_URL`: Custom API endpoint
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Override default contract

## 🔐 Security Considerations

- No sensitive data in localStorage
- API calls are client-side only
- Wallet connection requires explicit user permission
- No backend authentication required (read-only data)

## 📦 Bundle Size

Current optimizations:
- Dynamic imports for 3D components
- Tree-shaking enabled
- SWC minification
- Font subsetting
- Image optimization

Target: < 500KB gzipped ✅

## 🎭 Storybook (Pending Setup)

See `STORYBOOK_SETUP.md` for:
- Installation instructions
- Visual regression testing
- Component documentation
- CI/CD integration

**Note:** Requires Node.js 20.19+ or 22.12+

## 📚 Documentation Files

- `README.md` - Project overview
- `SETUP.md` - Setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation notes
- `STORYBOOK_SETUP.md` - Storybook installation guide
- This file - Quick reference

## 🤝 Contributing

When adding new features:
1. Create isolated components when possible
2. Add TypeScript types
3. Include ARIA labels
4. Test keyboard navigation
5. Test responsive design
6. Add unit tests
7. Create Storybook stories
8. Update documentation

## 🎓 Learning Resources

- **Next.js:** https://nextjs.org/docs
- **React Three Fiber:** https://docs.pmnd.rs/react-three-fiber
- **Tailwind CSS:** https://tailwindcss.com/docs
- **SWR:** https://swr.vercel.app/
- **Accessibility:** https://www.w3.org/WAI/WCAG21/quickref/

## 🆘 Getting Help

1. Check browser console for errors
2. Review documentation files
3. Check test files for usage examples
4. Review component prop types in code
5. Enable demo mode for testing without API

## ✨ Tips

- Use demo mode during development: `?demo=true`
- Open browser DevTools for performance metrics
- Test with keyboard-only navigation
- Enable reduced motion in OS to test animations
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Use React DevTools for component inspection

---

**Built with ❤️ for the Ergo blockchain community**
