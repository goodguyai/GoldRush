
import React, { useId } from 'react';

interface Props {
  colors: string[]; // 1-4 hex colors
  size?: number;
  className?: string;
}

const CountryColorIcon = ({ colors, size = 48, className = "" }: Props) => {
  // Ensure we have at least one color to prevent errors
  const safeColors = colors && colors.length > 0 ? colors : ['#CCCCCC'];
  const uniqueId = useId();
  // Strip non-alphanumeric chars for ID safety just in case
  const gradientId = `grad-${uniqueId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const glowId = `glow-${uniqueId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={`drop-shadow-lg ${className}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: safeColors[0], stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: safeColors[safeColors.length - 1], stopOpacity: 1 }} />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Glow effect - Subtle back layer */}
      <path 
        d="M24 4 L42 24 L24 44 L6 24 Z" 
        fill={`url(#${gradientId})`}
        filter={`url(#${glowId})`}
        opacity="0.4"
      />
      
      {/* Main diamond body */}
      {/* If 3+ colors, let's use the colors directly instead of just a 2-stop gradient to show more flag detail */}
      {safeColors.length > 2 ? (
         <g>
            <mask id={`mask-${gradientId}`}>
               <path d="M24 4 L42 24 L24 44 L6 24 Z" fill="white" />
            </mask>
            <g mask={`url(#mask-${gradientId})`}>
                {safeColors.map((c, i) => (
                    <rect 
                        key={i}
                        x="0" 
                        y={i * (48 / safeColors.length)} 
                        width="48" 
                        height={48 / safeColors.length} 
                        fill={c} 
                    />
                ))}
                {/* Overlay gradient for depth */}
                <rect x="0" y="0" width="48" height="48" fill={`url(#${gradientId})`} opacity="0.3" style={{ mixBlendMode: 'overlay' }} />
            </g>
         </g>
      ) : (
         <path 
            d="M24 4 L42 24 L24 44 L6 24 Z" 
            fill={`url(#${gradientId})`}
         />
      )}
      
      {/* Highlight for 3D effect */}
      <path 
        d="M24 4 L42 24 L24 24 Z" 
        fill="white" 
        opacity="0.15"
      />
      
      {/* Border */}
      <path 
        d="M24 4 L42 24 L24 44 L6 24 Z" 
        fill="none" 
        stroke="rgba(255,255,255,0.4)" 
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default CountryColorIcon;
