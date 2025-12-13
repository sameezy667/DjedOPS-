import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { DjedData } from '@/lib/types';
import { REPLAY_SCENARIOS } from '@/components/TimeTravel';

/**
 * Hook to get data based on current mode (live or replay)
 * When replay mode is active, returns historical scenario data
 * Otherwise returns the provided live data
 */
export function useReplayData(liveData: DjedData | null): DjedData | null {
  const { isReplayMode, replayScenario, replayTime } = useAppStore();

  return useMemo(() => {
    // If not in replay mode or no live data, return live data
    if (!isReplayMode || !replayScenario) {
      return liveData;
    }

    // Get the scenario data
    const scenario = REPLAY_SCENARIOS[replayScenario];
    if (!scenario) {
      return liveData;
    }

    // Interpolate data based on timeline slider (0-100)
    // For simplicity, we'll use the scenario data as-is
    // In a real implementation, you could interpolate between normal and scenario values
    const interpolationFactor = replayTime / 100;

    // If we have live data, we can interpolate between live and scenario
    if (liveData) {
      return {
        baseReserves: liveData.baseReserves + (scenario.baseReserves - liveData.baseReserves) * interpolationFactor,
        sigUsdCirculation: liveData.sigUsdCirculation + (scenario.sigUsdCirculation - liveData.sigUsdCirculation) * interpolationFactor,
        oraclePrice: liveData.oraclePrice + (scenario.ergPrice - liveData.oraclePrice) * interpolationFactor,
        reserveRatio: liveData.reserveRatio + (scenario.dsi - liveData.reserveRatio) * interpolationFactor,
        systemStatus: interpolationFactor > 0.5 ? scenario.status : liveData.systemStatus,
      };
    }

    // No live data, return scenario data directly
    return {
      baseReserves: scenario.baseReserves,
      sigUsdCirculation: scenario.sigUsdCirculation,
      oraclePrice: scenario.ergPrice,
      reserveRatio: scenario.dsi,
      systemStatus: scenario.status,
    };
  }, [liveData, isReplayMode, replayScenario, replayTime]);
}
