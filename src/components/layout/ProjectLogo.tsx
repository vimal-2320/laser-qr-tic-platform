import React from 'react';

interface ProjectLogoProps {
  className?: string;
  size?: number;
}

export const ProjectLogo: React.FC<ProjectLogoProps> = ({ className = '', size = 38 }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-industrial-900 to-industrial-950 p-1.5 border border-cyanAccent/40 shadow-cyan-glow group hover:border-cyanAccent transition-all ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer Hexagonal CAD Frame */}
        <polygon
          points="50,4 92,26 92,74 50,96 8,74 8,26"
          stroke="#00f2fe"
          strokeWidth="3.5"
          strokeLinejoin="round"
          className="opacity-80 group-hover:opacity-100 transition-opacity"
        />

        {/* CAD Corner Ticks */}
        <line x1="50" y1="4" x2="50" y2="14" stroke="#00f2fe" strokeWidth="2.5" />
        <line x1="50" y1="86" x2="50" y2="96" stroke="#00f2fe" strokeWidth="2.5" />
        <line x1="8" y1="50" x2="18" y2="50" stroke="#00f2fe" strokeWidth="2.5" />
        <line x1="82" y1="50" x2="92" y2="50" stroke="#00f2fe" strokeWidth="2.5" />

        {/* QR Code Position Detection Corner Boxes */}
        {/* Top-Left QR Finder */}
        <rect x="24" y="24" width="18" height="18" fill="none" stroke="#00f2fe" strokeWidth="2" />
        <rect x="28" y="28" width="10" height="10" fill="#00f2fe" />

        {/* Top-Right QR Finder */}
        <rect x="58" y="24" width="18" height="18" fill="none" stroke="#00f2fe" strokeWidth="2" />
        <rect x="62" y="28" width="10" height="10" fill="#00f2fe" />

        {/* Bottom-Left QR Finder */}
        <rect x="24" y="58" width="18" height="18" fill="none" stroke="#00f2fe" strokeWidth="2" />
        <rect x="28" y="62" width="10" height="10" fill="#00f2fe" />

        {/* Central Data Bits */}
        <rect x="47" y="26" width="6" height="6" fill="#00f2fe" opacity="0.9" />
        <rect x="47" y="47" width="6" height="6" fill="#00f2fe" opacity="0.9" />
        <rect x="26" y="47" width="6" height="6" fill="#00f2fe" opacity="0.9" />
        <rect x="68" y="47" width="6" height="6" fill="#00f2fe" opacity="0.9" />
        <rect x="47" y="68" width="6" height="6" fill="#00f2fe" opacity="0.9" />
        <rect x="68" y="68" width="6" height="6" fill="#00f2fe" opacity="0.9" />

        {/* Active Red Laser Beam Path (Angle across the QR) */}
        <line
          x1="12"
          y1="88"
          x2="88"
          y2="12"
          stroke="#ff3b30"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-pulse"
        />

        {/* Optical Crosshair Axis */}
        <circle cx="50" cy="50" r="16" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
        
        {/* Focal Laser Spark Center */}
        <circle cx="50" cy="50" r="4" fill="#ffffff" />
        <circle cx="50" cy="50" r="7" fill="#ff3b30" opacity="0.75" />
      </svg>
    </div>
  );
};
