
/**
 * EMERGENCY REPAIR SCRIPT FOR GOLD HUNT
 */
import { db } from './firebase';
import firebase from 'firebase/compat/app';

const getWaveDocId = (leagueId: string, waveId: string) => `${leagueId}_${waveId}`;

export interface DiagnosisResult {
  leagueId: string;
  leagueName: string;
  commissionerId: string;
  issues: string[];
  waves: {
    waveId: string;
    exists: boolean;
    participantCount: number;
    draftOrderCount: number;
    hasState: boolean;
    teamsInWave: string[];
    missingFromParticipants: string[];
  }[];
  teams: {
    odId: string;
    name: string;
    waveId: string;
    isBot: boolean;
  }[];
}

export const diagnoseLeague = async (leagueId: string): Promise<DiagnosisResult> => {
  console.log(`\n🔍 DIAGNOSING LEAGUE: ${leagueId}\n${'='.repeat(50)}`);
  
  const issues: string[] = [];
  
  // 1. Get league document
  const leagueDoc = await db.collection('leagues').doc(leagueId).get();
  if (!leagueDoc.exists) {
    throw new Error(`League ${leagueId} does not exist!`);
  }
  
  const leagueData = leagueDoc.data()!;
  const settings = leagueData.settings || {};
  const commissionerId = leagueData.commissioner_id;
  
  console.log(`League: ${settings.leagueName || 'Unnamed'}`);
  console.log(`Commissioner: ${commissionerId}`);
  
  // 2. Get all teams
  const teamsSnap = await db.collection('leagues').doc(leagueId).collection('teams').get();
  const teams = teamsSnap.docs.map(doc => {
    const d = doc.data();
    return {
      odId: d.user_id || doc.id,
      name: d.name || 'Unknown',
      waveId: d.wave_id || 'A',
      isBot: d.is_bot || false
    };
  });
  
  console.log(`\nTeams Found: ${teams.length}`);
  teams.forEach(t => console.log(`  - ${t.name} (${t.odId}) in Wave ${t.waveId} ${t.isBot ? '[BOT]' : ''}`));
  
  const commTeam = teams.find(t => t.odId === commissionerId);
  if (!commTeam) {
    issues.push(`❌ Commissioner ${commissionerId} has NO team document!`);
  }
  
  // 3. Get all waves
  const wavesSnap = await db.collection('waves').where('leagueId', '==', leagueId).get();
  const waveResults: DiagnosisResult['waves'] = [];
  
  const teamsByWave: Record<string, string[]> = {};
  teams.forEach(t => {
    if (!teamsByWave[t.waveId]) teamsByWave[t.waveId] = [];
    teamsByWave[t.waveId].push(t.odId);
  });
  
  const expectedWaveIds = Object.keys(teamsByWave);
  if (expectedWaveIds.length === 0) {
    expectedWaveIds.push('A'); 
  }
  
  console.log(`\nWave Analysis:`);
  
  for (const waveId of expectedWaveIds) {
    const waveDocId = getWaveDocId(leagueId, waveId);
    const waveDoc = wavesSnap.docs.find(d => d.id === waveDocId);
    
    const teamsInWave = teamsByWave[waveId] || [];
    
    if (!waveDoc) {
      issues.push(`❌ Wave ${waveId} document MISSING!`);
      waveResults.push({
        waveId,
        exists: false,
        participantCount: 0,
        draftOrderCount: 0,
        hasState: false,
        teamsInWave,
        missingFromParticipants: teamsInWave
      });
      console.log(`  Wave ${waveId}: ❌ MISSING (${teamsInWave.length} teams should be here)`);
      continue;
    }
    
    const waveData = waveDoc.data()!;
    const participants = waveData.participants || [];
    const draftOrder = waveData.draftOrder || [];
    
    const stateDoc = await db.collection('waves').doc(waveDocId).collection('draft').doc('state').get();
    
    const missingFromParticipants = teamsInWave.filter(id => !participants.includes(id));
    
    if (missingFromParticipants.length > 0) {
      issues.push(`❌ Wave ${waveId}: ${missingFromParticipants.length} users missing from participants array`);
    }
    
    if (!stateDoc.exists) {
      issues.push(`❌ Wave ${waveId}: draft/state subdocument MISSING!`);
    }
    
    waveResults.push({
      waveId,
      exists: true,
      participantCount: participants.length,
      draftOrderCount: draftOrder.length,
      hasState: stateDoc.exists,
      teamsInWave,
      missingFromParticipants
    });
    
    console.log(`  Wave ${waveId}: ${participants.length} participants, ${teamsInWave.length} teams`);
    if (missingFromParticipants.length > 0) {
      console.log(`    ⚠️ Missing from participants: ${missingFromParticipants.join(', ')}`);
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`ISSUES FOUND: ${issues.length}`);
  issues.forEach(i => console.log(i));
  
  return {
    leagueId,
    leagueName: settings.leagueName || 'Unnamed',
    commissionerId,
    issues,
    waves: waveResults,
    teams
  };
};

export const repairLeague = async (leagueId: string): Promise<{ fixed: string[], failed: string[] }> => {
  console.log(`\n🔧 REPAIRING LEAGUE: ${leagueId}\n${'='.repeat(50)}`);
  
  const fixed: string[] = [];
  const failed: string[] = [];
  
  const diagnosis = await diagnoseLeague(leagueId);
  
  if (diagnosis.issues.length === 0) {
    console.log('✅ No issues found - league is healthy!');
    return { fixed, failed };
  }
  
  const leagueDoc = await db.collection('leagues').doc(leagueId).get();
  const leagueData = leagueDoc.data()!;
  const settings = leagueData.settings || {};
  
  for (const wave of diagnosis.waves) {
    const waveDocId = getWaveDocId(leagueId, wave.waveId);
    const waveRef = db.collection('waves').doc(waveDocId);
    
    try {
      if (!wave.exists) {
        console.log(`Creating missing wave ${wave.waveId}...`);
        
        const legacyWave = settings.waves?.find((w: any) => w.id === wave.waveId) || {};
        
        await waveRef.set({
          id: wave.waveId,
          leagueId: leagueId,
          name: legacyWave.name || `Wave ${wave.waveId}`,
          inviteCode: legacyWave.inviteCode || `WV-${wave.waveId}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
          draftStartTime: legacyWave.draftStartTime || Date.now() + 86400000,
          status: legacyWave.status || 'scheduled',
          participants: wave.teamsInWave,
          draftOrder: wave.teamsInWave,
          pickIndex: legacyWave.pickIndex || 0,
          recentPicks: legacyWave.recentPicks || [],
          draftSettings: legacyWave.draftSettings || {
            pickTimerDuration: 60,
            autoDraftBehavior: 'random',
            skipThreshold: 3
          }
        });
        
        await waveRef.collection('draft').doc('state').set({
          phase: 'nation',
          pickIndex: legacyWave.pickIndex || 0,
          recentPicks: legacyWave.recentPicks || [],
          lastUpdated: Date.now()
        });
        
        fixed.push(`Created wave ${wave.waveId} with ${wave.teamsInWave.length} participants`);
      } else if (wave.missingFromParticipants.length > 0) {
        console.log(`Adding ${wave.missingFromParticipants.length} missing users to wave ${wave.waveId}...`);
        
        const waveDoc = await waveRef.get();
        const waveData = waveDoc.data()!;
        
        const newParticipants = [...(waveData.participants || []), ...wave.missingFromParticipants];
        const newDraftOrder = [...(waveData.draftOrder || []), ...wave.missingFromParticipants];
        
        await waveRef.update({
          participants: newParticipants,
          draftOrder: newDraftOrder
        });
        
        fixed.push(`Added ${wave.missingFromParticipants.length} users to wave ${wave.waveId}`);
      }
      
      if (!wave.hasState && wave.exists) {
        const waveDoc = await waveRef.get();
        const waveData = waveDoc.data()!;
        
        await waveRef.collection('draft').doc('state').set({
          phase: 'nation',
          pickIndex: waveData.pickIndex || 0,
          recentPicks: waveData.recentPicks || [],
          lastUpdated: Date.now()
        });
        
        fixed.push(`Created draft/state for wave ${wave.waveId}`);
      }
    } catch (e: any) {
      console.error(`Failed to fix wave ${wave.waveId}:`, e);
      failed.push(`Wave ${wave.waveId}: ${e.message}`);
    }
  }
  
  const commTeam = diagnosis.teams.find(t => t.odId === diagnosis.commissionerId);
  if (!commTeam) {
    try {
      const firstWaveId = diagnosis.waves[0]?.waveId || 'A';
      await db.collection('leagues').doc(leagueId).collection('teams').doc(diagnosis.commissionerId).set({
        user_id: diagnosis.commissionerId,
        name: 'Commissioner',
        wave_id: firstWaveId,
        drafted_countries: [],
        drafted_countries_detailed: [],
        confidence_events: [],
        purchased_boosts: 0,
        role: 'commissioner',
        is_bot: false,
        created_at: Date.now()
      });
      
      fixed.push(`Created commissioner team document`);
    } catch (e: any) {
      failed.push(`Commissioner team: ${e.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`REPAIR COMPLETE`);
  console.log(`Fixed: ${fixed.length}`);
  fixed.forEach(f => console.log(`  ✅ ${f}`));
  if (failed.length > 0) {
    console.log(`Failed: ${failed.length}`);
    failed.forEach(f => console.log(`  ❌ ${f}`));
  }
  
  return { fixed, failed };
};

export const repairAllLeagues = async (): Promise<{ leagueId: string; fixed: string[]; failed: string[] }[]> => {
  console.log(`\n🔧 REPAIRING ALL LEAGUES\n${'='.repeat(50)}`);
  
  const results: { leagueId: string; fixed: string[]; failed: string[] }[] = [];
  
  const leaguesSnap = await db.collection('leagues').get();
  console.log(`Found ${leaguesSnap.size} leagues`);
  
  for (const leagueDoc of leaguesSnap.docs) {
    const leagueId = leagueDoc.id;
    console.log(`\nProcessing: ${leagueId}`);
    
    try {
      const result = await repairLeague(leagueId);
      results.push({ leagueId, ...result });
    } catch (e: any) {
      console.error(`Failed to repair ${leagueId}:`, e);
      results.push({ leagueId, fixed: [], failed: [e.message] });
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`ALL REPAIRS COMPLETE`);
  const totalFixed = results.reduce((sum, r) => sum + r.fixed.length, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed.length, 0);
  console.log(`Total Fixed: ${totalFixed}`);
  console.log(`Total Failed: ${totalFailed}`);
  
  return results;
};

if (typeof window !== 'undefined') {
  (window as any).diagnoseLeague = diagnoseLeague;
  (window as any).repairLeague = repairLeague;
  (window as any).repairAllLeagues = repairAllLeagues;
}

export default {
  diagnoseLeague,
  repairLeague,
  repairAllLeagues
};
