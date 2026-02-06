
import React, { useState } from 'react';
import { User, OlympicEvent, MedalResult } from './types';
import { Trophy, Globe, Waves, Flag, Zap, TrendingUp } from './Icons';

interface LeaderboardProps {
  users: User[];
  currentUserId: string;
  currentUserPoolId: string;
  onUserSelect: (userId: string) => void;
  events?: OlympicEvent[]; 
  results?: MedalResult[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUserId, currentUserPoolId, onUserSelect }) => {
  const [filterMode, setFilterMode] = useState<'wave' | 'global'>('wave');
  
  const filteredUsers = filterMode === 'wave' 
    ? users.filter(u => u.poolId === currentUserPoolId) 
    : users;

  const sortedUsers = [...filteredUsers].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="flex flex-col min-h-full pb-24">
      
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-30 bg-neu-base/95 backdrop-blur-sm pt-4 pb-2 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-black uppercase italic text-gray-900 tracking-tight leading-none">
              Rankings
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 Portfolio Standings
               </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="neu-inset p-1 rounded-2xl flex relative max-w-xs mx-auto">
             <button 
                onClick={() => setFilterMode('wave')} 
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  filterMode === 'wave' 
                    ? 'bg-white shadow-md text-electric-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
             >
                <Waves size={14} /> My Division
             </button>
             <button 
                onClick={() => setFilterMode('global')} 
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  filterMode === 'global' 
                    ? 'bg-white shadow-md text-electric-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
             >
                <Globe size={14} /> Global
             </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-2 max-w-2xl mx-auto w-full space-y-3">
        {sortedUsers.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          const rank = index + 1;
          const breakdown = user.scoreBreakdown || { goldCount: 0, silverCount: 0, bronzeCount: 0 };
          
          return (
            <button 
                key={user.id} 
                onClick={() => onUserSelect(user.id)} 
                className={`w-full flex items-center p-3 rounded-2xl relative overflow-visible transition-all active:scale-[0.99] ${
                    isCurrentUser 
                    ? 'neu-card ring-2 ring-electric-500 z-10' 
                    : 'neu-card'
                }`}
            >
              {/* Rank Badge */}
              <div className={`mr-3 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg italic shadow-inner ${
                rank === 1 ? 'bg-gold-100 text-gold-600' :
                rank === 2 ? 'bg-gray-200 text-gray-600' :
                rank === 3 ? 'bg-orange-100 text-orange-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                 {rank === 1 ? <Trophy size={18} /> : rank}
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-black text-sm truncate max-w-[140px] sm:max-w-xs ${isCurrentUser ? 'text-electric-600' : 'text-gray-900'}`}>
                    {user.name}
                  </span>
                  {user.isBot && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[8px] font-black rounded uppercase border border-purple-200 flex-shrink-0">
                      Bot
                    </span>
                  )}
                  {filterMode === 'global' && (
                      <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-black tracking-wider flex-shrink-0 border border-gray-200">
                        {user.poolId}
                      </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1">
                   <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                        <Flag size={10} /> {user.draftedCountries.length}/4
                   </div>
                   <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                        <Zap size={10} /> {user.confidenceEvents.length} CB
                   </div>
                </div>
              </div>
              
              {/* Score Box - Unified */}
              <div className="pl-2">
                <div className={`rounded-xl py-2 px-3 flex flex-col items-center justify-center border shadow-sm min-w-[88px] ${
                    isCurrentUser ? 'bg-electric-50 border-electric-100' : 'bg-white border-gray-100'
                }`}>
                    <div className={`text-2xl font-black italic tracking-tighter leading-none mb-1 ${isCurrentUser ? 'text-electric-600' : 'text-gray-900'}`}>
                        {user.totalScore}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                        <span className="flex items-center gap-px">🥇{breakdown.goldCount}</span>
                        <span className="flex items-center gap-px">🥈{breakdown.silverCount}</span>
                        <span className="flex items-center gap-px">🥉{breakdown.bronzeCount}</span>
                    </div>
                </div>
              </div>
            </button>
          );
        })}
        
        {sortedUsers.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <TrendingUp size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold text-gray-400">No players found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
