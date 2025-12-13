# Storybook Setup for DjedOPS

## Overview

Story files have been created for isolated components to document their usage and enable visual regression testing. However, Storybook installation requires Node.js 20.19+ or 22.12+.

## Story Files Created

- `stories/DataGrid.stories.tsx` - DataGrid component stories
- `stories/ReserveSun.stories.tsx` - ReserveSun 3D component stories
- `stories/SystemStatus.stories.tsx` - SystemStatus component stories
- `stories/ErrorBanner.stories.tsx` - ErrorBanner component stories

## Installation Instructions

Once you have upgraded Node.js to version 20.19+ or 22.12+, run:

```bash
npx storybook@latest init
```

This will:
1. Install Storybook dependencies
2. Create `.storybook/main.ts` configuration
3. Create `.storybook/preview.ts` configuration
4. Add Storybook scripts to package.json

## Manual Installation (if needed)

If you prefer manual installation:

```bash
npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/blocks @storybook/test storybook
```

Then create the configuration files:

### `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### `.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'void',
      values: [
        {
          name: 'void',
          value: '#050505',
        },
        {
          name: 'obsidian',
          value: '#080808',
        },
      ],
    },
  },
};

export default preview;
```

## Running Storybook

After installation, add these scripts to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

Then run:

```bash
npm run storybook
```

## Visual Regression Testing

### Option 1: Chromatic (Recommended)

1. Sign up at https://www.chromatic.com/
2. Install: `npm install --save-dev chromatic`
3. Add script: `"chromatic": "chromatic --project-token=<your-token>"`
4. Run: `npm run chromatic`

### Option 2: Percy

1. Sign up at https://percy.io/
2. Install: `npm install --save-dev @percy/storybook`
3. Add script: `"percy:storybook": "percy storybook ./storybook-static"`
4. Build Storybook: `npm run build-storybook`
5. Run: `npm run percy:storybook`

### Option 3: Playwright with Storybook

1. Install: `npm install --save-dev @playwright/test`
2. Create test files that load Storybook stories
3. Capture screenshots for comparison

## Component Documentation

Each story includes:
- Component props documentation
- Multiple states (Normal, Critical, Mobile, etc.)
- Interactive controls for testing different values
- Viewport configurations for responsive testing

## Testing Scenarios

The stories cover:
- Normal state (reserve ratio > 400%)
- Critical state (reserve ratio < 400%)
- Different data ranges
- Mobile viewports (< 768px)
- Tablet viewports (768px - 1024px)
- Desktop viewports (> 1024px)
- Error states
- Warning states
- Stale data indicators

## CI Integration

Once visual regression testing is set up, integrate it into your CI pipeline:

```yaml
# Example GitHub Actions workflow
name: Visual Regression Tests
on: [push, pull_request]
jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.19'
      - run: npm ci
      - run: npm run build-storybook
      - run: npm run chromatic # or percy:storybook
```
