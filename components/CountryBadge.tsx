
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
      className={`relative rounded-2xl bg-white flex items-center justify-center overflow-hidden group transition-all duration-300 border border-gray-100 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle flag pattern background - shows on hover */}
      <div className="absolute inset-0 flex opacity-0 group-hover:opacity-10 transition-opacity duration-300">
        {safeColors.map((color, i) => (
          <div 
            key={i}
            className="flex-1 h-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      {/* Color accent bar on left */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-1.5 transition-all duration-300 group-hover:w-2"
        style={{ backgroundColor: primaryColor }}
      />
      
      {/* Country code */}
      <span 
        className="relative z-10 font-black tracking-tighter leading-none transition-transform duration-300 group-hover:scale-110 select-none"
        style={{ 
          color: primaryColor,
          fontSize: `${size * 0.35}px` // Dynamic text sizing
        }}
      >
        {code}
      </span>
    </div>
  );
};

export default CountryBadge;
