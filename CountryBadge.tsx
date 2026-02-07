
import React from 'react';

interface CountryBadgeProps {
  code: string;
  colors: string[];
  primaryColor: string;
  size?: number;
  className?: string;
}

const CountryBadge: React.FC<CountryBadgeProps> = ({ 
  code, 
  colors, 
  primaryColor, 
  size = 56,
  className = ""
}) => {
  // Ensure we have colors
  const safeColors = colors && colors.length > 0 ? colors : ['#E2E8F0'];

  return (
    <div
      className={`relative rounded-full bg-white flex items-center justify-center overflow-hidden group transition-all duration-300 shadow-md border-2 ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: primaryColor + '40'
      }}
    >
      {/* Ring color accent */}
      <div
        className="absolute inset-0 rounded-full opacity-10"
        style={{
          background: `linear-gradient(135deg, ${safeColors[0] || primaryColor}, ${safeColors[safeColors.length - 1] || primaryColor})`
        }}
      />

      {/* Country code */}
      <span
        className="relative z-10 font-black tracking-tighter leading-none transition-transform duration-300 group-hover:scale-110 select-none"
        style={{
          color: primaryColor,
          fontSize: `${size * 0.32}px`
        }}
      >
        {code}
      </span>
    </div>
  );
};

export default CountryBadge;
