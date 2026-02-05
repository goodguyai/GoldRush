
import React from 'react';
import { IconType } from 'react-icons';

import { 
  FaTrophy,
  FaPencilAlt,
  FaUserCircle,
  FaChartLine,
  FaCog,
  FaComments,
  FaShieldAlt,
  FaWallet,
  FaSignOutAlt,
  FaBookOpen,
  FaBolt,
  FaChevronDown,
  FaExclamationTriangle,
  FaSearch,
  FaCheck,
  FaArrowRight,
  FaClock,
  FaLock,
  FaPlus,
  FaTimes,
  FaSignInAlt,
  FaInfoCircle,
  FaFlag,
  FaDollarSign,
  FaUserShield,
  FaUsers,
  FaWater,
  FaGlobe,
  FaChevronRight,
  FaChartBar,
  FaCopy,
  FaShareAlt,
  FaCalendarAlt,
  FaPaperPlane,
  FaPlay,
  FaPause,
  FaUndo,
  FaTh,
  FaMagic,
  FaTrash,
  FaRandom,
  FaStar,
  FaCoins,
  FaFire,
  FaSnowflake,
  FaMountain,
  FaEye,
  FaSync,
  FaUserPlus,
  FaUserMinus,
  FaHome,
  FaBug,
  FaMinus
} from 'react-icons/fa';

// Use MdShield for shield-related icons
import { MdShield } from 'react-icons/md';
import { GiWhistle } from 'react-icons/gi';

interface IconProps {
  size?: number;
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

// Wrapper
const wrap = (Icon: any) => ({ size = 24, className = "", ...props }: IconProps) => {
  const Component = Icon;
  return <Component size={size} className={className} {...props} />;
};

// Custom SVG for Olympic Rings
export const OlympicRings = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
    <circle cx="20" cy="20" r="15" />
    <circle cx="50" cy="20" r="15" />
    <circle cx="80" cy="20" r="15" />
    <circle cx="35" cy="35" r="15" />
    <circle cx="65" cy="35" r="15" />
  </svg>
);

// ADAPTER EXPORTS - ALL VERIFIED ICONS
export const Snowflake = wrap(FaSnowflake);
export const Shield = wrap(FaShieldAlt);
export const Whistle = wrap(GiWhistle); // Commissioner Icon
export const Wallet = wrap(FaWallet);
export const LogOut = wrap(FaSignOutAlt);
export const Trophy = wrap(FaTrophy);
export const Activity = wrap(FaChartLine);
export const Edit3 = wrap(FaPencilAlt);
export const UserCircle = wrap(FaUserCircle);
export const BookOpen = wrap(FaBookOpen);
export const Zap = wrap(FaBolt);
export const ChevronDown = wrap(FaChevronDown);
export const AlertTriangle = wrap(FaExclamationTriangle);
export const Search = wrap(FaSearch);
export const Check = wrap(FaCheck);
export const ArrowRight = wrap(FaArrowRight);
export const Clock = wrap(FaClock);
export const Lock = wrap(FaLock);
export const PlusCircle = wrap(FaPlus);
export const X = wrap(FaTimes);
export const Plus = wrap(FaPlus);
export const Minus = wrap(FaMinus);
export const LogIn = wrap(FaSignInAlt);
export const Settings = wrap(FaCog);
export const Info = wrap(FaInfoCircle);
export const Flag = wrap(FaFlag);
export const DollarSign = wrap(FaDollarSign);
export const ShieldCheck = wrap(FaUserShield);
export const ShieldAlert = wrap(MdShield);
export const Users = wrap(FaUsers);
export const Waves = wrap(FaWater);
export const Globe = wrap(FaGlobe);
export const ChevronRight = wrap(FaChevronRight);
export const TrendingUp = wrap(FaChartLine);
export const BarChart = wrap(FaChartBar);
export const Copy = wrap(FaCopy);
export const Share2 = wrap(FaShareAlt);
export const Calendar = wrap(FaCalendarAlt);
export const Send = wrap(FaPaperPlane);
export const Play = wrap(FaPlay);
export const Pause = wrap(FaPause);
export const RotateCcw = wrap(FaUndo);
export const MessageCircle = wrap(FaComments);
export const Grid = wrap(FaTh);
export const Sparkles = wrap(FaMagic);
export const Trash2 = wrap(FaTrash);
export const Shuffle = wrap(FaRandom);
export const PenTool = wrap(FaPencilAlt);
export const Star = wrap(FaStar);
export const Coin = wrap(FaCoins);
export const Flame = wrap(FaFire);
export const Eye = wrap(FaEye);
export const RefreshCw = wrap(FaSync);
export const UserPlus = wrap(FaUserPlus);
export const UserMinus = wrap(FaUserMinus);
export const Home = wrap(FaHome);
export const Bug = wrap(FaBug);

// Aliases
export const Mountain = wrap(FaMountain);
export const Wind = wrap(FaBolt);
export const Target = wrap(FaUserShield);
export const CircleDot = wrap(FaUsers);
export const Timer = wrap(FaClock);
export const Footprints = wrap(FaChartLine);
export const Award = wrap(FaTrophy);
export const Circle = wrap(FaUsers);
