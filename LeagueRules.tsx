
import React from 'react';
import { SCORING_RULES } from './constants';
import { BookOpen, Zap, Trophy, ShieldCheck, ShieldAlert } from './Icons';

interface LeagueRulesProps {
  onBack?: () => void;
}

const LeagueRules: React.FC<LeagueRulesProps> = ({ onBack }) => {
  return (
    <div className="p-5 pb-40 max-w-2xl mx-auto space-y-8 animate-fade-in text-neu-text-main">
      {onBack && (
        <button onClick={onBack} className="neu-btn px-4 py-2 flex items-center gap-2 text-neu-text-sub font-black text-xs uppercase tracking-[0.2em] mb-4 hover:text-neu-text-bold">
          Back
        </button>
      )}
      
      <div className="bg-neu-base neu-card-interactive p-8 relative overflow-hidden cursor-default group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform rotate-12 transition-transform group-hover:rotate-0 text-neu-text-sub">
          <BookOpen size={180} />
        </div>
        <div className="relative z-10">
           <h2 className="text-4xl font-black mb-2 italic uppercase tracking-tighter text-neu-text-bold">League Constitution</h2>
           <p className="text-neu-text-sub text-sm font-bold uppercase tracking-widest">Official Bylaws of Gold Hunt '26</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Formula Section */}
        <div className="bg-neu-base rounded-[28px] shadow-neu-flat overflow-hidden">
          <div className="bg-neu-base p-6 border-b border-neu-pressed flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neu-base shadow-neu-icon flex items-center justify-center text-electric-600">
                <Zap size={20} />
            </div>
            <h3 className="font-black text-neu-text-bold italic uppercase tracking-tight">The Point Formula</h3>
          </div>
          <div className="p-8 space-y-6">
             <div className="bg-neu-pressed p-6 rounded-2xl shadow-neu-pressed-sm text-center border border-white/50">
                <div className="text-lg font-black text-neu-text-bold italic">
                  Medal Points × Round Multiplier × CB Multiplier
                </div>
                <div className="text-[10px] text-electric-600 uppercase tracking-widest mt-2 font-bold">
                  (CB Multiplier = 2x if event is a Confidence Boost)
                </div>
             </div>
             
             <div className="flex justify-between items-end bg-neu-base p-6 rounded-2xl shadow-neu-flat">
              <div className="text-center w-1/3">
                <div className="text-3xl font-black text-gold-500 italic drop-shadow-sm">{SCORING_RULES.GOLD}</div>
                <div className="text-[9px] uppercase font-black text-neu-text-sub tracking-widest">Gold</div>
              </div>
              <div className="text-center w-1/3 border-x border-neu-pressed/50">
                <div className="text-3xl font-black text-neu-text-sub italic drop-shadow-sm">{SCORING_RULES.SILVER}</div>
                <div className="text-[9px] uppercase font-black text-neu-text-sub tracking-widest">Silver</div>
              </div>
              <div className="text-center w-1/3">
                <div className="text-3xl font-black text-orange-600 italic drop-shadow-sm">{SCORING_RULES.BRONZE}</div>
                <div className="text-[9px] uppercase font-black text-neu-text-sub tracking-widest">Bronze</div>
              </div>
            </div>
          </div>
        </div>

        {/* Multipliers Section */}
        <div className="bg-neu-base rounded-[28px] shadow-neu-flat overflow-hidden">
          <div className="bg-neu-base p-6 border-b border-neu-pressed flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-neu-base shadow-neu-icon flex items-center justify-center text-gold-500">
                <Trophy size={20} />
            </div>
            <h3 className="font-black text-neu-text-bold italic uppercase tracking-tight">Snake Draft Risk</h3>
          </div>
          <div className="p-8 grid grid-cols-2 gap-4">
              <div className="p-5 bg-neu-base rounded-2xl shadow-neu-flat text-center group hover:-translate-y-1 transition-transform">
                <div className="text-[10px] font-black text-neu-text-sub uppercase tracking-widest mb-1">Round 1</div>
                <div className="text-3xl font-black text-neu-text-bold italic">1x</div>
              </div>
              <div className="p-5 bg-neu-base rounded-2xl shadow-neu-flat text-center group hover:-translate-y-1 transition-transform">
                <div className="text-[10px] font-black text-neu-text-sub uppercase tracking-widest mb-1">Round 2</div>
                <div className="text-3xl font-black text-electric-600 italic">5x</div>
              </div>
              <div className="p-5 bg-neu-base rounded-2xl shadow-neu-flat text-center group hover:-translate-y-1 transition-transform">
                <div className="text-[10px] font-black text-neu-text-sub uppercase tracking-widest mb-1">Round 3</div>
                <div className="text-3xl font-black text-purple-600 italic">10x</div>
              </div>
              <div className="p-5 bg-neu-base rounded-2xl shadow-neu-pressed border-2 border-gold-400/20 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-[10px] font-black text-gold-600 uppercase tracking-widest mb-1">Mendoza Line (RD 4)</div>
                    <div className="text-3xl font-black text-gold-600 italic">20x</div>
                </div>
              </div>
          </div>
        </div>

        {/* Constraints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-neu-base p-6 rounded-[28px] shadow-neu-flat space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-neu-base text-electric-600 rounded-xl shadow-neu-pressed">
                    <ShieldCheck size={20} />
                 </div>
                 <h4 className="font-black text-neu-text-bold italic uppercase text-sm">Discipline Cap</h4>
              </div>
              <p className="text-xs text-neu-text-sub leading-relaxed font-bold">
                 To ensure roster diversity, users are limited to <strong className="text-electric-600">2 confidence boosts per discipline</strong>.
              </p>
           </div>

           <div className="bg-neu-base p-6 rounded-[28px] shadow-neu-flat space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 border-2 border-italy-red/10 rounded-[28px] pointer-events-none" />
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-neu-base text-italy-red rounded-xl shadow-neu-pressed">
                    <ShieldAlert size={20} />
                 </div>
                 <h4 className="font-black text-italy-red italic uppercase text-sm">Confidence Penalty</h4>
              </div>
              <p className="text-xs text-italy-red/80 leading-relaxed font-bold">
                 Confidence is double-edged. If zero medals are won in a boosted event, a <strong className="text-italy-red">-100 point penalty</strong> is applied.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueRules;
