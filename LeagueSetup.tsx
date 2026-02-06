
import React, { useState, useEffect } from 'react';
import { OlympicRings, Plus, LogIn, ArrowRight, Wallet, Users, Clock, Check, Calendar, X, ChevronRight, ChevronDown, Shuffle, TrendingUp, Whistle } from './Icons';
import { generateLeagueCode, generateWaveCode } from './databaseService';
import { Wave as WaveType } from './types';
import { DEFAULT_LOCK_TIME } from './constants';
import { db } from './firebase';

interface LeagueSetupProps {
  onComplete: (settings: any) => void;
  onCancel: () => void;
  userId: string;
  initialMode?: 'create' | 'join' | null;
}

const toLocalISOString = (timestamp: number) => {
  const date = new Date(timestamp);
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// --- Custom Date Picker Component ---
const CustomDatePicker = ({ 
    initialTimestamp, 
    onSave, 
    onClose 
}: { 
    initialTimestamp: number, 
    onSave: (ts: number) => void, 
    onClose: () => void 
}) => {
    const [selectedDate, setSelectedDate] = useState(new Date(initialTimestamp));
    const [viewDate, setViewDate] = useState(new Date(initialTimestamp));

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const generateCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const days = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        const slots = [];
        
        // Empty slots
        for(let i=0; i<firstDay; i++) slots.push(null);
        // Days
        for(let i=1; i<=days; i++) slots.push(new Date(year, month, i));
        
        return slots;
    };

    const handleDateClick = (d: Date) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
        setSelectedDate(newDate);
    };

    const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
        const newDate = new Date(selectedDate);
        if (type === 'hours') newDate.setHours(parseInt(val));
        else newDate.setMinutes(parseInt(val));
        setSelectedDate(newDate);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl p-6 max-w-sm w-full border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-lg text-gray-900 uppercase italic">Set Start Time</h3>
                    <button onClick={onClose} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Calendar Nav */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()-1)))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="rotate-180" size={16}/></button>
                    <span className="font-bold text-gray-900">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()+1)))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={16}/></button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-1 mb-6 text-center">
                    {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-bold text-gray-400 mb-2">{d}</div>)}
                    {generateCalendar().map((date, i) => {
                        if (!date) return <div key={i} />;
                        const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
                        const isToday = new Date().toDateString() === date.toDateString();
                        return (
                            <button 
                                key={i} 
                                onClick={() => handleDateClick(date)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center mx-auto ${
                                    isSelected ? 'bg-electric-600 text-white shadow-lg' : isToday ? 'text-electric-600 bg-electric-50' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {date.getDate()}
                            </button>
                        );
                    })}
                </div>

                {/* Time Picker */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Hour</label>
                        <select 
                            value={selectedDate.getHours()} 
                            onChange={(e) => handleTimeChange('hours', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-electric-500"
                        >
                            {Array.from({length: 24}).map((_, i) => <option key={i} value={i}>{i.toString().padStart(2,'0')}:00</option>)}
                        </select>
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Minute</label>
                        <select 
                            value={selectedDate.getMinutes()} 
                            onChange={(e) => handleTimeChange('minutes', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-electric-500"
                        >
                            {Array.from({length: 12}).map((_, i) => <option key={i} value={i*5}>{ (i*5).toString().padStart(2,'0') }</option>)}
                        </select>
                    </div>
                </div>

                <button 
                    onClick={() => onSave(selectedDate.getTime())} 
                    className="w-full py-4 bg-electric-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all"
                >
                    Confirm Time
                </button>
            </div>
        </div>
    );
};

const LeagueSetup: React.FC<LeagueSetupProps> = ({ onComplete, onCancel, initialMode, userId }) => {
  const [step, setStep] = useState(initialMode ? 2 : 1);
  const [mode, setMode] = useState<'create' | 'join' | null>(initialMode || null);
  
  // Data State
  const [leagueName, setLeagueName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [leagueCodeInput, setLeagueCodeInput] = useState('');
  const [selectedWaveId, setSelectedWaveId] = useState<string>('');
  
  // Profile State
  const [timeZone, setTimeZone] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  });
  
  // Config State
  const [entryFee, setEntryFee] = useState(20);
  const [isCustomFee, setIsCustomFee] = useState(false);
  const [extraSlotPrice, setExtraSlotPrice] = useState(2);
  const [totalTeams, setTotalTeams] = useState(12);
  const [usersPerWave, setUsersPerWave] = useState(4);
  const [waves, setWaves] = useState<WaveType[]>([]);
  const [cpDeadlineMode, setCpDeadlineMode] = useState<'global' | 'per-event'>('global');
  
  // Draft Settings State
  const [pickTimerDuration, setPickTimerDuration] = useState(60);
  const [autoDraftBehavior, setAutoDraftBehavior] = useState<'random' | 'best' | 'commish'>('random');
  const [skipThreshold, setSkipThreshold] = useState(3);
  
  // UI Helpers
  const [activeDatePickerWave, setActiveDatePickerWave] = useState<string | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  // Calculate valid wave sizes
  const getValidWaveSizes = (total: number) => {
    const opts: number[] = [];
    if (total < 3) return [total];
    for (let size = 3; size <= 12; size++) {
      if (total % size === 0) opts.push(size);
    }
    if (opts.length === 0) opts.push(total);
    return opts.sort((a, b) => b - a);
  };

  const waveOptions = getValidWaveSizes(totalTeams);

  // Regenerate waves when config changes
  useEffect(() => {
    if (mode !== 'create') return;
    let safeWaveSize = usersPerWave;
    if (!waveOptions.includes(safeWaveSize)) {
        safeWaveSize = waveOptions.reduce((prev, curr) => Math.abs(curr - 4) < Math.abs(prev - 4) ? curr : prev, waveOptions[0]);
        setUsersPerWave(safeWaveSize);
    }
    const numWaves = Math.ceil(totalTeams / safeWaveSize);
    
    // Future Date Generation
    const now = new Date();
    // Start tomorrow at 7PM local
    const startDate = new Date();
    startDate.setDate(now.getDate() + 1);
    startDate.setHours(19, 0, 0, 0);

    setWaves(prevWaves => Array.from({ length: numWaves }).map((_, i) => {
        const id = String.fromCharCode(65 + i);
        const existing = prevWaves.find(w => w.id === id);
        
        // Stagger waves by 2 hours
        const waveTime = new Date(startDate.getTime() + (i * 2 * 60 * 60 * 1000)).getTime();

        return {
            id,
            name: `Division ${id}`,
            inviteCode: existing?.inviteCode || generateWaveCode(id),
            draftStartTime: existing?.draftStartTime || waveTime,
            status: 'scheduled',
            participants: i === 0 ? [userId] : [],
            pickIndex: 0,
            draftOrder: i === 0 ? [userId] : []
        };
    }));
  }, [totalTeams, usersPerWave, mode, userId]);

  const updateWaveTime = (id: string, time: number) => {
    setWaves(prev => prev.map(w => w.id === id ? { ...w, draftStartTime: time } : w));
    setActiveDatePickerWave(null);
  };

  const handleNext = async () => {
    if (step === 1 && mode) setStep(2);
    else if (step === 2) {
      if (mode === 'create' && (!leagueName.trim() || !teamName.trim())) return alert("All fields required.");
      if (mode === 'join') {
          if (!leagueCodeInput.trim() || !teamName.trim()) return alert("All fields required.");
          
          // Verify code and fetch waves for correct selection
          setIsCheckingCode(true);
          try {
              const snap = await db.collection('leagues').where('league_code', '==', leagueCodeInput.trim().toUpperCase()).get();
              if (snap.empty) {
                  alert("League not found. Check the code.");
                  setIsCheckingCode(false);
                  return;
              }
              const leagueId = snap.docs[0].id;
              
              // Fetch actual waves for this league
              const wavesSnap = await db.collection('waves').where('leagueId', '==', leagueId).get();
              let fetchedWaves = wavesSnap.docs.map(d => d.data() as WaveType).sort((a,b) => a.id.localeCompare(b.id));
              
              // Fallback to legacy settings if normalized waves empty
              if (fetchedWaves.length === 0) {
                  fetchedWaves = snap.docs[0].data().settings.waves || [];
              }
              
              setWaves(fetchedWaves);
              setStep(6); // Go to division selection
          } catch (e) {
              console.error(e);
              alert("Error fetching league info.");
          } finally {
              setIsCheckingCode(false);
          }
          return;
      }
      setStep(3);
    } else if (step === 3) {
        setStep(4);
    } else if (step === 4) {
        setStep(5);
    } else if (step === 5) {
        setStep(6);
    } else if (step === 6) {
        handleFinish();
    }
  };

  const handleBack = () => {
      if (step === 2) {
          if (initialMode) onCancel();
          else setStep(1);
      }
      else if (step === 3) setStep(2);
      else if (step === 4) setStep(3);
      else if (step === 5) setStep(4);
      else if (step === 6) {
          if (mode === 'join') setStep(2);
          else setStep(5);
      }
  };

  const handleCreateDemo = () => {
    const demoWaves: WaveType[] = [
      { id: 'A', name: 'Division A', inviteCode: 'DEMO-A', draftStartTime: Date.now() - 100000, status: 'live', participants: ['me', 'bot1', 'bot2', 'bot3'], pickIndex: 0, draftOrder: ['me', 'bot1', 'bot2', 'bot3'], draftSettings: { pickTimerDuration: 30, autoDraftBehavior: 'random', skipThreshold: 3, draftStartTime: Date.now() - 100000 } },
      { id: 'B', name: 'Division B', inviteCode: 'DEMO-B', draftStartTime: Date.now() + 3600000, status: 'scheduled', participants: ['bot4', 'bot5'], pickIndex: 0, draftOrder: ['bot4', 'bot5'], draftSettings: { pickTimerDuration: 60, autoDraftBehavior: 'random', skipThreshold: 3, draftStartTime: Date.now() + 3600000 } }
    ];
    onComplete({
      leagueName: "Demo League 2026",
      leagueId: "DEMO-" + Math.random().toString(36).substr(2,5),
      leagueCode: "DEMO26",
      totalUsers: 8,
      usersPerWave: 4,
      numWaves: 2,
      myTeamName: "Demo Team",
      entryFee: 0,
      extraSlotPrice: 0,
      role: 'commissioner',
      waves: demoWaves,
      selectedWaveId: 'A',
      openingCeremonyLockTime: DEFAULT_LOCK_TIME,
      currentPhase: 'phase1_nation_draft',
      isTestMode: true,
      simulation: { isRunning: true, speed: '20x', autoDraft: true, autoCP: true, autoResults: false }
    });
  };

  const handleFinish = () => {
    if (mode === 'create') {
      const configuredWaves = waves.map(w => ({
          ...w,
          draftSettings: {
              pickTimerDuration,
              autoDraftBehavior,
              skipThreshold,
              draftStartTime: w.draftStartTime
          }
      }));

      onComplete({
        leagueName,
        leagueId: 'L-' + Math.random().toString(36).substr(2,5).toUpperCase(),
        leagueCode: generateLeagueCode(),
        totalUsers: totalTeams,
        usersPerWave,
        numWaves: waves.length,
        myTeamName: teamName || 'Commissioner',
        timeZone,
        entryFee,
        extraSlotPrice,
        role: 'commissioner',
        waves: configuredWaves,
        selectedWaveId: selectedWaveId || waves[0].id, 
        openingCeremonyLockTime: DEFAULT_LOCK_TIME,
        cpDeadlineMode,
        currentPhase: 'phase1_nation_draft',
        isTestMode: false
      });
    } else if (mode === 'join') {
      onComplete({ mode: 'join', leagueCode: leagueCodeInput, myTeamName: teamName, timeZone, selectedWaveId });
    }
  };

  const renderHeader = () => (
    <div className="flex-shrink-0 px-4 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="flex items-center gap-1.5 text-gray-400 hover:text-electric-600 transition-colors"
        >
          <ArrowRight className="rotate-180" size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Lobby</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-electric-600 border border-gray-100">
            <OlympicRings size={28} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black italic uppercase tracking-tight text-gray-900 leading-none">Gold Hunt '26</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Fantasy Olympics</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neu-base">
        {renderHeader()}
        
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-24 no-scrollbar">
            <div className="max-w-lg mx-auto olympic-card p-6">
                
                {step === 1 && (
                    <div className="space-y-4">
                        <button onClick={() => { setMode('create'); setStep(2); }} className="w-full h-24 bg-white rounded-3xl flex items-center justify-center px-6 shadow-md hover:shadow-lg border border-gray-100 hover:-translate-y-1 transition-all group active:scale-95 cursor-pointer">
                            <div className="text-left w-full flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-electric-50 rounded-lg text-electric-600"><Plus size={24} /></div>
                                    <div className="text-left">
                                        <div className="font-black text-gray-900 uppercase italic text-xl">Create League</div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Start a new league</div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-electric-600"><ArrowRight size={20} /></div>
                            </div>
                        </button>

                        <button onClick={() => { setMode('join'); setStep(2); }} className="w-full h-24 bg-white rounded-3xl flex items-center justify-center px-6 shadow-md hover:shadow-lg border border-gray-100 hover:-translate-y-1 transition-all group active:scale-95 cursor-pointer">
                            <div className="text-left w-full flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gold-50 rounded-lg text-gold-600"><LogIn size={24} /></div>
                                    <div className="text-left">
                                        <div className="font-black text-gray-900 uppercase italic text-xl">Join League</div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Enter code</div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gold-600"><ArrowRight size={20} /></div>
                            </div>
                        </button>

                        <button onClick={handleCreateDemo} className="w-full py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                            Initialize Test Simulation
                        </button>
                    </div>
                )}

                {/* Steps 2-6 content */}
                {step === 2 && mode === 'create' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-gray-900 italic uppercase">League Identity</h3>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1">League Name</label>
                            <input 
                              type="text" 
                              value={leagueName} 
                              onChange={e => setLeagueName(e.target.value)} 
                              placeholder="e.g. Winter Glory" 
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 shadow-sm focus:border-electric-600 focus:ring-2 focus:ring-electric-200 transition-all font-medium outline-none" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1">Your Team Name</label>
                            <input 
                              type="text" 
                              value={teamName} 
                              onChange={e => setTeamName(e.target.value)} 
                              placeholder="e.g. Cortina Crushers" 
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 shadow-sm focus:border-electric-600 focus:ring-2 focus:ring-electric-200 transition-all font-medium outline-none" 
                            />
                        </div>
                    </div>
                )}

                {step === 2 && mode === 'join' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-gray-900 italic uppercase">Find League</h3>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1">League Code</label>
                            <input 
                              type="text" 
                              value={leagueCodeInput} 
                              onChange={e => setLeagueCodeInput(e.target.value.toUpperCase())} 
                              placeholder="GH-XXXX" 
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 shadow-sm focus:border-electric-600 focus:ring-2 focus:ring-electric-200 transition-all font-medium outline-none" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1">Your Team Name</label>
                            <input 
                              type="text" 
                              value={teamName} 
                              onChange={e => setTeamName(e.target.value)} 
                              placeholder="e.g. Alpine Ace" 
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 shadow-sm focus:border-electric-600 focus:ring-2 focus:ring-electric-200 transition-all font-medium outline-none" 
                            />
                        </div>
                    </div>
                )}

                {step === 3 && mode === 'create' && (
                    <div className="space-y-8">
                        <h3 className="text-lg font-black text-gray-900 italic uppercase">Configuration</h3>
                        
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1"><Wallet size={14} /> Entry Fee</label>
                            <div className="grid grid-cols-4 gap-2">
                                <button 
                                    onClick={() => { setIsCustomFee(true); setEntryFee(0); }} 
                                    className={`py-3 rounded-xl font-bold text-xs transition-all ${isCustomFee ? 'bg-electric-50 text-electric-600 border border-electric-600 shadow-inner' : 'bg-white shadow-sm text-gray-700 border border-gray-200 hover:border-gray-300'}`}
                                >
                                    Custom
                                </button>
                                {[20, 50, 100].map(f => (
                                    <button 
                                      key={f} 
                                      onClick={() => { setEntryFee(f); setIsCustomFee(false); }} 
                                      className={`py-3 rounded-xl font-bold text-xs transition-all ${!isCustomFee && entryFee === f ? 'bg-electric-50 text-electric-600 border border-electric-600 shadow-inner' : 'bg-white shadow-sm text-gray-700 border border-gray-200 hover:border-gray-300'}`}
                                    >
                                        ${f}
                                    </button>
                                ))}
                            </div>
                            {isCustomFee && (
                                <div className="relative animate-fade-in">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        value={entryFee === 0 ? '' : entryFee} 
                                        onChange={(e) => setEntryFee(Math.max(0, parseInt(e.target.value) || 0))}
                                        placeholder="Enter amount"
                                        className="w-full pl-8 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold shadow-sm focus:border-electric-600 focus:ring-2 focus:ring-electric-200 outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                             <div className="flex items-center justify-between mb-2 pl-1">
                                <span className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest"><Users size={14} /> Total Teams</span>
                                <span className="font-black text-xl text-gray-900 italic">{totalTeams}</span>
                            </div>
                            
                            <div className="relative h-4 bg-gray-100 rounded-full shadow-inner border border-gray-200">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-electric-600 rounded-full shadow-md transition-all duration-150"
                                    style={{ width: `${((totalTeams - 3) / (50 - 3)) * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="3"
                                    max="50"
                                    value={totalTeams}
                                    onChange={(e) => setTotalTeams(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-electric-500 pointer-events-none transition-all duration-150"
                                    style={{ left: `calc(${((totalTeams - 3) / (50 - 3)) * 100}% - 12px)` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1">Division Size</label>
                            <div className="grid grid-cols-4 gap-2">
                                {waveOptions.map(s => (
                                    <button 
                                      key={s} 
                                      onClick={() => setUsersPerWave(s)} 
                                      className={`py-2 rounded-xl text-[10px] font-bold transition-all ${usersPerWave === s ? 'bg-electric-600 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm border border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {s} / Div
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                            Confidence Boost Deadline
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setCpDeadlineMode('global')}
                              className={`p-4 rounded-xl text-center transition-all ${
                                cpDeadlineMode === 'global' 
                                  ? 'bg-electric-600 text-white shadow-lg' 
                                  : 'bg-white border border-gray-200 text-gray-600'
                              }`}
                            >
                              <div className="text-sm font-black">Global</div>
                              <div className="text-[9px] opacity-80 mt-1">All CBs lock at Opening Ceremony</div>
                            </button>
                            <button
                              onClick={() => setCpDeadlineMode('per-event')}
                              className={`p-4 rounded-xl text-center transition-all ${
                                cpDeadlineMode === 'per-event' 
                                  ? 'bg-electric-600 text-white shadow-lg' 
                                  : 'bg-white border border-gray-200 text-gray-600'
                              }`}
                            >
                              <div className="text-sm font-black">Per-Event</div>
                              <div className="text-[9px] opacity-80 mt-1">Each CB locks when event starts</div>
                            </button>
                          </div>
                        </div>
                    </div>
                )}

                {step === 4 && mode === 'create' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-electric-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Clock size={28} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black italic text-gray-900 uppercase">Schedule Divisions</h2>
                                <p className="text-xs text-gray-500 font-medium">Set the draft start time for each division.</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                            {waves.map((w) => (
                                <div key={w.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex items-center justify-between group hover:-translate-y-0.5 transition-transform">
                                    <div>
                                        <h3 className="font-black text-lg text-gray-900">Division {w.id}</h3>
                                        <p className="text-xs font-bold text-electric-600 mt-1 uppercase tracking-wide">
                                            {new Date(w.draftStartTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveDatePickerWave(w.id)}
                                        className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shadow-sm text-gray-500 hover:text-electric-600 active:shadow-inner transition-all border border-gray-100"
                                    >
                                        <Calendar size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        {activeDatePickerWave && (
                            <CustomDatePicker 
                                initialTimestamp={waves.find(w => w.id === activeDatePickerWave)?.draftStartTime || Date.now()}
                                onSave={(ts) => updateWaveTime(activeDatePickerWave, ts)}
                                onClose={() => setActiveDatePickerWave(null)}
                            />
                        )}
                    </div>
                )}

                {step === 5 && mode === 'create' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-electric-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Clock size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black italic text-gray-900 uppercase">DRAFT SETTINGS</h2>
                                <p className="text-xs text-gray-500 font-medium">Configure pick timers and auto-draft behavior</p>
                            </div>
                        </div>
                        
                        {/* Pick Timer Duration */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">
                                Pick Timer Duration
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 30, label: '30 Seconds', desc: 'Fast Draft' },
                                    { value: 60, label: '60 Seconds', desc: 'Standard' },
                                    { value: 90, label: '90 Seconds', desc: 'Relaxed' },
                                    { value: 120, label: '2 Minutes', desc: 'Strategic' },
                                    { value: 0, label: 'No Timer', desc: 'Unlimited' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setPickTimerDuration(option.value)}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            pickTimerDuration === option.value
                                                ? 'bg-electric-600 border-electric-600 text-white shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-electric-300'
                                        }`}
                                    >
                                        <div className="font-black text-lg">{option.label}</div>
                                        <div className="text-xs mt-1 opacity-80 font-medium">{option.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Auto-Draft Behavior */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">
                                When Timer Expires
                            </label>
                            <div className="space-y-2">
                                {[
                                    { value: 'random', label: 'Random Nation', desc: 'Auto-select random available nation', icon: Shuffle },
                                    { value: 'best', label: 'Best Available', desc: 'Auto-select highest medal count nation', icon: TrendingUp },
                                    { value: 'commish', label: 'Manual Entry', desc: 'Commissioner must enter pick (Offline)', icon: Whistle }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setAutoDraftBehavior(option.value as any)}
                                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                                            autoDraftBehavior === option.value
                                                ? 'bg-electric-600 border-electric-600 text-white shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-electric-300'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                            autoDraftBehavior === option.value ? 'bg-white/20' : 'bg-gray-100'
                                        }`}>
                                            <option.icon size={24} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-bold">{option.label}</div>
                                            <div className="text-xs mt-1 opacity-80 font-medium">{option.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Skip Threshold */}
                        {(autoDraftBehavior === 'random' || autoDraftBehavior === 'best') && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">
                                    Auto-Pilot After Timeouts
                                </label>
                                <select
                                    value={skipThreshold}
                                    onChange={(e) => setSkipThreshold(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-medium shadow-sm focus:border-electric-600 focus:ring-2 focus:ring-electric-200 transition-all outline-none"
                                >
                                    <option value="3">After 3 missed picks</option>
                                    <option value="5">After 5 missed picks</option>
                                    <option value="999">Never (each pick times individually)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2 font-medium pl-1">
                                    If a player misses this many picks, remaining picks auto-draft immediately.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {step === 6 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black italic text-gray-900 uppercase mb-2">Select Your Division</h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {mode === 'create' ? "Which division do you want to join as Commissioner?" : "Select the division you want to compete in."}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto no-scrollbar pb-4">
                            {waves.map((w: WaveType) => {
                                const id = w.id;
                                const time = new Date(w.draftStartTime).toLocaleString([], { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                                const isSelected = selectedWaveId === id;
                                const isFull = w.participants && w.participants.length >= usersPerWave;
                                
                                return (
                                    <button 
                                        key={id} 
                                        onClick={() => !isFull && setSelectedWaveId(isSelected ? '' : id)} 
                                        disabled={isFull && mode === 'join'}
                                        className={`p-5 rounded-2xl transition-all text-left flex flex-col justify-between h-32 relative overflow-hidden ${
                                            isSelected 
                                            ? 'bg-white shadow-inner border-2 border-electric-600' 
                                            : isFull && mode === 'join'
                                                ? 'bg-gray-100 opacity-60 cursor-not-allowed border border-gray-200'
                                                : 'bg-white shadow-md hover:shadow-lg hover:-translate-y-1 border border-gray-100'
                                        }`}
                                    >
                                        <div>
                                            <h3 className={`font-black text-xl mb-1 ${isSelected ? 'text-electric-600' : 'text-gray-900'}`}>Division {id}</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{time}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute bottom-3 right-3 w-6 h-6 bg-electric-600 rounded-full flex items-center justify-center text-white shadow-md">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                        {isFull && mode === 'join' && (
                                            <div className="absolute bottom-3 right-3 text-[10px] font-black text-red-500 uppercase">FULL</div>
                                        )}
                                        {mode === 'join' && !isFull && (
                                            <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-400">
                                                {w.participants?.length || 0} / {usersPerWave}
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Fixed Footer */}
        {step > 1 && (
            <div className="flex-shrink-0 p-6 glass-nav-bottom flex gap-4 pb-safe z-20">
                <button onClick={handleBack} className="neu-btn px-6 h-14 rounded-2xl font-black text-xs uppercase text-gray-500 hover:text-gray-900 transition-colors">Back</button>
                <button 
                    onClick={handleNext} 
                    disabled={isCheckingCode}
                    className="neu-btn flex-1 h-14 bg-electric-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all hover:bg-electric-700 disabled:opacity-50"
                >
                    {isCheckingCode ? 'Verifying...' : step === 6 ? 'Finish Setup' : 'Next Step'} <ArrowRight size={16} />
                </button>
            </div>
        )}
    </div>
  );
};

export default LeagueSetup;
