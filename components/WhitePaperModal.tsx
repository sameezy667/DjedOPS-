'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Scale, Database, Github, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export interface WhitePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'protocol' | 'licenses' | 'sources';

/**
 * WhitePaperModal - Protocol Reference & Compliance Modal
 * 
 * Displays academic citations, open source licenses, and data sources
 * for compliance with hackathon rules and transparency.
 */
export function WhitePaperModal({ isOpen, onClose }: WhitePaperModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('protocol');

  const tabs = [
    { id: 'protocol' as TabType, label: 'The Djed Protocol', icon: BookOpen },
    { id: 'licenses' as TabType, label: 'Open Source Licenses', icon: Scale },
    { id: 'sources' as TabType, label: 'Data Sources', icon: Database },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-black/90 backdrop-blur-2xl border-2 border-[#39FF14]/30 max-w-4xl w-full max-h-[85vh] overflow-hidden pointer-events-auto shadow-[0_0_40px_rgba(57,255,20,0.2)]">
              {/* Header */}
              <div className="border-b border-[#39FF14]/30 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-mono font-black text-[#39FF14] tracking-wider">
                    PROTOCOL REFERENCE & COMPLIANCE
                  </h2>
                  <p className="text-[#A3A3A3] text-sm font-mono mt-1">
                    Academic Citations · Open Source · Transparency
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#E5E5E5] hover:text-[#39FF14] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-[#39FF14]/20 bg-black/50">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 font-mono text-sm uppercase tracking-wider transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#39FF14]/10 text-[#39FF14] border-b-2 border-[#39FF14]'
                            : 'text-[#A3A3A3] hover:text-[#E5E5E5] hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
                {/* Tab: The Djed Protocol */}
                {activeTab === 'protocol' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-mono font-bold text-[#39FF14] mb-3">
                        Academic Foundation
                      </h3>
                      <p className="text-[#E5E5E5] leading-relaxed mb-4">
                        Djed is an algorithmic stablecoin protocol that uses a reserve coin (SHEN) 
                        to maintain price stability. The protocol employs formal verification methods 
                        and mathematical proofs to ensure robustness against market volatility.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-[#39FF14]/20 p-4 rounded">
                      <h4 className="text-[#39FF14] font-mono font-bold text-sm mb-2">
                        CORE FORMULA: RESERVE RATIO
                      </h4>
                      <div className="font-mono text-[#E5E5E5] text-lg bg-black/50 p-3 rounded border border-[#39FF14]/10">
                        <code>
                          R = (BaseReserves × OraclePrice) / StablecoinCirculation
                        </code>
                      </div>
                      <p className="text-[#A3A3A3] text-sm mt-2">
                        Where R must remain {'>'} 400% for optimal stability
                      </p>
                    </div>

                    <div className="bg-[#39FF14]/5 border-l-4 border-[#39FF14] p-4">
                      <h4 className="text-[#E5E5E5] font-mono font-bold text-sm mb-2">
                        PRIMARY CITATION
                      </h4>
                      <p className="text-[#E5E5E5] italic mb-2">
                        [1] Zahnentferner, J. (2021). <em>Djed: A Formally Verified Crypto-Backed 
                        Pegged Algorithmic Stablecoin.</em> IOHK Research.
                      </p>
                      <a
                        href="https://iohk.io/en/research/library/papers/djeda-formally-verified-crypto-backed-pegged-algorithmic-stablecoin/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#39FF14] hover:text-[#39FF14]/80 font-mono text-sm flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Original Paper
                      </a>
                    </div>

                    <div>
                      <h4 className="text-[#E5E5E5] font-mono font-bold text-sm mb-2">
                        IMPLEMENTATION
                      </h4>
                      <p className="text-[#A3A3A3] text-sm">
                        This dashboard implements the SigmaUSD variant on Ergo blockchain, 
                        using SigUSD (stablecoin) and SigRSV (reserve coin) tokens. The protocol 
                        is live and fully decentralized.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Tab: Open Source Licenses */}
                {activeTab === 'licenses' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-mono font-bold text-[#39FF14] mb-3">
                        Open Source Compliance
                      </h3>
                      <p className="text-[#E5E5E5] leading-relaxed mb-4">
                        This project utilizes the following open-source software. All dependencies 
                        are used in accordance with their respective licenses (MIT, ISC, OFL).
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: 'Next.js', license: 'MIT', desc: 'React framework for production' },
                        { name: 'React', license: 'MIT', desc: 'JavaScript library for building UI' },
                        { name: 'React Three Fiber', license: 'MIT', desc: '3D visualization engine' },
                        { name: 'Three.js', license: 'MIT', desc: 'WebGL 3D graphics library' },
                        { name: 'Tailwind CSS', license: 'MIT', desc: 'Utility-first CSS framework' },
                        { name: 'Framer Motion', license: 'MIT', desc: 'Animation library for React' },
                        { name: 'Lucide Icons', license: 'ISC', desc: 'Open source icon library' },
                        { name: 'Recharts', license: 'MIT', desc: 'Chart visualization library' },
                        { name: 'SWR', license: 'MIT', desc: 'React Hooks for data fetching' },
                        { name: 'Zustand', license: 'MIT', desc: 'State management solution' },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="bg-white/5 border border-[#39FF14]/10 p-3 rounded hover:border-[#39FF14]/30 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-[#E5E5E5] font-mono font-bold text-sm">
                                {item.name}
                              </h4>
                              <p className="text-[#A3A3A3] text-xs mt-1">{item.desc}</p>
                            </div>
                            <span className="text-[#39FF14] font-mono text-xs px-2 py-1 bg-[#39FF14]/10 rounded">
                              {item.license}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/5 border border-[#39FF14]/20 p-4 rounded">
                      <h4 className="text-[#39FF14] font-mono font-bold text-sm mb-2">
                        FONTS (OFL - SIL Open Font License)
                      </h4>
                      <ul className="text-[#E5E5E5] text-sm space-y-1">
                        <li>• <strong>Inter</strong> – UI sans-serif font</li>
                        <li>• <strong>JetBrains Mono</strong> – Monospace font for code/data</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Tab: Data Sources */}
                {activeTab === 'sources' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-mono font-bold text-[#39FF14] mb-3">
                        Data Transparency
                      </h3>
                      <p className="text-[#E5E5E5] leading-relaxed mb-4">
                        All data displayed in this dashboard is sourced from public APIs and 
                        on-chain data. No centralized or proprietary data sources are used.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 border-l-4 border-[#39FF14] p-4">
                        <h4 className="text-[#39FF14] font-mono font-bold text-sm mb-2">
                          ERGO EXPLORER API
                        </h4>
                        <p className="text-[#E5E5E5] text-sm mb-2">
                          Live blockchain data including transaction history, mempool activity, 
                          and protocol interactions.
                        </p>
                        <a
                          href="https://api.ergoplatform.com/api/v1/docs/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#39FF14] hover:text-[#39FF14]/80 font-mono text-xs flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          api.ergoplatform.com
                        </a>
                      </div>

                      <div className="bg-white/5 border-l-4 border-purple-500 p-4">
                        <h4 className="text-purple-400 font-mono font-bold text-sm mb-2">
                          SPECTRUM FINANCE API
                        </h4>
                        <p className="text-[#E5E5E5] text-sm mb-2">
                          Decentralized exchange (DEX) price feeds for ERG/SigUSD trading pairs 
                          and liquidity data.
                        </p>
                        <a
                          href="https://spectrum.fi"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 font-mono text-xs flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          spectrum.fi
                        </a>
                      </div>

                      <div className="bg-white/5 border-l-4 border-blue-500 p-4">
                        <h4 className="text-blue-400 font-mono font-bold text-sm mb-2">
                          SIGMAUSD PROTOCOL CONTRACT
                        </h4>
                        <p className="text-[#E5E5E5] text-sm mb-2">
                          On-chain smart contract data including reserve levels, circulation, 
                          and oracle price feeds.
                        </p>
                        <a
                          href="https://explorer.ergoplatform.com/en/addresses/9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono text-xs flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Contract on Explorer
                        </a>
                      </div>
                    </div>

                    <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 p-4 rounded">
                      <p className="text-[#A3A3A3] text-sm">
                        <strong className="text-[#E5E5E5]">Note:</strong> All API requests are 
                        made client-side. No user data is collected or stored. The application 
                        operates entirely in the browser with read-only blockchain access.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[#39FF14]/30 p-6 bg-black/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[#A3A3A3] text-sm font-mono">
                    Built for <span className="text-[#39FF14]">ErgoHack 2025</span>. 
                    Code is Open Source.
                  </p>
                  <a
                    href="https://github.com/yourusername/djedops"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-2 bg-[#39FF14]/10 border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-mono text-sm uppercase tracking-wider transition-all duration-300"
                  >
                    <Github className="w-4 h-4" />
                    VIEW GITHUB REPO
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
