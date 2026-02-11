
import React, { useState, useEffect, useMemo } from 'react';
import { OlympicEvent, MedalResult, User, LeagueSettings, Wave, ChatMessage, DraftedCountry } from './types';
import { INITIAL_EVENTS } from './staticData';
import { Snowflake, Whistle, Wallet, LogOut, Activity, Edit3, UserCircle, Trophy, Settings, AlertTriangle, Waves, TrendingUp, X, MessageCircle, Grid, ArrowRight, Copy, Check, BookOpen, RotateCcw, Trash2, RefreshCw, Search, Zap } from './Icons';
import LeagueSetup from './LeagueSetup';
import DraftRoom from './DraftRoom';
import MedalTracker from './MedalTracker';
import Leaderboard from './Leaderboard';
import TeamPage from './TeamPage';
import CommissionerDashboard from './CommissionerDashboard';
import LeagueChat from './LeagueChat';
import LeagueRules from './LeagueRules';
import Auth from './Auth';
import Lobby from './Lobby';
import ErrorBoundary from './ErrorBoundary';
import HowItWorks from './HowItWorks';
import Navigation from './Navigation';
import MiniBuySlot from './MiniBuySlot';
import { calculateUserScore } from './scoringEngine';
import { updateWaveInCloud, updateTeamInCloud, joinLeagueInCloud, fetchLeagueData, deleteLeagueInCloud, signOut, listenToLeague, listenToTeams, addResultToLeague, listenToChat, sendChatMessage, createLeagueInCloud, updateLeagueSettingsInCloud, moveUserToWave, initializeDraftState, quickFixLeagueDraft, createBotInWave, clearLeagueResults } from './databaseService';
import { listenToEvents, mergeWithStaticData, syncEventsToFirebase, markEventFinished } from './services/olympicDataService';
import { auth, db } from './firebase';
import ToastProvider, { useToast } from './Toast';
import WalletModal from './WalletModal';

const STORAGE_PREFIX = 'goldhunt:';

// Create a mini error boundary for individual sections
const SectionErrorBoundary: React.FC<{ children: React.ReactNode; name: string }> = ({ children, name }) => (
  <ErrorBoundary
    fallback={
      <div className="neu-card p-6 text-center">
        <AlertTriangle size={32} className="text-yellow-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-gray-700 mb-2">Failed to load {name}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs text-electric-600 font-bold"
        >
          Reload Page
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

const AppShell: React.FC = () => {
  const [authUser, setAuthUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  
  const toast = useToast();

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Session State ---
  const [session, setSession] = useState<{ userId: string; leagueId: string; role: 'commissioner' | 'manager' | 'player'; selectedWaveId: string; viewMode?: 'commish' | 'team' } | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}session`);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // UI Modes
  const [isSetupMode, setIsSetupMode] = useState<'create' | 'join' | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Settings Trigger for TeamPage
  const [settingsScrollTrigger, setSettingsScrollTrigger] = useState(0);
  
  // Live Events Filter State
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [showOnlyCPs, setShowOnlyCPs] = useState(false);
  const [showBuyCPPopover, setShowBuyCPPopover] = useState(false);
  
  // Loading states
  const [isDrafting, setIsDrafting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Chat State
  const [lastReadChatTimestamp, setLastReadChatTimestamp] = useState<number>(() => {
    const stored = localStorage.getItem('goldhunt:lastReadChat');
    return stored ? parseInt(stored) : Date.now();
  });

  // Edit Name State
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  // Wallet State
  const [showWallet, setShowWallet] = useState(false);

  // Data
  const [events, setEvents] = useState<OlympicEvent[]>(INITIAL_EVENTS);
  const [liveResults, setLiveResults] = useState<MedalResult[]>([]);
  const [leagueSettings, setLeagueSettings] = useState<LeagueSettings | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Filter State (Lifted to App level for Header integration)
  const [selectedSport, setSelectedSport] = useState('All');
  const sports = useMemo(() => ['All', ...Array.from(new Set(events.map(e => e.sport)))], [events]);

  // Derived Local State for current user
  const currentUser = useMemo((): User => {
    return allUsers.find(u => u.id === authUser?.uid) || {
      id: authUser?.uid || 'me',
      name: authUser?.email?.split('@')[0] || 'Loading...',
      poolId: 'A',
      draftedCountries: [],
      draftedCountriesDetailed: [],
      confidenceEvents: [],
      totalScore: 0,
      purchasedBoosts: 0,
      role: 'player'
    };
  }, [allUsers, authUser]);

  const userStats = useMemo(() => {
    return calculateUserScore(currentUser, liveResults, events);
  }, [currentUser, liveResults, events]);

  // Derived Wave State (Hoisted to be available for handlers)
  const currentWave = useMemo(() => {
    if (!leagueSettings || !session?.selectedWaveId) return undefined;
    return leagueSettings.waves.find(w => w.id === session.selectedWaveId) || leagueSettings.waves[0];
  }, [leagueSettings, session?.selectedWaveId]);

  const currentWaveDocId = useMemo(() => {
    if (!currentWave || !leagueSettings) return null;
    return `${leagueSettings.leagueId}_${currentWave.id}`;
  }, [currentWave, leagueSettings]);

  // Enriched users with real-time scores
  const enrichedUsers = useMemo(() => {
    return allUsers.map(u => {
      const { total, breakdown } = calculateUserScore(u, liveResults, events);
      return { 
        ...u, 
        totalScore: total,
        scoreBreakdown: breakdown
      };
    });
  }, [allUsers, liveResults, events]);

  const currentUserEnriched = useMemo(() => {
    return enrichedUsers.find(u => u.id === authUser?.uid) || enrichedUsers[0] || currentUser;
  }, [enrichedUsers, authUser?.uid, currentUser]);

  // Unread chat count
  const unreadChatCount = useMemo(() => {
    return chatMessages.filter(m => m.timestamp > lastReadChatTimestamp && m.userId !== authUser?.uid).length;
  }, [chatMessages, lastReadChatTimestamp, authUser?.uid]);

  // --- Data Loading & Listeners ---
  useEffect(() => {
    if (session?.leagueId && authUser) {
      // 1. Fetch initial data once
      fetchLeagueData(session.leagueId)
        .then(data => {
          if (data) {
            setLeagueSettings(data.settings);
            setLiveResults(data.results);
            setAllUsers(data.users);
          } else {
             // League might be deleted or invalid
             setSession(null);
          }
        })
        .catch(err => {
          console.error("Initial fetch failed", err);
          if (err.message.includes("permission") || err.message.includes("Missing or insufficient permissions")) {
            setFatalError(err.message);
          } else {
             setSession(null);
          }
        });

      // 2. Setup Realtime Listeners
      const unsubLeague = listenToLeague(session.leagueId, (data) => {
        setLeagueSettings(data.settings);
        setLiveResults(data.results);
      });

      const unsubTeams = listenToTeams(session.leagueId, (users) => {
        setAllUsers(users);
      });

      const unsubChat = listenToChat(session.leagueId, (msgs) => {
         setChatMessages(msgs);
      });

      // 3. Listen to Synced Events
      const unsubEvents = listenToEvents(session.leagueId, (apiEvents) => {
        if (apiEvents && apiEvents.length > 0) {
          const merged = mergeWithStaticData(apiEvents, INITIAL_EVENTS);
          setEvents(merged);
        }
      });

      // 4. Auto-cleanup: re-sync Firebase events to purge stale prelim data.
      // Runs once per league load, fire-and-forget. The listener above will
      // pick up the cleaned data automatically.
      syncEventsToFirebase(session.leagueId).catch(() => {});

      return () => {
        unsubLeague();
        unsubTeams();
        unsubChat();
        unsubEvents();
      };
    }
  }, [session?.leagueId, authUser]);

  // --- Auto-Fetch Live Results (on load + every 2 hours) ---
  useEffect(() => {
    if (!session?.leagueId || !authUser) return;

    let isCancelled = false;

    const autoFetchResults = async () => {
      try {
        console.log('[AutoSync] Fetching live results...');
        const { fetchLiveResults, filterNewResults } = await import('./liveResultsService');
        const { results: fetched } = await fetchLiveResults();

        if (isCancelled || fetched.length === 0) return;

        // Get latest results from Firebase to diff
        const leagueData = await fetchLeagueData(session.leagueId);
        const existingResults: MedalResult[] = leagueData?.results || [];
        const newResults = filterNewResults(fetched, existingResults);

        if (newResults.length === 0) {
          console.log('[AutoSync] No new results to import');
          return;
        }

        console.log(`[AutoSync] Importing ${newResults.length} new results`);

        for (const r of newResults) {
          if (isCancelled) break;
          try {
            await addResultToLeague(session.leagueId, {
              eventId: r.eventId,
              gold: r.gold,
              silver: r.silver,
              bronze: r.bronze,
              source: 'live',
              timestamp: Date.now(),
            });
            markEventFinished(session.leagueId, r.eventId).catch(() => {});
          } catch (err) {
            console.warn('[AutoSync] Failed to import', r.eventId, err);
          }
        }

        console.log(`[AutoSync] Done — imported ${newResults.length} results`);
      } catch (err) {
        console.warn('[AutoSync] Fetch failed:', err);
      }
    };

    // Initial fetch after 3s (let Firebase listeners settle)
    const initialTimeout = setTimeout(() => {
      if (!isCancelled) autoFetchResults();
    }, 3000);

    // Then every 2 hours
    const interval = setInterval(autoFetchResults, 2 * 60 * 60 * 1000);

    return () => {
      isCancelled = true;
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [session?.leagueId, authUser]);

  // MIGRATION: Backfill detailed draft info if missing
  useEffect(() => {
    if (session?.leagueId && currentUser && currentUser.draftedCountries.length > 0) {
       const hasDetailed = currentUser.draftedCountriesDetailed && currentUser.draftedCountriesDetailed.length > 0;
       const isComplete = hasDetailed && currentUser.draftedCountriesDetailed.length === currentUser.draftedCountries.length;
       
       if (!isComplete) {
           console.log("Migrating draft details for user", currentUser.name);
           const backfilledDetailed = currentUser.draftedCountries.map((code, idx) => ({
               code,
               round: idx + 1,
               pickNumber: idx + 1,
               multiplier: [1, 5, 10, 20][Math.min(idx, 3)]
           }));
           updateTeamInCloud(session.leagueId, { 
               id: currentUser.id, 
               draftedCountriesDetailed: backfilledDetailed 
           });
       }
    }
  }, [session?.leagueId, currentUser?.id, currentUser?.draftedCountries.length]);

  // Persist session
  useEffect(() => {
    if (session) {
        localStorage.setItem(`${STORAGE_PREFIX}session`, JSON.stringify(session));
    } else {
        localStorage.removeItem(`${STORAGE_PREFIX}session`);
    }
  }, [session]);

  // Chat Read Status
  useEffect(() => {
    if (currentTab === 'chat' && chatMessages.length > 0) {
        const latestTimestamp = Math.max(...chatMessages.map(m => m.timestamp));
        setLastReadChatTimestamp(latestTimestamp);
        localStorage.setItem('goldhunt:lastReadChat', String(latestTimestamp));
    }
  }, [currentTab, chatMessages]);

  // Populate Edit Name Modal
  useEffect(() => {
    if (showEditNameModal && currentUser) {
        setEditNameValue(currentUser.name);
    }
  }, [showEditNameModal, currentUser]);

  // AUTO-DRAFT FOR BOTS (Corrected)
  useEffect(() => {
    if (!session?.leagueId || !leagueSettings) return;
    
    const currentWave = leagueSettings.waves.find(w => w.id === session.selectedWaveId);
    if (!currentWave || currentWave.status !== 'live') return;
    
    const waveUsers = allUsers.filter(u => u.poolId === currentWave.id);
    const waveSize = currentWave.participants?.length || 0;
    
    if (waveSize === 0) return;
    
    const currentPickIndex = currentWave.pickIndex || 0;
    const totalPicks = waveSize * 4;
    if (currentPickIndex >= totalPicks) return; // Draft complete
    
    // Calculate whose turn it is
    const round = Math.floor(currentPickIndex / waveSize);
    const pos = currentPickIndex % waveSize;
    const isReverse = round % 2 !== 0;
    const userIndex = isReverse ? (waveSize - 1 - pos) : pos;
    const draftOrder = currentWave.draftOrder || currentWave.participants || [];
    
    if (userIndex >= draftOrder.length) return;

    const currentPickerId = draftOrder[userIndex];
    
    // Find the current picker
    const currentPicker = waveUsers.find(u => u.id === currentPickerId);
    
    // If it's a bot's turn, auto-draft after short delay
    if (currentPicker?.isBot) {
      const timer = setTimeout(async () => {
        try {
          // Determine available countries
          const draftedInWave = waveUsers.flatMap(u => u.draftedCountries);
          const { COUNTRIES } = await import('./constants');
          const available = COUNTRIES.filter(c => !draftedInWave.includes(c.code));
          
          if (available.length === 0) return;

          // Pick one (random)
          const pick = available[Math.floor(Math.random() * available.length)];
          console.log(`[Bot Auto-Draft] ${currentPicker.name} picking ${pick.code}`);
          
          // Calculate round/multiplier info
          const currentRound = Math.floor(currentPickIndex / waveSize) + 1;
          const multiplier = [1, 5, 10, 20][Math.min(currentRound - 1, 3)];
          
          const newDetailedPick: DraftedCountry = {
              code: pick.code,
              round: currentRound,
              pickNumber: currentPickIndex + 1,
              multiplier
          };

          // 1. Update Bot Team (Directly, not via handleDraftCountry)
          const newDrafted = [...currentPicker.draftedCountries, pick.code];
          const newDetailed = [...(currentPicker.draftedCountriesDetailed || []), newDetailedPick];
          
          await updateTeamInCloud(session.leagueId, { 
              id: currentPicker.id, 
              draftedCountries: newDrafted,
              draftedCountriesDetailed: newDetailed
          });

          // 2. Update Wave
          const newRecentPicks = [...(currentWave.recentPicks || []), {
              userId: currentPicker.id,
              countryCode: pick.code,
              pickIndex: currentPickIndex,
              timestamp: Date.now()
          }];
          
          await updateWaveInCloud(session.leagueId, {
              ...currentWave,
              pickIndex: currentPickIndex + 1,
              recentPicks: newRecentPicks
          });
          
          toast.success(`🤖 ${currentPicker.name} drafted ${pick.name}`);
        } catch (e: any) {
          console.error('[Bot Auto-Draft] Failed:', e);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [session?.selectedWaveId, leagueSettings?.waves, allUsers, session?.leagueId]);

  // --- Action Handlers ---

  const handleSetupComplete = async (setupData: any) => {
    if (!authUser) return;
    try {
      let lid = '';
      let role = 'player';
      const targetWaveId = setupData.selectedWaveId || 'A';

      if (setupData.mode === 'join') {
        const res = await joinLeagueInCloud(setupData.leagueCode, {
          id: authUser.uid,
          name: setupData.myTeamName,
          poolId: targetWaveId,
          draftedCountries: [],
          draftedCountriesDetailed: [],
          confidenceEvents: [],
          totalScore: 0,
          purchasedBoosts: 0,
          role: 'player',
          timeZone: setupData.timeZone
        }, targetWaveId);
        lid = res.leagueId;
        role = 'player';
      } else {
        // Create Mode - createLeagueInCloud creates the commish team atomically now
        lid = await createLeagueInCloud(setupData, authUser.uid);
        role = 'commissioner';
      }

      const freshData = await fetchLeagueData(lid);
      
      if (freshData) {
          setLeagueSettings(freshData.settings);
          setLiveResults(freshData.results);
          setAllUsers(freshData.users);
          
          setSession({ 
              userId: authUser.uid, 
              leagueId: lid, 
              role: role as any, 
              selectedWaveId: targetWaveId, 
              viewMode: (role === 'commissioner' || role === 'manager') ? 'commish' : 'team'
          });

          const myWave = freshData.settings.waves.find(w => w.id === targetWaveId);
          if (myWave && myWave.status === 'live') {
              setCurrentTab('draft');
          } else {
              setCurrentTab('dashboard');
          }
      }

      setIsSetupMode(null);
      toast.success("Welcome to the League!");
    } catch (e: any) {
      console.error("Setup Error:", e);
      toast.error(e.message || "Setup failed.");
    }
  };

  const handleUpdateWave = async (wave: Wave) => {
    if (!leagueSettings || !session?.leagueId) return;
    await updateWaveInCloud(session.leagueId, wave);

    // Auto-advance phase: if wave just completed, check if all waves are done
    if (wave.status === 'completed' && leagueSettings.currentPhase === 'phase1_nation_draft') {
      const updatedWaves = leagueSettings.waves.map(w => w.id === wave.id ? wave : w);
      const allDone = updatedWaves.every(w => w.status === 'completed');
      if (allDone) {
        handleUpdateSettings({ currentPhase: 'phase2_confidence_picks' });
      }
    }
  };

  const handleUpdateTeam = async (updates: Partial<User>) => {
    if (!session?.leagueId || !currentUser) return;
    const updatedUser: User = { ...currentUser, ...updates };
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    await updateTeamInCloud(session.leagueId, updatedUser);
  };

  const handleRemoveBoostSlot = async (removedCBEventIds: string[]) => {
    if (!session?.leagueId) return;
    
    try {
      const newPurchasedBoosts = Math.max(0, (currentUser.purchasedBoosts || 0) - 1);
      const newConfidenceEvents = currentUser.confidenceEvents.filter(
        id => !removedCBEventIds.includes(id)
      );
      
      await handleUpdateTeam({ 
        purchasedBoosts: newPurchasedBoosts,
        confidenceEvents: newConfidenceEvents
      });
      
      if (removedCBEventIds.length > 0) {
        toast.warning(`Removed ${removedCBEventIds.length} CB(s) to fit new capacity`);
      } else {
        toast.success('Boost slot removed');
      }
    } catch (error: any) {
      toast.error("Failed to remove boost: " + error.message);
    }
  };

  const handleDraftCountry = async (countryCode: string) => {
    if (isDrafting) return;
    setIsDrafting(true);
    try {
        // Hard limit: 4 countries max
        if (currentUser.draftedCountries.length >= 4) {
            toast.error("Maximum 4 countries reached!");
            setIsDrafting(false);
            return;
        }
        // Block if draft is completed (players only)
        if (currentWave?.status === 'completed' && currentUser.role === 'player') {
            toast.error("Draft is locked!");
            setIsDrafting(false);
            return;
        }
        // Calculate multipliers
        const waveSize = currentWave?.participants?.length || 1;
        const pickIndex = currentWave?.pickIndex || 0;
        const round = Math.floor(pickIndex / waveSize) + 1;
        const multiplier = [1, 5, 10, 20][Math.min(round - 1, 3)];
        
        const newDetailedPick: DraftedCountry = {
            code: countryCode,
            round,
            pickNumber: pickIndex + 1,
            multiplier
        };

        const newDraftedCountries = [...currentUser.draftedCountries, countryCode];
        const newDraftedCountriesDetailed = [...(currentUser.draftedCountriesDetailed || []), newDetailedPick];

        await handleUpdateTeam({ 
            draftedCountries: newDraftedCountries,
            draftedCountriesDetailed: newDraftedCountriesDetailed 
        });

        // Optimistic + Server Update for Wave
        const newRecentPicks = [...(currentWave?.recentPicks || []), {
            userId: currentUser.id,
            countryCode: countryCode,
            pickIndex: currentWave?.pickIndex || 0,
            timestamp: Date.now()
        }];
        
        if (currentWave) {
             await handleUpdateWave({ 
                ...currentWave, 
                pickIndex: (currentWave.pickIndex || 0) + 1,
                recentPicks: newRecentPicks
            });
        }
        toast.success(`Drafted ${countryCode}`);
    } catch (e: any) {
        toast.error(e.message || "Drafting failed");
    } finally {
        setIsDrafting(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<LeagueSettings>) => {
    if (isUpdating || !session?.leagueId) return;
    setIsUpdating(true);
    
    try {
        await updateLeagueSettingsInCloud(session.leagueId, updates);
        setLeagueSettings(prev => prev ? { ...prev, ...updates } : null);
        toast.success('Settings saved!');
    } catch (error: any) {
        toast.error('Failed to save: ' + error.message);
    } finally {
        setIsUpdating(false);
    }
  };

  const handleUpdateTeamName = async () => {
    if (!editNameValue.trim() || !session?.leagueId) return;
    
    try {
        await updateTeamInCloud(session.leagueId, {
            id: authUser.uid,
            name: editNameValue.trim()
        });
        
        setAllUsers(prev => prev.map(u => 
            u.id === authUser.uid ? { ...u, name: editNameValue.trim() } : u
        ));
        
        setShowEditNameModal(false);
        toast.success("Team Name Updated");
    } catch (e) {
        console.error('Failed to update name:', e);
        toast.error('Failed to update team name.');
    }
  };

  // For commissioner to update ANY team
  const handleUpdateAnyTeam = async (userId: string, updates: Partial<User>) => {
    if (!session?.leagueId) return;
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const updatedUser = { ...user, ...updates };

    // If poolId changed, also move user in wave participants/draftOrder
    if (updates.poolId && updates.poolId !== user.poolId) {
      try {
        await moveUserToWave(session.leagueId, userId, user.poolId, updates.poolId);
        // Also sync draft state so the new wave picks them up
        await initializeDraftState(session.leagueId, updates.poolId, {
          resetPicks: false,
          shuffleOrder: false,
        });
        // Re-sync old wave too
        try {
          await initializeDraftState(session.leagueId, user.poolId, {
            resetPicks: false,
            shuffleOrder: false,
          });
        } catch { /* old wave might be empty now, that's ok */ }
      } catch (e: any) {
        console.error('[Commish] Move user to wave failed:', e);
        // Still update team doc even if wave move fails
      }
    }

    await updateTeamInCloud(session.leagueId, updatedUser);

    // Force refresh to pick up changes
    const freshData = await fetchLeagueData(session.leagueId);
    if (freshData) {
      setAllUsers(freshData.users);
      setLeagueSettings(freshData.settings);

      // Auto-complete wave if all users now have 4 countries
      const targetPoolId = updatedUser.poolId;
      const wave = freshData.settings.waves.find((w: Wave) => w.id === targetPoolId);
      if (wave && wave.status !== 'completed') {
        const waveUsers = freshData.users.filter((u: User) => u.poolId === targetPoolId);
        const allHave4 = waveUsers.length > 0 && waveUsers.every((u: User) => u.draftedCountries.length >= 4);
        if (allHave4) {
          console.log(`[Commish] All users in Division ${targetPoolId} have 4 countries, auto-completing`);
          await handleUpdateWave({ ...wave, status: 'completed' });
        }
      }
    }
  };

  // NEW: Create Test Bot for Draft Testing using databaseService
  const handleCreateBot = async (name: string, waveId: string) => {
    if (!session?.leagueId) {
      toast.error('No league selected');
      return;
    }
    
    try {
      toast.info(`Creating bot "${name}"...`);
      const botId = await createBotInWave(session.leagueId, waveId, name);
      toast.success(`Bot "${name}" joined Division ${waveId}!`);
      
      // Refresh handled by listeners, but we can force fetch to be sure
      const freshData = await fetchLeagueData(session.leagueId);
      if (freshData) {
        setLeagueSettings(freshData.settings);
        setAllUsers(freshData.users);
      }
    } catch (error: any) {
      console.error('[Bot] Creation failed:', error);
      toast.error(`Failed to create bot: ${error.message}`);
    }
  };

  // NEW: Reset Draft State
  const handleResetWaveDraft = async (waveId: string) => {
    if (!session?.leagueId || !leagueSettings) return;
    // 1. Reset Wave
    const w = leagueSettings.waves.find(w => w.id === waveId);
    if (!w) return;
    await updateWaveInCloud(session.leagueId, { ...w, pickIndex: 0, recentPicks: [] });
    
    // 2. Clear Users
    const waveUsers = allUsers.filter(u => u.poolId === waveId);
    for (const u of waveUsers) {
        await updateTeamInCloud(session.leagueId, { 
            ...u, 
            draftedCountries: [],
            draftedCountriesDetailed: [] // Clear details too
        });
    }
    toast.success(`Division ${waveId} draft reset`);
  };

  // NEW: Quick Repair Handler
  const handleQuickRepair = async () => {
      if (!session?.leagueId) return;
      try {
          toast.info("Running draft diagnostics...");
          const res = await quickFixLeagueDraft(session.leagueId);
          toast.success(res.message);
          
          // Force refresh
          const freshData = await fetchLeagueData(session.leagueId);
          if (freshData) {
            setLeagueSettings(freshData.settings);
            setAllUsers(freshData.users);
          }
      } catch (e: any) {
          toast.error("Repair failed: " + e.message);
      }
  };
  
  // Commissioner Override Logic
  const handleCommishUpdate = async (action: 'draft' | 'manual' | 'undo' | 'init', userId: string, data?: any) => {
    if (!currentWave || !session?.leagueId) return;

    try {
        if (action === 'init') {
            // Reboot the draft state if missing
            await updateWaveInCloud(session.leagueId, {
                ...currentWave,
                pickIndex: 0,
                recentPicks: []
            });
            toast.success("Draft Initialized");
            return;
        }

        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        if (action === 'draft') {
            if (user.draftedCountries.length >= 4) {
                toast.error(`${user.name} already has 4 countries!`);
                return;
            }
            const waveSize = currentWave.participants?.length || 1;
            const pickIndex = currentWave.pickIndex || 0;
            const round = Math.floor(pickIndex / waveSize) + 1;
            const multiplier = [1, 5, 10, 20][Math.min(round - 1, 3)];
            
            const newDetailedPick: DraftedCountry = {
                code: data.countryCode,
                round,
                pickNumber: pickIndex + 1,
                multiplier
            };

            const newDrafted = [...user.draftedCountries, data.countryCode];
            const newDetailed = [...(user.draftedCountriesDetailed || []), newDetailedPick];

            await updateTeamInCloud(session.leagueId, { 
                ...user, 
                draftedCountries: newDrafted,
                draftedCountriesDetailed: newDetailed
            });
            
            // Update wave metadata
            const newRecentPicks = [...(currentWave.recentPicks || []), {
                userId,
                countryCode: data.countryCode,
                pickIndex: currentWave.pickIndex,
                timestamp: Date.now()
            }];
            
            await updateWaveInCloud(session.leagueId, { 
                ...currentWave, 
                pickIndex: currentWave.pickIndex + 1,
                recentPicks: newRecentPicks
            });
            
            if (data?.reason === 'timer_expired') {
                toast.warning(`⏰ Time expired for ${user.name} - Auto-drafted ${data.countryCode}`);
            } else {
                toast.success("Forced Pick");
            }
        } else if (action === 'manual') {
            if (user.draftedCountries.length >= 4) {
                toast.error(`${user.name} already has 4 countries!`);
                return;
            }
            // Assume end of draft or generic placement for manual
            const round = user.draftedCountries.length + 1;
            const multiplier = [1, 5, 10, 20][Math.min(round - 1, 3)];
            
            const newDetailedPick: DraftedCountry = {
                code: data.countryCode,
                round,
                pickNumber: 0, // Manual flag
                multiplier
            };

            const newDrafted = [...user.draftedCountries, data.countryCode];
            const newDetailed = [...(user.draftedCountriesDetailed || []), newDetailedPick];

            await updateTeamInCloud(session.leagueId, { 
                ...user, 
                draftedCountries: newDrafted,
                draftedCountriesDetailed: newDetailed
            });
            toast.success("Manual Pick Added");
        } else if (action === 'undo') {
            const newDrafted = [...user.draftedCountries];
            newDrafted.pop();
            const newDetailed = [...(user.draftedCountriesDetailed || [])];
            newDetailed.pop();

            await updateTeamInCloud(session.leagueId, { 
                ...user, 
                draftedCountries: newDrafted,
                draftedCountriesDetailed: newDetailed
            });
            
            const newRecentPicks = [...(currentWave.recentPicks || [])];
            if (newRecentPicks.length > 0) newRecentPicks.pop();
            
            await updateWaveInCloud(session.leagueId, { 
                ...currentWave, 
                pickIndex: Math.max(0, currentWave.pickIndex - 1),
                recentPicks: newRecentPicks
            });
            toast.success("Undo Successful");
        }
    } catch (e: any) {
        toast.error("Action Failed: " + e.message);
    }
  };

  const handleMoveUser = async (userId: string, targetWaveId: string) => {
      if (!session?.leagueId) return;
      const user = allUsers.find(u => u.id === userId);
      if (!user) return;
      
      try {
          await moveUserToWave(session.leagueId, userId, user.poolId, targetWaveId);
          toast.success("User moved successfully");
      } catch (e: any) {
          toast.error("Failed to move user: " + e.message);
      }
  };

  const handleSendMessage = async (text: string) => {
     if (!session?.leagueId || !currentUser) return;
     try {
         await sendChatMessage(session.leagueId, {
             userId: currentUser.id,
             userName: currentUser.name,
             text: text
         });
     } catch (e) {
         toast.error("Failed to send message");
     }
  };

  // Add Result (now supports source tagging via spread if modified, but defaulting to test for manual add)
  const handleAddResult = async (result: MedalResult) => {
      if (!session?.leagueId) return;
      try {
          // If coming from Commissioner Dashboard manual inject, mark as test
          const enrichedResult: MedalResult = {
              ...result,
              source: result.source || 'manual',
              timestamp: Date.now()
          };

          setLiveResults(prev => [...prev, enrichedResult]);
          await addResultToLeague(session.leagueId, enrichedResult);

          // Also mark the event as Finished in Firebase
          if (result.eventId) {
            markEventFinished(session.leagueId, result.eventId).catch(() => {});
          }

          toast.success("Result added");
      } catch (e) {
          toast.error("Failed to add result");
      }
  };

  const handleClearResults = async (type: 'all' | 'test') => {
    if (!session?.leagueId) return;
    if (!window.confirm(`Are you sure you want to clear ${type === 'all' ? 'ALL' : 'TEST'} results?`)) return;

    try {
      await clearLeagueResults(session.leagueId, type === 'test');
      toast.success(`${type === 'all' ? 'All' : 'Test'} results cleared`);
      // Note: listenToLeague listener will automatically update the local state
    } catch (e: any) {
      toast.error("Failed to clear results: " + e.message);
    }
  };

  const handleDeleteLeague = async () => {
    if (!session?.leagueId) return;
    if (!window.confirm("WARNING: Are you sure you want to delete this league? This action cannot be undone.")) return;
    if (!window.confirm("FINAL CONFIRMATION: This will permanently destroy all teams, draft history, and settings.")) return;

    try {
      await deleteLeagueInCloud(session.leagueId);
      setSession(null);
      setLeagueSettings(null);
      window.location.reload();
    } catch (e: any) {
      toast.error("Failed to delete league: " + (e.message || "Unknown error"));
    }
  };

  const handleExitToLobby = () => {
      setSession(null);
      setLeagueSettings(null);
      setCurrentTab('dashboard');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success("Code copied!");
  };

  // Handle switching to settings tab from header
  const handleOpenSettings = () => {
    if (currentTab !== 'profile') {
        setCurrentTab('profile');
        setTimeout(() => setSettingsScrollTrigger(prev => prev + 1), 50);
    } else {
        setSettingsScrollTrigger(prev => prev + 1);
    }
  };

  // --- Render Logic (State Machine) ---

  if (fatalError) {
      return (
          <div className="h-dvh bg-neu-base flex items-center justify-center p-6">
              <div className="bg-neu-base shadow-neu-flat p-8 rounded-3xl text-center">
                  <h2 className="text-xl font-black text-neu-text-bold mb-2">Connection Error</h2>
                  <p className="text-neu-text-sub mb-4">{fatalError}</p>
                  <button onClick={() => window.location.reload()} className="bg-neu-base text-electric-600 shadow-neu-btn px-6 py-2 rounded-xl font-bold hover:-translate-y-1 active:shadow-neu-pressed">Reload</button>
              </div>
          </div>
      );
  }

  // 1. Loading
  if (authLoading) return <div className="h-dvh bg-neu-base flex items-center justify-center text-neu-text-sub font-black italic animate-pulse">Establishing Uplink...</div>;

  // 2. Auth (Not Logged In)
  if (!authUser) return <Auth />;

  // 3. Setup Mode (Create/Join)
  if (isSetupMode) {
      return (
          <div className="fixed inset-0 bg-neu-base z-50 overflow-hidden flex flex-col h-dvh">
              <LeagueSetup 
                onComplete={handleSetupComplete} 
                userId={authUser.uid} 
                initialMode={isSetupMode} 
                onCancel={() => setIsSetupMode(null)}
              />
          </div>
      );
  }

  // 4. Lobby (Logged In, No League Selected)
  if (!session) {
      return (
        <Lobby 
            userId={authUser.uid} 
            userEmail={authUser.email}
            onSelectLeague={setSession} 
            onCreateNew={() => setIsSetupMode('create')}
            onJoinExisting={() => setIsSetupMode('join')}
        />
      );
  }

  // 5. League Loading
  if (!leagueSettings) return <div className="h-dvh bg-neu-base flex items-center justify-center text-neu-text-sub font-bold animate-pulse">Syncing League Data...</div>;

  // 6. Main App (League Dashboard)
  const currentWaveId = session.selectedWaveId;
  const isPrivilegedRole = session.role === 'commissioner' || session.role === 'manager';
  const viewMode = isPrivilegedRole ? (session.viewMode || 'commish') : 'team';
  const isViewModeCommish = viewMode === 'commish';
  const isChatTab = currentTab === 'chat';
  
  // NOTE: We treat DraftRoom like Chat now - independent vertical scroll
  const isDraftTab = currentTab === 'draft';
  const isDashboardTab = currentTab === 'dashboard';
  
  // Fixed layouts handle their own scrolling
  const isFixedLayout = isChatTab || isDraftTab || isDashboardTab;

  // Dynamic padding: If fixed layout, we usually handle scrolling internally.
  // HOWEVER, for dashboard we now want it to respect the fixed header.
  // So we will add top padding to the dashboard container itself, and leave main without padding for fixed layouts.
  const mainPaddingTop = isFixedLayout ? '' : 'pt-[64px]';

  return (
    <div className="h-dvh bg-neu-base text-neu-text-main font-sans selection:bg-electric-500/30 flex flex-col overflow-hidden">
        
        {/* COMPACT HEADER - Unified for all pages including Dashboard */}
        <header className={`fixed top-0 left-0 right-0 z-50 glass-header pt-safe bg-white/95 backdrop-blur-md transition-all duration-300 ${
            currentTab === 'chat' ? 'shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-b border-gray-100' : 'shadow-sm'
        }`}>
          <div className="px-4 py-2">
            <div className="flex items-center justify-between gap-3">
              {/* Settings Button */}
              <div 
                className="w-11 h-11 neu-button rounded-xl flex items-center justify-center text-gray-400 hover:text-electric-600 transition-colors flex-shrink-0 cursor-pointer" 
                onClick={handleOpenSettings}
              >
                <Settings size={20} />
              </div>
              
              {/* League Info - Compact */}
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-black text-gray-900 uppercase italic tracking-tight truncate">
                  {leagueSettings?.leagueName || 'Gold Hunt'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {(currentUser.role === 'commissioner' || currentUser.role === 'manager') && (
                    <span className="text-[9px] font-bold text-gray-500 uppercase">{currentUser.role === 'commissioner' ? 'Commissioner' : 'Manager'}</span>
                  )}
                  {(currentUser.role === 'commissioner' || currentUser.role === 'manager') && <span className="text-gray-300">•</span>}
                  {isViewModeCommish ? (
                    <select 
                      value={currentWaveId} 
                      onChange={(e) => setSession(prev => prev ? { ...prev, selectedWaveId: e.target.value } : null)}
                      className="bg-transparent text-[9px] font-bold text-gray-500 uppercase tracking-wider outline-none cursor-pointer border-none shadow-none focus:ring-0 p-0"
                    >
                      {leagueSettings.waves.map(w => <option key={w.id} value={w.id}>Division {w.id}</option>)}
                    </select>
                  ) : (
                    <span className="text-[9px] font-bold text-gray-500 uppercase">
                        Division {session?.selectedWaveId}
                    </span>
                  )}
                  {currentWave?.status === 'live' && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Live
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Actions - Compact */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isViewModeCommish && (
                    <button 
                        onClick={() => setCurrentTab('commish')}
                        className={`w-11 h-11 neu-button rounded-xl flex items-center justify-center transition-colors ${currentTab === 'commish' ? 'text-gold-500' : 'text-gray-400 hover:text-electric-600'}`}
                    >
                    <Whistle size={18} />
                    </button>
                )}
                <button onClick={() => setShowWallet(true)} className="neu-button px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform">
                  <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                    <Wallet size={10} className="text-white" />
                  </div>
                  <span className="text-sm font-black text-gray-900">${(leagueSettings.entryFee + (currentUser.purchasedBoosts * leagueSettings.extraSlotPrice)).toFixed(0)}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sim Banner */}
        {leagueSettings.isTestMode && leagueSettings.simulation?.isRunning && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 flex-shrink-0 bg-electric-600 px-4 py-1.5 flex items-center justify-between shadow-lg z-[60] rounded-full w-auto min-w-[200px]">
              <div className="flex items-center gap-2">
                <TrendingUp size={12} className="text-white" />
                <span className="text-[9px] font-black uppercase italic text-white">Sim Active: {leagueSettings.simulation.speed}</span>
              </div>
              <button 
                onClick={() => handleUpdateSettings({ isTestMode: false })}
                className="text-[9px] font-black uppercase text-white/90 underline ml-4"
              >
                Exit Test
              </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 relative ${isFixedLayout ? 'flex flex-col overflow-hidden' : `${mainPaddingTop} overflow-y-auto overflow-x-hidden`}`}>
          {isChatTab ? (
             <LeagueChat currentUser={currentUser} messages={chatMessages} onSendMessage={handleSendMessage} />
          ) : (
             <div className={`${isFixedLayout ? 'h-full flex flex-col' : 'max-w-3xl mx-auto px-4 pt-4 pb-24 min-h-full'}`}>
                {currentTab === 'dashboard' && (
                    <SectionErrorBoundary name="Medal Tracker">
                        <div className="flex flex-col h-full relative">
                          
                          {/* Dashboard Sub-Header (Controls) */}
                          <div className="z-30 bg-neu-base/95 backdrop-blur-md border-b border-white/20 pb-3 pt-2 shadow-sm transition-all relative">
                                
                                {/* Search & Filters - Compacted */}
                                <div className="px-4 space-y-2 relative z-20">
                                    {/* Search Bar - matching Scout Nations style */}
                                    <div className="relative">
                                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                      <input
                                        type="text"
                                        value={eventSearchQuery}
                                        onChange={(e) => setEventSearchQuery(e.target.value)}
                                        placeholder="Search events, sports..."
                                        className="w-full bg-neu-base rounded-xl px-4 py-3 pl-12 text-sm font-bold text-gray-700 placeholder-gray-400 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] outline-none focus:ring-2 focus:ring-electric-500/50"
                                      />
                                      {eventSearchQuery && (
                                        <button 
                                            onClick={() => setEventSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                      )}
                                    </div>
                                    
                                    {/* Filter Pills - Horizontal Scroll */}
                                    <div className="relative">
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar mask-fade-x pb-1 items-center">
                                            {/* My CPs Filter - Acts as Status Indicator too */}
                                            <button
                                                onClick={() => {
                                                    const newState = !showOnlyCPs;
                                                    setShowOnlyCPs(newState);
                                                    if (newState && currentUser.confidenceEvents.length >= 0) {
                                                        setShowBuyCPPopover(true);
                                                    } else {
                                                        setShowBuyCPPopover(false);
                                                    }
                                                }}
                                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                                                showOnlyCPs 
                                                    ? 'bg-electric-600 text-white border-electric-600 shadow-md' 
                                                    : 'bg-white text-electric-600 border-electric-100 shadow-sm'
                                                }`}
                                            >
                                                <Zap size={10} className={showOnlyCPs ? 'fill-current' : ''} />
                                                <span>Boosts ({currentUser.confidenceEvents.length})</span>
                                            </button>
                                            
                                            {/* Sport Filters */}
                                            {sports.map(sport => {
                                                const isSelected = selectedSport === sport;
                                                const sportCPCount = sport === 'All' ? 0 
                                                : events.filter(e => e.sport === sport && currentUser.confidenceEvents.includes(e.id)).length;
                                                const sportMaxed = sport !== 'All' && sportCPCount >= 2;
                                                
                                                return (
                                                <button
                                                    key={sport}
                                                    onClick={() => { 
                                                    setSelectedSport(sport); 
                                                    if (showOnlyCPs) setShowOnlyCPs(false);
                                                    }}
                                                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 border ${
                                                    isSelected 
                                                        ? 'bg-gray-800 text-white border-gray-800 shadow-md' 
                                                        : sportMaxed
                                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                        : 'bg-white text-gray-500 border-transparent shadow-sm'
                                                    }`}
                                                >
                                                    {sport}
                                                    {sportMaxed && !isSelected && (
                                                    <span className="text-[8px] bg-yellow-200 text-yellow-800 px-1 rounded-sm">MAX</span>
                                                    )}
                                                </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Buy CP Popover - Absolute positioned within header block */}
                                {showBuyCPPopover && showOnlyCPs && (
                                    <>
                                        {/* Invisible backdrop to catch clicks outside */}
                                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowBuyCPPopover(false)} />
                                        
                                        <div className="absolute top-full left-4 mt-2 z-50 animate-fade-in">
                                            <MiniBuySlot 
                                                user={currentUser}
                                                leagueSettings={leagueSettings}
                                                onPurchase={() => handleUpdateTeam({ purchasedBoosts: (currentUser.purchasedBoosts || 0) + 1 })}
                                                onClose={() => setShowBuyCPPopover(false)}
                                            />
                                        </div>
                                    </>
                                )}
                          </div>
                          
                          {/* SCROLLABLE EVENT LIST */}
                          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
                            <MedalTracker 
                                events={events} 
                                results={liveResults} 
                                userScores={userStats.details} 
                                user={currentUserEnriched} 
                                selectedSport={selectedSport}
                                searchQuery={eventSearchQuery}
                                showOnlyCPs={showOnlyCPs}
                                onToggleConfidencePick={(eventId) => {
                                    // Enforce CB deadline for non-privileged users
                                    const isPrivileged = currentUser.role === 'commissioner' || currentUser.role === 'manager';
                                    if (!isPrivileged && leagueSettings?.openingCeremonyLockTime && Date.now() >= leagueSettings.openingCeremonyLockTime) {
                                        toast.error('Deadline passed — boosts are locked!');
                                        return;
                                    }
                                    const has = currentUser.confidenceEvents.includes(eventId);
                                    const newEvents = has
                                        ? currentUser.confidenceEvents.filter(e => e !== eventId)
                                        : [...currentUser.confidenceEvents, eventId];
                                    handleUpdateTeam({ confidenceEvents: newEvents });
                                    toast.success(has ? 'CB Removed' : 'CB Added');
                                }}
                                maxConfidencePicks={10 + (currentUser.purchasedBoosts || 0)}
                                cpDeadlineMode={leagueSettings?.cpDeadlineMode || 'global'}
                                globalDeadline={leagueSettings?.openingCeremonyLockTime}
                                purchasedBoosts={currentUser.purchasedBoosts}
                            />
                          </div>
                        </div>
                    </SectionErrorBoundary>
                )}
                
                {currentTab === 'commish' && isViewModeCommish && (
                  <SectionErrorBoundary name="Commissioner Dashboard">
                      <CommissionerDashboard 
                        settings={leagueSettings} users={enrichedUsers} events={events}
                        onStartDraft={async (wid) => {
                          // Shuffle draft order on start
                          try {
                            await initializeDraftState(session!.leagueId, wid, {
                              resetPicks: false,
                              shuffleOrder: true,
                            });
                          } catch (e) {
                            console.error('[Draft] Failed to shuffle order:', e);
                          }
                          const w = leagueSettings.waves.find(wa => wa.id === wid);
                          if(w) handleUpdateWave({...w, status: 'live'});
                          if (leagueSettings.currentPhase === 'setup') {
                              handleUpdateSettings({ currentPhase: 'phase1_nation_draft' });
                          }
                          setSession(s => s ? {...s, selectedWaveId: wid} : null);
                          setCurrentTab('draft');
                        }} 
                        onUpdateWave={handleUpdateWave} 
                        onUpdateSettings={handleUpdateSettings} 
                        onAddTestResult={handleAddResult}
                        onClearResults={handleClearResults}
                        onMoveUser={handleMoveUser}
                        onUpdateTeam={handleUpdateAnyTeam}
                        results={liveResults}
                        viewMode={viewMode}
                        onToggleView={(m) => setSession(s => s ? {...s, viewMode: m} : null)}
                        onCreateBot={handleCreateBot}
                      />
                  </SectionErrorBoundary>
                )}

                {currentTab === 'draft' && currentWave && currentWaveDocId ? (
                  <SectionErrorBoundary name="Draft Room">
                      <DraftRoom 
                        waveId={currentWaveDocId}
                        events={events} 
                        wave={currentWave} 
                        phase={leagueSettings.currentPhase} 
                        users={enrichedUsers} 
                        currentUserId={authUser.uid}
                        openingCeremonyLockTime={leagueSettings.openingCeremonyLockTime}
                        onDraftCountry={handleDraftCountry}
                        onToggleEvent={(id) => {
                          const has = currentUser.confidenceEvents.includes(id);
                          const newEvents = has ? currentUser.confidenceEvents.filter(e => e !== id) : [...currentUser.confidenceEvents, id];
                          handleUpdateTeam({ confidenceEvents: newEvents });
                        }}
                        onFinishDraft={() => {}} 
                        onBuyBoost={() => handleUpdateTeam({ purchasedBoosts: currentUser.purchasedBoosts + 1 })} 
                        purchasedBoosts={currentUser.purchasedBoosts} extraSlotPrice={leagueSettings.extraSlotPrice}
                        isCommissionerMode={isViewModeCommish}
                        onCommishUpdate={handleCommishUpdate}
                        onUpdateWave={handleUpdateWave}
                        onCreateBot={handleCreateBot}
                        onResetDraft={handleResetWaveDraft}
                        capacity={leagueSettings.usersPerWave}
                        onNavigate={(tab) => setCurrentTab(tab)}
                        cpDeadlineMode={leagueSettings?.cpDeadlineMode || 'global'}
                      />
                  </SectionErrorBoundary>
                ) : (currentTab === 'draft' && (
                    <div className="text-center py-20 text-neu-text-sub px-4">
                        <AlertTriangle size={32} className="mx-auto mb-2" />
                        <p>Division Not Found. Contact Commissioner.</p>
                        {currentTab === 'draft' && !currentWaveDocId && <p className="text-[10px] mt-2 text-red-400">Error: Missing Wave Document ID.</p>}
                    </div>
                ))}

                {currentTab === 'profile' && (
                  <SectionErrorBoundary name="Profile">
                      <TeamPage
                        user={currentUserEnriched}
                        events={events}
                        results={liveResults}
                        entryFee={leagueSettings.entryFee}
                        extraSlotPrice={leagueSettings.extraSlotPrice}
                        onEditName={() => setShowEditNameModal(true)}
                        leagueSettings={leagueSettings}
                        onSignOut={() => { signOut(); setAuthUser(null); setSession(null); }}
                        isCommissioner={session.role === 'commissioner'}
                        onDeleteLeague={handleDeleteLeague}
                        onSwitchLeague={handleExitToLobby}
                        onShowRules={() => setShowHowItWorks(true)}
                        onFixDraft={handleQuickRepair}
                        scrollToSettingsTrigger={settingsScrollTrigger}
                        onBuyBoost={() => handleUpdateTeam({ purchasedBoosts: (currentUser.purchasedBoosts || 0) + 1 })}
                        onRemoveBoost={handleRemoveBoostSlot}
                        onOpenWallet={() => setShowWallet(true)}
                      />
                  </SectionErrorBoundary>
                )}

                {currentTab === 'leaderboard' && (
                    <SectionErrorBoundary name="Leaderboard">
                        <Leaderboard 
                          users={enrichedUsers} 
                          currentUserId={authUser.uid} 
                          currentUserPoolId={currentUser.poolId} 
                          onUserSelect={() => setCurrentTab('profile')} 
                          events={events}
                          results={liveResults}
                        />
                    </SectionErrorBoundary>
                )}
                
             </div>
          )}
        </main>

        {/* Wallet Modal */}
        {showWallet && leagueSettings && (
          <WalletModal
            user={currentUser}
            leagueSettings={leagueSettings}
            allUsers={allUsers}
            onClose={() => setShowWallet(false)}
          />
        )}

        {/* Edit Name Modal */}
        {showEditNameModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black uppercase italic text-gray-900">Edit Team Name</h3>
                <button 
                  onClick={() => setShowEditNameModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              <input
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                placeholder="Team name..."
                maxLength={24}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-electric-500 mb-4"
                autoFocus
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowEditNameModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateTeamName}
                  disabled={!editNameValue.trim() || editNameValue === currentUser?.name}
                  className="flex-1 py-3 bg-electric-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Glass Bottom Nav */}
        <Navigation 
            currentTab={currentTab} 
            setTab={setCurrentTab} 
            isVisible={true}
            unreadChatCount={unreadChatCount}
            draftPhase={
                currentWave?.status === 'live' ? 'live' :
                currentWave?.status === 'completed' ? 'complete' : 'waiting'
            }
        />

        {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}

        {showRules && (
          <div className="fixed inset-0 z-[200] bg-neu-base overflow-y-auto pt-safe animate-fade-in relative h-dvh">
             <div className="sticky top-0 p-4 flex justify-end glass-header z-10">
                <button onClick={() => setShowRules(false)} className="w-12 h-12 bg-neu-base rounded-full flex items-center justify-center text-neu-text-sub hover:text-neu-text-main shadow-neu-btn"><X size={24} /></button>
             </div>
             <div className="relative z-10 pb-20">
               <LeagueRules />
             </div>
          </div>
        )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
        <ErrorBoundary>
            <AppShell />
        </ErrorBoundary>
    </ToastProvider>
  );
};

export default App;
