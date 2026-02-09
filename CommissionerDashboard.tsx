
import React, { useState, useMemo } from 'react';
import { 
  Shield, Copy, Calendar, Activity, Lock, Users, ArrowRight, Edit3, X, Plus, 
  Trash2, ChevronDown, ChevronRight, TrendingUp, ShieldCheck, AlertTriangle,
  Play, Pause, RotateCcw, Settings, Clock, UserPlus, UserMinus, Shuffle,
  Check, Zap, Eye, RefreshCw, Flag, UserCircle, Whistle
} from './Icons';
import { LeagueSettings, User, Wave, OlympicEvent, MedalResult } from './types';
import { COUNTRIES } from './constants';
import { 
  updateTeamInCloud, updateWaveInCloud, initializeDraftState, 
  migrateFixBrokenDrafts, editResultWithAudit 
} from './databaseService';
import { verifyScoring } from './scoringEngine';
import CountryBadge from './CountryBadge';
import { COUNTRY_COLORS } from './olympicCountryColors';
import { useToast } from './Toast';

interface CommissionerDashboardProps {
  settings: LeagueSettings;
  users: User[];
  events: OlympicEvent[];
  onStartDraft: (waveId: string) => void;
  onUpdateWave: (wave: Wave) => void;
  onUpdateSettings: (settings: Partial<LeagueSettings>) => void;
  onAddTestResult: (result: MedalResult) => void;
  onClearResults?: (type: 'all' | 'test') => void;
  onMoveUser?: (userId: string, targetWaveId: string) => void;
  onUpdateTeam?: (userId: string, updates: Partial<User>) => void;
  onCreateBot?: (name: string, waveId: string) => void;
  results?: MedalResult[];
  viewMode: 'commish' | 'team';
  onToggleView: (mode: 'commish' | 'team') => void;
  onRefreshData?: () => void;
}

// Reusable styling for light neumorphic inputs
const NEU_INPUT_STYLE = {
  background: '#EFEEF3',
  boxShadow: 'inset 2px 2px 4px rgba(163, 163, 168, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
};
const NEU_INPUT_CLASS = "w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-900 placeholder-gray-500 outline-none transition-all";

// Date picker component
const DateTimePicker: React.FC<{
  value: number;
  onChange: (ts: number) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const toInputValue = (ts: number) => {
    const d = new Date(ts);
    // Adjust to local ISO string for input[type="datetime-local"]
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };
  
  return (
    <div>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">
        {label}
      </label>
      <input
        type="datetime-local"
        value={toInputValue(value)}
        onChange={(e) => onChange(new Date(e.target.value).getTime())}
        className={NEU_INPUT_CLASS}
        style={NEU_INPUT_STYLE}
      />
    </div>
  );
};

const CommissionerDashboard: React.FC<CommissionerDashboardProps> = ({ 
  settings, users, events, onStartDraft, onUpdateWave, onUpdateSettings, 
  onAddTestResult, onClearResults, onMoveUser, onUpdateTeam, onCreateBot, results = [], 
  viewMode, onToggleView, onRefreshData
}) => {
  const toast = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'waves' | 'teams' | 'assign' | 'settings' | 'scoring' | 'tools'>('overview');
  
  // Modal states
  const [editingWaveId, setEditingWaveId] = useState<string | null>(null);
  const [movingUser, setMovingUser] = useState<{ userId: string; currentWave: string } | null>(null);
  
  // Form states
  const [newBotName, setNewBotName] = useState('');
  const [selectedBotWave, setSelectedBotWave] = useState(settings.waves[0]?.id || 'A');
  const [verifyUserId, setVerifyUserId] = useState('');
  const [testEventId, setTestEventId] = useState('');
  const [goldCode, setGoldCode] = useState('NOR');
  const [silverCode, setSilverCode] = useState('GER');
  const [bronzeCode, setBronzeCode] = useState('USA');
  
  // Editing states
  const [editEntryFee, setEditEntryFee] = useState(settings.entryFee);
  const [editExtraSlotPrice, setEditExtraSlotPrice] = useState(settings.extraSlotPrice);
  const [editLockTime, setEditLockTime] = useState(settings.openingCeremonyLockTime);
  
  // Result Editing State
  const [editingResult, setEditingResult] = useState<MedalResult | null>(null);
  const [resultForm, setResultForm] = useState({ gold: '', silver: '', bronze: '' });

  // Clipboard state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // User Edit State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    draftedCountries: [] as string[],
    confidenceEvents: [] as string[],
    purchasedBoosts: 0,
    poolId: '',
    role: 'player' as 'commissioner' | 'manager' | 'player'
  });

  // Computed values
  const usersByWave = useMemo(() => {
    const grouped: Record<string, User[]> = {};
    settings.waves.forEach(w => grouped[w.id] = []);
    users.forEach(u => {
      if (grouped[u.poolId]) grouped[u.poolId].push(u);
      else if (grouped[u.poolId] === undefined) {
          if(!grouped[u.poolId]) grouped[u.poolId] = [];
          grouped[u.poolId].push(u);
      }
    });
    return grouped;
  }, [users, settings.waves]);

  const waveStats = useMemo(() => {
    return settings.waves.map(wave => {
      const waveUsers = usersByWave[wave.id] || [];
      const totalPicks = waveUsers.reduce((sum, u) => sum + u.draftedCountries.length, 0);
      const expectedPicks = waveUsers.length * 4; // 4 rounds
      const progress = expectedPicks > 0 ? (totalPicks / expectedPicks) * 100 : 0;
      
      return {
        ...wave,
        userCount: waveUsers.length,
        totalPicks,
        expectedPicks,
        progress,
        isComplete: progress >= 100 && waveUsers.length > 0,
        isEmpty: waveUsers.length === 0
      };
    });
  }, [settings.waves, usersByWave]);

  // Handlers
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleMoveUser = async (userId: string, targetWaveId: string) => {
    if (onMoveUser) {
      onMoveUser(userId, targetWaveId);
    }
    setMovingUser(null);
  };

  const handleAddBot = async () => {
    if (!newBotName.trim() || !onCreateBot) return;
    onCreateBot(newBotName.trim(), selectedBotWave);
    setNewBotName('');
  };

  const handleRepairDraft = async (waveId: string) => {
    try {
      const result = await initializeDraftState(settings.leagueId, waveId, { 
        resetPicks: false, 
        shuffleOrder: false 
      });
      alert(`Division ${waveId} repaired! ${result.participants.length} participants synced.`);
      if (onRefreshData) onRefreshData();
    } catch (e: any) {
      alert('Repair failed: ' + e.message);
    }
  };

  const handleResetWave = async (waveId: string) => {
    if (!confirm(`Reset Division ${waveId}? This will clear all draft picks for this division.`)) return;
    
    try {
      await initializeDraftState(settings.leagueId, waveId, { 
        resetPicks: true, 
        shuffleOrder: true 
      });
      alert(`Division ${waveId} has been reset.`);
      if (onRefreshData) onRefreshData();
    } catch (e: any) {
      alert('Reset failed: ' + e.message);
    }
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      entryFee: editEntryFee,
      extraSlotPrice: editExtraSlotPrice,
      openingCeremonyLockTime: editLockTime
    });
    alert('Settings Saved');
  };

  const handleStartAllDrafts = () => {
    if (!confirm('Start ALL division drafts simultaneously? Draft orders will be randomized.')) return;
    settings.waves.forEach(wave => {
      if (wave.status === 'scheduled') {
        onStartDraft(wave.id);
      }
    });
  };

  // User Management Handlers
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      draftedCountries: [...user.draftedCountries],
      confidenceEvents: [...user.confidenceEvents],
      purchasedBoosts: user.purchasedBoosts,
      poolId: user.poolId,
      role: user.role || 'player'
    });
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser || !onUpdateTeam) return;

    // Enforce 4-country maximum
    if (editForm.draftedCountries.length > 4) {
        toast.error("Cannot assign more than 4 countries per user!");
        return;
    }

    // Enforce within-division uniqueness
    const divisionUsers = users.filter(u =>
        u.poolId === (editForm.poolId || editingUser.poolId) && u.id !== editingUser.id
    );
    const divisionCountries = new Set(divisionUsers.flatMap(u => u.draftedCountries));
    const duplicates = editForm.draftedCountries.filter(code => divisionCountries.has(code));
    if (duplicates.length > 0) {
        toast.error(`Already taken in this division: ${duplicates.join(', ')}`);
        return;
    }

    // Rebuild detailed info to match updated countries
    const currentDetails = editingUser.draftedCountriesDetailed || [];
    const newDetails = editForm.draftedCountries.map((code, idx) => {
        const existing = currentDetails.find(d => d.code === code);
        if (existing) return existing;
        return {
            code,
            round: idx + 1,
            pickNumber: 0,
            multiplier: [1, 5, 10, 20][Math.min(idx, 3)] || 20
        };
    });

    await onUpdateTeam(editingUser.id, {
      ...editForm,
      draftedCountriesDetailed: newDetails
    });
    
    toast.success(`Updated ${editForm.name}`);
    setEditingUser(null);
  };

  // Result Editing Handlers
  const handleEditResult = (result: MedalResult) => {
    setEditingResult(result);
    setResultForm({
      gold: result.gold,
      silver: result.silver,
      bronze: result.bronze
    });
  };

  const handleSaveResultEdit = async () => {
    if (!editingResult) return;
    
    const event = events.find(e => e.id === editingResult.eventId);
    const eventName = event?.name || editingResult.eventId;
    
    const changes: string[] = [];
    if (resultForm.gold !== editingResult.gold) changes.push(`🥇 Gold: ${editingResult.gold} → ${resultForm.gold}`);
    if (resultForm.silver !== editingResult.silver) changes.push(`🥈 Silver: ${editingResult.silver} → ${resultForm.silver}`);
    if (resultForm.bronze !== editingResult.bronze) changes.push(`🥉 Bronze: ${editingResult.bronze} → ${resultForm.bronze}`);
    
    if (changes.length === 0) {
      toast.info('No changes detected');
      setEditingResult(null);
      return;
    }

    try {
      const auditMsg = `⚠️ **RESULT MODIFIED** by Commissioner\n` +
        `Event: ${eventName}\n\n` +
        changes.join('\n');

      const updatedResult: MedalResult = {
        ...editingResult,
        gold: resultForm.gold,
        silver: resultForm.silver,
        bronze: resultForm.bronze,
        lastEditedBy: 'Commissioner',
        lastEditedAt: Date.now()
      };

      await editResultWithAudit(settings.leagueId, updatedResult, auditMsg);
      toast.success('Result updated & audit logged');
      setEditingResult(null);
    } catch (e: any) {
      toast.error('Failed to update result: ' + e.message);
    }
  };

  // Tab content components
  const renderOverview = () => (
    <div className="space-y-6">
      {/* League Status Card */}
      <div className="neu-card p-6 relative overflow-hidden rounded-[32px]">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Whistle size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-1.5">League Code</div>
              <div className="text-4xl font-black text-gray-900 italic tracking-tight">{settings.leagueCode}</div>
            </div>
            
            <button 
              onClick={() => handleCopyCode(settings.leagueCode)}
              className={`w-14 h-14 neu-button rounded-2xl flex items-center justify-center transition-all ${
                copiedCode === settings.leagueCode ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:text-electric-600'
              }`}
            >
              {copiedCode === settings.leagueCode ? <Check size={24} /> : <Copy size={24} />}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="neu-inset p-4 text-center bg-white/50 backdrop-blur-sm">
              <div className="text-3xl font-black text-electric-600 italic tracking-tighter">{users.length}</div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Players</div>
            </div>
            <div className="neu-inset p-4 text-center bg-white/50 backdrop-blur-sm">
              <div className="text-3xl font-black text-purple-600 italic tracking-tighter">{settings.waves.length}</div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Divisions</div>
            </div>
            <div className="neu-inset p-4 text-center bg-white/50 backdrop-blur-sm">
              <div className="text-3xl font-black text-gold-600 italic tracking-tighter">${settings.entryFee}</div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Buy-In</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Status Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Division Status</div>
          <button 
            onClick={handleStartAllDrafts}
            className="text-[10px] font-black text-electric-600 uppercase tracking-wide flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Play size={12} /> Start All
          </button>
        </div>
        
        {waveStats.map(wave => (
          <div key={wave.id} className="neu-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-inner ${
                  wave.status === 'live' ? 'bg-green-100 text-green-600' :
                  wave.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {wave.id}
                </div>
                <div>
                  <div className="font-black text-lg text-gray-900">Division {wave.id}</div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {wave.userCount}/{settings.usersPerWave} players • {wave.totalPicks}/{wave.expectedPicks} picks
                  </div>
                </div>
              </div>
              
              <div>
                {wave.status === 'scheduled' && (
                  <button 
                    onClick={() => onStartDraft(wave.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-transform"
                  >
                    Start Draft
                  </button>
                )}
                {wave.status === 'live' && (
                  <div className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-[10px] font-black uppercase animate-pulse border border-green-200">
                    Live Now
                  </div>
                )}
                {wave.status === 'completed' && (
                  <div className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-200">
                    Finished
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  wave.isComplete ? 'bg-green-500' : 'bg-electric-500'
                }`}
                style={{ width: `${Math.min(wave.progress, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
            onClick={() => setActiveTab('teams')}
            className="neu-button p-5 h-auto flex flex-col items-center gap-3 group hover:-translate-y-1"
        >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm group-hover:text-purple-500 group-hover:scale-110 transition-transform">
                <Users size={22} />
            </div>
            <span className="text-xs font-black text-gray-600 uppercase tracking-wide">Manage Teams</span>
        </button>
        
        <button
            onClick={() => setActiveTab('settings')}
            className="neu-button p-5 h-auto flex flex-col items-center gap-3 group hover:-translate-y-1"
        >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm group-hover:text-gray-700 group-hover:scale-110 transition-transform">
                <Settings size={22} />
            </div>
            <span className="text-xs font-black text-gray-600 uppercase tracking-wide">Edit Settings</span>
        </button>
      </div>
    </div>
  );

  const renderWaves = () => (
    <div className="space-y-4">
      {settings.waves.map(wave => {
        const waveUsers = usersByWave[wave.id] || [];
        const isEditing = editingWaveId === wave.id;
        
        return (
          <div key={wave.id} className="neu-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic ${
                  wave.status === 'live' ? 'bg-green-100 text-green-600' :
                  wave.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {wave.id}
                </div>
                <div>
                  <div className="font-black text-lg text-gray-900 italic">{wave.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                    {new Date(wave.draftStartTime).toLocaleString([], { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setEditingWaveId(isEditing ? null : wave.id)}
                className="w-10 h-10 neu-button text-gray-400"
              >
                {isEditing ? <X size={18} /> : <Edit3 size={18} />}
              </button>
            </div>

            {isEditing && (
              <div className="space-y-4 pt-4 border-t border-gray-100 animate-fade-in">
                <DateTimePicker
                  value={wave.draftStartTime}
                  onChange={(ts) => onUpdateWave({ ...wave, draftStartTime: ts })}
                  label="Draft Start Time"
                />
                
                <div className="flex gap-2 flex-wrap">
                  {wave.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => onStartDraft(wave.id)}
                        className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-black uppercase shadow-md active:scale-95 transition-transform min-w-[100px]"
                      >
                        <Play size={14} className="inline mr-1" /> Start Draft
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const result = await initializeDraftState(settings.leagueId, wave.id, {
                              resetPicks: false,
                              shuffleOrder: true,
                            });
                            toast.success(`Division ${wave.id} order shuffled!`);
                            if (onRefreshData) onRefreshData();
                          } catch (e) {
                            toast.error('Failed to shuffle order');
                          }
                        }}
                        className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-xs font-black uppercase shadow-md active:scale-95 transition-transform min-w-[100px]"
                      >
                        <Shuffle size={14} className="inline mr-1" /> Shuffle Order
                      </button>
                    </>
                  )}
                  {wave.status === 'live' && (
                    <button
                      onClick={() => onUpdateWave({ ...wave, status: 'scheduled' })}
                      className="flex-1 py-2 bg-yellow-500 text-white rounded-xl text-xs font-black uppercase shadow-md active:scale-95 transition-transform"
                    >
                      <Pause size={14} className="inline mr-1" /> Pause
                    </button>
                  )}
                  <button
                    onClick={() => handleRepairDraft(wave.id)}
                    className="flex-1 py-2 bg-purple-500 text-white rounded-xl text-xs font-black uppercase shadow-md active:scale-95 transition-transform min-w-[80px]"
                  >
                    <RefreshCw size={14} className="inline mr-1" /> Repair
                  </button>
                  <button
                    onClick={() => handleResetWave(wave.id)}
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase shadow-md active:scale-95 transition-transform min-w-[80px]"
                  >
                    <RotateCcw size={14} className="inline mr-1" /> Reset
                  </button>
                </div>
              </div>
            )}

            {/* Participants */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Participants ({waveUsers.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {waveUsers.map(u => (
                  <div 
                    key={u.id} 
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-2"
                  >
                    {u.name}
                    <span className="text-[9px] text-gray-500">{u.draftedCountries.length}/4</span>
                    <button 
                      onClick={() => setMovingUser({ userId: u.id, currentWave: wave.id })}
                      className="text-gray-400 hover:text-electric-600"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
                {waveUsers.length === 0 && (
                  <div className="text-xs text-gray-400 italic">No participants yet</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-6">
      {/* ADD TEST BOT - Modern styling */}
      <div className="neu-card p-4 rounded-2xl">
        <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">
          Add Test Bot
        </h3>
        <div className="flex gap-2">
          {/* Bot Name Input */}
          <input
            type="text"
            value={newBotName}
            onChange={(e) => setNewBotName(e.target.value)}
            placeholder="Bot name..."
            className={NEU_INPUT_CLASS}
            style={NEU_INPUT_STYLE}
          />
          
          {/* Wave Select */}
          <select
            value={selectedBotWave}
            onChange={(e) => setSelectedBotWave(e.target.value)}
            className={`${NEU_INPUT_CLASS} w-24 px-3`}
            style={NEU_INPUT_STYLE}
          >
            {settings.waves.map(w => (
              <option key={w.id} value={w.id}>Div {w.id}</option>
            ))}
          </select>
          
          {/* Add Button */}
          <button
            onClick={handleAddBot}
            disabled={!newBotName.trim()}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: newBotName.trim() ? '#0085C7' : '#EFEEF3',
              color: newBotName.trim() ? 'white' : '#9CA3AF',
              boxShadow: newBotName.trim() 
                ? '4px 4px 8px rgba(0, 133, 199, 0.3), -2px -2px 6px rgba(255, 255, 255, 0.2)'
                : '3px 3px 6px rgba(163, 163, 168, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.8)'
            }}
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      {/* MANAGE USERS LIST */}
      <div>
        <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">
          Manage Users ({users.length})
        </h3>
        <div className="space-y-3">
          {users.map(user => (
            <div 
              key={user.id}
              className="neu-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  user.role === 'commissioner' ? 'bg-gold-50 text-gold-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {user.role === 'commissioner' ? <Whistle size={18} /> : <UserCircle size={18} />}
                </div>
                <div>
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {user.name}
                    {user.isBot && <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 rounded uppercase font-black">Bot</span>}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Div {user.poolId} • {user.draftedCountries.length}/4 nations • {user.confidenceEvents.length} CBs
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleEditUser(user)}
                className="neu-button w-10 h-10 flex items-center justify-center text-gray-400 hover:text-electric-600 active:scale-95"
              >
                <Edit3 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl p-6 w-full max-w-lg my-8 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black uppercase italic text-gray-900">
                Edit User
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className={NEU_INPUT_CLASS}
                  style={NEU_INPUT_STYLE}
                />
              </div>
              
              {/* Division */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Division
                </label>
                <select
                  value={editForm.poolId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, poolId: e.target.value }))}
                  className={NEU_INPUT_CLASS}
                  style={NEU_INPUT_STYLE}
                >
                  {settings.waves.map(w => (
                    <option key={w.id} value={w.id}>Division {w.id}</option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className={NEU_INPUT_CLASS}
                  style={NEU_INPUT_STYLE}
                >
                  <option value="player">Player</option>
                  <option value="manager">League Manager</option>
                  <option value="commissioner">Commissioner</option>
                </select>
                <p className="text-[9px] text-gray-400 mt-1 pl-1">
                  Managers can edit all rosters and confidence boosts.
                </p>
              </div>

              {/* Drafted Countries */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Drafted Nations ({editForm.draftedCountries.length}/4)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editForm.draftedCountries.map((code, idx) => (
                    <div 
                      key={code}
                      className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                    >
                      <span className="text-xs font-bold">{code}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">R{idx + 1}</span>
                      <button
                        onClick={() => setEditForm(prev => ({
                          ...prev,
                          draftedCountries: prev.draftedCountries.filter(c => c !== code)
                        }))}
                        className="text-red-400 hover:text-red-600 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                {editForm.draftedCountries.length < 4 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setEditForm(prev => ({
                          ...prev,
                          draftedCountries: [...prev.draftedCountries, e.target.value]
                        }));
                        e.target.value = '';
                      }
                    }}
                    className={NEU_INPUT_CLASS}
                    style={NEU_INPUT_STYLE}
                  >
                    <option value="">+ Add nation...</option>
                    {(() => {
                      const divUsers = users.filter(u =>
                        u.poolId === (editForm.poolId || editingUser?.poolId) && u.id !== editingUser?.id
                      );
                      const takenInDiv = new Set(divUsers.flatMap(u => u.draftedCountries));
                      return COUNTRIES.filter(c =>
                        !editForm.draftedCountries.includes(c.code) && !takenInDiv.has(c.code)
                      ).map(c => (
                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                      ));
                    })()}
                  </select>
                )}
              </div>
              
              {/* Confidence Boosts */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Confidence Boosts ({editForm.confidenceEvents.length}/{10 + editForm.purchasedBoosts})
                </label>
                <div className="flex flex-wrap gap-2 mb-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {editForm.confidenceEvents.map(eventId => {
                    const event = events.find(e => e.id === eventId);
                    return (
                      <div 
                        key={eventId}
                        className="flex items-center gap-1.5 bg-electric-50 px-3 py-1.5 rounded-lg border border-electric-100"
                      >
                        <Zap size={10} className="text-electric-600" />
                        <span className="text-[10px] font-bold text-electric-700 truncate max-w-[120px]">
                          {event?.name || eventId}
                        </span>
                        <button
                          onClick={() => setEditForm(prev => ({
                            ...prev,
                            confidenceEvents: prev.confidenceEvents.filter(e => e !== eventId)
                          }))}
                          className="text-red-400 hover:text-red-600 ml-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value && editForm.confidenceEvents.length < 10 + editForm.purchasedBoosts) {
                      setEditForm(prev => ({
                        ...prev,
                        confidenceEvents: [...prev.confidenceEvents, e.target.value]
                      }));
                      e.target.value = '';
                    }
                  }}
                  className={NEU_INPUT_CLASS}
                  style={NEU_INPUT_STYLE}
                >
                  <option value="">+ Add Boost...</option>
                  {events.filter(e => !editForm.confidenceEvents.includes(e.id))
                    .map(e => (
                      <option key={e.id} value={e.id}>{e.sport}: {e.name}</option>
                    ))
                  }
                </select>
              </div>
              
              {/* Purchased Boosts */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Purchased Slots
                </label>
                <input
                  type="number"
                  value={editForm.purchasedBoosts}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    purchasedBoosts: Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                  className={NEU_INPUT_CLASS}
                  style={NEU_INPUT_STYLE}
                  min={0}
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveUserEdit}
                  className="flex-1 py-3 bg-electric-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="neu-card p-5 space-y-4">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          League Economics
        </div>
        
        <div>
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">
            Entry Fee ($)
          </label>
          <input
            type="number"
            value={editEntryFee}
            onChange={(e) => setEditEntryFee(Number(e.target.value))}
            className={NEU_INPUT_CLASS}
            style={NEU_INPUT_STYLE}
          />
        </div>
        
        <div>
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">
            Extra CB Slot Price ($)
          </label>
          <input
            type="number"
            value={editExtraSlotPrice}
            onChange={(e) => setEditExtraSlotPrice(Number(e.target.value))}
            className={NEU_INPUT_CLASS}
            style={NEU_INPUT_STYLE}
          />
        </div>
        
        <DateTimePicker
          value={editLockTime}
          onChange={(ts) => setEditLockTime(ts)}
          label="Confidence Boost Deadline"
        />
        
        <button 
          onClick={handleSaveSettings}
          className="w-full neu-button primary py-3 text-sm"
        >
          Save Settings
        </button>
      </div>

      <div className="neu-card p-5 space-y-4">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Phase Control
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {['setup', 'phase1_nation_draft', 'phase2_confidence_picks', 'phase3_games_live', 'phase4_complete'].map(phase => (
            <button
              key={phase}
              onClick={() => onUpdateSettings({ currentPhase: phase as any })}
              className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase ${
                settings.currentPhase === phase 
                  ? 'bg-electric-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {phase.replace('phase', 'P').replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScoring = () => {
    const selectedUser = users.find(u => u.id === verifyUserId);
    const verification = selectedUser ? verifyScoring(selectedUser, results, events) : null;
    
    return (
      <div className="space-y-6">
        {/* Manage Results */}
        <div className="neu-card p-5 space-y-4">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Manage Live Results ({results.length})
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
            {results.length === 0 ? (
              <div className="text-center text-xs text-gray-400 italic py-4">No results yet</div>
            ) : (
              results.map(result => {
                const event = events.find(e => e.id === result.eventId);
                return (
                  <div key={result.eventId} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-xs font-bold text-gray-800">{event?.name || result.eventId}</div>
                        <div className="text-[9px] text-gray-500">{event?.sport}</div>
                      </div>
                      <button 
                        onClick={() => handleEditResult(result)}
                        className="text-gray-400 hover:text-electric-600 bg-white p-1.5 rounded-lg shadow-sm"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="flex-1 bg-white border border-gray-100 rounded p-1 text-center">
                        <span className="text-[10px]">🥇</span> <span className="text-[10px] font-black">{result.gold}</span>
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded p-1 text-center">
                        <span className="text-[10px]">🥈</span> <span className="text-[10px] font-black">{result.silver}</span>
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded p-1 text-center">
                        <span className="text-[10px]">🥉</span> <span className="text-[10px] font-black">{result.bronze}</span>
                      </div>
                    </div>
                    {result.lastEditedBy && (
                      <div className="text-[8px] text-gray-400 mt-1.5 text-right">
                        Edited by {result.lastEditedBy}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {onClearResults && (
            <button 
              onClick={() => onClearResults('all')}
              className="w-full neu-button py-3 text-xs text-red-600 gap-2 border border-red-100 hover:bg-red-50"
            >
              <Trash2 size={14} /> Clear ALL Results
            </button>
          )}
        </div>

        {/* Verify Scores */}
        <div className="neu-card p-5 space-y-4">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Verify User Scoring
          </div>
          
          <select 
            value={verifyUserId}
            onChange={(e) => setVerifyUserId(e.target.value)}
            className={NEU_INPUT_CLASS}
            style={NEU_INPUT_STYLE}
          >
            <option value="">Select player...</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.totalScore} pts)</option>
            ))}
          </select>
          
          {verification && (
            <div className="space-y-3">
              <div className={`p-3 rounded-xl ${verification.isValid ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className={`text-sm font-bold ${verification.isValid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {verification.isValid ? '✓ Valid' : '⚠ Issues Found'}
                </div>
                {verification.warnings.map((w, i) => (
                  <div key={i} className="text-xs text-yellow-700">• {w}</div>
                ))}
              </div>
              
              <div className="neu-inset p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Calculated:</span>
                  <span className="font-black text-electric-600">{verification.calculatedTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Displayed:</span>
                  <span className="font-black">{selectedUser?.totalScore}</span>
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1">
                {verification.details.map((d, i) => (
                  <div key={i} className={`text-[10px] p-2 rounded ${d.isPenalty ? 'bg-red-50 text-red-700' : 'bg-gray-50'}`}>
                    {d.isPenalty ? `❌ ${d.eventName}: -100` : 
                      `${d.medal === 'Gold' ? '🥇' : d.medal === 'Silver' ? '🥈' : '🥉'} ${d.eventName}: ${d.points}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Test Result */}
        <div className="neu-card p-5 space-y-4">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Inject Test Result
          </div>
          
          <select value={testEventId} onChange={e => setTestEventId(e.target.value)} className={NEU_INPUT_CLASS} style={NEU_INPUT_STYLE}>
            <option value="">Select event...</option>
            {events.filter(e => !results.find(r => r.eventId === e.id)).map(e => (
              <option key={e.id} value={e.id}>{e.sport}: {e.name}</option>
            ))}
          </select>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[8px] font-black text-gray-500 uppercase">Gold</label>
              <select value={goldCode} onChange={e => setGoldCode(e.target.value)} className={`${NEU_INPUT_CLASS} py-2 text-xs`} style={NEU_INPUT_STYLE}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[8px] font-black text-gray-500 uppercase">Silver</label>
              <select value={silverCode} onChange={e => setSilverCode(e.target.value)} className={`${NEU_INPUT_CLASS} py-2 text-xs`} style={NEU_INPUT_STYLE}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[8px] font-black text-gray-500 uppercase">Bronze</label>
              <select value={bronzeCode} onChange={e => setBronzeCode(e.target.value)} className={`${NEU_INPUT_CLASS} py-2 text-xs`} style={NEU_INPUT_STYLE}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (!testEventId) return;
              // Pass standard args, App.tsx will tag as source: 'test'
              onAddTestResult({ eventId: testEventId, gold: goldCode, silver: silverCode, bronze: bronzeCode });
              setTestEventId('');
            }}
            disabled={!testEventId}
            className="w-full neu-button primary py-3 text-sm disabled:opacity-50"
          >
            Add Result
          </button>
        </div>
      </div>
    );
  };

  const renderTools = () => (
    <div className="space-y-6">
      <div className="neu-card p-5 space-y-4">
        <div className="flex items-center gap-3 text-purple-600 mb-2">
          <RefreshCw size={20} />
          <div className="text-[10px] font-black uppercase tracking-widest">Draft Repair Tools</div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Use these tools to fix broken draft states. Run "Repair" first, then "Reset" only if needed.
        </p>
        
        {settings.waves.map(wave => (
          <div key={wave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="font-bold text-gray-700">Division {wave.id}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => handleRepairDraft(wave.id)}
                className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-[10px] font-black uppercase"
              >
                Repair
              </button>
              <button 
                onClick={() => handleResetWave(wave.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase"
              >
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="neu-card p-5 space-y-4">
        <div className="flex items-center gap-3 text-orange-600 mb-2">
          <AlertTriangle size={20} />
          <div className="text-[10px] font-black uppercase tracking-widest">Migration Tools</div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Run this if players are showing as not in any division despite having joined.
        </p>
        
        <button 
          onClick={async () => {
            if (!confirm('Run migration to fix all broken draft states in this league?')) return;
            try {
              const result = await migrateFixBrokenDrafts(settings.leagueId);
              alert(`Migration complete! Fixed ${result.wavesFixed} divisions, linked ${result.usersLinked} users.`);
              if (onRefreshData) onRefreshData();
            } catch (e: any) {
              alert('Migration failed: ' + e.message);
            }
          }}
          className="w-full neu-button py-3 text-sm text-orange-600 gap-2"
        >
          <RefreshCw size={16} /> Run League Migration
        </button>
      </div>
    </div>
  );

  const renderAssign = () => (
    <div className="space-y-6">
      <div className="neu-card p-5 rounded-[24px]">
        <div className="flex items-center gap-3 mb-4">
          <Flag size={20} className="text-electric-600" />
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase italic">Offline Country Assignment</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Assign countries without running a live draft. 4 max per user, no duplicates within a division.</p>
          </div>
        </div>
      </div>

      {settings.waves.map(wave => {
        const waveUsers = usersByWave[wave.id] || [];
        const usersComplete = waveUsers.filter(u => u.draftedCountries.length >= 4).length;
        const allComplete = waveUsers.length > 0 && usersComplete === waveUsers.length;
        const takenCodes = new Set(waveUsers.flatMap(u => u.draftedCountries));

        return (
          <div key={wave.id} className="neu-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg italic ${
                  wave.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                  allComplete ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {wave.id}
                </div>
                <div>
                  <div className="font-black text-gray-900">Division {wave.id}</div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {usersComplete}/{waveUsers.length} users complete • {takenCodes.size} countries assigned
                  </div>
                </div>
              </div>
              {wave.status !== 'completed' && allComplete && (
                <button
                  onClick={() => onUpdateWave({ ...wave, status: 'completed' })}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase shadow-md active:scale-95 transition-transform"
                >
                  <Lock size={12} className="inline mr-1" /> Lock Division
                </button>
              )}
              {wave.status === 'completed' && (
                <div className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-200">
                  Locked
                </div>
              )}
            </div>

            <div className="space-y-2">
              {waveUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{user.name}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {user.draftedCountries.map((code, idx) => (
                        <div key={code} className="px-2 py-0.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700">
                          {code} <span className="text-gray-400">R{idx + 1}</span>
                        </div>
                      ))}
                      {user.draftedCountries.length === 0 && (
                        <span className="text-[10px] text-gray-400 italic">No countries assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-[10px] font-bold text-gray-400">{user.draftedCountries.length}/4</span>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="w-8 h-8 neu-button rounded-lg flex items-center justify-center text-gray-400 hover:text-electric-600"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {waveUsers.length === 0 && (
                <div className="text-xs text-gray-400 italic text-center py-3">No users in this division</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Neumorphic Segmented Tab Navigation */}
      <div className="neu-inset p-1.5 rounded-2xl mb-6 overflow-x-auto no-scrollbar flex items-center justify-between">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'waves', label: 'Divisions', icon: Activity },
          { id: 'teams', label: 'Teams', icon: Users },
          { id: 'assign', label: 'Assign', icon: Flag },
          { id: 'settings', label: null, icon: Settings },
          { id: 'scoring', label: null, icon: TrendingUp },
          { id: 'tools', label: null, icon: RefreshCw },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 min-w-[50px] ${
              activeTab === tab.id 
                ? 'neu-card text-gold-600 transform scale-100 shadow-neu-flat' 
                : 'text-gray-400 hover:text-gray-600 bg-transparent border-none shadow-none'
            }`}
          >
            <tab.icon size={16} />
            {tab.label && <span className="hidden sm:inline">{tab.label}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'waves' && renderWaves()}
      {activeTab === 'teams' && renderTeams()}
      {activeTab === 'assign' && renderAssign()}
      {activeTab === 'settings' && renderSettings()}
      {activeTab === 'scoring' && renderScoring()}
      {activeTab === 'tools' && renderTools()}

      {/* Move User Modal */}
      {movingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-gray-900">Move Player</h3>
              <button onClick={() => setMovingUser(null)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Select target division for {users.find(u => u.id === movingUser.userId)?.name}:
            </p>
            
            <div className="space-y-2">
              {settings.waves.filter(w => w.id !== movingUser.currentWave).map(wave => (
                <button
                  key={wave.id}
                  onClick={() => handleMoveUser(movingUser.userId, wave.id)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all flex items-center justify-between"
                >
                  <span className="font-bold">Division {wave.id}</span>
                  <span className="text-sm text-gray-400">{usersByWave[wave.id]?.length || 0} players</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Edit Modal */}
      {editingResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black uppercase italic text-gray-900">
                  Edit Result
                </h3>
                <p className="text-xs text-gray-500">
                  {events.find(e => e.id === editingResult.eventId)?.name}
                </p>
              </div>
              <button 
                onClick={() => setEditingResult(null)}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Warning Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-yellow-800 leading-tight">
                Warning: Modifying this result will post an audit log to the league chat.
              </p>
            </div>
            
            {/* Medal Inputs */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[9px] font-black text-gold-600 uppercase tracking-widest block mb-1">
                  🥇 Gold
                </label>
                <select
                  value={resultForm.gold}
                  onChange={(e) => setResultForm(prev => ({ ...prev, gold: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900"
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">
                  🥈 Silver
                </label>
                <select
                  value={resultForm.silver}
                  onChange={(e) => setResultForm(prev => ({ ...prev, silver: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900"
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest block mb-1">
                  🥉 Bronze
                </label>
                <select
                  value={resultForm.bronze}
                  onChange={(e) => setResultForm(prev => ({ ...prev, bronze: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900"
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingResult(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveResultEdit}
                className="flex-1 py-3 bg-electric-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg active:scale-95 transition-all"
              >
                Save & Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionerDashboard;
