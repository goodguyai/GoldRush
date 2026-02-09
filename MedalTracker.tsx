
import React, { useState, useMemo } from 'react';
import { OlympicEvent, MedalResult, ScoreDetail, User } from './types';
import { ChevronDown, Trophy, Zap, Clock, Sparkles, Lock, Check, Plus, AlertTriangle, X, Search, Activity } from './Icons';
import { SportIcon } from './SportIcons';

interface MedalTrackerProps {
  events: OlympicEvent[];
  results: MedalResult[];
  userScores: ScoreDetail[];
  user: User;
  selectedSport: string;
  searchQuery?: string;
  showOnlyCPs?: boolean;
  onToggleConfidencePick?: (eventId: string) => void;
  maxConfidencePicks?: number;
  cpDeadlineMode?: 'global' | 'per-event';
  globalDeadline?: number;
  purchasedBoosts?: number;
}

const MedalTracker: React.FC<MedalTrackerProps> = ({ 
  events, results, userScores, user, selectedSport, 
  searchQuery = '',
  showOnlyCPs = false,
  onToggleConfidencePick, 
  maxConfidencePicks = 10,
  cpDeadlineMode = 'global',
  globalDeadline
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Derived CP State
  const myConfEvents = user.confidenceEvents || [];
  
  // Count picks per sport for 2-per-sport limit
  const getCPCountForSport = (sportName: string) => {
    return events.filter(e => 
      e.sport === sportName && user.confidenceEvents.includes(e.id)
    ).length;
  };

  // Check if CP is locked for this event
  const isCPLocked = (event: OlympicEvent) => {
    // Commissioners and managers bypass deadline locks
    if (user.role === 'commissioner' || user.role === 'manager') return false;

    if (event.status === 'Finished') return true;
    if (event.status === 'Live') return true;

    if (cpDeadlineMode === 'per-event' && event.startTime) {
      return Date.now() >= event.startTime;
    }

    if (cpDeadlineMode === 'global' && globalDeadline) {
      return Date.now() >= globalDeadline;
    }

    return false;
  };

  // Check if can add more picks
  const canAddMorePicks = user.confidenceEvents.length < maxConfidencePicks;

  const combinedData = events.map(event => {
    const result = results.find(r => r.eventId === event.id);
    const userScore = userScores.find(s => s.eventId === event.id);
    const myWin = result && (
       user.draftedCountries.includes(result.gold) ? result.gold :
       user.draftedCountries.includes(result.silver) ? result.silver :
       user.draftedCountries.includes(result.bronze) ? result.bronze : null
    );
    const hasCP = myConfEvents.includes(event.id);
    const locked = isCPLocked(event);
    const sportCPCount = getCPCountForSport(event.sport);
    
    // Determine toggle state
    const sportMaxed = sportCPCount >= 2 && !hasCP;
    const disabled = locked || (!hasCP && !canAddMorePicks) || sportMaxed;

    return { ...event, result, userScore, myWin, hasCP, locked, disabled, sportCPCount, sportMaxed };
  });

  // Apply Filters
  let filteredData = combinedData;
  
  // 1. Sport Filter
  if (selectedSport !== 'All') {
    filteredData = filteredData.filter(item => item.sport === selectedSport);
  }
  
  // 2. Search Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.sport.toLowerCase().includes(q)
    );
  }
  
  // 3. Show Only CPs Filter
  if (showOnlyCPs) {
    filteredData = filteredData.filter(item => item.hasCP);
  }

  const toggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Empty States */}
      {filteredData.length === 0 && (
        <div className="neu-card p-8 text-center mt-4">
          {showOnlyCPs ? (
            <>
              <div className="w-16 h-16 bg-electric-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={28} className="text-electric-400" />
              </div>
              <h3 className="font-black text-gray-900 uppercase text-sm mb-2">No Confidence Boosts Yet</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Browse events and tap to add confidence boosts. You get 2x points if your countries medal!
              </p>
            </>
          ) : searchQuery ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-gray-500" />
              </div>
              <h3 className="font-black text-gray-900 uppercase text-sm mb-2">No Results</h3>
              <p className="text-xs text-gray-500">
                No events match "{searchQuery}"
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity size={28} className="text-gray-500" />
              </div>
              <h3 className="font-black text-gray-900 uppercase text-sm mb-2">No Events</h3>
              <p className="text-xs text-gray-500">
                No events found for this filter
              </p>
            </>
          )}
        </div>
      )}

      {filteredData.map((item) => (
        <div 
          key={item.id}
          className={`neu-card overflow-hidden p-0 transition-all duration-300 ${
            expandedEventId === item.id ? 'ring-2 ring-electric-500/20' : ''
          } ${item.hasCP ? 'border-l-4 border-l-gold-500 bg-yellow-50/10' : ''}`}
        >
          {/* Card Header - Split Click Zones */}
          <div className="p-4 flex items-center gap-4">
            
            {/* Sport Icon Container - Expands Card */}
            <div 
                onClick={() => toggleExpand(item.id)}
                className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all neu-button cursor-pointer ${
                    item.result ? 'text-gold-600' : item.hasCP ? 'text-electric-600' : 'text-gray-400'
                }`}
            >
                <SportIcon 
                    sport={item.sport} 
                    eventId={item.id} 
                    variant={item.result ? 'gold' : item.status === 'Live' ? 'live' : 'default'} 
                    className="w-6 h-6" 
                />
                {item.status === 'Live' && !item.result && (
                  <div className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-italy-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-italy-green border border-white"></span>
                  </div>
                )}
            </div>

            {/* Event Info - Expands Card */}
            <div 
                onClick={() => toggleExpand(item.id)}
                className="flex-1 min-w-0 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate">{item.sport}</span>
                 
                 {/* Sport CP Count Badge */}
                 {item.sportCPCount > 0 && !item.result && (
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                      item.sportCPCount >= 2 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-electric-50 text-electric-600'
                    }`}>
                      {item.sportCPCount}/2 CB
                    </span>
                 )}
              </div>
              <h3 className={`text-sm font-black truncate italic uppercase tracking-tight leading-none ${
                item.myWin ? 'text-electric-600' : item.hasCP ? 'text-electric-700' : 'text-gray-800'
              }`}>
                {item.name}
              </h3>
            </div>

            {/* Quick Actions (CP Toggle & Expand) */}
            <div className="flex items-center gap-2 flex-shrink-0">
               {item.myWin ? (
                 <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-gold-50 shadow-inner">
                   <Trophy size={16} className="text-gold-500" />
                 </div>
               ) : (
                 <>
                    {/* Quick CP Toggle */}
                    {onToggleConfidencePick && !item.result && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Stop expansion
                                if (!item.disabled) onToggleConfidencePick(item.id);
                            }}
                            disabled={item.disabled}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                item.hasCP 
                                    ? 'bg-electric-600 text-white shadow-lg shadow-electric-500/30'
                                    : item.disabled
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                                        : 'neu-button text-gray-400 hover:text-electric-600'
                            }`}
                        >
                            <Zap size={16} className={item.hasCP ? 'fill-current' : ''} />
                        </button>
                    )}

                    {/* Expand Chevron */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item.id);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            expandedEventId === item.id ? 'bg-electric-100 text-electric-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <ChevronDown size={16} className={`transition-transform duration-300 ${expandedEventId === item.id ? 'rotate-180' : ''}`} />
                    </button>
                 </>
               )}
            </div>
          </div>

          {/* Expanded Content */}
          {expandedEventId === item.id && (
            <div className="px-4 pb-4 pt-0 bg-gray-50/50 border-t border-gray-100">
               
               {/* CP Manager Panel */}
               {onToggleConfidencePick && !item.result && (
                   <div className="mt-4 mb-4">
                       <div className="space-y-2">
                          {/* Sport Max Warning */}
                          {item.sportMaxed && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl animate-fade-in">
                              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Zap size={14} className="text-yellow-600" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-yellow-800">
                                  {item.sport} Maxed Out
                                </div>
                                <div className="text-[10px] text-yellow-600">
                                  You have 2/2 confidence boosts in this sport
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* CP Toggle Button (Detailed) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.disabled) onToggleConfidencePick(item.id);
                            }}
                            disabled={item.disabled}
                            className={`w-full rounded-xl transition-all overflow-hidden relative ${
                              item.hasCP 
                                ? 'bg-gradient-to-r from-electric-600 to-electric-500 shadow-lg shadow-electric-500/25' 
                                : item.disabled
                                  ? 'bg-gray-100 cursor-not-allowed'
                                  : 'bg-white border-2 border-dashed border-electric-300 hover:border-electric-500 hover:bg-electric-50'
                            }`}
                          >
                            <div className={`p-4 flex items-center justify-between relative z-10 ${item.hasCP ? 'text-white' : item.disabled ? 'text-gray-400' : 'text-electric-700'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  item.hasCP 
                                    ? 'bg-white/20' 
                                    : item.disabled 
                                      ? 'bg-gray-200' 
                                      : 'bg-electric-100'
                                }`}>
                                  <Zap size={20} className={item.hasCP ? 'fill-current' : ''} />
                                </div>
                                <div className="text-left">
                                  <div className="font-black text-sm uppercase tracking-tight">
                                    {item.hasCP ? 'Confidence Boost Active' : item.locked ? 'Locked' : 'Add Confidence Boost'}
                                  </div>
                                  <div className={`text-[10px] font-medium ${item.hasCP ? 'text-electric-100' : ''}`}>
                                    {item.hasCP 
                                      ? '2x multiplier active • Tap to remove' 
                                      : item.locked 
                                        ? 'Event has started or deadline passed'
                                        : !canAddMorePicks && !item.hasCP
                                          ? `${user.confidenceEvents.length}/${maxConfidencePicks} boosts used`
                                          : `+2x points • Risk: -100 penalty`
                                    }
                                  </div>
                                </div>
                              </div>
                              
                              {item.hasCP && !item.locked && (
                                <X size={20} className="opacity-60" />
                              )}
                              
                              {item.locked && (
                                <Clock size={20} className="opacity-60" />
                              )}
                            </div>
                            
                            {/* Progress bar visual for used picks */}
                            {!item.hasCP && !item.locked && (
                              <div className="h-1 bg-gray-200 absolute bottom-0 left-0 right-0">
                                <div 
                                  className="h-full bg-electric-500 transition-all"
                                  style={{ width: `${(user.confidenceEvents.length / maxConfidencePicks) * 100}%` }}
                                />
                              </div>
                            )}
                          </button>
                          
                          {/* Deadline info */}
                          {!item.locked && (
                            <p className="text-center text-[9px] font-medium text-gray-500">
                              {cpDeadlineMode === 'per-event' && item.startTime 
                                ? `Locks ${new Date(item.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
                                : globalDeadline 
                                  ? `All CBs lock ${new Date(globalDeadline).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
                                  : ''
                              }
                            </p>
                          )}
                        </div>
                   </div>
               )}

               <div className="mt-2">
               {(() => {
                  const userCountriesInEvent = user.draftedCountriesDetailed || [];
                  const hasConfidencePick = item.hasCP;
                  
                  const potentials = userCountriesInEvent.slice(0, 3).map((country, idx) => {
                    const medalPoints = [5, 3, 1][idx]; 
                    const baseScore = medalPoints * country.multiplier;
                    const finalScore = hasConfidencePick ? baseScore * 2 : baseScore;
                    return { country, medalPoints, finalScore, position: ['🥇', '🥈', '🥉'][idx] };
                  });
                  
                  if (userCountriesInEvent.length === 0) return null;
                  
                  return (
                    <div className="neu-inset bg-electric-50/30 p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-electric-600 uppercase tracking-wider">
                            Your Potential
                          </span>
                        </div>
                        {hasConfidencePick && (
                          <div className="bg-gold-500 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                            <Zap size={10} fill="currentColor" /> 2x Boost
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {potentials.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm grayscale opacity-80">{p.position}</span>
                              <div className="w-8 h-8 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-700">
                                {p.country.code.substring(0, 2)}
                              </div>
                              <div>
                                <div className="text-xs font-black text-gray-900">
                                  {p.country.code}
                                </div>
                                <div className="text-[8px] font-bold text-gray-500">
                                  Rd {p.country.round} • {p.country.multiplier}x
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-electric-600">
                                {p.finalScore} pts
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
               })()}
               </div>
               
               <div className="neu-inset bg-white p-3 mb-3">
                  <h4 className="font-bold text-xs text-gray-900 mb-1 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-gold-500" />
                    Intel
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    {item.description || "Detailed intel unavailable."}
                  </p>
               </div>

               {item.result ? (
                 <div className="neu-inset bg-white p-3 space-y-2">
                   <div className="flex items-center gap-1.5 mb-2">
                     <Trophy size={14} className="text-gold-500" />
                     <span className="font-bold text-xs text-gray-900 uppercase tracking-widest">Podium</span>
                   </div>
                   <div className="space-y-1.5">
                     <div className={`flex items-center gap-2 bg-yellow-50 rounded-lg p-2 ${item.result.gold === item.myWin ? 'ring-1 ring-electric-500' : ''}`}>
                       <span className="text-sm">🥇</span>
                       <span className="font-black text-sm text-gray-900">{item.result.gold}</span>
                     </div>
                     <div className={`flex items-center gap-2 bg-gray-50 rounded-lg p-2 ${item.result.silver === item.myWin ? 'ring-1 ring-electric-500' : ''}`}>
                       <span className="text-sm">🥈</span>
                       <span className="font-black text-sm text-gray-900">{item.result.silver}</span>
                     </div>
                     <div className={`flex items-center gap-2 bg-orange-50 rounded-lg p-2 ${item.result.bronze === item.myWin ? 'ring-1 ring-electric-500' : ''}`}>
                       <span className="text-sm">🥉</span>
                       <span className="font-black text-sm text-gray-900">{item.result.bronze}</span>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="neu-inset bg-gray-100 p-4 text-center">
                    <Clock size={20} className="mx-auto mb-1 text-gray-400" />
                    <p className="font-bold text-[10px] text-gray-500 uppercase tracking-widest">Awaiting Results</p>
                 </div>
               )}
               
               {item.userScore && (
                 <div className="flex justify-between items-center bg-electric-600 px-4 py-3 rounded-xl shadow-lg mt-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Points Won</span>
                    <span className="text-xl font-black drop-shadow-sm">+{item.userScore.points}</span>
                 </div>
               )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MedalTracker;
