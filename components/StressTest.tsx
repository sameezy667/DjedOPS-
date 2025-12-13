'use client';

import { useState, useEffect } from 'react';
import { useDjedData } from '@/lib/hooks/useDjedData';
import Lottie from 'lottie-react';

export default function StressTest() {
  const { data } = useDjedData();
  const [sliderPercent, setSliderPercent] = useState(0);
  const [projectedRatio, setProjectedRatio] = useState<number | null>(null);

  const reserve = data?.baseReserves;
  const price = data?.oraclePrice;
  const supply = data?.sigUsdCirculation;

  useEffect(() => {
    if (reserve && price && supply) {
      // Calculate projected ratio based on hypothetical ERG price change
      const hypotheticalPrice = price * (1 + sliderPercent / 100);
      const calculatedRatio = ((reserve * hypotheticalPrice) / supply) * 100;
      setProjectedRatio(calculatedRatio);
    }
  }, [reserve, price, supply, sliderPercent]);

  const currentRatio = data?.reserveRatio;

  const isLiquidationRisk = projectedRatio !== null && projectedRatio < 400;
  const hypotheticalPrice = price ? (price * (1 + sliderPercent / 100)).toFixed(2) : '0.00';

  const getSliderColor = () => {
    if (sliderPercent < -20) return 'from-red-600 to-red-400';
    if (sliderPercent < 0) return 'from-orange-600 to-orange-400';
    if (sliderPercent < 20) return 'from-cyan-600 to-cyan-400';
    return 'from-green-600 to-green-400';
  };

  const getRatioChangeIcon = () => {
    if (!projectedRatio || !currentRatio) return '—';
    const change = projectedRatio - currentRatio;
    if (Math.abs(change) < 1) return '→';
    return change > 0 ? '↗' : '↘';
  };

  const formatRatioChange = () => {
    if (!projectedRatio || !currentRatio) return '0.00';
    const change = projectedRatio - currentRatio;
    return Math.abs(change).toFixed(2);
  };

  const stressTestAnimation = {
    loop: true,
    autoplay: true,
    animationData: {
      v: '5.5.7',
      fr: 30,
      ip: 0,
      op: 60,
      w: 100,
      h: 100,
      nm: 'StressTest',
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: 'Wave',
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            p: { a: 1, k: [{ t: 0, s: [50, 50, 0] }, { t: 30, s: [50, 40, 0] }, { t: 60, s: [50, 50, 0] }] },
            s: { a: 0, k: [100, 100, 100] },
          },
          ao: 0,
          shapes: [
            {
              ty: 'rc',
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [60, 4] },
              r: { a: 0, k: 2 },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.22, 1, 0.08, 1] },
              o: { a: 0, k: 100 },
            },
          ],
          ip: 0,
          op: 60,
          st: 0,
          bm: 0,
        },
      ],
    },
  };

  return (
    <div className="bg-black/40 border border-[#39FF14]/20 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8">
            <Lottie animationData={stressTestAnimation.animationData} loop={true} />
          </div>
          <h3 className="text-xl font-bold text-[#39FF14] font-mono uppercase tracking-wider">Peg Resilience Simulator</h3>
        </div>
        <p className="text-sm text-gray-400 font-mono">
          Test how ERG price changes impact the reserve ratio
        </p>
      </div>

      {/* Current State */}
      <div className="bg-black/60 border border-[#39FF14]/10 rounded p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1 font-mono">Current ERG Price</div>
            <div className="text-xl font-bold text-[#39FF14] font-mono">
              ${price?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1 font-mono">Current Ratio</div>
            <div className="text-xl font-bold text-[#39FF14] font-mono">
              {currentRatio?.toFixed(2) || '0.00'}%
            </div>
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-300 font-mono uppercase tracking-wide">
            Hypothetical ERG Price Change
          </label>
          <div className={`px-3 py-1 rounded text-xs font-bold font-mono ${
            sliderPercent > 0 
              ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30' 
              : sliderPercent < 0 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {sliderPercent > 0 ? '+' : ''}{sliderPercent}%
          </div>
        </div>

        <input
          type="range"
          min="-50"
          max="50"
          step="1"
          value={sliderPercent}
          onChange={(e) => setSliderPercent(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          style={{
            background: `linear-gradient(to right, 
              #dc2626 0%, 
              #f97316 25%, 
              #06b6d4 50%, 
              #22c55e 75%, 
              #22c55e 100%)`
          }}
        />

        <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
          <span>-50%</span>
          <span>0%</span>
          <span>+50%</span>
        </div>
      </div>

      {/* Projection Results */}
      <div className={`border-2 rounded-lg p-5 mb-4 transition-all ${
        isLiquidationRisk 
          ? 'border-red-500/50 bg-red-500/10' 
          : 'border-[#39FF14]/30 bg-[#39FF14]/5'
      }`}>
        <div className="text-center mb-4">
          <div className="text-xs text-gray-400 uppercase mb-2 font-mono">Projected Scenario</div>
          <div className="text-sm text-gray-300 mb-3 font-mono">
            At <span className="text-[#39FF14] font-bold">${hypotheticalPrice}</span> ERG price
          </div>
          
          <div className={`text-4xl font-bold mb-2 font-mono ${
            isLiquidationRisk ? 'text-red-400' : 'text-[#39FF14]'
          }`} style={!isLiquidationRisk ? { textShadow: '0 0 20px rgba(57, 255, 20, 0.5)' } : {}}>
            {projectedRatio?.toFixed(2) || '0.00'}%
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-mono">
            <span className="text-gray-400">Reserve Ratio</span>
            <span className={`font-bold ${
              projectedRatio && currentRatio && projectedRatio > currentRatio 
                ? 'text-[#39FF14]' 
                : 'text-red-400'
            }`}>
              {getRatioChangeIcon()} {formatRatioChange()}%
            </span>
          </div>
        </div>

        {/* Warning Banner */}
        {isLiquidationRisk && (
          <div className="bg-red-500/20 border border-red-500/50 rounded p-3 animate-pulse">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-2xl">⚠️</span>
              <span className="text-red-400 font-bold uppercase tracking-wide font-mono">
                Liquidation Risk
              </span>
            </div>
            <p className="text-xs text-red-300 text-center mt-2 font-mono">
              Ratio below 400% critical threshold
            </p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="text-xs text-gray-500 text-center font-mono">
        <p>
          Formula: <code className="text-[#39FF14]/70 bg-black/40 px-2 py-1 rounded">
            (Reserve × Price) ÷ Supply × 100
          </code>
        </p>
      </div>
    </div>
  );
}
