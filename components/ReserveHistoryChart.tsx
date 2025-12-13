'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import Lottie from 'lottie-react';

interface DataPoint {
  time: string;
  ratio: number;
}

export default function ReserveHistoryChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock 24h data (48 data points, one per 30 minutes)
    const mockData: DataPoint[] = [];
    const now = Date.now();
    const baseRatio = 450;

    for (let i = 47; i >= 0; i--) {
      const timestamp = new Date(now - i * 30 * 60 * 1000);
      const timeStr = timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Add some realistic variation
      const variance = (Math.sin(i / 3) * 30) + (Math.random() * 20 - 10);
      const ratio = Math.max(380, Math.min(520, baseRatio + variance));
      
      mockData.push({
        time: timeStr,
        ratio: parseFloat(ratio.toFixed(2))
      });
    }

    setData(mockData);
    setIsLoading(false);
  }, []);

  const minRatio = Math.min(...data.map(d => d.ratio));
  const maxRatio = Math.max(...data.map(d => d.ratio));
  const currentRatio = data[data.length - 1]?.ratio || 0;
  const isHealthy = currentRatio > 400;

  const pulseAnimation = {
    loop: true,
    autoplay: true,
    animationData: {
      v: '5.5.7',
      fr: 30,
      ip: 0,
      op: 60,
      w: 100,
      h: 100,
      nm: 'Pulse',
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: 'Circle',
          sr: 1,
          ks: {
            o: { a: 1, k: [{ t: 0, s: [100] }, { t: 30, s: [0] }, { t: 60, s: [100] }] },
            p: { a: 0, k: [50, 50, 0] },
            s: { a: 1, k: [{ t: 0, s: [50, 50, 100] }, { t: 30, s: [100, 100, 100] }, { t: 60, s: [50, 50, 100] }] },
          },
          ao: 0,
          shapes: [
            {
              ty: 'el',
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [80, 80] },
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.22, 1, 0.08, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 3 },
            },
          ],
          ip: 0,
          op: 60,
          st: 0,
          bm: 0,
        },
      ],
    },
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-black/90 border border-[#39FF14]/30 px-3 py-2 rounded font-mono">
          <p className="text-[#39FF14] text-sm">{payload[0].payload.time}</p>
          <p className={`text-lg font-bold ${payload[0].value > 400 ? 'text-[#39FF14]' : 'text-red-400'}`}>
            {payload[0].value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-400/50 animate-pulse">Loading historical data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-[#39FF14]/20 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <Lottie animationData={pulseAnimation.animationData} loop={true} />
          </div>
          <h3 className="text-xl font-bold text-[#39FF14] font-mono uppercase tracking-wider">Reserve Ratio Timeline</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400 font-mono">24h History</div>
          <div className={`px-3 py-1 rounded text-xs font-bold font-mono uppercase ${
            isHealthy 
              ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isHealthy ? '✓ HEALTHY' : '⚠ AT RISK'}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1 font-mono">Current</div>
          <div className={`text-2xl font-bold font-mono ${isHealthy ? 'text-[#39FF14]' : 'text-red-400'}`}>
            {currentRatio.toFixed(2)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1 font-mono">24h Low</div>
          <div className="text-2xl font-bold text-[#39FF14] font-mono">
            {minRatio.toFixed(2)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1 font-mono">24h High</div>
          <div className="text-2xl font-bold text-[#39FF14] font-mono">
            {maxRatio.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                {data.map((point, index) => (
                  <stop
                    key={index}
                    offset={`${(index / (data.length - 1)) * 100}%`}
                    stopColor={point.ratio > 400 ? '#39FF14' : '#ef4444'}
                  />
                ))}
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <YAxis 
              domain={[Math.floor(minRatio / 50) * 50, Math.ceil(maxRatio / 50) * 50]}
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="ratio"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={false}
              filter="url(#glow)"
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Critical Level Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
        <div className="w-3 h-3 border-2 border-red-500/50 border-dashed"></div>
        <span>400% Critical Threshold</span>
      </div>
    </div>
  );
}
