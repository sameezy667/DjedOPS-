import type { Metadata } from "next";
import { Inter, Unbounded, JetBrains_Mono, Space_Mono } from "next/font/google";
import { ErrorBoundary } from "../components/ErrorBoundary";
import GridBackground from "../components/GridBackground";
import "./globals.css";

// Display fonts - optimized loading with preload
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "700", "900"],
  display: "swap",
  preload: true,
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: ["700", "900"],
  display: "swap",
  preload: true,
});

// Monospace fonts - optimized loading
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "DjedOps | Real-time Ergo Stability Monitor",
  description: "Monitor Djed Stablecoin health, track whales, and find arbitrage opportunities on the Ergo blockchain.",
  keywords: ["Ergo", "Djed", "Stablecoin", "DeFi", "Blockchain", "Analytics", "SigmaUSD"],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#000000",
  openGraph: {
    title: "DjedOps | Real-time Ergo Stability Monitor",
    description: "Monitor Djed Stablecoin health, track whales, and find arbitrage opportunities on the Ergo blockchain.",
    type: "website",
    siteName: "DjedOps",
    images: ["/Gemini_Generated_Image_fan86gfan86gfan8.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DjedOps | Real-time Ergo Stability Monitor",
    description: "Mission-critical visualization interface for the Djed stablecoin protocol",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#050505" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DjedOps" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
      </head>
      <body
        className={`${inter.variable} ${unbounded.variable} ${jetbrainsMono.variable} ${spaceMono.variable} antialiased bg-void text-textPrimary`}
      >
        {/* Animated Grid Background */}
        <GridBackground />
        
        {/* CRT Overlay Effect */}
        <div className="crt-overlay" aria-hidden="true" />
        
        {/* Scanline overlay effect - Financial Brutalism theme */}
        <div 
          className="fixed inset-0 pointer-events-none z-50 opacity-30"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15),
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            )`,
          }}
          aria-hidden="true"
        />
        
        {/* Skip to main content link for keyboard navigation */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        
        {/* Main content */}
        <div id="main-content" className="relative" style={{ zIndex: 10 }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}
