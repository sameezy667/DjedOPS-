'use client';

import { DataGrid } from './isolated/DataGrid';
import { ReserveSunWithVisibility } from './ReserveSunWithVisibility';
import { SystemStatus } from './SystemStatus';

export interface HeroSectionProps {
  reserveRatio: number;
  baseReserves: number;
  oraclePrice: number;
  systemStatus: 'NORMAL' | 'CRITICAL';
  isSimulated?: boolean; // Whether the data is from simulation
  contractAddress?: string;
  onLaunchSimulation: () => void;
  onInspectProtocol?: () => void;
}

/**
 * HeroSection - Main hero section of the dashboard
 * 
 * Features:
 * - Two-column layout (data grid left, 3D visualization right)
 * - Integrates SystemStatus, DataGrid, and ReserveSun components
 * - Action buttons: "LAUNCH SIMULATION" and "VIEW CONTRACT"
 * - Responsive layout that stacks vertically on mobile (< 768px)
 * 
 * Requirements: 10.1, 10.3
 */
export function HeroSection({
  reserveRatio,
  baseReserves,
  oraclePrice,
  systemStatus,
  contractAddress,
  onLaunchSimulation,
  onInspectProtocol,
}: HeroSectionProps) {
  /**
   * Opens Ergo Explorer contract address page in a new browser tab
   * Requirements: 7.1, 7.2, 7.3
   */
  const handleViewContract = () => {
    if (contractAddress) {
      window.open(`https://explorer.ergoplatform.com/en/addresses/${contractAddress}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="relative w-full min-h-screen py-2 md:py-12 overflow-hidden">
      {/* Horizontal green line separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#39FF14]/30"></div>
      
      {/* Container with responsive padding */}
      <div className="px-2 sm:px-4 md:px-8 lg:px-12">
        {/* Two-column layout: Title/Data (left 7 cols) and Reserve Visualization (right 5 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-12 lg:gap-16 mb-3 md:mb-12">
          {/* Left Column: Title + Data Grid (7 columns) */}
          <div className="md:col-span-7 flex flex-col justify-center order-1">
            {/* Massive Title */}
            <div className="mb-2 md:mb-8">
              {/* Title - Left Aligned */}
              <h1 className="font-display font-black text-left mb-1 md:mb-4 title-flicker" style={{ fontSize: 'clamp(1.5rem, 7vw, 8rem)', lineHeight: '0.9', letterSpacing: '-0.05em', filter: 'drop-shadow(0 0 25px rgba(57, 255, 20, 0.3))' }}>
                <span className="text-white">DJED</span>
                <br />
                <span className="text-bloom-green" style={{ WebkitTextStroke: '1.5px #39FF14', WebkitTextFillColor: 'transparent' }}>OPS</span>
              </h1>
              
              {/* Tagline */}
              <div className="inline-block px-2 py-0.5 border border-[#39FF14]/40 mt-1">
                <span className="text-[#39FF14] text-[9px] sm:text-xs font-mono tracking-widest">STABILITY + RESILIENCE</span>
              </div>
            </div>

            {/* System Status */}
            <div className="mb-2 md:mb-8">
              <SystemStatus systemStatus={systemStatus} />
            </div>

          {/* Data Grid */}
          <DataGrid
            reserveRatio={reserveRatio}
            baseReserves={baseReserves}
            oraclePrice={oraclePrice}
            onInspectProtocol={onInspectProtocol}
          />
        </div>

          {/* Right Column: Reserve Visualization (5 columns) */}
          <div className="md:col-span-5 flex items-center justify-center order-2">
            <div className="w-full max-w-[280px] sm:max-w-sm md:max-w-none relative h-[180px] sm:h-[280px] md:h-[450px] lg:h-[500px]">
            {/* Radial gradient glow behind radar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-gradient-radial from-red-500/20 via-red-500/10 to-transparent rounded-full blur-2xl" aria-hidden="true"></div>
            </div>
            <ReserveSunWithVisibility
              reserveRatio={reserveRatio}
              systemStatus={systemStatus}
            />
            </div>
          </div>
        </div>

        {/* Action Buttons - Aura Style */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center max-w-7xl mx-auto mt-3 md:mt-16">
        {/* LAUNCH SIMULATOR - Green border button */}
        <button
          onClick={onLaunchSimulation}
          className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-3 border-2 border-[#39FF14] text-[#39FF14] font-bold text-[10px] sm:text-sm font-mono tracking-wider hover:bg-[#39FF14] hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group"
          aria-label="Launch price simulation modal"
        >
          <span className="text-[#39FF14] group-hover:text-black">▶</span>
          LAUNCH SIMULATOR
        </button>

        {/* VIEW CONTRACT - Transparent with border */}
        <button
          onClick={handleViewContract}
          disabled={!contractAddress}
          className={`w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-3 border border-[#39FF14]/30 font-mono text-[10px] sm:text-sm tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
            contractAddress
              ? 'text-[#E5E5E5] hover:border-[#39FF14] hover:text-[#39FF14]'
              : 'text-[#E5E5E5]/30 cursor-not-allowed'
          }`}
        >
          <span>◆</span>
          VIEW CONTRACT
        </button>
        </div>
      </div>
    </section>
  );
}
