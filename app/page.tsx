'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { SimulationModal } from '../components/SimulationModal';
import { WhitePaperModal } from '../components/WhitePaperModal';
import { TerminalFeed } from '../components/TerminalFeed';
import { ApiStatusBar, ApiErrorBanner } from '../components/ApiStatus';
import { ErrorBanner } from '../components/ErrorBanner';
import { MarketOpportunityCard } from '../components/MarketOpportunityCard';
import { StabilityGauge } from '../components/StabilityGauge';
import { WalletConnect } from '../components/WalletConnect';
import { WalletBalance } from '../components/WalletBalance';
import { SentinelToggle, SentinelPanel, SentinelShield } from '../components/SentinelPanel';
import { PerformanceToggle } from '../components/PerformanceToggle';
import { KYAModal } from '../components/KYAModal';
import { ShareButton } from '../components/ShareButton';
import ReserveHistoryChart from '../components/ReserveHistoryChart';
import StressTest from '../components/StressTest';
import ProtocolInspector from '../components/ProtocolInspector';
import OracleConsensus from '../components/OracleConsensus';
import { SentinelTriggerBanner, DashboardBorderFlash } from '../components/SentinelTrigger';
import { useAppStore } from '@/lib/store';
import { useDjedData } from '@/lib/hooks/useDjedData';
import { useTransactionFeed } from '@/lib/hooks/useTransactionFeed';
import { DemoService } from '@/lib/demo-service';
import { TransactionEvent, SimulationScenario } from '@/lib/types';
import { calculateReserveRatio, determineSystemStatus } from '@/lib/calculations';
import { calculateDSI } from '@/lib/utils/dsiCalculator';
import { useDexPrice } from '@/lib/hooks/useDexPrice';
import { API_CONFIG, BLOCKCHAIN, SIMULATION, RESERVE_RATIO } from '@/lib/constants';

// Dynamically import HeroSection to avoid SSR issues with React Three Fiber
const HeroSection = dynamic(() => import('../components/HeroSection').then(mod => ({ default: mod.HeroSection })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <p className="text-terminal font-mono">Loading...</p>
    </div>
  ),
});



export default function Home() {
  // Detect demo mode from URL parameter
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [transactions, setTransactions] = useState<TransactionEvent[]>([]);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [isProtocolInspectorOpen, setIsProtocolInspectorOpen] = useState(false);
  const [isWhitePaperModalOpen, setIsWhitePaperModalOpen] = useState(false);
  const [isKYAModalOpen, setIsKYAModalOpen] = useState(false);
  const [ergoErrorDismissed, setErgoErrorDismissed] = useState(false);
  const [dexErrorDismissed, setDexErrorDismissed] = useState(false);
  const [lastDjedDataUpdate, setLastDjedDataUpdate] = useState<Date | undefined>();
  const [lastDexUpdate, setLastDexUpdate] = useState<Date | undefined>();

  // Fetch live transaction feed
  const { transactions: liveTransactions, error: feedError, isLoading: feedLoading } = useTransactionFeed();

  useEffect(() => {
    // Check for demo mode on client side or default to demo mode
    const urlDemoMode = DemoService.isDemoMode();
    // Default to demo mode if no URL parameter specified
    const shouldUseDemoMode = urlDemoMode || typeof window !== 'undefined' && !window.location.search.includes('demo=false');
    setIsDemoMode(shouldUseDemoMode);
    
    // Load transactions if in demo mode, otherwise use live transactions
    if (shouldUseDemoMode) {
      DemoService.loadMockData().then(mockData => {
        const txEvents = DemoService.parseTransactions(mockData);
        setTransactions(txEvents);
      }).catch(error => {
        console.error('Failed to load demo transactions:', error);
      });
    }
  }, []);

  // Separate effect to update live transactions
  useEffect(() => {
    if (!isDemoMode && liveTransactions.length > 0) {
      console.log('🔴 LIVE MODE: Setting transactions from API:', liveTransactions.length, 'transactions');
      setTransactions(liveTransactions);
    }
  }, [liveTransactions, isDemoMode]);

  // Fetch protocol data using useDjedData hook
  const { data: djedData, error, isLoading, mutate } = useDjedData(isDemoMode);

  // Fetch DEX price for DSI calculation
  const { dexPrice, isError: dexError } = useDexPrice(djedData?.oraclePrice ?? 1.0);

  // Track last successful updates
  useEffect(() => {
    if (djedData) {
      setLastDjedDataUpdate(new Date());
    }
  }, [djedData]);

  // Track last successful updates
  useEffect(() => {
    if (djedData) {
      setLastDjedDataUpdate(new Date());
    }
  }, [djedData]);

  useEffect(() => {
    if (dexPrice && !dexError) {
      setLastDexUpdate(new Date());
    }
  }, [dexPrice, dexError]);

  // Check if data is stale
  useEffect(() => {
    if (!djedData?.lastUpdated) {
      setIsStale(false);
      return;
    }

    const checkStaleData = () => {
      const now = new Date();
      const age = now.getTime() - djedData.lastUpdated.getTime();
      setIsStale(age > API_CONFIG.STALE_DATA_THRESHOLD);
    };

    checkStaleData();
    const interval = setInterval(checkStaleData, API_CONFIG.STALE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [djedData?.lastUpdated]);

  // Get state from Zustand store
  const { 
    isSimulationModalOpen, 
    toggleSimulationModal, 
    isSimulating,
    simulatedPrice,
    simulationScenario,
    sentinelConfig,
    sentinelTriggered,
    startSimulation,
    stopSimulation,
    updateSimulatedPrice,
    setSimulationScenario,
    triggerSentinel,
    setDjedData,
    setDemoMode
  } = useAppStore();

  // Update store when data changes
  useEffect(() => {
    if (djedData) {
      setDjedData(djedData);
    }
  }, [djedData, setDjedData]);

  // Update store demo mode
  useEffect(() => {
    setDemoMode(isDemoMode);
  }, [isDemoMode, setDemoMode]);

  // Calculate display values (use simulated values if simulating, otherwise use live data)
  const displayRatio = isSimulating && simulatedPrice && djedData
    ? calculateReserveRatio(djedData.baseReserves, simulatedPrice, djedData.sigUsdCirculation)
    : djedData?.reserveRatio ?? 0;

  const displayStatus = isSimulating && simulatedPrice && djedData
    ? determineSystemStatus(calculateReserveRatio(djedData.baseReserves, simulatedPrice, djedData.sigUsdCirculation))
    : djedData?.systemStatus ?? 'NORMAL';

  // Calculate DSI (Djed Stability Index)
  const dsi = djedData ? calculateDSI(
    displayRatio,
    djedData.oraclePrice,
    dexError ? null : dexPrice
  ) : { score: 0, label: 'LOADING', color: '#A3A3A3', breakdown: { ratioScore: 0, pegScore: 0, trendScore: 0 } };

  // Sentinel monitoring - trigger on critical conditions
  // Only trigger once per session - don't re-trigger after manual dismiss
  useEffect(() => {
    if (sentinelConfig.enabled && sentinelConfig.autoRedeemOnCritical && !sentinelTriggered) {
      if (displayStatus === 'CRITICAL' && displayRatio < RESERVE_RATIO.CRITICAL_THRESHOLD) {
        triggerSentinel();
        
        const timestamp = new Date();
        const sentinelEvent: TransactionEvent = {
          id: `sentinel-${timestamp.getTime()}`,
          timestamp,
          type: 'SENTINEL_TRIGGER',
          details: `Reserve ratio ${displayRatio.toFixed(2)}% – auto-redeem scenario triggered`,
        };
        setTransactions(prev => [sentinelEvent, ...prev].slice(0, API_CONFIG.MAX_TRANSACTION_FEED_ITEMS));
      }
    }
    // Note: sentinelTriggered is intentionally NOT in dependencies to prevent re-triggering after manual dismiss
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayStatus, displayRatio, sentinelConfig, triggerSentinel]);



  const handleLaunchSimulation = () => {
    toggleSimulationModal();
    if (!isSimulating && djedData) {
      startSimulation(djedData.oraclePrice);
    }
  };

  const handleCloseSimulation = () => {
    toggleSimulationModal();
    stopSimulation();
  };

  const handleSimulatedPriceChange = (price: number, ratio: number, status: 'NORMAL' | 'CRITICAL') => {
    updateSimulatedPrice(price);
  };

  const handleScenarioActivate = useCallback((scenario: SimulationScenario) => {
    setSimulationScenario(scenario);
    
    // Add scenario event to terminal feed
    if (scenario !== 'none') {
      const timestamp = new Date();
      const scenarioEvent: TransactionEvent = {
        id: `scenario-${timestamp.getTime()}`,
        timestamp,
        type: 'SCENARIO_ACTIVATED',
        details: scenario === 'flash_crash'
          ? 'FLASH CRASH – ERG price -50%'
          : scenario === 'oracle_freeze'
          ? 'ORACLE FREEZE – protocol price stale'
          : 'BANK RUN – reserve ratio forced below 400%',
      };
      setTransactions(prev => [scenarioEvent, ...prev].slice(0, 50));
    }
  }, [setSimulationScenario]);

  // Get user-friendly error message
  const getErrorMessage = (err: Error): string => {
    const message = err.message.toLowerCase();
    
    if (message.includes('fetch') || message.includes('network')) {
      return 'Network error: Unable to connect to Ergo Explorer API. Please check your internet connection.';
    }
    if (message.includes('timeout')) {
      return 'Request timeout: The server took too long to respond. Please try again.';
    }
    if (message.includes('429') || message.includes('rate limit')) {
      return 'Rate limit exceeded: Too many requests. Please wait a moment before retrying.';
    }
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'Server error: The Ergo Explorer API is temporarily unavailable. Please try again later.';
    }
    if (message.includes('404')) {
      return 'Data not found: The requested resource could not be found.';
    }
    
    return `Error loading data: ${err.message}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-void text-textPrimary flex items-center justify-center">
        <div className="text-center">
          <p className="text-terminal font-mono text-xl mb-2">Loading DjedOps...</p>
          <p className="text-textSecondary font-mono text-sm">
            {isDemoMode ? 'Loading demo data...' : 'Fetching live protocol data...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state (but allow stale data to be displayed if available)
  if (error && !djedData && !errorDismissed) {
    return (
      <div className="min-h-screen bg-void text-textPrimary flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <ErrorBanner
            message={getErrorMessage(error)}
            type="error"
            onRetry={() => {
              setErrorDismissed(false);
              mutate();
            }}
            onDismiss={() => setErrorDismissed(true)}
          />
        </div>
      </div>
    );
  }

  // Show main dashboard when data is loaded
  if (!djedData) {
    return null;
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-void text-textPrimary relative">
      {/* Static Grid Background - Always Visible */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.25,
        }}
      />
      
      {/* Noise/Static Overlay Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: 0.25,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%2300ff41' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      <main className="relative z-10">
        {/* Mobile Status Header - Pinned */}
        <div className="block md:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[#39FF14]/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[#39FF14] text-xs font-mono uppercase">Reserve Ratio</div>
              <div className="text-white text-lg font-bold font-mono">{displayRatio.toFixed(2)}%</div>
            </div>
            <div className="text-right">
              <div className="text-[#39FF14] text-xs font-mono uppercase">ERG Price</div>
              <div className="text-white text-lg font-bold font-mono">${djedData.oraclePrice.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Top Status Bar - Desktop */}
        <div className="hidden md:flex border-b border-[#39FF14]/30 px-8 py-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" style={{ boxShadow: '0 0 10px #39FF14' }}></div>
            <span className="text-[#39FF14] text-sm font-mono font-bold tracking-wider">SYSTEM ONLINE</span>
            <span className="text-neutral-600 text-xs font-mono">UPTIME: 99.99%</span>
            {isDemoMode && (
              <span className="text-[#39FF14]/70 text-xs font-mono">
                [DEMO MODE{DemoService.isUsingFallback() ? ' - FALLBACK' : ''}]
              </span>
            )}
          </div>
          <div className="text-[#E5E5E5] text-sm font-mono">
            BLOCK: <span className="text-[#39FF14]">12,04,728</span>
          </div>
          <div className="flex items-center gap-3">
            {!isDemoMode && (
              <ApiStatusBar
                ergoConnected={!error && !!djedData}
                dexConnected={!dexError}
                onRetryErgo={() => {
                  setErgoErrorDismissed(false);
                  mutate();
                }}
                onRetryDex={() => setDexErrorDismissed(false)}
              />
            )}
            <div className="hidden md:block">
              <SentinelToggle />
            </div>
            <PerformanceToggle />
            <ShareButton status={displayStatus} reserveRatio={displayRatio} />
            <WalletConnect />
          </div>
        </div>

        <div className="mx-auto max-w-screen-2xl px-4 md:px-8 py-6 md:py-12">
        {/* Wallet Balance Display (top-right corner) */}
        <WalletBalance />
        
        {/* Sentinel Components */}
        <SentinelPanel />

        {/* Demo Mode Fallback Warning */}
        {isDemoMode && DemoService.isUsingFallback() && (
          <ErrorBanner
            message="Demo mode is using fallback data. The mock-data.json file could not be loaded."
            type="warning"
          />
        )}

        {/* API Error Banners */}
        {!isDemoMode && error && djedData && !ergoErrorDismissed && (
          <ApiErrorBanner
            type="ergo"
            lastUpdate={lastDjedDataUpdate}
            onRetry={() => {
              setErgoErrorDismissed(false);
              mutate();
            }}
            onDismiss={() => setErgoErrorDismissed(true)}
          />
        )}
        {!isDemoMode && dexError && !dexErrorDismissed && (
          <ApiErrorBanner
            type="dex"
            lastUpdate={lastDexUpdate}
            onDismiss={() => setDexErrorDismissed(true)}
          />
        )}

        {/* Error Banner - Show if error exists and data is available (showing stale data) */}
        {error && djedData && !errorDismissed && (
          <ErrorBanner
            message={getErrorMessage(error)}
            type="warning"
            onRetry={() => {
              setErrorDismissed(false);
              mutate();
            }}
            onDismiss={() => setErrorDismissed(true)}
          />
        )}

        {/* Stale Data Warning */}
        {isStale && !error && !isDemoMode && (
          <ErrorBanner
            message="Data may be stale. Last update was more than 30 seconds ago."
            type="stale"
            onRetry={() => mutate()}
          />
        )}
        
        {/* Hero Section */}
        <HeroSection
          reserveRatio={displayRatio}
          baseReserves={djedData.baseReserves}
          oraclePrice={djedData.oraclePrice}
          systemStatus={displayStatus}
          isSimulated={isSimulating}
          contractAddress={BLOCKCHAIN.SIGMAUSD_CONTRACT_ADDRESS}
          onLaunchSimulation={handleLaunchSimulation}
          onInspectProtocol={() => setIsProtocolInspectorOpen(true)}
        />

        {/* Historical Timeline Chart */}
        <div className="mt-24 max-w-7xl mx-auto">
          <ReserveHistoryChart />
        </div>

        {/* Analytics Grid - DSI, Arbitrage Monitor & Stress Test */}
        <div className="mt-12 md:mt-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Djed Stability Index */}
          <div>
            <h2 className="text-3xl font-display font-bold text-[#E5E5E5] mb-6 uppercase tracking-tight">
              Stability Index
            </h2>
            <StabilityGauge
              dsi={dsi}
              isDexOffline={dexError}
              lastCalculated={lastDexUpdate}
            />
          </div>

          {/* Arbitrage Monitor */}
          <div>
            <h2 className="text-3xl font-display font-bold text-[#E5E5E5] mb-6 uppercase tracking-tight">
              Arbitrage Monitor
            </h2>
            <MarketOpportunityCard protocolPrice={djedData.oraclePrice} />
          </div>

          {/* Peg Resilience Simulator */}
          <div>
            <h2 className="text-3xl font-display font-bold text-[#E5E5E5] mb-6 uppercase tracking-tight">
              Stress Testing
            </h2>
            <StressTest />
          </div>
        </div>

        {/* Oracle Network Health */}
        <div className="mt-24 max-w-7xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-[#E5E5E5] mb-6 uppercase tracking-tight">
            Network Health
          </h2>
          <OracleConsensus />
        </div>

        {/* Terminal Feed - Show in both demo and live mode */}
        {(isDemoMode ? transactions.length > 0 : true) && (
          <div className="mt-24 max-w-7xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-[#E5E5E5] mb-6 uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#39FF14] text-2xl">▸</span>
              Transaction Feed
              {!isDemoMode && <span className="text-xs text-[#39FF14]/70 font-normal tracking-normal ml-2">LIVE</span>}
            </h2>
            {feedError && !isDemoMode ? (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded text-red-400">
                Failed to load transactions: {feedError.message}
              </div>
            ) : transactions.length === 0 && !feedLoading && !isDemoMode ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded text-yellow-400">
                No transactions found. The API might be returning empty results.
              </div>
            ) : (
              <TerminalFeed events={transactions} isLoading={!isDemoMode && feedLoading} />
            )}
          </div>
        )}

        {/* Simulation Modal */}
        <SimulationModal
          isOpen={isSimulationModalOpen}
          onClose={handleCloseSimulation}
          currentPrice={djedData.oraclePrice}
          baseReserves={djedData.baseReserves}
          sigUsdCirculation={djedData.sigUsdCirculation}
          onSimulatedPriceChange={handleSimulatedPriceChange}
          onScenarioActivate={handleScenarioActivate}
        />

        {/* Protocol Inspector Modal */}
        <ProtocolInspector
          isOpen={isProtocolInspectorOpen}
          onClose={() => setIsProtocolInspectorOpen(false)}
          reserve={djedData.baseReserves}
          price={djedData.oraclePrice}
          supply={djedData.sigUsdCirculation}
          ratio={displayRatio}
          status={displayStatus}
        />

        {/* White Paper Modal */}
        <WhitePaperModal
          isOpen={isWhitePaperModalOpen}
          onClose={() => setIsWhitePaperModalOpen(false)}
        />

        {/* Sentinel Panel */}
        <SentinelPanel />

        {/* Sentinel Trigger UI */}
        <SentinelTriggerBanner />
        <DashboardBorderFlash />
        <SentinelShield />

        {/* Bottom Status Bar */}
        <div className="mt-16 pt-8 border-t border-[#39FF14]/20 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-6">
            <span className="text-neutral-600">SYS_V_1.0</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${ i < 4 ? 'bg-[#39FF14]' : 'bg-neutral-800'}`}></div>
                ))}
              </div>
              <span className="text-[#E5E5E5]">Active Oracles: 6/6</span>
            </div>
            <span className="text-neutral-600">OPERATIONAL_NODES</span>
          </div>
          <div className="text-neutral-600">LATENCY: <span className="text-[#39FF14]">12ms</span></div>
        </div>

        {/* Footer CTA - Aura Style */}
        <footer className="mt-24 py-16 border-t border-[#E5E5E5]/10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Headline */}
            <h2 className="text-4xl md:text-5xl font-black text-[#E5E5E5] leading-tight">
              Decentralization is Non-Negotiable
            </h2>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleLaunchSimulation}
                className="w-full sm:w-auto px-8 py-4 bg-[#39FF14] text-black font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:bg-[#39FF14]/90 hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] transition-all duration-300"
              >
                INITIATE PROTOCOL
              </button>
              <button
                onClick={() => setIsWhitePaperModalOpen(true)}
                className="w-full sm:w-auto px-10 py-4 border-2 border-[#E5E5E5]/20 text-[#E5E5E5]/70 hover:border-[#39FF14]/50 hover:text-[#E5E5E5] font-bold text-sm tracking-widest uppercase text-center transition-all duration-300"
              >
                READ WHITE PAPER
              </button>
            </div>
            
            {/* Footer Meta Info */}
            <div className="pt-8 font-mono text-gray-500 text-xs space-y-1">
              <p>Last Updated: {djedData.lastUpdated.toLocaleTimeString()}</p>
              <p>
                Data Source: {isDemoMode ? 'Mock Data (Demo Mode)' : 'Ergo Explorer API'}
              </p>
            </div>
          </div>
        </footer>
        {/* Close mx-auto max-w-screen-2xl container */}
        </div>
      </main>

      {/* KYA Modal */}
      <KYAModal isOpen={isKYAModalOpen} onClose={() => setIsKYAModalOpen(false)} />
    </div>
  );
}
