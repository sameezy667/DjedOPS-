'use client';

export default function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Grid pattern - highly visible */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.5) 2px, transparent 2px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.5) 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.6,
        }}
      />
      
      {/* Animated scan lines - very bright */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-full animate-scan"
          style={{
            height: '3px',
            background: 'linear-gradient(to right, transparent, #00ff41 50%, transparent)',
            boxShadow: '0 0 30px #00ff41, 0 0 60px #00ff41, 0 0 90px #00ff41',
          }}
        />
        <div 
          className="absolute w-full animate-scan-slow"
          style={{
            height: '3px',
            background: 'linear-gradient(to right, transparent, #ff0040 50%, transparent)',
            boxShadow: '0 0 30px #ff0040, 0 0 60px #ff0040, 0 0 90px #ff0040',
          }}
        />
      </div>
    </div>
  );
}
