import React from 'react';

/**
 * 8-Fold Islamic Geometric Star Rosette SVG
 * Used as subtle low-opacity watermark / decorative accent
 */
export const IslamicStarMotif: React.FC<{ className?: string; color?: string }> = ({
  className = "w-6 h-6",
  color = "#D4AF37",
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Concentric subtle geometry */}
    <circle cx="50" cy="50" r="44" stroke={color} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="32" stroke={color} strokeWidth="0.8" strokeOpacity="0.5" />
    
    {/* 8-pointed star formed by two intersecting 45-degree rotated squares */}
    <rect
      x="25"
      y="25"
      width="50"
      height="50"
      stroke={color}
      strokeWidth="1.2"
      fill="none"
    />
    <rect
      x="25"
      y="25"
      width="50"
      height="50"
      stroke={color}
      strokeWidth="1.2"
      fill="none"
      transform="rotate(45 50 50)"
    />

    {/* Central 8-pointed inner rosette star */}
    <polygon
      points="50,30 54,42 66,38 58,48 70,50 58,52 66,62 54,58 50,70 46,58 34,62 42,52 30,50 42,48 34,38 46,42"
      fill={color}
      fillOpacity="0.35"
      stroke={color}
      strokeWidth="0.8"
    />
    
    <circle cx="50" cy="50" r="4" fill={color} />
  </svg>
);

/**
 * Islamic Architectural Mihrab Arch Outline Accent
 */
export const IslamicArchMotif: React.FC<{ className?: string; color?: string }> = ({
  className = "w-12 h-16",
  color = "#D4AF37",
}) => (
  <svg
    viewBox="0 0 80 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M10 115 V60 C10 32 30 15 40 8 C50 15 70 32 70 60 V115"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M16 115 V62 C16 38 32 23 40 17 C48 23 64 38 64 62 V115"
      stroke={color}
      strokeWidth="0.8"
      strokeOpacity="0.6"
    />
    <circle cx="40" cy="30" r="2.5" fill={color} />
  </svg>
);

/**
 * Geometric Girih Ribbon border pattern
 */
export const IslamicBorderBand: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`w-full h-1.5 flex items-center justify-center overflow-hidden opacity-60 ${className}`}>
    <div className="w-full h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
  </div>
);
