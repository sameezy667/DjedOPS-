'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface OracleNode {
  id: string;
  price: number;
  status: 'synced' | 'desync';
  lastUpdate: Date;
}

export default function OracleConsensus() {
  const [nodes, setNodes] = useState<OracleNode[]>([]);
  const [meanPrice, setMeanPrice] = useState(0);

  useEffect(() => {
    // Generate mock oracle node data
    const basePrice = 2.45; // Base ERG price in USD
    const mockNodes: OracleNode[] = [
      {
        id: '4a3f...2b9c',
        price: basePrice + (Math.random() * 0.04 - 0.02), // ±2% variance
        status: 'synced',
        lastUpdate: new Date(Date.now() - Math.random() * 5000)
      },
      {
        id: '8d7e...5c1a',
        price: basePrice + (Math.random() * 0.04 - 0.02),
        status: 'synced',
        lastUpdate: new Date(Date.now() - Math.random() * 5000)
      },
      {
        id: '1b9f...3e4d',
        price: basePrice + (Math.random() * 0.04 - 0.02),
        status: 'synced',
        lastUpdate: new Date(Date.now() - Math.random() * 5000)
      },
      {
        id: '6c2a...8f7b',
        price: basePrice + (Math.random() * 0.04 - 0.02),
        status: 'synced',
        lastUpdate: new Date(Date.now() - Math.random() * 5000)
      },
      {
        id: '9e5d...4a6c',
        price: basePrice + (Math.random() * 0.04 - 0.02),
        status: 'synced',
        lastUpdate: new Date(Date.now() - Math.random() * 5000)
      },
      {
        id: '2f8b...7d1e',
        price: basePrice + (Math.random() * 0.06 - 0.03), // Slightly more variance
        status: 'synced',
        lastUpdate: new Date(Date.now() - Math.random() * 5000)
      }
    ];

    // Calculate mean price
    const mean = mockNodes.reduce((sum, node) => sum + node.price, 0) / mockNodes.length;
    setMeanPrice(mean);

    // Determine sync status based on deviation from mean
    const processedNodes = mockNodes.map(node => {
      const deviation = Math.abs(node.price - mean) / mean;
      return {
        ...node,
        status: (deviation > 0.01 ? 'desync' : 'synced') as 'synced' | 'desync' // > 1% deviation = desync
      };
    });

    setNodes(processedNodes);

    // Update periodically
    const interval = setInterval(() => {
      const updatedNodes = processedNodes.map(node => ({
        ...node,
        price: basePrice + (Math.random() * 0.04 - 0.02),
        lastUpdate: new Date()
      }));

      const newMean = updatedNodes.reduce((sum, node) => sum + node.price, 0) / updatedNodes.length;
      setMeanPrice(newMean);

      const finalNodes = updatedNodes.map(node => ({
        ...node,
        status: (Math.abs(node.price - newMean) / newMean > 0.01 ? 'desync' : 'synced') as 'synced' | 'desync'
      }));

      setNodes(finalNodes);
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // Hexagon positioning (6 nodes in a circle)
  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
    const radius = 45; // percentage
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  const syncedCount = nodes.filter(n => n.status === 'synced').length;
  const consensusHealth = nodes.length > 0 ? (syncedCount / nodes.length) * 100 : 0;

  const networkAnimation = {
    loop: true,
    autoplay: true,
    animationData: {
      v: '5.5.7',
      fr: 30,
      ip: 0,
      op: 90,
      w: 100,
      h: 100,
      nm: 'Network',
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: 'Ring',
          sr: 1,
          ks: {
            r: { a: 1, k: [{ t: 0, s: [0] }, { t: 90, s: [360] }] },
            p: { a: 0, k: [50, 50, 0] },
            s: { a: 0, k: [100, 100, 100] },
          },
          ao: 0,
          shapes: [
            {
              ty: 'el',
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [60, 60] },
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.22, 1, 0.08, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 2 },
            },
          ],
          ip: 0,
          op: 90,
          st: 0,
          bm: 0,
        },
      ],
    },
  };

  return (
    <div className="bg-black/40 border border-[#39FF14]/20 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <Lottie animationData={networkAnimation.animationData} loop={true} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#39FF14] mb-1 font-mono uppercase tracking-wider">Oracle Network Status</h3>
            <p className="text-xs text-gray-400 font-mono">Price feed consensus monitoring</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-bold font-mono uppercase ${
          consensusHealth === 100
            ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
            : consensusHealth >= 80
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {syncedCount}/{nodes.length} SYNCED
        </div>
      </div>

      {/* Oracle Node Ring Visualization */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-64 h-64">
          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs text-gray-500 uppercase mb-1 font-mono">Consensus Price</div>
            <div className="text-3xl font-bold text-[#39FF14] font-mono" style={{ textShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}>
              ${meanPrice.toFixed(4)}
            </div>
            <div className="text-xs text-gray-400 mt-1 font-mono">ERG/USD</div>
          </div>

          {/* Connecting Lines (optional - creates web effect) */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {nodes.map((_, i) => {
              const pos = getNodePosition(i, nodes.length);
              return (
                <line
                  key={`line-${i}`}
                  x1="50%"
                  y1="50%"
                  x2={`${pos.x}%`}
                  y2={`${pos.y}%`}
                  stroke="rgba(57, 255, 20, 0.1)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>

          {/* Oracle Nodes */}
          {nodes.map((node, index) => {
            const pos = getNodePosition(index, nodes.length);
            const isSynced = node.status === 'synced';
            
            return (
              <div
                key={node.id}
                className="absolute group cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2
                }}
              >
                {/* Node Circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                    isSynced
                      ? 'bg-[#39FF14] border-[#39FF14] shadow-lg shadow-[#39FF14]/50'
                      : 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50 animate-pulse'
                  }`}
                  style={{
                    boxShadow: isSynced
                      ? '0 0 20px rgba(57, 255, 20, 0.8)'
                      : '0 0 20px rgba(239, 68, 68, 0.6)'
                  }}
                />

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <div className="bg-black/95 border border-[#39FF14]/30 rounded px-3 py-2 text-xs font-mono">
                    <div className="text-[#39FF14] font-bold mb-1">Node: {node.id}</div>
                    <div className="text-gray-300">
                      Price: <span className="text-[#39FF14] font-mono">${node.price.toFixed(4)}</span>
                    </div>
                    <div className="text-gray-300">
                      Status: <span className={isSynced ? 'text-[#39FF14]' : 'text-red-400'}>
                        {isSynced ? '✓ Synced' : '⚠ Desync'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-[10px] mt-1">
                      Updated: {node.lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-[#39FF14]/30"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#39FF14]/10">
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1 font-mono">Health</div>
          <div className={`text-lg font-bold font-mono ${
            consensusHealth === 100 ? 'text-[#39FF14]' : 'text-yellow-400'
          }`}>
            {consensusHealth.toFixed(0)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1 font-mono">Deviation</div>
          <div className="text-lg font-bold text-[#39FF14] font-mono">
            {nodes.length > 0 
              ? (Math.max(...nodes.map(n => Math.abs(n.price - meanPrice) / meanPrice)) * 100).toFixed(2)
              : '0.00'}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1 font-mono">Nodes</div>
          <div className="text-lg font-bold text-[#39FF14] font-mono">{nodes.length}</div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 text-xs text-gray-500 text-center font-mono">
        Oracle pool provides decentralized price feeds • Max deviation tolerance: 1%
      </div>
    </div>
  );
}
