import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',        // Pure Black (Aura background)
        obsidian: '#0A0A0A',    // Dark Grey (Aura cards)
        terminal: '#39FF14',    // Neon Terminal Green (legacy)
        alert: '#FF2A2A',       // Alert Red (danger)
        textPrimary: '#FFFFFF', // Pure White
        textSecondary: '#888888', // Steel Grey
      },
      fontFamily: {
        display: ['var(--font-unbounded)', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'var(--font-space-mono)', 'monospace'],
      },
      boxShadow: {
        'green-glow': '0 0 10px rgba(57, 255, 20, 0.6)',
        'red-glow': '0 0 10px rgba(255, 42, 42, 0.6)',
        'lime-glow': '0 0 30px rgba(163, 230, 53, 0.6)',
      },
      fontSize: {
        'massive': 'clamp(3rem, 12vw, 10rem)',
      },
      letterSpacing: {
        'tighter-xl': '-0.05em',
      },
      animation: {
        'scan': 'scan 3s linear infinite',
        'scan-slow': 'scan 5s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
