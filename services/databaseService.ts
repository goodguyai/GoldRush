import { auth, db } from "./firebase";
import firebase from "firebase/compat/app";
import { LeagueSettings, Wave, User, MedalResult, ChatMessage, DraftedCountry } from '../types';

// --- UTILITIES ---

const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // Don't retry on permission errors or if explicitly cancelled
      if (error.code === 'permission-denied') throw error;
      
      console.warn(`[DB] Attempt ${attempt}/${maxAttempts} failed:`, error.message);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
};

export const generateLeagueCode = () => 'GH-' + Math.random().toString(36).substr(2, 4).toUpperCase();
export const generateWaveCode = (waveId: string) => `WV-${waveId}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
const getWaveDocId = (leagueId: string, waveId: string) => `${leagueId}_${waveId}`;

// --- AUTH SERVICES ---

export const signUp = async (email: string, password: string) => {
  // Allow raw firebase errors to bubble up for better handling in UI
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  return userCredential.user;
};

export const signIn = async (email: string, password: string) => {
  // Allow raw firebase errors to bubble up for better handling in UI
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  return userCredential.user;
};

export const signOut = async () => {
  await auth.signOut();
  localStorage.clear();
};

// --- USER & LEAGUE MANAGEMENT ---

const addToUserLeagues = async (userId: string, leagueSummary: any) => {
    await db.collection("users").doc(userId).set({
        leagues: firebase.firestore.FieldValue.arrayUnion(leagueSummary)
    }, { merge: true });
};

export const getUserLeagues = async (userId: string) => {
  const userDoc = await db.collection("users").doc(userId).get();
  const rawLeagues = userDoc.exists ? userDoc.data()?.leagues || [] : [];
  
  // Verify existence of leagues to avoid ghost entries
  const verifiedLeagues = [];
  for (const l of rawLeagues) {
      const doc = await db.collection("leagues").doc(l.leagueId).get();
      if (doc.exists) {
          verifiedLeagues.push(l);
      } else {
          // Cleanup dead reference
          await db.collection("users").doc(userId).update({
              leagues: firebase.firestore.FieldValue.arrayRemove(l)
          });
      }
  }
  return verifiedLeagues;
};

export const createLeagueInCloud = async (settings: LeagueSettings, odId: string): Promise<string> => {
  return withRetry(async () => {
    const leagueRef = db.collection("leagues").doc();
    const leagueId = leagueRef.id;

    // Separate waves from settings for storage in league doc
    const { waves, ...leagueSettingsWithoutWaves } = settings;
    
    // Determine which wave commissioner joins (first by default or selected)
    const commissionerWaveId = (settings as any).selectedWaveId || waves[0]?.id || 'A';
    
    const batch = db.batch();

    // 1. Create League Document
    const newLeagueData = {
      id: leagueId,
      league_code: settings.leagueCode,
      name: settings.leagueName,
      commissioner_id: odId,
      settings: { ...leagueSettingsWithoutWaves, leagueId },
      results: [],
      created_at: Date.now()
    };
    batch.set(leagueRef, newLeagueData);

    // 2. Create Commissioner Team Document
    // CRITICAL FIX: Ensure commissioner has a team entry immediately
    const teamRef = leagueRef.collection("teams").doc(odId);
    batch.set(teamRef, {
      user_id: odId,
      name: (settings as any).myTeamName || "Commissioner",
      wave_id: commissionerWaveId,
      role: 'commissioner',
      drafted_countries: [],
      drafted_countries_detailed: [],
      confidence_events: [],
      purchased_boosts: 0,
      total_score: 0,
      is_bot: false,
      created_at: Date.now()
    });

    // 3. Create Wave Documents (Normalized)
    waves.forEach(wave => {
      const waveDocRef = db.collection("waves").doc(getWaveDocId(leagueId, wave.id));
      const isCommissionerWave = wave.id === commissionerWaveId;
      
      const waveData: Wave = {
        ...wave,
        leagueId: leagueId,
        // CRITICAL FIX: Add commissioner to participants immediately
        participants: isCommissionerWave ? [odId] : [],
        draftOrder: isCommissionerWave ? [odId] : [],
        pickIndex: 0,
        recentPicks: [],
        draftSettings: wave.draftSettings || { 
          pickTimerDuration: 60, 
          autoDraftBehavior: 'random', 
          skipThreshold: 3 
        },
      };

      batch.set(waveDocRef, waveData);

      // 4. Create draft state subdocument
      const draftStateRef = waveDocRef.collection("draft").doc("state");
      batch.set(draftStateRef, {
        phase: "nation",
        pickIndex: 0,
        recentPicks: [],
        lastUpdated: Date.now()
      });
    });

    await batch.commit();

    // 5. Add to user's league list
    await addToUserLeagues(odId, {
      leagueId,
      leagueName: settings.leagueName,
      role: 'commissioner',
      waveId: commissionerWaveId
    });

    return leagueId;
  });
};

export const joinLeagueInCloud = async (leagueCode: string, user: User, waveId: string) => {
  // 1. Find league by code
  const querySnapshot = await db.collection("leagues").where("league_code", "==", leagueCode).get();

  if (querySnapshot.empty) {
    throw new Error("League not found. Check the invite code.");
  }

  const leagueDoc = querySnapshot.docs[0];
  const leagueData = leagueDoc.data();
  const leagueId = leagueDoc.id;
  const currentSettings = leagueData.settings as LeagueSettings;

  // 2. Create/Update team document
  const teamRef = db.collection("leagues").doc(leagueId).collection("teams").doc(user.id);
  await teamRef.set({
    user_id: user.id,
    name: user.name,
    wave_id: waveId,
    drafted_countries: user.draftedCountries || [],
    drafted_countries_detailed: user.draftedCountriesDetailed || [],
    confidence_events: user.confidenceEvents || [],
    purchased_boosts: user.purchasedBoosts || 0,
    role: user.role || 'player',
    time_zone: user.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_bot: false,
    joined_at: Date.now()
  }, { merge: true });

  // 3. Add user to wave (with self-healing)
  const waveDocId = getWaveDocId(leagueId, waveId);
  const waveRef = db.collection("waves").doc(waveDocId);
  
  try {
    await db.runTransaction(async (transaction) => {
      const waveDoc = await transaction.get(waveRef);
      
      if (!waveDoc.exists) {
        // SELF-HEALING: Create wave doc if missing
        console.warn(`[Join] Healing missing wave: ${waveDocId}`);
        
        const legacyWave: any = currentSettings.waves?.find((w: any) => w.id === waveId) || {};
        
        const newWaveData: Wave = {
          id: waveId,
          leagueId: leagueId,
          name: legacyWave.name || `Wave ${waveId}`,
          inviteCode: legacyWave.inviteCode || generateWaveCode(waveId),
          draftStartTime: legacyWave.draftStartTime || Date.now() + 86400000,
          status: legacyWave.status || 'scheduled',
          participants: [user.id],
          draftOrder: [user.id],
          pickIndex: 0,
          recentPicks: [],
          draftSettings: legacyWave.draftSettings || { 
            pickTimerDuration: 60, 
            autoDraftBehavior: 'random', 
            skipThreshold: 3 
          }
        };
        
        transaction.set(waveRef, newWaveData);
        
        // Also create draft state subdoc
        const draftStateRef = waveRef.collection("draft").doc("state");
        transaction.set(draftStateRef, {
          phase: "nation",
          pickIndex: 0,
          recentPicks: [],
          lastUpdated: Date.now()
        });
        
        return;
      }
      
      // Wave exists - add user if not present
      const waveData = waveDoc.data() as Wave;
      
      if (!waveData.participants?.includes(user.id)) {
        const updatedParticipants = [...(waveData.participants || [])];
        // Double check for duplicates
        if (!updatedParticipants.includes(user.id)) updatedParticipants.push(user.id);

        const updatedOrder = [...(waveData.draftOrder || [])];
        if (!updatedOrder.includes(user.id)) updatedOrder.push(user.id);

        transaction.update(waveRef, { 
          participants: updatedParticipants,
          draftOrder: updatedOrder
        });
      }
    });
  } catch (txError: any) {
    console.error('[Join] Transaction failed:', txError);
    throw new Error('Failed to join wave. Please try again.');
  }

  // 4. Ensure draft state subdoc exists (redundancy check)
  const draftStateRef = waveRef.collection("draft").doc("state");
  const draftStateSnap = await draftStateRef.get();
  if (!draftStateSnap.exists) {
    await draftStateRef.set({
      phase: "nation",
      pickIndex: 0,
      recentPicks: [],
      lastUpdated: Date.now()
    });
  }

  // 5. Add to user's league list
  await addToUserLeagues(user.id, {
    leagueId,
    leagueName: currentSettings.leagueName,
    role: 'player',
    waveId
  });

  return { 
    settings: currentSettings, 
    leagueId 
  };
};

export const moveUserToWave = async (leagueId: string, userId: string, oldWaveId: string, newWaveId: string) => {
  const oldWaveRef = db.collection("waves").doc(getWaveDocId(leagueId, oldWaveId));
  const newWaveRef = db.collection("waves").doc(getWaveDocId(leagueId, newWaveId));
  const teamRef = db.collection("leagues").doc(leagueId).collection("teams").doc(userId);

  await db.runTransaction(async (transaction) => {
    const oldWaveDoc = await transaction.get(oldWaveRef);
    const newWaveDoc = await transaction.get(newWaveRef);

    if (!oldWaveDoc.exists || !newWaveDoc.exists) throw new Error("Wave not found");

    const oldData = oldWaveDoc.data() as Wave;
    const newData = newWaveDoc.data() as Wave;

    // Update Old Wave
    const oldParticipants = oldData.participants.filter(id => id !== userId);
    const oldOrder = oldData.draftOrder.filter(id => id !== userId);
    transaction.update(oldWaveRef, { participants: oldParticipants, draftOrder: oldOrder });

    // Update New Wave
    if (!newData.participants.includes(userId)) {
        transaction.update(newWaveRef, {
            participants: [...newData.participants, userId],
            draftOrder: [...newData.draftOrder, userId]
        });
    }

    // Update User
    transaction.update(teamRef, { wave_id: newWaveId });
  });
};

export const fetchLeagueData = async (leagueId: string) => {
  // 1. Fetch League Settings
  const leagueRef = db.collection("leagues").doc(leagueId);
  const leagueSnap = await leagueRef.get();

  if (!leagueSnap.exists) return null;

  const leagueData = leagueSnap.data()!;
  
  // 2. Fetch Teams
  const teamsRef = db.collection("leagues").doc(leagueId).collection("teams");
  const teamsSnap = await teamsRef.get();
  
  const users: User[] = teamsSnap.docs.map(doc => {
    const d = doc.data();
    return {
      id: d.user_id || doc.id,
      name: d.name,
      poolId: d.wave_id || 'A',
      draftedCountries: d.drafted_countries || [],
      draftedCountriesDetailed: d.drafted_countries_detailed || [],
      confidenceEvents: d.confidence_events || [],
      totalScore: d.total_score || 0,
      purchasedBoosts: d.purchased_boosts || 0,
      role: d.role || 'player',
      timeZone: d.time_zone,
      isBot: d.is_bot || false
    };
  });

  // 3. Fetch Waves (Normalized)
  const wavesSnap = await db.collection("waves").where("leagueId", "==", leagueId).get();
  let waves = wavesSnap.docs.map(d => d.data() as Wave).sort((a,b) => a.id.localeCompare(b.id));

  // FALLBACK: If no normalized waves found, check for legacy embedded waves in settings
  if (waves.length === 0 && leagueData.settings?.waves) {
      waves = leagueData.settings.waves;
  }

  return {
    settings: { 
        ...(leagueData.settings as LeagueSettings), 
        waves 
    },
    results: (leagueData.results || []) as MedalResult[],
    users
  };
};

export const deleteLeagueInCloud = async (leagueId: string) => {
  const leagueRef = db.collection("leagues").doc(leagueId);
  
  // Delete Teams
  const teamsRef = leagueRef.collection("teams");
  const teamsSnap = await teamsRef.get();
  const batch = db.batch();
  
  if (!teamsSnap.empty) {
    teamsSnap.docs.forEach(doc => batch.delete(doc.ref));
  }

  // Delete Waves
  const wavesSnap = await db.collection("waves").where("leagueId", "==", leagueId).get();
  if (!wavesSnap.empty) {
      wavesSnap.docs.forEach(doc => batch.delete(doc.ref));
  }

  // Delete League
  batch.delete(leagueRef);
  
  await batch.commit();
};

// --- CHAT SERVICES ---

export const sendChatMessage = async (leagueId: string, message: Partial<ChatMessage>) => {
    await db.collection("leagues").doc(leagueId).collection("messages").add({
        ...message,
        timestamp: Date.now()
    });
};

export const listenToChat = (leagueId: string, onUpdate: (messages: ChatMessage[]) => void) => {
    return db.collection("leagues").doc(leagueId).collection("messages")
        .orderBy("timestamp", "asc")
        .limit(100)
        .onSnapshot(snapshot => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
            onUpdate(messages);
        });
};

// --- LISTENERS ---

export const listenToLeague = (leagueId: string, onUpdate: (data: any) => void) => {
  let leagueData: any = null;
  let wavesData: Wave[] = [];

  const checkAndEmit = () => {
      if (leagueData) {
          // Merge active waves data with league settings
          const finalWaves = (wavesData.length > 0) 
              ? wavesData.sort((a,b) => a.id.localeCompare(b.id))
              : (leagueData.settings?.waves || []);

          onUpdate({
              settings: {
                  ...leagueData.settings,
                  waves: finalWaves
              },
              results: leagueData.results || []
          });
      }
  };

  const unsubLeague = db.collection("leagues").doc(leagueId).onSnapshot((doc) => {
    if (doc.exists) {
      leagueData = doc.data();
      checkAndEmit();
    }
  });

  const unsubWaves = db.collection("waves").where("leagueId", "==", leagueId).onSnapshot((snapshot) => {
      wavesData = snapshot.docs.map(d => d.data() as Wave);
      checkAndEmit();
  });

  return () => {
      unsubLeague();
      unsubWaves();
  };
};

export const listenToTeams = (leagueId: string, onUpdate: (users: User[]) => void) => {
  return db.collection("leagues").doc(leagueId).collection("teams").onSnapshot((snapshot: any) => {
    const users: User[] = snapshot.docs.map((doc: any) => {
      const d = doc.data();
      return {
        id: d.user_id || doc.id,
        name: d.name,
        poolId: d.wave_id,
        draftedCountries: d.drafted_countries || [],
        draftedCountriesDetailed: d.drafted_countries_detailed || [],
        confidenceEvents: d.confidence_events || [],
        totalScore: d.total_score || 0,
        purchasedBoosts: d.purchased_boosts || 0,
        role: d.role || 'player',
        timeZone: d.time_zone,
        isBot: d.is_bot || false
      };
    });
    onUpdate(users);
  });
};

export const listenToDraftState = (waveDocId: string, onUpdate: (data: any) => void) => {
  if (!waveDocId) {
    onUpdate(null);
    return () => {};
  }

  let waveData: any = null;
  let draftData: any = null;
  
  const emitCombined = () => {
    // Prefer wave doc data for structure, fallback to draft state for phase
    const combined = {
      phase: draftData?.phase || 'nation',
      pickIndex: waveData?.pickIndex ?? draftData?.pickIndex ?? 0,
      recentPicks: waveData?.recentPicks ?? draftData?.recentPicks ?? [],
      participants: waveData?.participants ?? [],
      draftOrder: waveData?.draftOrder ?? [],
      status: waveData?.status ?? 'scheduled'
    };
    onUpdate(combined);
  };

  const unsubWave = db.collection("waves").doc(waveDocId)
    .onSnapshot((doc) => {
        if (doc.exists) {
          waveData = doc.data();
          emitCombined();
        }
    });

  const unsubDraft = db.collection("waves").doc(waveDocId)
    .collection("draft").doc("state")
    .onSnapshot((doc) => {
        draftData = doc.exists ? doc.data() : null;
        emitCombined();
    });

  return () => {
    unsubWave();
    unsubDraft();
  };
};

// --- UPDATES & ACTIONS ---

export const updateWaveInCloud = async (leagueId: string, wave: Wave) => {
  return withRetry(async () => {
    const waveDocId = getWaveDocId(leagueId, wave.id);
    const waveRef = db.collection("waves").doc(waveDocId);
    const draftStateRef = waveRef.collection("draft").doc("state");

    const batch = db.batch();

    // Update wave document
    batch.set(waveRef, {
      ...wave,
      pickIndex: wave.pickIndex ?? 0,
      recentPicks: wave.recentPicks ?? [],
      lastUpdated: Date.now()
    }, { merge: true });

    // Keep draft/state in sync for listeners
    batch.set(draftStateRef, {
      phase: wave.status === 'completed' ? 'confidence' : 'nation',
      pickIndex: wave.pickIndex ?? 0,
      recentPicks: wave.recentPicks ?? [],
      lastUpdated: Date.now()
    }, { merge: true });

    await batch.commit();
  });
};

export const updateLeagueSettingsInCloud = async (leagueId: string, settings: Partial<LeagueSettings>) => {
  const leagueRef = db.collection("leagues").doc(leagueId);
  const { waves, ...safeSettings } = settings as any;
  
  // Dot notation for nested updates
  const updates: any = {};
  Object.keys(safeSettings).forEach(key => {
      updates[`settings.${key}`] = safeSettings[key];
  });

  await leagueRef.update(updates);
};

export const updateTeamInCloud = async (leagueId: string, user: Partial<User> & { id: string }) => {
  return withRetry(async () => {
    const teamRef = db.collection("leagues").doc(leagueId).collection("teams").doc(user.id);
    
    // Map fields to Firestore snake_case
    const updateData: any = {};
    if (user.name !== undefined) updateData.name = user.name;
    if (user.poolId !== undefined) updateData.wave_id = user.poolId;
    if (user.draftedCountries !== undefined) updateData.drafted_countries = user.draftedCountries;
    if (user.draftedCountriesDetailed !== undefined) updateData.drafted_countries_detailed = user.draftedCountriesDetailed;
    if (user.confidenceEvents !== undefined) updateData.confidence_events = user.confidenceEvents;
    if (user.purchasedBoosts !== undefined) updateData.purchased_boosts = user.purchasedBoosts;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.timeZone !== undefined) updateData.time_zone = user.timeZone;
    if (user.isBot !== undefined) updateData.is_bot = user.isBot;
    
    updateData.updated_at = Date.now();
    
    await teamRef.update(updateData);
  });
};

export const updateLeagueResults = async (leagueId: string, results: MedalResult[]) => {
  const leagueRef = db.collection("leagues").doc(leagueId);
  await leagueRef.set({ results }, { merge: true });
};

export const addResultToLeague = async (leagueId: string, result: MedalResult) => {
    const leagueRef = db.collection("leagues").doc(leagueId);
    await leagueRef.update({
        results: firebase.firestore.FieldValue.arrayUnion(result)
    });
};

// NEW: Edit result with audit log
export const editResultWithAudit = async (
  leagueId: string, 
  updatedResult: MedalResult, 
  auditMessage: string
) => {
  const leagueRef = db.collection("leagues").doc(leagueId);
  
  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(leagueRef);
    if (!doc.exists) throw new Error("League not found");
    
    const data = doc.data();
    const currentResults = (data?.results || []) as MedalResult[];
    
    // Replace the result
    const newResults = currentResults.map(r => 
      r.eventId === updatedResult.eventId ? updatedResult : r
    );
    
    transaction.update(leagueRef, { results: newResults });
    
    // Send audit message
    const msgRef = leagueRef.collection("messages").doc();
    transaction.set(msgRef, {
      userId: 'system',
      userName: 'System',
      text: auditMessage,
      timestamp: Date.now()
    });
  });
};

// NEW: Clear results helper
export const clearLeagueResults = async (leagueId: string, onlyTest: boolean = false) => {
  const leagueRef = db.collection("leagues").doc(leagueId);
  
  if (onlyTest) {
    // Transactional safe removal of test results
    await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(leagueRef);
        if (!doc.exists) return;
        
        const data = doc.data();
        const currentResults = (data?.results || []) as MedalResult[];
        
        // Filter out any results marked as source='test'
        const keptResults = currentResults.filter(r => r.source !== 'test');
        
        transaction.update(leagueRef, { results: keptResults });
    });
  } else {
    // Clear everything
    await leagueRef.update({ results: [] });
  }
};

// --- NEW FEATURES: BOTS & MIGRATION ---

/**
 * Creates a bot and adds it to the wave safely using a transaction.
 */
export const createBotInWave = async (
  leagueId: string, 
  waveId: string, 
  botName: string
): Promise<string> => {
  const botId = 'bot-' + Math.random().toString(36).substr(2, 5);
  const waveDocId = getWaveDocId(leagueId, waveId);
  const waveRef = db.collection("waves").doc(waveDocId);
  const teamRef = db.collection("leagues").doc(leagueId).collection("teams").doc(botId);

  await db.runTransaction(async (transaction) => {
    const waveDoc = await transaction.get(waveRef);
    if (!waveDoc.exists) throw new Error(`Wave ${waveId} not found`);
    
    const waveData = waveDoc.data() as Wave;
    const currentParticipants = waveData.participants || [];
    const currentDraftOrder = waveData.draftOrder || [];
    
    // Create bot team doc
    transaction.set(teamRef, {
      user_id: botId,
      name: botName,
      wave_id: waveId,
      drafted_countries: [],
      drafted_countries_detailed: [],
      confidence_events: [],
      purchased_boosts: 0,
      role: 'player',
      is_bot: true,
      created_at: Date.now()
    });
    
    // Add to wave
    transaction.update(waveRef, {
      participants: [...currentParticipants, botId],
      draftOrder: [...currentDraftOrder, botId]
    });
  });
  
  console.log(`[Bot] Created ${botName} (${botId}) in Wave ${waveId}`);
  return botId;
};

/**
 * Rebuilds the participants list and draft state for a wave based on current teams.
 */
export const initializeDraftState = async (
  leagueId: string, 
  waveId: string, 
  options?: { 
    resetPicks?: boolean;
    shuffleOrder?: boolean;
  }
): Promise<{ participants: string[]; draftOrder: string[]; pickIndex: number }> => {
  const waveDocId = getWaveDocId(leagueId, waveId);
  const waveRef = db.collection("waves").doc(waveDocId);
  
  // 1. Fetch all teams assigned to this wave
  const teamsSnap = await db.collection("leagues").doc(leagueId)
    .collection("teams")
    .where("wave_id", "==", waveId)
    .get();
  
  const participantIds = teamsSnap.docs.map(d => d.data().user_id || d.id);
  
  if (participantIds.length === 0) throw new Error(`No teams found in Wave ${waveId}`);
  
  const waveSnap = await waveRef.get();
  const currentData = waveSnap.exists ? waveSnap.data() as Wave : null;
  
  // 2. Determine draft order
  let draftOrder = [...participantIds];
  if (options?.shuffleOrder) {
    // Fisher-Yates shuffle
    for (let i = draftOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [draftOrder[i], draftOrder[j]] = [draftOrder[j], draftOrder[i]];
    }
  } else if (currentData?.draftOrder && currentData.draftOrder.length > 0) {
    // Preserve existing order, append new participants
    const existingOrder = currentData.draftOrder.filter(id => participantIds.includes(id));
    const newParticipants = participantIds.filter(id => !existingOrder.includes(id));
    draftOrder = [...existingOrder, ...newParticipants];
  }
  
  const pickIndex = options?.resetPicks ? 0 : (currentData?.pickIndex || 0);
  const recentPicks = options?.resetPicks ? [] : (currentData?.recentPicks || []);
  
  const batch = db.batch();
  
  // 3. Update/Create Wave Doc
  if (waveSnap.exists) {
    batch.update(waveRef, {
      participants: participantIds,
      draftOrder: draftOrder,
      pickIndex: pickIndex,
      recentPicks: recentPicks,
      lastUpdated: Date.now()
    });
  } else {
    batch.set(waveRef, {
      id: waveId,
      leagueId: leagueId,
      name: `Wave ${waveId}`,
      inviteCode: generateWaveCode(waveId),
      draftStartTime: Date.now() + 86400000,
      status: 'scheduled',
      participants: participantIds,
      draftOrder: draftOrder,
      pickIndex: pickIndex,
      recentPicks: recentPicks
    });
  }
  
  // 4. Update draft state subdoc
  const draftStateRef = waveRef.collection("draft").doc("state");
  batch.set(draftStateRef, {
    phase: "nation",
    pickIndex: pickIndex,
    recentPicks: recentPicks,
    lastUpdated: Date.now()
  }, { merge: true });
  
  // 5. Optionally clear player picks
  if (options?.resetPicks) {
    for (const doc of teamsSnap.docs) {
      batch.update(doc.ref, {
        drafted_countries: [],
        drafted_countries_detailed: [],
        confidence_events: [] 
      });
    }
  }
  
  await batch.commit();
  console.log(`[Draft] Initialized Wave ${waveId} with ${participantIds.length} users`);
  
  return { participants: participantIds, draftOrder, pickIndex };
};

/**
 * Convenience wrapper for fixing a single league's Wave A.
 */
export const quickFixLeagueDraft = async (leagueId: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    const result = await initializeDraftState(leagueId, 'A', { shuffleOrder: false });
    return {
      success: true,
      message: `Fixed Wave A: ${result.participants.length} users synced.`,
      details: result
    };
  } catch (error: any) {
    console.error('[QuickFix] Error:', error);
    return { success: false, message: error.message || 'Unknown error' };
  }
};

/**
 * System-wide repair script to ensure all waves have correct participants.
 */
export const migrateFixBrokenDrafts = async (leagueId?: string): Promise<{
  leaguesFixed: number;
  wavesFixed: number;
  usersLinked: number;
}> => {
  const results = { leaguesFixed: 0, wavesFixed: 0, usersLinked: 0 };
  
  let leagues;
  if (leagueId) {
    const doc = await db.collection("leagues").doc(leagueId).get();
    leagues = doc.exists ? [doc] : [];
  } else {
    const snap = await db.collection("leagues").get();
    leagues = snap.docs;
  }
  
  for (const leagueDoc of leagues) {
    const lid = leagueDoc.id;
    
    // Get all teams for league
    const teamsSnap = await db.collection("leagues").doc(lid).collection("teams").get();
    if (teamsSnap.empty) continue;
    
    // Group users by wave
    const teamsByWave: Record<string, string[]> = {};
    teamsSnap.docs.forEach(doc => {
      const data = doc.data();
      const uid = data.user_id || doc.id;
      const wid = data.wave_id || 'A';
      if (!teamsByWave[wid]) teamsByWave[wid] = [];
      teamsByWave[wid].push(uid);
    });
    
    let leagueHasFixes = false;
    
    // Check each wave
    for (const [wid, userIds] of Object.entries(teamsByWave)) {
      const waveDocId = getWaveDocId(lid, wid);
      const waveRef = db.collection("waves").doc(waveDocId);
      const waveSnap = await waveRef.get();
      
      let needsUpdate = false;
      
      if (!waveSnap.exists) {
        // Create missing wave
        console.log(`[Migrate] Creating missing Wave ${wid} in League ${lid}`);
        await initializeDraftState(lid, wid);
        needsUpdate = true;
        results.wavesFixed++;
      } else {
        // Check for missing participants
        const waveData = waveSnap.data()!;
        const currentParts = waveData.participants || [];
        const missing = userIds.filter(id => !currentParts.includes(id));
        
        if (missing.length > 0) {
          console.log(`[Migrate] Adding ${missing.length} missing users to Wave ${wid}`);
          await waveRef.update({
            participants: [...currentParts, ...missing],
            draftOrder: [...(waveData.draftOrder || []), ...missing]
          });
          needsUpdate = true;
          results.wavesFixed++;
          results.usersLinked += missing.length;
        }
      }
      
      if (needsUpdate) leagueHasFixes = true;
    }
    
    if (leagueHasFixes) results.leaguesFixed++;
  }
  
  console.log('[Migrate] Complete:', results);
  return results;
};