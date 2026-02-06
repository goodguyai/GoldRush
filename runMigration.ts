
/**
 * Console Migration Runner
 */
export const runDraftMigration = async (dryRun: boolean = true, leagueId?: string | null) => {
  const { migrateFixBrokenDrafts } = await import('./databaseService');
  if (dryRun) {
    console.warn("Dry run is not supported by the migration script currently. Aborting to prevent data modification.");
    return { success: false, message: "Dry run not supported" };
  }
  return migrateFixBrokenDrafts(leagueId || undefined);
};

if (typeof window !== 'undefined') {
  (window as any).runDraftMigration = runDraftMigration;
}
