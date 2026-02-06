
import React, { useState } from 'react';
import { User, LeagueSettings } from './types';
import { Plus, Minus, Zap, AlertTriangle, X } from './Icons';

interface BuyConfidenceSlotProps {
  user: User;
  leagueSettings: LeagueSettings;
  onPurchase: () => void;
  onRemoveSlot?: (removedCBs: string[]) => void;
}

const BuyConfidenceSlot: React.FC<BuyConfidenceSlotProps> = ({ 
  user, 
  leagueSettings, 
  onPurchase,
  onRemoveSlot
}) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const baseSlots = 10;
  const purchasedSlots = user.purchasedBoosts || 0;
  const totalSlots = baseSlots + purchasedSlots;
  const usedSlots = user.confidenceEvents?.length || 0;
  const price = leagueSettings.extraSlotPrice || 2;
  
  // Check deadline
  const isExpired = Date.now() >= (leagueSettings.openingCeremonyLockTime || 0);
  
  // Can only remove if they have purchased slots
  const canRemove = purchasedSlots > 0 && !isExpired && !!onRemoveSlot;
  
  // Calculate what would be removed
  const newMaxAfterRemove = totalSlots - 1;
  const cbsToRemove = usedSlots > newMaxAfterRemove 
    ? user.confidenceEvents.slice(newMaxAfterRemove) 
    : [];
  
  const handleRemove = () => {
    if (cbsToRemove.length > 0) {
      setShowRemoveConfirm(true);
    } else {
      onRemoveSlot?.([]);
    }
  };
  
  const confirmRemove = () => {
    onRemoveSlot?.(cbsToRemove);
    setShowRemoveConfirm(false);
  };

  return (
    <div className="neu-card p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 rounded-xl bg-electric-50 flex items-center justify-center text-electric-600 shadow-sm flex-shrink-0">
          <Zap size={20} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
            Boost Capacity
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-black text-gray-900 leading-none">
              {usedSlots} / {totalSlots}
            </p>
            {purchasedSlots > 0 && (
              <span className="text-[10px] font-bold text-electric-600 bg-electric-50 px-1.5 py-0.5 rounded">
                +{purchasedSlots} Bought
              </span>
            )}
          </div>
        </div>
      </div>
      
      {!isExpired ? (
        <div className="flex gap-2">
          {/* Buy Button */}
          <button
            onClick={onPurchase}
            className="flex-1 neu-button px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:text-electric-700 active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Buy CB Slot (+${price})</span>
          </button>
          
          {/* Remove Button */}
          {canRemove && (
            <button
              onClick={handleRemove}
              className="neu-button px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 active:scale-95 transition-all bg-gray-50 border border-gray-100"
            >
              <Minus size={14} strokeWidth={3} />
              <span>Remove</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100 justify-center">
          <AlertTriangle size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wide">Deadline Passed</span>
        </div>
      )}
      
      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic text-gray-900">Warning</h3>
                  <p className="text-xs text-gray-500">Capacity Reduction</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRemoveConfirm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
              <p className="text-sm text-red-700 font-medium leading-relaxed mb-3">
                Removing this slot will reduce your max capacity from <strong>{totalSlots}</strong> to <strong>{newMaxAfterRemove}</strong>.
              </p>
              {cbsToRemove.length > 0 && (
                <div className="pt-3 border-t border-red-200/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">
                    These boosts will be dropped:
                  </p>
                  <div className="space-y-1">
                    {cbsToRemove.map(eventId => (
                      <div key={eventId} className="text-xs font-bold text-red-700 bg-white rounded-md px-2 py-1 shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {eventId}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemove}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95 transition-all"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyConfidenceSlot;
