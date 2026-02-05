
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { User, OlympicEvent, MedalResult, LeagueSettings } from '../types';
import { calculateUserScore } from '../services/scoringEngine';
import { Zap, Flag, DollarSign, OlympicRings, Edit3, ChevronDown, Shield, Copy, BookOpen, Grid, LogOut, AlertTriangle, RotateCcw, Trash2, Check, Settings, Whistle } from './Icons';
import { COUNTRY_COLORS } from '../data/olympicCountryColors';
import CountryBadge from './CountryBadge';
import { useToast } from './ui/Toast';
import { getCountryData } from '../constants';
import BuyConfidenceSlot from './BuyConfidenceSlot';
import ScoreBreakdown from './ScoreBreakdown';

interface TeamPageProps {
  user: User;
  events: OlympicEvent[];
  results: MedalResult[];
  entryFee: number;
  extraSlotPrice: number;
  onEditName?: () => void;
  // Settings Props
  leagueSettings?: LeagueSettings | null;
  onSignOut?: () => void;
  isCommissioner?: boolean;
  onDeleteLeague?: () => void;
  onSwitchLeague?: () => void;
  onShowRules?: () => void;
  onFixDraft?: () => void;
  scrollToSettingsTrigger?: number;
  onBuyBoost?: () => void;
  onRemoveBoost?: (removedIds: string[]) => void;
}

const TeamPage: React.FC<TeamPageProps> = ({ 
  user, events, results, entryFee, extraSlotPrice, onEditName,
  leagueSettings, onSignOut, isCommissioner, onDeleteLeague, onSwitchLeague, onShowRules, onFixDraft, scrollToSettingsTrigger, onBuyBoost, onRemoveBoost
}) => {
  const toast = useToast();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    return calculateUserScore(user, results, events);
  }, [user, results, events]);

  const goldCount = stats.details.filter(d => d.medal === 'Gold').length;
  const silverCount = stats.details.filter(d => d.medal === 'Silver').length;
  const bronzeCount = stats.details.filter(d => d.medal === 'Bronze').length;

  const totalDues = entryFee + (user.purchasedBoosts * extraSlotPrice);
  const ROUND_MULTIPLIERS = [1, 5, 10, 20];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success("Code copied!");
  };

  const scrollToSettings = () => {
    settingsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to settings when triggered from parent
  useEffect(() => {
    if (scrollToSettingsTrigger && scrollToSettingsTrigger > 0) {
      scrollToSettings();
    }
  }, [scrollToSettingsTrigger]);

  // Calculate country stats for expanded view
  const getCountryStats = (countryCode: string) => {
    const metadata = getCountryData(countryCode);
    
    const relevantCPs = user.confidenceEvents.map(eventId => {
        const event = events.find(e => e.id === eventId);
        const result = results.find(r => r.eventId === eventId);
        
        if (!event) return null;

        const medaled = result && (result.gold === countryCode || result.silver === countryCode || result.bronze === countryCode);
        const isStrength = !result && metadata.bestSports.includes(event.sport);
        
        if (medaled || isStrength) {
            return { event, result, medaled };
        }
        return null;
    }).filter(Boolean) as { event: OlympicEvent, result: MedalResult | undefined, medaled: boolean }[];
    
    let countryScore = 0;
    let cGold = 0, cSilver = 0, cBronze = 0;
    
    const draftedInfo = user.draftedCountriesDetailed.find(c => c.code === countryCode);
    const multiplier = draftedInfo?.multiplier || 1;

    results.forEach(result => {
        const event = events.find(e => e.id === result.eventId);
        if (!event) return;
        
        const isCP = user.confidenceEvents.includes(result.eventId);
        const cpMultiplier = isCP ? 2 : 1;
        
        if (result.gold === countryCode) {
            cGold++;
            countryScore += 5 * multiplier * cpMultiplier;
        } else if (result.silver === countryCode) {
            cSilver++;
            countryScore += 3 * multiplier * cpMultiplier;
        } else if (result.bronze === countryCode) {
            cBronze++;
            countryScore += 1 * multiplier * cpMultiplier;
        }
    });
    
    return { countryScore, cGold, cSilver, cBronze, relevantCPs };
  };

  return (
    <div className="flex flex-col h-full bg-neu-base overflow-y-auto pb-24 relative">
      
      {/* --- HERO CARD --- */}
      <div className="px-4 pt-4">
        <div className="rounded-[32px] relative overflow-hidden group"
            style={{
                background: '#EFEEF3',
                boxShadow: `
                    8px 8px 16px rgba(163, 163, 168, 0.4),
                    -8px -8px 16px rgba(255, 255, 255, 0.9)
                `
            }}
        >
          <div className="absolute top-[-20px] right-[-20px] opacity-5 pointer-events-none transform rotate-12 text-gray-900 scale-150">
              <OlympicRings size={200} />
          </div>
          
          <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-600 shadow-[0_0_5px_#0085C7]"></span>
                      Division {user.poolId}
                  </p>
                  
                  {/* Name Row */}
                  <div className="flex items-center gap-2 min-w-0">
                    <h1 
                      onClick={onEditName}
                      className="text-2xl sm:text-3xl font-black italic text-gray-900 tracking-tighter leading-none truncate cursor-pointer hover:text-electric-600 transition-colors flex items-center gap-2"
                    >
                      {user.name}
                      {onEditName && <Edit3 size={14} className="text-gray-400 flex-shrink-0" />}
                    </h1>
                  </div>
                </div>
                
                <div className="neu-inset bg-neu-base/80 px-4 py-3 text-center min-w-[90px] backdrop-blur-sm flex-shrink-0">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    Total Pts
                  </p>
                  <p className="text-3xl font-black text-electric-600 italic tracking-tighter leading-none">
                    {stats.total}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/60 rounded-2xl p-3 flex items-center gap-3 border border-white/50 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-italy-green/10 text-italy-green flex items-center justify-center flex-shrink-0">
                          <DollarSign size={18} />
                      </div>
                      <div>
                          <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Dues</div>
                          <div className="text-sm font-black text-gray-900 italic tracking-tight">${totalDues.toFixed(0)}</div>
                      </div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-3 flex items-center gap-3 border border-white/50 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-500 flex items-center justify-center flex-shrink-0">
                          <Zap size={18} />
                      </div>
                      <div>
                          <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Boosts</div>
                          <div className="text-sm font-black text-gray-900 italic tracking-tight">{user.confidenceEvents.length} / {10 + user.purchasedBoosts}</div>
                      </div>
                  </div>
              </div>

              {/* Medal Tally */}
              <div className="neu-inset grid grid-cols-3 bg-neu-base/50 divide-x divide-gray-200/50 backdrop-blur-sm">
                  <div className="p-3 text-center">
                      <div className="text-xl font-black text-gold-500 italic leading-none mb-1">{goldCount}</div>
                      <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Gold</div>
                  </div>
                  <div className="p-3 text-center">
                      <div className="text-xl font-black text-gray-500 italic leading-none mb-1">{silverCount}</div>
                      <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Silver</div>
                  </div>
                  <div className="p-3 text-center">
                      <div className="text-xl font-black text-orange-600 italic leading-none mb-1">{bronzeCount}</div>
                      <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Bronze</div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* --- SCORE BREAKDOWN --- */}
      <div className="px-4 mt-4">
        <ScoreBreakdown 
          user={user}
          events={events}
          results={results}
        />
      </div>

      {/* --- CONFIDENCE SLOT PURCHASE --- */}
      {onBuyBoost && leagueSettings && (
        <div className="px-4 mt-4">
          <BuyConfidenceSlot 
            user={user} 
            leagueSettings={leagueSettings} 
            onPurchase={onBuyBoost} 
            onRemoveSlot={onRemoveBoost}
          />
        </div>
      )}

      {/* --- NATION PORTFOLIO --- */}
      <div className="px-4 mt-8 space-y-4">
        <div className="flex items-center justify-between pl-2">
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Flag size={14} className="text-electric-600" /> The Nation Portfolio
            </h3>
            
            <button 
                onClick={scrollToSettings}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-electric-600 transition-colors"
            >
                <span>Settings</span>
                <ChevronDown size={12} />
            </button>
        </div>
        
        <div className="space-y-3">
            {user.draftedCountries.map((code, index) => {
                const detailedPick = user.draftedCountriesDetailed?.find(c => c.code === code) || user.draftedCountriesDetailed?.[index];
                const multiplier = detailedPick?.multiplier || ROUND_MULTIPLIERS[Math.min(index, 3)];
                const round = detailedPick?.round || index + 1;
                
                const countryColors = COUNTRY_COLORS[code] || { name: code, colors: ['#ccc'], primaryColor: '#666' };
                const metadata = getCountryData(code);
                
                const isExpanded = expandedCountry === code;
                const stats = isExpanded ? getCountryStats(code) : null;

                return (
                  <div 
                    key={code} 
                    className={`rounded-2xl overflow-hidden transition-all ${
                        isExpanded ? 'ring-2 ring-electric-500/30' : ''
                    }`}
                    style={{
                        background: '#EFEEF3',
                        boxShadow: '4px 4px 8px rgba(163, 163, 168, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.9)'
                    }}
                  >
                      {/* Country Header - Clickable */}
                      <button
                        onClick={() => setExpandedCountry(isExpanded ? null : code)}
                        className="w-full p-4 flex items-center gap-4 text-left"
                      >
                        <div className="flex-shrink-0 drop-shadow-sm">
                            <CountryBadge 
                                code={code} 
                                colors={countryColors.colors} 
                                primaryColor={countryColors.primaryColor}
                                size={48}
                            />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">
                                Round {round}
                           </div>
                           <div className="text-lg font-black text-gray-900 tracking-tight leading-none truncate">
                               {countryColors.name}
                           </div>
                        </div>
                        
                        <div className={`px-3 py-2 rounded-xl text-center min-w-[60px] flex-shrink-0 ${
                            multiplier >= 20 ? 'bg-gold-100 text-gold-600' :
                            multiplier >= 10 ? 'bg-purple-100 text-purple-600' :
                            multiplier >= 5 ? 'bg-electric-50 text-electric-600' :
                            'bg-gray-100 text-gray-500'
                        }`}>
                          <div className="text-xl font-black italic leading-none">{multiplier}x</div>
                          <div className="text-[8px] font-bold uppercase tracking-wider opacity-75">Bonus</div>
                        </div>
                        
                        <ChevronDown 
                            size={18} 
                            className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {/* Expanded Content */}
                      {isExpanded && stats && (
                        <div className="px-4 pb-4 pt-0 border-t border-gray-200/50">
                            {/* Score Summary */}
                            <div className="mt-4 p-3 rounded-xl bg-white/50 mb-4 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 mb-1">Points from {countryColors.name}</div>
                                    <div className="flex gap-3">
                                        <span className="text-xs font-bold text-gray-600">🥇 {stats.cGold}</span>
                                        <span className="text-xs font-bold text-gray-600">🥈 {stats.cSilver}</span>
                                        <span className="text-xs font-bold text-gray-600">🥉 {stats.cBronze}</span>
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-electric-600">{stats.countryScore}</div>
                            </div>
                            
                            {/* Intel */}
                            {metadata?.history && (
                                <div className="p-3 rounded-xl bg-electric-50/50 mb-4">
                                    <div className="text-[9px] font-black text-electric-600 uppercase tracking-wider mb-1">Intel</div>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{metadata.history}</p>
                                </div>
                            )}
                            
                            {/* Relevant CPs */}
                            <div>
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-2">
                                    Relevant Confidence Boosts ({stats.relevantCPs.length})
                                </div>
                                {stats.relevantCPs.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {stats.relevantCPs.map(({ event, result, medaled }) => (
                                            <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/60">
                                                <Zap size={12} className="text-electric-600 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-gray-800 truncate">{event.name}</div>
                                                    <div className="text-[9px] text-gray-500">{event.sport}</div>
                                                </div>
                                                {result ? (
                                                    <span className={`text-xs font-bold ${medaled ? 'text-gold-600' : 'text-gray-400'}`}>
                                                        {result.gold === code ? '🥇' : 
                                                         result.silver === code ? '🥈' : 
                                                         result.bronze === code ? '🥉' : '—'}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-gray-400 italic">Pending</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400 italic pl-1">No picks linked to this nation yet.</div>
                                )}
                            </div>
                        </div>
                      )}
                  </div>
                );
            })}
            
            {user.draftedCountries.length === 0 && (
                <div className="neu-inset p-6 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                    No nations drafted yet
                </div>
            )}
        </div>
      </div>

      {/* --- SETTINGS & ACTIONS --- */}
      <div ref={settingsRef} className="px-4 mt-10 pb-24">
        <div className="flex items-center justify-center gap-3 mb-6 opacity-50">
            <div className="h-px bg-gray-300 w-12" />
            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <ChevronDown size={12} /> Settings & Actions
            </div>
            <div className="h-px bg-gray-300 w-12" />
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
            {/* Invite Code (Commish Only) */}
            {isCommissioner && leagueSettings && (
                <div className="neu-card p-4 rounded-[24px] flex items-center justify-between bg-white border border-gold-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-50 rounded-xl flex items-center justify-center text-gold-600 shadow-sm">
                            <Whistle size={20} />
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-gold-500 uppercase tracking-widest">Invite Code</div>
                            <div className="text-lg font-black text-gray-900 italic tracking-[0.1em]">{leagueSettings.leagueCode}</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleCopyCode(leagueSettings.leagueCode)}
                        className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-electric-600 active:scale-95 transition-all shadow-sm border border-gray-100"
                    >
                        {copiedCode === leagueSettings.leagueCode ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>
            )}

            <div className="neu-card p-5 rounded-[28px] space-y-3">
                <button onClick={onShowRules} className="w-full h-12 bg-gray-50 rounded-2xl flex items-center justify-center gap-3 text-gray-700 font-bold text-xs uppercase tracking-wide active:scale-[0.98] transition-all hover:bg-gray-100 border border-gray-100">
                    <BookOpen size={18} className="text-electric-500" /> Mission Briefing
                </button>

                <button onClick={onSwitchLeague} className="w-full h-12 bg-gray-50 rounded-2xl flex items-center justify-center gap-3 text-gray-700 font-bold text-xs uppercase tracking-wide active:scale-[0.98] transition-all hover:bg-gray-100 border border-gray-100">
                    <Grid size={18} className="text-purple-500" /> Switch League
                </button>

                <button onClick={onSignOut} className="w-full h-12 bg-gray-50 rounded-2xl flex items-center justify-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-wide active:scale-[0.98] transition-all hover:bg-red-50 hover:text-red-500 border border-gray-100">
                    <LogOut size={18} /> Sign Out
                </button>
            </div>

            {/* Danger Zone */}
            {isCommissioner && (
                <div className="neu-card p-5 rounded-[28px] space-y-3 border-2 border-red-50 bg-red-50/10">
                    <div className="flex items-center gap-2 text-red-500 mb-1 px-1">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Danger Zone</span>
                    </div>
                    
                    <button onClick={onFixDraft} className="w-full h-12 bg-white rounded-xl flex items-center justify-center gap-2 text-orange-600 font-bold text-[10px] uppercase tracking-wider active:scale-[0.98] transition-all shadow-sm border border-orange-100">
                        <RotateCcw size={14} /> Fix Draft State
                    </button>

                    <button onClick={onDeleteLeague} className="w-full h-12 bg-white rounded-xl flex items-center justify-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-wider active:scale-[0.98] transition-all shadow-sm border border-red-100 hover:bg-red-600 hover:text-white">
                        <Trash2 size={14} /> Delete League
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
