'use client';

import { ReserveSun, ReserveSunProps } from './isolated/ReserveSun';
import { usePageVisibility } from '../lib/hooks/usePageVisibility';

/**
 * ReserveSunWithVisibility - Wrapper component that integrates Page Visibility API
 * 
 * This component wraps the isolated ReserveSun component and automatically
 * pauses the 3D animation when the browser tab becomes inactive, conserving
 * resources and improving performance.
 * 
 * The component passes the isPaused prop to ReserveSun based on tab visibility:
 * - Tab active: isPaused = false (animation runs)
 * - Tab inactive: isPaused = true (animation pauses)
 */
export function ReserveSunWithVisibility(props: Omit<ReserveSunProps, 'isPaused'>) {
  const isVisible = usePageVisibility();

  return <ReserveSun {...props} isPaused={!isVisible} />;
}
