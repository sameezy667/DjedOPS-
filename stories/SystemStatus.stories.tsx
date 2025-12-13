import type { Meta, StoryObj } from '@storybook/react';
import { SystemStatus } from '../components/SystemStatus';

/**
 * SystemStatus displays the current system health status with appropriate styling.
 * 
 * Features:
 * - NORMAL: Green glow effect
 * - CRITICAL: Red pulse animation
 * - Smooth transition animation when status changes
 */
const meta = {
  title: 'Components/SystemStatus',
  component: SystemStatus,
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
    systemStatus: {
      control: { type: 'radio' },
      options: ['NORMAL', 'CRITICAL'],
      description: 'System health status',
    },
  },
} satisfies Meta<typeof SystemStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Normal status - Green glow
 */
export const Normal: Story = {
  args: {
    systemStatus: 'NORMAL',
  },
};

/**
 * Critical status - Red pulse
 */
export const Critical: Story = {
  args: {
    systemStatus: 'CRITICAL',
  },
};

/**
 * Mobile viewport test
 */
export const Mobile: Story = {
  args: {
    systemStatus: 'NORMAL',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
