'use client';

import { FileText, Github, Twitter, MessageCircle, ExternalLink, AlertTriangle } from 'lucide-react';

interface FooterProps {
  onKYAClick?: () => void;
}

export function Footer({ onKYAClick }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left Column - Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-zinc-400">
              © 2025 <span className="font-semibold text-white">The Stable Order</span>
            </p>
          </div>

          {/* Center Column - Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Documentation */}
            <a
              href="https://docs.stability.nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              aria-label="Documentation"
            >
              <FileText className="w-4 h-4" />
              <span>Documentation</span>
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/DjedAlliance"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </a>

            {/* Twitter */}
            <a
              href="https://x.com/DjedStablecoin"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              aria-label="Twitter / X"
            >
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">Twitter</span>
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </a>

            {/* Discord */}
            <a
              href="https://discord.gg/stabilitynexus"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              aria-label="Discord Community"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Discord</span>
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </a>
          </div>

          {/* Right Column - KYA Button */}
          <div className="flex justify-center md:justify-end">
            <button
              onClick={onKYAClick}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:border-yellow-500 transition-all text-sm font-medium"
              aria-label="Know Your Assumptions - View Legal Disclaimer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Know Your Assumptions</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
