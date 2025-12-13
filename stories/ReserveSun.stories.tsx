import type { Meta, StoryObj } from '@storybook/react';
import { ReserveSun } from '../components/isolated/ReserveSun';

/**
 * ReserveSun renders a 3D wireframe sphere that represents the health of the Djed protocol.
 * 
 * Features:
 * - NORMAL state: Green wireframe sphere with smooth rotation
 * - CRITICAL state: Red sphere with vertex displacement distortion
 * - Pause/resume based on isPaused prop
 * - Vertex displacement shader for CRITICAL state
 */
const meta = {
  title: 'Components/ReserveSun',
  component: ReserveSun,
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
    systemStatus: {
      control: { type: 'radio' },
      options: ['NORMAL', 'CRITICAL'],
      description: 'System health status',
    },
    isPaused: {
      control: { type: 'boolean' },
      description: 'Whether animation is paused',
    },
  },
} satisfies Meta<typeof ReserveSun>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Normal state - Green rotating sphere
 */
export const Normal: Story = {
  args: {
    reserveRatio: 567.89,
    systemStatus: 'NORMAL',
    isPaused: false,
  },
};

/**
 * Critical state - Red distorted sphere
 */
export const Critical: Story = {
  args: {
    reserveRatio: 325.50,
    systemStatus: 'CRITICAL',
    isPaused: false,
  },
};

/**
 * Paused animation
 */
export const Paused: Story = {
  args: {
    reserveRatio: 567.89,
    systemStatus: 'NORMAL',
    isPaused: true,
  },
};

/**
 * Critical state paused
 */
export const CriticalPaused: Story = {
  args: {
    reserveRatio: 325.50,
    systemStatus: 'CRITICAL',
    isPaused: true,
  },
};

/**
 * Mobile viewport test
 */
export const Mobile: Story = {
  args: {
    reserveRatio: 567.89,
    systemStatus: 'NORMAL',
    isPaused: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
