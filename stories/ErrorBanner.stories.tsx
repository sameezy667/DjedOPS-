import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBanner } from '../components/ErrorBanner';

/**
 * ErrorBanner displays error messages and warnings with different styles.
 * 
 * Features:
 * - Error, warning, and stale data indicators
 * - User-friendly error messages
 * - Retry and dismiss actions
 * - Corner L-bracket decorations
 */
const meta = {
  title: 'Components/ErrorBanner',
  component: ErrorBanner,
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
    message: {
      control: 'text',
      description: 'Error or warning message',
    },
    type: {
      control: { type: 'radio' },
      options: ['error', 'warning', 'stale'],
      description: 'Type of banner',
    },
  },
} satisfies Meta<typeof ErrorBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Error banner with retry
 */
export const Error: Story = {
  args: {
    message: 'Network error: Unable to connect to Ergo Explorer API. Please check your internet connection.',
    type: 'error',
    onRetry: () => console.log('Retry clicked'),
    onDismiss: () => console.log('Dismiss clicked'),
  },
};

/**
 * Warning banner
 */
export const Warning: Story = {
  args: {
    message: 'Data may be outdated. Using cached information from previous request.',
    type: 'warning',
    onDismiss: () => console.log('Dismiss clicked'),
  },
};

/**
 * Stale data indicator
 */
export const Stale: Story = {
  args: {
    message: 'Data may be stale. Last update was more than 30 seconds ago.',
    type: 'stale',
    onRetry: () => console.log('Retry clicked'),
  },
};

/**
 * Rate limit error
 */
export const RateLimit: Story = {
  args: {
    message: 'Rate limit exceeded: Too many requests. Please wait a moment before retrying.',
    type: 'error',
    onRetry: () => console.log('Retry clicked'),
    onDismiss: () => console.log('Dismiss clicked'),
  },
};

/**
 * Mobile viewport test
 */
export const Mobile: Story = {
  args: {
    message: 'Network error: Unable to connect to Ergo Explorer API. Please check your internet connection.',
    type: 'error',
    onRetry: () => console.log('Retry clicked'),
    onDismiss: () => console.log('Dismiss clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
