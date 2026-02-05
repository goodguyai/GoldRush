
import React, { useState, useEffect } from 'react';
import { OlympicRings, Plus, LogIn, Grid, ArrowRight, LogOut, Shield, BookOpen, Whistle } from './Icons';
import { getUserLeagues, signOut } from '../services/databaseService';
import HowItWorks from './HowItWorks';

interface LobbyProps {
  userId: string;
  userEmail: string;
  onSelectLeague: (session: any) => void;
  onCreateNew: () => void;
  onJoinExisting: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ userId, userEmail, onSelectLeague, onCreateNew, onJoinExisting }) => {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    let mounted = true;
    getUserLeagues(userId).then(data => {
      if (mounted) {
        setLeagues(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [userId]);

  const handleSelect = (league: any) => {
      onSelectLeague({
          userId,
          leagueId: league.leagueId,
          role: league.role,
          selectedWaveId: league.waveId || 'A'
      });
  };

  const handleSignOut = async () => {
      await signOut();
      window.location.reload();
  };

  return (
    <div className="h-dvh bg-neu-base flex flex-col animate-fade-in overflow-hidden">
       {/* Header */}
       <div className="p-6 flex justify-between items-center max-w-lg mx-auto w-full flex-shrink-0">
           <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-electric-600">
                   <OlympicRings size={20} />
               </div>
               <span className="font-black text-gray-900 italic uppercase tracking-tight">Gold Hunt</span>
           </div>
           <button onClick={handleSignOut} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors cursor-pointer">
               <LogOut size={18} />
           </button>
       </div>

       <div className="flex-1 overflow-y-auto px-6 pb-24 max-w-lg mx-auto w-full no-scrollbar space-y-6">
           
           <div className="space-y-2">
               <h1 className="text-2xl font-black italic uppercase text-gray-900">Welcome Back</h1>
               <p className="text-xs text-gray-500 font-medium">Logged in as {userEmail}</p>
           </div>

           {/* Actions */}
           <div className="grid grid-cols-2 gap-4">
               <button onClick={onCreateNew} className="bg-white p-4 rounded-[24px] shadow-sm flex flex-col gap-3 group hover:-translate-y-1 transition-transform border border-gray-100 cursor-pointer">
                   <div className="w-10 h-10 bg-electric-50 rounded-xl flex items-center justify-center text-electric-600 group-hover:bg-electric-600 group-hover:text-white transition-colors">
                       <Plus size={20} />
                   </div>
                   <div className="text-left">
                       <div className="text-sm font-black text-gray-900 uppercase italic">Create</div>
                       <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">New League</div>
                   </div>
               </button>

               <button onClick={onJoinExisting} className="bg-white p-4 rounded-[24px] shadow-sm flex flex-col gap-3 group hover:-translate-y-1 transition-transform border border-gray-100 cursor-pointer">
                   <div className="w-10 h-10 bg-gold-50 rounded-xl flex items-center justify-center text-gold-600 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                       <LogIn size={20} />
                   </div>
                   <div className="text-left">
                       <div className="text-sm font-black text-gray-900 uppercase italic">Join</div>
                       <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Enter Code</div>
                   </div>
               </button>
           </div>

           {/* League List */}
           <div className="space-y-4">
               <div className="flex items-center justify-between">
                   <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Your Leagues</h2>
                   <button onClick={() => setShowHowItWorks(true)} className="flex items-center gap-1 text-[10px] font-bold text-electric-600 uppercase tracking-wider cursor-pointer">
                       <BookOpen size={12} /> Briefing
                   </button>
               </div>
               
               {loading ? (
                   <div className="text-center py-10 text-gray-400 text-xs font-bold animate-pulse">Locating Signals...</div>
               ) : leagues.length === 0 ? (
                   <div className="bg-white rounded-[24px] p-8 text-center border border-dashed border-gray-200">
                       <Grid size={32} className="mx-auto text-gray-300 mb-3" />
                       <p className="text-sm font-bold text-gray-500">No active leagues found.</p>
                   </div>
               ) : (
                   <div className="space-y-3">
                       {leagues.map((l, i) => (
                           <button 
                               key={l.leagueId + i} 
                               onClick={() => handleSelect(l)}
                               className="w-full bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-electric-200 transition-colors cursor-pointer"
                           >
                               <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${l.role === 'commissioner' ? 'bg-gold-50 text-gold-600' : 'bg-gray-50 text-gray-500'}`}>
                                       {l.role === 'commissioner' ? <Whistle size={20} /> : <Grid size={20} />}
                                   </div>
                                   <div className="text-left">
                                       <div className="text-base font-black text-gray-900 italic uppercase">{l.leagueName}</div>
                                       <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                           {l.role === 'commissioner' ? 'Commissioner' : 'Player'} • Division {l.waveId || 'A'}
                                       </div>
                                   </div>
                               </div>
                               <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-electric-600 group-hover:text-white transition-all">
                                   <ArrowRight size={14} />
                               </div>
                           </button>
                       ))}
                   </div>
               )}
           </div>
       </div>

       {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}
    </div>
  );
};

export default Lobby;
