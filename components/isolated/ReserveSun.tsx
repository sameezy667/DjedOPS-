'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useAppStore } from '@/lib/store';

export interface ReserveSunProps {
  reserveRatio: number;
  systemStatus: 'NORMAL' | 'CRITICAL';
  isPaused?: boolean;
}

/**
 * ReserveSun - System health visualization component
 * 
 * Renders a circular visualization that represents the health of the Djed protocol:
 * - NORMAL state (ratio >= 400%): Green pulsing circle with smooth rotation
 * - CRITICAL state (ratio < 400%): Red pulsing circle with distortion effect
 * 
 * Features:
 * - Smooth rotation animation
 * - Pause/resume based on isPaused prop
 * - Respects reduced motion preferences
 * - Performance mode support for low-end devices
 * - CSS-based for maximum compatibility
 * 
 * Performance Mode Optimizations:
 * - Reduced ring count (2 instead of 4)
 * - Simplified grid (4 lines instead of 8)
 * - Disabled glow effects (box-shadow)
 * - Slower rotation speeds (2x duration)
 * - Reduced pulse animations
 * - Lower distortion effects
 * 
 * This component is isolated and accepts only props (no global state).
 * Performance mode state is accessed directly from store for optimization.
 * 
 * Future Three.js Integration:
 * The performance mode infrastructure is ready for Three.js upgrade:
 * - High perf: SphereGeometry(1, 16, 16), no shadows, skip frames
 * - Visual mode: SphereGeometry(1, 64, 64), full shadows, 60fps
 */
export function ReserveSun({ reserveRatio, systemStatus, isPaused = false }: ReserveSunProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const highPerformanceMode = useAppStore((state) => state.highPerformanceMode);
  const shouldPause = isPaused || prefersReducedMotion;
  
  // Determine visual state from reserve ratio
  const visualState: 'SAFE' | 'NORMAL' | 'CRITICAL' = 
    reserveRatio > 800 ? 'SAFE' : 
    reserveRatio >= 400 ? 'NORMAL' : 
    'CRITICAL';
  
  // Visual configuration based on state and performance mode
  const configs = {
    SAFE: {
      color: '#00F0FF',
      rotationDuration: highPerformanceMode ? 60 : 30, // Slower rotation in perf mode
      pulseScale: highPerformanceMode ? 1.0 : 1.0,
      distortion: 0,
      glowIntensity: highPerformanceMode ? 8 : 15, // Reduced glow
    },
    NORMAL: {
      color: '#39FF14',
      rotationDuration: highPerformanceMode ? 40 : 20,
      pulseScale: highPerformanceMode ? 1.02 : 1.05, // Reduced scale animation
      distortion: 0,
      glowIntensity: highPerformanceMode ? 10 : 20,
    },
    CRITICAL: {
      color: '#FF2A2A',
      rotationDuration: highPerformanceMode ? 16 : 8, // Slower but still urgent
      pulseScale: highPerformanceMode ? 1.05 : 1.1,
      distortion: highPerformanceMode ? 0.08 : 0.15, // Reduced distortion
      glowIntensity: highPerformanceMode ? 15 : 30,
    },
  };
  
  const config = configs[visualState];
  const { color, rotationDuration, pulseScale, distortion, glowIntensity } = config;
  
  // Number of rings - reduced in performance mode
  const ringCount = highPerformanceMode ? 2 : 4;
  
  // Grid density - reduced in performance mode
  const gridLines = highPerformanceMode ? 4 : 8;
  
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none md:pointer-events-auto touch-none">
      <motion.div
        className="relative"
        style={{ 
          width: '200px', 
          height: '200px',
          filter: visualState === 'CRITICAL' ? 'blur(1px)' : 'none', // Slight blur for critical
        }}
        animate={!shouldPause ? { rotate: 360 } : {}}
        transition={{
          duration: rotationDuration,
          repeat: Infinity,
          ease: visualState === 'CRITICAL' ? 'easeInOut' : 'linear', // Erratic motion for critical
        }}
      >
        {/* Outer rings with distortion */}
        {[...Array(ringCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${color}`,
              opacity: 0.3 - i * 0.05,
              transform: `scale(${1 + i * 0.15})`,
              boxShadow: highPerformanceMode ? 'none' : `0 0 ${glowIntensity}px ${color}`,
              // Distortion for critical state - irregular border radius
              borderRadius: visualState === 'CRITICAL' 
                ? `${50 - distortion * 100 * Math.sin(i)}% ${50 + distortion * 100 * Math.cos(i)}% ${50 - distortion * 100 * Math.sin(i + 1)}% ${50 + distortion * 100 * Math.cos(i + 1)}%`
                : '50%',
            }}
            animate={!shouldPause && visualState !== 'SAFE' && !highPerformanceMode ? {
              scale: [1 + i * 0.15, 1 + i * 0.15 * pulseScale, 1 + i * 0.15],
              opacity: [0.3 - i * 0.05, 0.5 - i * 0.05, 0.3 - i * 0.05],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}
        
        {/* Main circle with distortion */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            border: `3px solid ${color}`,
            boxShadow: `0 0 ${glowIntensity * 1.5}px ${color}66`,
            // Distorted border radius for critical state
            borderRadius: visualState === 'CRITICAL'
              ? '47% 53% 45% 55%' // Irregular "spiky" shape
              : '50%',
          }}
          animate={!shouldPause && visualState !== 'SAFE' ? {
            boxShadow: [
              `0 0 ${glowIntensity * 1.5}px ${color}66`,
              `0 0 ${glowIntensity * 2.5}px ${color}99`,
              `0 0 ${glowIntensity * 1.5}px ${color}66`,
            ],
            scale: visualState === 'CRITICAL' ? [1, 1.03, 0.97, 1] : [1, pulseScale, 1], // Erratic scale for critical
          } : {}}
          transition={{
            duration: visualState === 'CRITICAL' ? 1.5 : 2,
            repeat: Infinity,
            ease: visualState === 'CRITICAL' ? [0.4, 0, 0.6, 1] : 'easeInOut', // Irregular easing for critical
          }}
        >
          {/* Inner grid pattern */}
          <div className="w-full h-full relative overflow-hidden rounded-full">
            {[...Array(gridLines)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0"
                style={{
                  top: `${(i + 1) * (100 / (gridLines + 1))}%`,
                  height: '1px',
                  background: color,
                  opacity: 0.3,
                }}
              />
            ))}
            {[...Array(gridLines)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${(i + 1) * (100 / (gridLines + 1))}%`,
                  width: '1px',
                  background: color,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
          
          {/* Center dot with state-based pulse */}
          <div 
            className="absolute w-4 h-4" 
            style={{ 
              background: color, 
              boxShadow: highPerformanceMode ? 'none' : `0 0 ${glowIntensity}px ${color}`,
              borderRadius: visualState === 'CRITICAL' ? '40% 60% 50% 50%' : '50%', // Distorted for critical
            }}
          >
            {!shouldPause && visualState !== 'SAFE' && !highPerformanceMode && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: color,
                  boxShadow: `0 0 ${glowIntensity * 2}px ${color}`,
                  borderRadius: visualState === 'CRITICAL' ? '40% 60% 50% 50%' : '50%',
                }}
                animate={{
                  scale: visualState === 'CRITICAL' ? [1, 1.8, 1.4, 1] : [1, 1.5, 1], // Erratic pulse for critical
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: visualState === 'CRITICAL' ? 0.8 : 1.2,
                  repeat: Infinity,
                  ease: visualState === 'CRITICAL' ? [0.4, 0, 0.6, 1] : 'easeOut',
                }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// CSS-based visualization - no 3D code needed