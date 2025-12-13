import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid } from '../components/isolated/DataGrid';

/**
 * DataGrid displays key Djed protocol metrics with terminal-inspired styling.
 * 
 * Features:
 * - Monospace typography for all numbers
 * - Corner L-bracket decorations
 * - Animated count-up effect on initial load
 * - Green glow text shadow on values
 */
const meta = {
  title: 'Components/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'void',
      values: [
        { name: 'void', value: '#050505' },
        { name: 'obsidian', value: '#080808' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    reserveRatio: {
      control: { type: 'number', min: 0, max: 1000, step: 10 },
      description: 'Reserve ratio percentage',
    },
    baseReserves: {
      control: { type: 'number', min: 0, max: 100000000, step: 100000 },
      description: 'Base reserves in ERG',
    },
    oraclePrice: {
      control: { type: 'number', min: 0.1, max: 20, step: 0.1 },
      description: 'Oracle price in USD',
    },
  },
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Normal state - Reserve ratio above 400%
 */
export const Normal: Story = {
  args: {
    reserveRatio: 567.89,
    baseReserves: 12500000,
    oraclePrice: 1.45,
  },
};

/**
 * Critical state - Reserve ratio below 400%
 */
export const Critical: Story = {
  args: {
    reserveRatio: 325.50,
    baseReserves: 8000000,
    oraclePrice: 0.95,
  },
};

/**
 * Low reserves scenario
 */
export const LowReserves: Story = {
  args: {
    reserveRatio: 198.25,
    baseReserves: 500000,
    oraclePrice: 1.20,
  },
};

/**
 * High reserves scenario
 */
export const HighReserves: Story = {
  args: {
    reserveRatio: 850.00,
    baseReserves: 50000000,
    oraclePrice: 2.50,
  },
};

/**
 * Mobile viewport test
 */
export const Mobile: Story = {
  args: {
    reserveRatio: 567.89,
    baseReserves: 12500000,
    oraclePrice: 1.45,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
