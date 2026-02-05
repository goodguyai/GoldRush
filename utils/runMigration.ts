

/**
 * Console Migration Runner
 * 
 * To run this migration:
 * 1. Open browser console on the app
 * 2. Import and run:
 *    
 *    // Dry run first (see what would change)
 *    await window.runDraftMigration(true);
 *    
 *    // Then run for real
 *    await window.runDraftMigration(false);
 * 
 * Or for a specific league:
 *    await window.runDraftMigration(false, 'specific-league-id');
 */

export const runDraftMigration = async (dryRun: boolean = true, leagueId?: string | null) => {
  const { migrateFixBrokenDrafts } = await import('../services/databaseService');
  if (dryRun) {
    console.warn("Dry run is not supported by the migration script currently. Aborting to prevent data modification.");
    return { success: false, message: "Dry run not supported" };
  }
  return migrateFixBrokenDrafts(leagueId || undefined);
};

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).runDraftMigration = runDraftMigration;
}