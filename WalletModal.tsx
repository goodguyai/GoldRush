
import React from 'react';
import { User, LeagueSettings } from './types';
import { X, DollarSign, Trophy, Zap, Users } from './Icons';

interface WalletModalProps {
  user: User;
  leagueSettings: LeagueSettings;
  allUsers: User[];
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ user, leagueSettings, allUsers, onClose }) => {
  const entryFee = leagueSettings.entryFee || 0;
  const extraSlotPrice = leagueSettings.extraSlotPrice || 0;
  const purchasedBoosts = user.purchasedBoosts || 0;
  const boostSpend = purchasedBoosts * extraSlotPrice;
  const totalSpent = entryFee + boostSpend;

  // Calculate league-wide pot
  const totalPlayers = allUsers.filter(u => !u.isBot).length || leagueSettings.totalUsers;
  const basePot = totalPlayers * entryFee;
  const totalBoostRevenue = allUsers.reduce((sum, u) => sum + (u.purchasedBoosts || 0) * extraSlotPrice, 0);
  const totalPot = basePot + totalBoostRevenue;

  // Payout splits
  const payouts = leagueSettings.payouts || { first: 60, second: 25, third: 10, fantasyCares: 5 };
  const caresAmount = totalPot * (payouts.fantasyCares / 100);
  const distributablePot = totalPot - caresAmount;

  const payoutRows = [
    { label: '1st Place', pct: payouts.first, amount: distributablePot * (payouts.first / (payouts.first + payouts.second + payouts.third)) },
    { label: '2nd Place', pct: payouts.second, amount: distributablePot * (payouts.second / (payouts.first + payouts.second + payouts.third)) },
    { label: '3rd Place', pct: payouts.third, amount: distributablePot * (payouts.third / (payouts.first + payouts.second + payouts.third)) },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-neu-base rounded-t-[32px] shadow-2xl overflow-hidden toast-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-6 pb-5 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-white/5 rounded-full" />

          <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-black uppercase italic text-lg tracking-tight leading-none">Wallet</h2>
                <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest mt-0.5">Financial Overview</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              <X size={16} />
            </button>
          </div>

          {/* Total Spent Hero */}
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Your Total Dues</p>
              <p className="text-4xl font-black text-white italic tracking-tighter leading-none">${totalSpent}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">League Pot</p>
              <p className="text-2xl font-black text-white/90 italic tracking-tighter leading-none">${totalPot}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar">

          {/* Your Spending Breakdown */}
          <div className="neu-card p-4 space-y-3">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Your Spending</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <DollarSign size={12} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">Entry Fee</span>
                </div>
                <span className="text-sm font-black text-gray-900">${entryFee}</span>
              </div>

              {boostSpend > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-electric-50 flex items-center justify-center text-electric-600 flex-shrink-0">
                      <Zap size={12} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Boost Slots ({purchasedBoosts}× ${extraSlotPrice})</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">${boostSpend}</span>
                </div>
              )}

              <div className="h-px bg-gray-200/80 my-1" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-900 uppercase">Total</span>
                <span className="text-base font-black text-emerald-600 italic">${totalSpent}</span>
              </div>
            </div>
          </div>

          {/* Pot & Payouts */}
          <div className="neu-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Prize Pool</p>
              <div className="flex items-center gap-1.5">
                <Users size={10} className="text-gray-400" />
                <span className="text-[9px] font-bold text-gray-400">{totalPlayers} players</span>
              </div>
            </div>

            <div className="space-y-2">
              {payoutRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      i === 0 ? 'bg-gold-50 text-gold-600' :
                      i === 1 ? 'bg-gray-100 text-gray-500' :
                      'bg-orange-50 text-orange-500'
                    }`}>
                      <Trophy size={12} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{row.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-gray-900">${row.amount.toFixed(0)}</span>
                    <span className="text-[9px] text-gray-400 font-bold ml-1.5">{row.pct}%</span>
                  </div>
                </div>
              ))}

              {payouts.fantasyCares > 0 && (
                <>
                  <div className="h-px bg-gray-200/80 my-1" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0">
                        <span className="text-xs">❤️</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">Fantasy Cares</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-pink-600">${caresAmount.toFixed(0)}</span>
                      <span className="text-[9px] text-gray-400 font-bold ml-1.5">{payouts.fantasyCares}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom handle / swipe hint */}
        <div className="flex justify-center pb-5 pt-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
