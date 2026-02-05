
import React from 'react';
import { User, LeagueSettings } from '../types';
import { Zap, X, Plus } from './Icons';

interface MiniBuySlotProps {
  user: User;
  leagueSettings: LeagueSettings;
  onPurchase: () => void;
  onClose: () => void;
}

const MiniBuySlot: React.FC<MiniBuySlotProps> = ({ 
  user, 
  leagueSettings, 
  onPurchase,
  onClose
}) => {
  const baseSlots = 10;
  const purchasedSlots = user.purchasedBoosts || 0;
  const totalSlots = baseSlots + purchasedSlots;
  const usedSlots = user.confidenceEvents?.length || 0;
  const price = leagueSettings.extraSlotPrice || 2;
  
  // Check deadline
  const isExpired = Date.now() >= (leagueSettings.openingCeremonyLockTime || 0);

  return (
    <div 
      className="bg-white rounded-2xl border border-white/50 h-auto py-2.5 px-3 flex items-center gap-3 animate-fade-in select-none w-max max-w-[92vw] relative z-50"
      style={{
        boxShadow: '8px 8px 16px rgba(163, 163, 168, 0.15), -8px -8px 16px rgba(255, 255, 255, 0.8)'
      }}
    >
      
      {/* Pointer Arrow */}
      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-white/50 transform rotate-45"></div>

      {/* Icon Container - Neumorphic Inset */}
      <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-500 shadow-[inset_2px_2px_4px_rgba(163,163,168,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] flex-shrink-0 border border-gold-100/50">
        <Zap size={20} className="fill-current drop-shadow-sm" />
      </div>

      {/* Stats Group */}
      <div className="flex flex-col justify-center min-w-[70px]">
        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
            Capacity
        </div>
        <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-gray-900 leading-none tracking-tight">
                {usedSlots}<span className="text-gray-300">/</span>{totalSlots}
            </span>
            {purchasedSlots > 0 && (
                <span className="text-[8px] font-black text-electric-600 bg-electric-50 px-1.5 py-0.5 rounded-md border border-electric-100 shadow-sm">
                    +{purchasedSlots}
                </span>
            )}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-1"></div>

      {/* Action Button */}
      {!isExpired ? (
        <button
          onClick={(e) => { e.stopPropagation(); onPurchase(); }}
          className="flex items-center gap-2 bg-gradient-to-br from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 active:from-electric-600 active:to-electric-700 text-white h-9 pl-3 pr-4 rounded-xl shadow-lg shadow-electric-500/20 active:scale-95 transition-all group"
        >
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
             <Plus size={10} strokeWidth={4} />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-black uppercase tracking-wide">Buy Slot</span>
            <span className="text-[8px] font-medium opacity-90">${price}</span>
          </div>
        </button>
      ) : (
        <div className="h-9 px-4 flex items-center bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase border border-gray-200 cursor-not-allowed shadow-inner">
          Locked
        </div>
      )}

      {/* Close Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 active:bg-gray-200 transition-all ml-1"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default MiniBuySlot;
