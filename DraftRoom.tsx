
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { OlympicEvent, User, Wave } from './types';
import { COUNTRIES, ALL_COUNTRIES, EXTENDED_COUNTRIES, getCountryData } from './constants';
import { COUNTRY_COLORS } from './olympicCountryColors';
import { Check, Clock, Search, Shield, RotateCcw, AlertTriangle, X, Shuffle, Trophy, Users, Activity, ChevronDown, Plus, Play, Zap, ArrowRight, Lock, Whistle } from './Icons';
import CountryBadge from './CountryBadge';
import { listenToDraftState } from './databaseService';

interface DraftRoomProps {
  waveId: string;
  events: OlympicEvent[];
  wave: Wave;
  phase: 'setup' | 'phase1_nation_draft' | 'phase2_confidence_picks' | 'live';
  users: User[];
  currentUserId: string;
  onDraftCountry: (code: string) => void;
  onToggleEvent: (eventId: string) => void;
  onFinishDraft: () => void;
  onBuyBoost: () => void;
  purchasedBoosts: number;
  extraSlotPrice: number;
  openingCeremonyLockTime: number;
  isCommissionerMode?: boolean;
  onCommishUpdate?: (action: 'draft' | 'manual' | 'undo' | 'init', userId: string, data?: any) => void;
  onUpdateWave?: (wave: Wave) => void;
  onCreateBot?: (name: string, waveId: string) => void;
  onResetDraft?: (waveId: string) => void;
  capacity?: number;
  onNavigate?: (tab: string) => void;
  cpDeadlineMode?: 'global' | 'per-event';
}

const useCountdown = (targetTime: number) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, targetTime - Date.now()));
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, targetTime - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);
  return timeLeft;
};

const formatTime = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const DraftRoom: React.FC<DraftRoomProps> = ({ 
  waveId, events = [], wave, phase, users = [], currentUserId,
  onDraftCountry, onToggleEvent, onBuyBoost, purchasedBoosts, 
  extraSlotPrice, openingCeremonyLockTime, isCommissionerMode, onCommishUpdate,
  onUpdateWave, onCreateBot, onResetDraft, capacity = 4, onNavigate, cpDeadlineMode = 'global'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCountryCode, setExpandedCountryCode] = useState<string | null>(null);
  const [showExtendedCountries, setShowExtendedCountries] = useState(false);
  const [draftState, setDraftState] = useState<{
      phase: string;
      pickIndex: number;
      recentPicks: any[];
      participants?: string[];
      draftOrder?: string[];
      status?: string;
  } | undefined | null>(undefined);

  const [showCommishTools, setShowCommishTools] = useState(false);
  const [commishForceNation, setCommishForceNation] = useState('');
  const [botName, setBotName] = useState('');
  
  // Safety toggle for commissioner force pick
  const [forcePickMode, setForcePickMode] = useState(false);

  // Timer State
  const [pickTimeRemaining, setPickTimeRemaining] = useState<number | null>(null);
  const pickTimerRef = useRef<any>(null); // Use any to be safe across environments
  const lastPickIndexRef = useRef<number>(-1);

  useEffect(() => {
      if (waveId) {
          const unsub = listenToDraftState(waveId, (data) => {
              if (data) setDraftState(data);
              else setDraftState(null);
          });
          return () => unsub();
      }
  }, [waveId]);

  // Reset force pick mode when pick index changes (turn changes)
  useEffect(() => {
      setForcePickMode(false);
      setCommishForceNation('');
  }, [draftState?.pickIndex]);

  // --- Derived State ---
  const effectiveDraftState = useMemo(() => {
    return {
      pickIndex: draftState?.pickIndex ?? wave?.pickIndex ?? 0,
      recentPicks: draftState?.recentPicks ?? wave?.recentPicks ?? [],
      participants: draftState?.participants ?? wave?.participants ?? [],
      draftOrder: draftState?.draftOrder ?? wave?.draftOrder ?? [],
      status: draftState?.status ?? wave?.status ?? 'scheduled'
    };
  }, [draftState, wave]);

  const currentPickIndex = effectiveDraftState.pickIndex;
  const participants = effectiveDraftState.participants;
  const waveSize = participants.length;
  const totalPicksNeeded = waveSize > 0 ? waveSize * 4 : 4; 
  const isDraftComplete = waveSize > 0 && currentPickIndex >= totalPicksNeeded;
  
  const roundNumber = Math.floor(currentPickIndex / (waveSize || 1)) + 1;
  const pickInRound = currentPickIndex % (waveSize || 1);
  const isReverseRound = (roundNumber % 2 === 0);
  
  const currentPickerId = useMemo(() => {
    if (waveSize === 0) return null;
    if (isDraftComplete) return null;
    
    const order = effectiveDraftState.draftOrder;
    if (!order || order.length === 0) return null;

    let index = pickInRound;
    if (isReverseRound) {
        index = waveSize - 1 - pickInRound;
    }
    
    if (index < 0 || index >= order.length) return null;

    const pickerId = order[index];
    return pickerId;
  }, [currentPickIndex, waveSize, isReverseRound, effectiveDraftState.draftOrder, pickInRound, isDraftComplete, currentUserId, roundNumber]);

  const currentPicker = users.find(u => u.id === currentPickerId);
  const isMyTurn = currentPickerId === currentUserId;
  
  const draftedCountryCodes = new Set(users.flatMap(u => u.draftedCountries));
  
  // Use ALL_COUNTRIES if extended mode is on, otherwise just COUNTRIES
  const baseCountries = showExtendedCountries ? ALL_COUNTRIES : COUNTRIES;
  
  const availableCountries = baseCountries.filter(c => !draftedCountryCodes.has(c.code));
  const filteredCountries = availableCountries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeToStart = useCountdown(wave.draftStartTime || 0);
  const isScheduled = wave.status === 'scheduled';

  // --- TIMER LOGIC ---
  const timerDuration = wave.draftSettings?.pickTimerDuration ?? 60; // Allow 0 to mean disabled

  const handleTimerExpired = useCallback(() => {
    // Only commissioner mode or if it's a bot can auto-skip
    // For human players, we notify but don't force locally (rely on commish)
    if (currentPicker?.isBot) {
      return; // Handled by auto-draft effect
    }
    
    // If commissioner mode enabled, auto-skip with random pick
    if (isCommissionerMode && onCommishUpdate && currentPickerId && availableCountries.length > 0) {
      const behavior = wave.draftSettings?.autoDraftBehavior || 'random';
      
      // We implement auto-draft for 'random' or 'best' (as approximation)
      if (behavior === 'random' || behavior === 'best') {
        const randomCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
        if (randomCountry) {
          console.log('[Draft Timer] Auto-drafting', randomCountry.code, 'for', currentPicker?.name);
          onCommishUpdate('draft', currentPickerId, { 
            countryCode: randomCountry.code,
            reason: 'timer_expired'
          });
        }
      }
    } else if (isMyTurn) {
      // Notify current user their time is up
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [currentPickerId, currentPicker, availableCountries, isCommissionerMode, onCommishUpdate, isMyTurn, wave.draftSettings]);

  // Timer effect - resets when pickIndex changes
  useEffect(() => {
    // Only run timer when draft is live and it's someone's turn and timer is enabled
    if (wave.status !== 'live' || isDraftComplete || !currentPickerId || timerDuration <= 0) {
      setPickTimeRemaining(null);
      if (pickTimerRef.current) clearInterval(pickTimerRef.current);
      return;
    }
    
    // Check if this is a new pick (pickIndex changed)
    if (lastPickIndexRef.current !== currentPickIndex) {
      lastPickIndexRef.current = currentPickIndex;
      setPickTimeRemaining(timerDuration);
      
      // Clear existing timer
      if (pickTimerRef.current) {
        clearInterval(pickTimerRef.current);
      }
      
      // Start countdown
      pickTimerRef.current = setInterval(() => {
        setPickTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            return 0; // Will trigger effect below
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (pickTimerRef.current) {
        clearInterval(pickTimerRef.current);
      }
    };
  }, [currentPickIndex, wave.status, isDraftComplete, currentPickerId, timerDuration]);

  // Handle expiration
  useEffect(() => {
    if (pickTimeRemaining === 0) {
        if (pickTimerRef.current) clearInterval(pickTimerRef.current);
        handleTimerExpired();
    }
  }, [pickTimeRemaining, handleTimerExpired]);


  const handleManualDraft = (code: string) => { onDraftCountry(code); };
  const toggleCountryExpand = (code: string) => { setExpandedCountryCode(expandedCountryCode === code ? null : code); };

  // --- WAITING ROOM ---
  if (isScheduled) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-8 bg-neu-base">
              <div className="w-32 h-32 bg-neu-base rounded-full flex items-center justify-center text-electric-600 animate-pulse shadow-neu-flat">
                  <Clock size={56} />
              </div>
              
              <div>
                  <h2 className="text-3xl font-black uppercase italic text-gray-900 mb-2 tracking-tighter">Locked Down</h2>
                  <p className="text-sm font-bold text-gray-500 max-w-xs mx-auto">
                      League Division {wave.id} standby.
                  </p>
              </div>
              
              <div className="neu-card min-w-[280px] p-8">
                  {timeToStart > 0 ? (
                      <>
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Deploy In</div>
                          <div className="text-5xl font-black text-electric-600 font-mono tracking-tight text-shadow-sm">
                              {formatTime(timeToStart)}
                          </div>
                      </>
                  ) : (
                      <>
                          <div className="text-xl font-black text-gray-900 mb-2">Ready to Launch</div>
                          <div className="text-xs font-bold text-orange-500 animate-pulse uppercase tracking-widest">Awaiting Commissioner</div>
                      </>
                  )}
              </div>

              {isCommissionerMode && (
                  <div className="space-y-4 w-full max-w-xs">
                      <button 
                        onClick={() => { if(onUpdateWave) onUpdateWave({ ...wave, status: 'live' }); }}
                        className="neu-button primary w-full py-4 text-sm gap-3"
                      >
                          <Play size={20} /> Force Start Now
                      </button>
                      <button 
                        onClick={() => { if(onCommishUpdate) onCommishUpdate('init', ''); }}
                        className="neu-button w-full py-3 text-xs text-gray-500"
                      >
                          Reset / Initialize
                      </button>
                  </div>
              )}
          </div>
      );
  }

  const renderDraftContent = () => {
    // DRAFT COMPLETE - COMPACT VIEW
    if (isDraftComplete) {
      return (
        <div className="flex flex-col h-full bg-neu-base">
          {/* Compact Hero */}
          <div className="flex-shrink-0 bg-gradient-to-r from-electric-600 to-blue-500 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white uppercase italic tracking-tight leading-none">
                  Draft Complete!
                </h1>
                <p className="text-electric-100 text-xs font-medium mt-0.5">
                  Your nations are locked in. Time for strategy.
                </p>
              </div>
            </div>
          </div>
          
          {/* Compact Content */}
          <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
            {/* CP CTA */}
            <div className="neu-card p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 bg-electric-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-electric-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm leading-tight">Confidence Boosts</h3>
                <p className="text-[11px] text-gray-500 truncate">
                  Go to <span className="text-electric-600 font-bold">Live Events</span> to pick
                </p>
              </div>
            </div>
            
            {/* Rules Grid - Ultra Compact */}
            <div className="neu-card p-3 rounded-xl bg-yellow-50/50">
              <h4 className="font-bold text-yellow-700 text-[10px] uppercase tracking-wider mb-2">How It Works</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-green-500 flex-shrink-0" />
                  <span className="text-[10px] text-gray-600">Pick events to medal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-electric-500 flex-shrink-0" />
                  <span className="text-[10px] text-gray-600">2x points if medal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                  <span className="text-[10px] text-gray-600">-100 if no medal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-yellow-500 flex-shrink-0" />
                  <span className="text-[10px] text-gray-600">Max 2 per sport</span>
                </div>
              </div>
            </div>
            
            {/* Deadline - Inline */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl neu-inset">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Deadline</span>
              <span className="text-xs font-black text-gray-800">
                {new Date(openingCeremonyLockTime).toLocaleDateString(undefined, {
                  weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          
          {/* Fixed CTA */}
          <div className="flex-shrink-0 p-4 pt-2 pb-safe space-y-2">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="w-full py-3.5 bg-electric-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-electric-500/30 active:scale-[0.98] transition-transform"
            >
              <Activity size={16} />
              Go to Live Events
            </button>
            <button
              onClick={() => onNavigate?.('profile')}
              className="w-full py-2.5 text-gray-500 font-bold text-[11px]"
            >
              View My Team
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-neu-base">
          {/* FIXED TOP SECTION */}
          <div className="flex-shrink-0 px-4 pt-4 pb-2 z-30 space-y-4">
              
              {/* Error State */}
              {waveSize === 0 && isCommissionerMode && (
                <div className="neu-card p-6 bg-red-50 border-2 border-red-200 mb-4 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="text-red-500" size={24} />
                    <div>
                      <h3 className="font-black text-red-700">Draft State Error</h3>
                      <p className="text-xs text-red-600">Division has no participants. This needs repair.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onCommishUpdate) {
                        onCommishUpdate('init', '', { waveId: wave.id });
                      }
                    }}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <RotateCcw size={16} /> Initialize Draft State
                  </button>
                </div>
              )}

              {/* Status Module */}
              {waveSize > 0 && (
                  <div className={`neu-card p-5 relative overflow-hidden transition-all duration-300 ${isMyTurn ? 'border-2 border-electric-400' : ''}`}>
                      <div className="absolute right-[-20px] top-[-20px] opacity-5 pointer-events-none text-gray-900">
                          <Clock size={120} />
                      </div>
                      
                      <div className="flex items-center justify-between relative z-10">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Round {roundNumber}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pick {pickInRound + 1}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  {currentPicker ? (
                                      <>
                                          {isMyTurn && <div className="w-3 h-3 rounded-full bg-electric-600 animate-pulse shadow-[0_0_10px_#0085C7]" />}
                                          <span className={`text-2xl font-black italic tracking-tighter truncate max-w-[200px] ${isMyTurn ? 'text-electric-600' : 'text-gray-800'}`}>
                                              {isMyTurn ? 'Your Pick' : `${currentPicker.name}'s Pick`}
                                          </span>
                                          {currentPicker.isBot && (
                                              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[9px] font-black rounded-full uppercase border border-purple-200">
                                                  Bot
                                              </span>
                                          )}
                                      </>
                                  ) : (
                                      <span className="text-lg font-bold flex items-center gap-2 text-gray-500">
                                          <Users size={18} /> Initializing...
                                      </span>
                                  )}
                              </div>
                          </div>

                          {/* Timer / On Clock Display */}
                          <div className="text-right">
                              {pickTimeRemaining !== null && wave.status === 'live' && !isDraftComplete ? (
                                <div className={`flex flex-col items-end ${pickTimeRemaining <= 10 ? 'animate-pulse' : ''}`}>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                        <Clock size={10} /> Time
                                    </div>
                                    <div className={`text-xl font-black font-mono leading-none mt-0.5 ${
                                        pickTimeRemaining <= 10 ? 'text-red-600' : 
                                        pickTimeRemaining <= 30 ? 'text-orange-500' : 'text-gray-900'
                                    }`}>
                                        {Math.floor(pickTimeRemaining / 60)}:{(pickTimeRemaining % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">On The Clock</div>
                                  <div className="text-sm font-bold truncate max-w-[80px] text-gray-900">{currentPicker ? currentPicker.name : '...'}</div>
                                </>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              {/* Quick Bot Fill */}
              {isCommissionerMode && waveSize < capacity && waveSize > 0 && (
                  <div className="neu-card p-4 bg-purple-50 border border-purple-200 animate-fade-in">
                      <div className="text-xs font-black text-purple-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Users size={14} /> Quick Fill ({waveSize}/{capacity} Players)
                      </div>
                      <div className="flex gap-2 mb-2">
                          <input
                              type="text"
                              value={botName}
                              onChange={(e) => setBotName(e.target.value)}
                              placeholder="Bot name..."
                              className="flex-1 px-3 py-2 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                          />
                          <button
                              onClick={() => {
                                  if (onCreateBot && botName.trim()) {
                                      onCreateBot(botName.trim(), wave.id);
                                      setBotName('');
                                  }
                              }}
                              disabled={!botName.trim()}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider disabled:opacity-50 shadow-md active:scale-95 transition-all"
                          >
                              + Add
                          </button>
                      </div>
                  </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                      type="text" 
                      placeholder="Scout nations..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-neu-base rounded-xl px-4 py-3 pl-12 text-sm font-bold text-gray-700 placeholder-gray-400 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] outline-none focus:ring-2 focus:ring-electric-500/50"
                  />
                  {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors"
                    >
                        <X size={12} />
                    </button>
                  )}
              </div>
          </div>

          {/* SCROLLABLE LIST */}
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32">
              <div className="space-y-4">
                  {filteredCountries.length === 0 && (
                      <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">No nations found</div>
                  )}
                  
                  {filteredCountries.map((country, index) => {
                      const meta = getCountryData(country.code);
                      const fallbackColors = (country as any).colors || ['#ccc'];
                      const fallbackPrimary = (country as any).colors?.[0] || '#666';
                      
                      const countryColors = COUNTRY_COLORS[country.code] || { 
                          name: country.name,
                          colors: fallbackColors, 
                          primaryColor: fallbackPrimary,
                          gradientStart: fallbackPrimary,
                          gradientEnd: fallbackColors[fallbackColors.length - 1] || fallbackPrimary
                      };
                      
                      const isExpanded = expandedCountryCode === country.code;
                      
                      // Inject a separator if this is the first Extended country being shown
                      const isFirstExtended = showExtendedCountries && EXTENDED_COUNTRIES.find(e => e.code === country.code) && !EXTENDED_COUNTRIES.find(e => e.code === filteredCountries[index-1]?.code);

                      return (
                          <React.Fragment key={country.code}>
                              {isFirstExtended && (
                                <div className="flex items-center gap-3 py-4 mt-4">
                                    <div className="h-px bg-gray-300 flex-1" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                        🌍 Extended Nations
                                    </span>
                                    <div className="h-px bg-gray-300 flex-1" />
                                </div>
                              )}
                              
                              <div 
                                  className={`neu-card-interactive p-0 overflow-hidden ${isExpanded ? 'ring-2 ring-electric-500/20' : ''}`}
                              >
                                  <div 
                                      className="p-4 flex items-center gap-4 cursor-pointer"
                                      onClick={() => toggleCountryExpand(country.code)}
                                  >
                                      <div className="flex-shrink-0 drop-shadow-md">
                                          <CountryBadge 
                                              code={country.code} 
                                              colors={countryColors.colors} 
                                              primaryColor={countryColors.primaryColor}
                                              size={56}
                                          />
                                      </div>

                                      <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-center">
                                              <div>
                                                  <div className="font-black text-xl text-gray-900 italic tracking-tight leading-none mb-2">
                                                      {country.name}
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                      <div className="flex items-center gap-1.5 neu-inset px-2 py-1 rounded-lg text-[10px] font-bold text-gray-700 bg-transparent">
                                                          <Trophy size={12} className="text-gold-500" />
                                                          <span>{
                                                              // @ts-ignore 
                                                              country.totalMedals || 0} All-Time
                                                          </span>
                                                      </div>
                                                      <div className="text-[10px] font-bold text-gray-400">
                                                          • {meta.projectedGold} Gold Proj.
                                                      </div>
                                                  </div>
                                              </div>
                                              
                                              {(isMyTurn || isCommissionerMode) && (
                                                  <button
                                                      onClick={(e) => {
                                                          e.stopPropagation();
                                                          if (isCommissionerMode && !isMyTurn && currentPickerId) {
                                                              // Commish forcing
                                                              setCommishForceNation(country.code);
                                                              setShowCommishTools(true);
                                                              setForcePickMode(true);
                                                          } else if (isMyTurn) {
                                                              handleManualDraft(country.code);
                                                          }
                                                      }}
                                                      className="w-12 h-12 ml-3 flex-shrink-0 rounded-full bg-neu-base flex items-center justify-center text-electric-600 shadow-neu-flat active:shadow-neu-pressed transition-all active:scale-95 border border-white/50"
                                                  >
                                                      <Plus size={20} />
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                      
                                      {!(isMyTurn || isCommissionerMode) && (
                                          <div className="text-gray-300">
                                              <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                          </div>
                                      )}
                                  </div>

                                  {isExpanded && (
                                      <div className="px-4 pb-4 pt-0 bg-gray-50/50 border-t border-gray-100">
                                          <div className="mt-3 grid grid-cols-2 gap-3 mb-3">
                                              <div className="neu-inset bg-white/50 p-3 rounded-xl">
                                                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                      <Activity size={10} /> Top Sports
                                                  </div>
                                                  <div className="text-xs font-bold text-gray-800 leading-tight">
                                                      {meta.bestSports.slice(0, 3).join(', ') || 'Various'}
                                                  </div>
                                              </div>
                                              <div className="neu-inset bg-white/50 p-3 rounded-xl">
                                                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                      <Trophy size={10} /> Stars
                                                  </div>
                                                  <div className="text-xs font-bold text-gray-800 leading-tight">
                                                      {meta.stars.slice(0, 2).join(', ') || 'Deep Roster'}
                                                  </div>
                                              </div>
                                          </div>
                                          
                                          <div className="neu-inset bg-electric-50/50 p-3 text-xs text-gray-600 leading-relaxed font-medium">
                                              <span className="text-electric-600 font-black uppercase text-[10px] tracking-wider block mb-1">Strategic Intel</span>
                                              {meta.history}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          </React.Fragment>
                      );
                  })}
                  
                  {/* Extended List Toggle */}
                  {!showExtendedCountries && (
                    <button
                        onClick={() => setShowExtendedCountries(true)}
                        className="w-full py-4 mt-4 neu-inset rounded-2xl text-center hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        + Show {EXTENDED_COUNTRIES.length} More Countries
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">
                        Jamaica, Brazil, Trinidad & Tobago, and more...
                        </p>
                    </button>
                  )}

                  {showExtendedCountries && (
                    <button
                        onClick={() => setShowExtendedCountries(false)}
                        className="w-full py-3 mt-4 text-center text-xs font-bold text-electric-600"
                    >
                        Hide Extended Countries
                    </button>
                  )}

                  <div className="h-24 md:h-8" />
              </div>
          </div>
      </div>
    );
  };

  return (
    <div className="relative h-full flex flex-col">
        {renderDraftContent()}

        {isCommissionerMode && showCommishTools && (
            <div className="fixed bottom-20 right-4 z-[90] w-72 animate-fade-in">
                <div className="neu-card p-4 bg-neu-base ring-1 ring-gold-500/20">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 neu-button text-gold-500">
                                <Whistle size={16} />
                            </div>
                            <h3 className="text-xs font-black uppercase italic text-gold-600">Commish Tools</h3>
                        </div>
                        <button onClick={() => setShowCommishTools(false)} className="w-7 h-7 neu-button text-gray-400 hover:text-red-500">
                            <X size={14} />
                        </button>
                    </div>
                    
                    {/* Current Picker */}
                    <div className="neu-inset p-2 mb-3 rounded-lg">
                        <div className="text-[8px] font-black text-electric-600 uppercase tracking-widest">On Clock</div>
                        <div className="text-sm font-black text-gray-900 truncate">{currentPicker ? currentPicker.name : '...'}</div>
                    </div>
                    
                    {/* Force Pick Toggle */}
                    <div className="bg-gray-100 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-gray-600 uppercase flex items-center gap-1">
                                <AlertTriangle size={10} className={forcePickMode ? "text-red-500" : "text-gray-400"} />
                                Force Pick
                            </span>
                            <button
                                onClick={() => setForcePickMode(!forcePickMode)}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${forcePickMode ? 'bg-red-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${forcePickMode ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                        
                        {forcePickMode && (
                            <div className="space-y-2 pt-1 animate-fade-in">
                                <select
                                    value={commishForceNation}
                                    onChange={(e) => setCommishForceNation(e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-red-200 focus:border-red-500 outline-none"
                                >
                                    <option value="">Select Nation...</option>
                                    {availableCountries.map(n => (<option key={n.code} value={n.code}>{n.name}</option>))}
                                </select>
                                <button
                                    disabled={!commishForceNation || !currentPickerId}
                                    onClick={() => { 
                                        if(onCommishUpdate && currentPickerId) {
                                            onCommishUpdate('draft', currentPickerId, { countryCode: commishForceNation });
                                            setCommishForceNation('');
                                            setForcePickMode(false);
                                        }
                                    }}
                                    className="w-full py-2 text-[10px] font-bold bg-red-500 text-white rounded-lg active:bg-red-600 disabled:opacity-50"
                                >
                                    ⚠️ FORCE PICK
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                if(onCommishUpdate && currentPickerId && availableCountries.length > 0) {
                                    const random = availableCountries[Math.floor(Math.random() * availableCountries.length)].code;
                                    onCommishUpdate('draft', currentPickerId, { countryCode: random });
                                }
                            }}
                            className="flex-1 py-2 neu-button text-[9px] text-gray-600 gap-1"
                        >
                            <Shuffle size={12} /> Skip
                        </button>
                        <button onClick={() => onCommishUpdate?.('undo', '')} className="flex-1 py-2 neu-button text-[9px] text-red-500 gap-1">
                            <RotateCcw size={12} /> Undo
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DraftRoom;
