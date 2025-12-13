import { create } from 'zustand';
import { DjedData, WalletState, SimulationScenario, SentinelConfig } from './types';

export interface AppState {
  // Data state
  djedData: DjedData | null;
  isDemoMode: boolean;
  
  // Simulation state
  isSimulating: boolean;
  simulatedPrice: number | null;
  simulationScenario: SimulationScenario;
  
  // Sentinel state
  sentinelConfig: SentinelConfig;
  sentinelTriggered: boolean;
  lastSentinelTrigger: Date | null;
  
  // Wallet state
  wallet: WalletState;
  
  // UI state
  isSimulationModalOpen: boolean;
  isSentinelPanelOpen: boolean;
  
  // Performance state
  highPerformanceMode: boolean;
  
  // Actions
  setDjedData: (data: DjedData) => void;
  setDemoMode: (enabled: boolean) => void;
  startSimulation: (price: number) => void;
  stopSimulation: () => void;
  updateSimulatedPrice: (price: number) => void;
  setSimulationScenario: (scenario: SimulationScenario) => void;
  setSentinelConfig: (config: Partial<SentinelConfig>) => void;
  triggerSentinel: () => void;
  clearSentinelTrigger: () => void;
  setWallet: (wallet: WalletState) => void;
  toggleSimulationModal: () => void;
  toggleSentinelPanel: () => void;
  setHighPerformanceMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  djedData: null,
  isDemoMode: false,
  isSimulating: false,
  simulatedPrice: null,
  simulationScenario: 'none',
  sentinelConfig: {
    enabled: false,
    autoRedeemOnCritical: true,
    notifyOnVolatility: true,
    watchedBalance: 0,
  },
  sentinelTriggered: false,
  lastSentinelTrigger: null,
  wallet: {
    isConnected: false,
    address: null,
    balance: null,
    error: null,
  },
  isSimulationModalOpen: false,
  isSentinelPanelOpen: false,
  highPerformanceMode: typeof window !== 'undefined' 
    ? localStorage.getItem('perfMode') === 'true' 
    : false,
  
  // Actions
  setDjedData: (data) => set({ djedData: data }),
  
  setDemoMode: (enabled) => set({ isDemoMode: enabled }),
  
  startSimulation: (price) => set({ 
    isSimulating: true, 
    simulatedPrice: price 
  }),
  
  stopSimulation: () => set({ 
    isSimulating: false, 
    simulatedPrice: null,
    simulationScenario: 'none'
  }),
  
  updateSimulatedPrice: (price) => set({ simulatedPrice: price }),
  
  setSimulationScenario: (scenario) => set({ simulationScenario: scenario }),
  
  setSentinelConfig: (config) => set((state) => ({
    sentinelConfig: { ...state.sentinelConfig, ...config }
  })),
  
  triggerSentinel: () => set({ 
    sentinelTriggered: true,
    lastSentinelTrigger: new Date()
  }),
  
  clearSentinelTrigger: () => set({ sentinelTriggered: false }),
  
  setWallet: (wallet) => set({ wallet }),
  
  toggleSimulationModal: () => set((state) => ({ 
    isSimulationModalOpen: !state.isSimulationModalOpen 
  })),
  
  toggleSentinelPanel: () => set((state) => ({
    isSentinelPanelOpen: !state.isSentinelPanelOpen
  })),
  
  setHighPerformanceMode: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('perfMode', String(enabled));
    }
    set({ highPerformanceMode: enabled });
  },
}));
