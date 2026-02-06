
import React, { useState } from 'react';
import { Trophy, Edit3, UserCircle, Activity, MessageCircle } from './Icons';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
  isVisible: boolean;
  unreadChatCount?: number;
  draftPhase?: 'waiting' | 'live' | 'complete';
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentTab, 
  setTab, 
  isVisible, 
  unreadChatCount = 0,
  draftPhase = 'waiting'
}) => {
  const [pressingId, setPressingId] = useState<string | null>(null);

  // Consolidated 5-tab navigation
  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'LIVE' },
    { id: 'draft', icon: Edit3, label: 'DRAFT', badge: draftPhase === 'live' ? '!' : undefined },
    { id: 'chat', icon: MessageCircle, label: 'CHAT', badge: unreadChatCount > 0 ? String(unreadChatCount) : undefined },
    { id: 'leaderboard', icon: Trophy, label: 'RANK' },
    { id: 'profile', icon: UserCircle, label: 'ME' }, // Renamed from TEAM, includes settings
  ];

  if (!isVisible) return null;

  const handleNavClick = (id: string) => {
    // Haptic feedback (if available)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setPressingId(id);
    setTimeout(() => {
      setPressingId(null);
      setTab(id);
      window.scrollTo(0, 0);
    }, 100);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] pb-safe glass-nav-bottom">
      <div className="flex items-center justify-around h-[88px] px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const isPressing = pressingId === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="relative flex flex-col items-center justify-center gap-1.5 py-2 px-1 outline-none select-none w-16 group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Icon Container */}
              <div
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isPressing
                    ? 'bg-neu-pressed shadow-neu-pressed text-electric-600 scale-95' 
                    : isActive
                    ? 'bg-white shadow-neu-flat text-electric-600 -translate-y-2' 
                    : 'bg-neu-base shadow-neu-flat text-gray-400 active:scale-95' 
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-all duration-200 ${isActive ? 'scale-110' : ''}`}
                />
                
                {/* Badge */}
                {item.badge && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
                    {item.badge}
                  </div>
                )}
              </div>
              
              {/* Label */}
              <span
                className={`text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                  isActive ? 'text-electric-600' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
