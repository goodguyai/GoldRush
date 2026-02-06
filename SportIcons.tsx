
import React from 'react';
import { IconType } from 'react-icons';

// Phosphor Icons
import { PiPersonSimpleSkiFill } from 'react-icons/pi';

// Font Awesome 6
import { FaPersonRifle, FaPersonSkiingNordic, FaPersonSkiing, FaPersonSkating } from 'react-icons/fa6';

// Font Awesome 5
import { FaSnowboarding, FaMedal } from 'react-icons/fa';

// Material Design
import { MdSledding, MdSportsHockey, MdDownhillSkiing } from 'react-icons/md';

// Game Icons
import { GiCurlingStone, GiSkis } from 'react-icons/gi';

// Tabler Icons
import { TbIceSkating, TbSkiJumping } from 'react-icons/tb';

// Bootstrap Icons
import { BsEmojiSmileFill } from 'react-icons/bs';

// Boxicons
import { BiSolidUpsideDown } from 'react-icons/bi';

interface SportIconProps {
  sport: string;
  eventId?: string;
  className?: string;
  variant?: 'default' | 'gold' | 'live';
  size?: number;
}

const SPORT_ICONS: Record<string, IconType> = {
  'Alpine Skiing': PiPersonSimpleSkiFill,
  'Biathlon': FaPersonRifle,
  'Bobsleigh': MdSledding,
  'Bobsled': MdSledding,
  'Cross-Country Skiing': FaPersonSkiingNordic,
  'Cross-Country': FaPersonSkiingNordic,
  'Curling': GiCurlingStone,
  'Figure Skating': TbIceSkating,
  'Freestyle Skiing': FaPersonSkiing,
  'Ice Hockey': MdSportsHockey,
  'Luge': BsEmojiSmileFill,
  'Nordic Combined': MdDownhillSkiing,
  'Short Track Speed Skating': FaPersonSkating,
  'Short Track': FaPersonSkating,
  'Skeleton': BiSolidUpsideDown,
  'Ski Jumping': TbSkiJumping,
  'Ski Mountaineering': GiSkis,
  'Snowboarding': FaSnowboarding,
  'Snowboard': FaSnowboarding,
  'Speed Skating': FaPersonSkating,
};

const DEFAULT_ICON: IconType = FaMedal;

// Muted colors that complement neumorphic design
const getColorClass = (variant: string, sport: string): string => {
  if (variant === 'gold') return 'text-amber-500';
  if (variant === 'live') return 'text-white';
  
  const categories: Record<string, string[]> = {
    // Alpine/Downhill - Cool slate blue
    'text-slate-500': [
      'Alpine Skiing', 
      'Freestyle Skiing', 
      'Ski Jumping',
    ],
    
    // Endurance/Nordic - Muted teal
    'text-teal-600': [
      'Cross-Country Skiing', 
      'Cross-Country', 
      'Biathlon', 
      'Nordic Combined',
      'Ski Mountaineering',
    ],
    
    // Ice/Rink sports - Soft indigo
    'text-indigo-400': [
      'Figure Skating', 
      'Ice Hockey', 
      'Curling',
    ],
    
    // Speed/Sliding - Warm rose
    'text-rose-400': [
      'Bobsleigh', 
      'Bobsled', 
      'Luge', 
      'Skeleton', 
      'Speed Skating', 
      'Short Track', 
      'Short Track Speed Skating',
    ],
    
    // Board sports - Muted amber
    'text-amber-600': [
      'Snowboarding', 
      'Snowboard',
    ],
  };
  
  for (const [color, sports] of Object.entries(categories)) {
    if (sports.includes(sport)) return color;
  }
  
  return 'text-gray-500';
};

export const SportIcon: React.FC<SportIconProps> = ({ 
  sport, 
  eventId,
  className,
  variant = 'default',
  size = 20
}) => {
  const IconComponent = SPORT_ICONS[sport] || DEFAULT_ICON;
  const colorClass = getColorClass(variant, sport);
  
  // Normalize icon sizing with flex centering container
  return (
    <span 
      className={`inline-flex items-center justify-center ${colorClass} ${className || ''}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
      }}
    >
      <IconComponent 
        style={{ 
          width: '100%', 
          height: '100%',
        }} 
      />
    </span>
  );
};

export default SportIcon;
