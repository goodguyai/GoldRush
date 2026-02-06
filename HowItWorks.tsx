
import React from 'react';
import { X, Users, Trophy, Zap, ShieldAlert, Activity, BookOpen } from './Icons';

interface HowItWorksProps {
  onClose: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col relative animate-fade-in">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-white z-10">
            <div className="flex items-center gap-3">
                 <div className="p-2 bg-electric-50 text-electric-600 rounded-xl">
                    <BookOpen size={20} />
                 </div>
                 <h2 className="text-xl font-black italic uppercase text-gray-900 tracking-tighter">Mission Briefing</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer">
                <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white overscroll-contain">
            
            {/* Section 1: Concept */}
            <section className="space-y-3">
                <div className="flex items-center gap-3 text-electric-600">
                    <Users size={20} />
                    <h3 className="text-base font-black uppercase italic tracking-wide text-gray-900">1. The League</h3>
                </div>
                <div className="bg-gray-50 rounded-[20px] p-5 border border-gray-100 text-sm text-gray-600 leading-relaxed">
                    <p className="mb-3">
                        Gold Hunt is played in <strong className="text-gray-900">Leagues</strong>.
                        To keep drafts intense, Leagues are divided into <strong className="text-gray-900">Divisions</strong>.
                    </p>
                    <p>
                        A division is a group of players (usually 3-6). You draft countries <strong>only</strong> against rivals in your Division. This ensures every player gets a chance at top-tier nations.
                    </p>
                </div>
            </section>

            {/* Section 2: The Draft */}
            <section className="space-y-3">
                <div className="flex items-center gap-3 text-gold-600">
                    <Trophy size={20} />
                    <h3 className="text-base font-black uppercase italic tracking-wide text-gray-900">2. The Draft</h3>
                </div>
                <div className="bg-gray-50 rounded-[20px] p-5 border border-gray-100 text-sm text-gray-600 leading-relaxed space-y-4">
                    <p>
                        You will draft <strong className="text-gray-900">4 Nations</strong> in a snake format.
                        The later you pick a country, the higher its <strong className="text-gold-600">Score Multiplier</strong>.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-gray-100">
                            <div className="text-[9px] uppercase font-black text-gray-400">Round 1</div>
                            <div className="text-lg font-black text-gray-900">1x Points</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm text-center border-l-4 border-electric-600">
                            <div className="text-[9px] uppercase font-black text-electric-600">Round 2</div>
                            <div className="text-lg font-black text-electric-600">5x Points</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm text-center border-l-4 border-purple-500">
                            <div className="text-[9px] uppercase font-black text-purple-600">Round 3</div>
                            <div className="text-lg font-black text-purple-600">10x Points</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm text-center border-l-4 border-gold-500 relative overflow-hidden">
                             <div className="text-[9px] uppercase font-black text-gold-600">Round 4</div>
                             <div className="text-lg font-black text-gold-600">20x Points</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Confidence Boosts */}
            <section className="space-y-3">
                <div className="flex items-center gap-3 text-electric-600">
                    <Zap size={20} />
                    <h3 className="text-base font-black uppercase italic tracking-wide text-gray-900">3. Confidence Boosts</h3>
                </div>
                <div className="bg-gray-50 rounded-[20px] p-5 border border-gray-100 text-sm text-gray-600 leading-relaxed space-y-4">
                    <p>
                        Select specific Events where you believe your drafted nations will dominate.
                    </p>
                    <div className="space-y-3">
                        <div className="flex gap-3 items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-electric-600 flex-shrink-0" />
                            <div>
                               <strong className="text-gray-900 block text-xs uppercase tracking-wider mb-0.5">The Boost (CB)</strong>
                               <span className="text-xs">Double points (<strong className="text-gray-900">2x</strong>) for medals won in that event.</span>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-electric-600 flex-shrink-0" />
                            <div>
                               <strong className="text-gray-900 block text-xs uppercase tracking-wider mb-0.5">The Limit</strong>
                               <span className="text-xs">Max <strong className="text-gray-900">2 Boosts</strong> per discipline.</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-100 p-4 rounded-[16px] flex items-start gap-3 mt-2">
                        <ShieldAlert className="text-red-500 flex-shrink-0" size={20} />
                        <div className="text-xs text-red-600 leading-relaxed font-medium">
                            <strong className="text-red-700 uppercase tracking-wider block mb-1 font-black">The Penalty</strong>
                            If your drafted nations win <strong className="font-black">ZERO medals</strong> in a Boosted event, you suffer a <strong className="font-black">-100 Point Penalty</strong>.
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Scoring */}
            <section className="space-y-3">
                <div className="flex items-center gap-3 text-italy-green">
                    <Activity size={20} />
                    <h3 className="text-base font-black uppercase italic tracking-wide text-gray-900">4. Scoring</h3>
                </div>
                <div className="bg-gray-50 rounded-[20px] p-5 border border-gray-100 text-sm text-gray-600 leading-relaxed space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-center">
                            <div className="text-xl font-black text-gold-500 italic">5</div>
                            <div className="text-[8px] uppercase font-bold text-gray-400">Gold</div>
                        </div>
                        <div className="text-center border-x border-gray-100 px-6">
                            <div className="text-xl font-black text-gray-400 italic">3</div>
                            <div className="text-[8px] uppercase font-bold text-gray-400">Silver</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-black text-orange-600 italic">1</div>
                            <div className="text-[8px] uppercase font-bold text-gray-400">Bronze</div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Master Formula</div>
                        <div className="font-mono text-[10px] bg-white text-electric-600 p-3 rounded-xl border border-gray-100 shadow-sm break-words leading-relaxed font-bold">
                            Points = Medal Value × Round Mult × CB Mult
                        </div>
                    </div>
                </div>
            </section>

          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-white">
             <button onClick={onClose} className="w-full py-3.5 bg-electric-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg active:scale-[0.98] transition-all hover:bg-electric-700 cursor-pointer">
                Acknowledge & Continue
             </button>
          </div>
      </div>
    </div>
  );
};

export default HowItWorks;
