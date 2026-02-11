
import React, { useState, useMemo } from 'react';
import { User, OlympicEvent, MedalResult, ScoreBreakdown } from './types';
import { Trophy, Globe, Waves, Flag, Zap, TrendingUp, Flame, ChevronDown, ChevronRight, Activity } from './Icons';
import { COUNTRY_COLORS } from './olympicCountryColors';

interface LeaderboardProps {
  users: User[];
  currentUserId: string;
  currentUserPoolId: string;
  onUserSelect: (userId: string) => void;
  events?: OlympicEvent[];
  results?: MedalResult[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUserId, currentUserPoolId, onUserSelect, events = [], results = [] }) => {
  const [filterMode, setFilterMode] = useState<'wave' | 'global'>('wave');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showFeed, setShowFeed] = useState(true);

  const filteredUsers = filterMode === 'wave'
    ? users.filter(u => u.poolId === currentUserPoolId)
    : users;

  const sortedUsers = [...filteredUsers].sort((a, b) => b.totalScore - a.totalScore);

  // Recent results feed — last 5 finished events
  const recentResults = useMemo(() => {
    return [...results]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 5)
      .map(r => {
        const event = events.find(e => e.id === r.eventId);
        return { ...r, event };
      });
  }, [results, events]);

  const finishedCount = results.length;
  const totalEvents = events.length;

  // Top medal countries across all results
  const countryMedalTally = useMemo(() => {
    const tally: Record<string, { gold: number; silver: number; bronze: number; total: number }> = {};
    for (const r of results) {
      for (const [medal, code] of [['gold', r.gold], ['silver', r.silver], ['bronze', r.bronze]] as const) {
        if (!code) continue;
        if (!tally[code]) tally[code] = { gold: 0, silver: 0, bronze: 0, total: 0 };
        tally[code][medal]++;
        tally[code].total++;
      }
    }
    return Object.entries(tally).sort((a, b) => b[1].gold - a[1].gold || b[1].total - a[1].total).slice(0, 5);
  }, [results]);

  const getCountryColor = (code: string) => COUNTRY_COLORS[code]?.primaryColor || '#6B7280';

  return (
    <div className="flex flex-col min-h-full pb-24">

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-neu-base/95 backdrop-blur-sm pt-4 pb-2 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Title row with live pulse */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase italic text-gray-900 tracking-tight leading-none">
                Rankings
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {results.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live</span>
                  </span>
                )}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {finishedCount}/{totalEvents} Events
                </span>
              </div>
            </div>
            {/* Mini medal tally — top countries */}
            {countryMedalTally.length > 0 && (
              <div className="flex items-center gap-1">
                {countryMedalTally.slice(0, 3).map(([code, tally]) => (
                  <div key={code} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/60 border border-gray-100">
                    <span className="text-[10px] font-black" style={{ color: getCountryColor(code) }}>{code}</span>
                    <span className="text-[9px] font-bold text-yellow-600">{tally.gold}g</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Switch */}
          <div className="neu-inset p-1 rounded-2xl flex relative max-w-xs mx-auto">
            <button
              onClick={() => setFilterMode('wave')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                filterMode === 'wave'
                  ? 'bg-white shadow-md text-electric-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Waves size={14} /> My Division
            </button>
            <button
              onClick={() => setFilterMode('global')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                filterMode === 'global'
                  ? 'bg-white shadow-md text-electric-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Globe size={14} /> Global
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 max-w-2xl mx-auto w-full space-y-3">

        {/* ── Recent Activity Feed ── */}
        {recentResults.length > 0 && (
          <div className="neu-card p-3 space-y-2">
            <button
              onClick={() => setShowFeed(!showFeed)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-electric-600" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recent Results</span>
              </div>
              {showFeed ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
            </button>

            {showFeed && (
              <div className="space-y-1.5 pt-1">
                {recentResults.map(r => (
                  <div key={r.eventId} className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl bg-gray-50/80">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-gray-800 truncate">
                        {r.event?.name || r.eventId}
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold truncate">{r.event?.sport}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-50 border border-yellow-200">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                        <span className="text-[10px] font-black" style={{ color: getCountryColor(r.gold) }}>{r.gold}</span>
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-50 border border-gray-200">
                        <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
                        <span className="text-[10px] font-black" style={{ color: getCountryColor(r.silver) }}>{r.silver}</span>
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200">
                        <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
                        <span className="text-[10px] font-black" style={{ color: getCountryColor(r.bronze) }}>{r.bronze}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Player Rankings ── */}
        {sortedUsers.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          const rank = index + 1;
          const breakdown: ScoreBreakdown = user.scoreBreakdown || { goldCount: 0, silverCount: 0, bronzeCount: 0, medalPoints: 0, confidenceBonuses: 0, penalties: 0, penaltyCount: 0, byCountry: {}, bySport: {} };
          const isExpanded = expandedUser === user.id;

          return (
            <div key={user.id}>
              <button
                onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                className={`w-full flex items-center p-3 rounded-2xl relative overflow-visible transition-all active:scale-[0.99] ${
                  isCurrentUser
                    ? 'neu-card ring-2 ring-electric-500 z-10'
                    : 'neu-card'
                } ${isExpanded ? 'rounded-b-none' : ''}`}
              >
                {/* Rank Badge */}
                <div className={`mr-3 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg italic shadow-inner ${
                  rank === 1 ? 'bg-gold-100 text-gold-600' :
                  rank === 2 ? 'bg-gray-200 text-gray-600' :
                  rank === 3 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {rank === 1 ? <Trophy size={18} /> : rank}
                </div>

                {/* User Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-sm truncate max-w-[120px] sm:max-w-xs ${isCurrentUser ? 'text-electric-600' : 'text-gray-900'}`}>
                      {user.name}
                    </span>
                    {user.isBot && (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[8px] font-black rounded uppercase border border-purple-200 flex-shrink-0">
                        Bot
                      </span>
                    )}
                    {filterMode === 'global' && (
                      <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-black tracking-wider flex-shrink-0 border border-gray-200">
                        {user.poolId}
                      </span>
                    )}
                  </div>

                  {/* Country portfolio mini-badges */}
                  <div className="flex items-center gap-1.5 mt-1">
                    {user.draftedCountries.map(code => (
                      <span
                        key={code}
                        className="text-[9px] font-black px-1.5 py-0.5 rounded-md border"
                        style={{
                          color: getCountryColor(code),
                          borderColor: getCountryColor(code) + '40',
                          backgroundColor: getCountryColor(code) + '10',
                        }}
                      >
                        {code}
                      </span>
                    ))}
                    {user.draftedCountries.length === 0 && (
                      <span className="text-[9px] font-bold text-gray-300 italic">No countries</span>
                    )}
                  </div>
                </div>

                {/* Score Box */}
                <div className="pl-2">
                  <div className={`rounded-xl py-2 px-3 flex flex-col items-center justify-center border shadow-sm min-w-[88px] ${
                    isCurrentUser ? 'bg-electric-50 border-electric-100' : 'bg-white border-gray-100'
                  }`}>
                    <div className={`text-2xl font-black italic tracking-tighter leading-none mb-1 ${isCurrentUser ? 'text-electric-600' : 'text-gray-900'}`}>
                      {user.totalScore}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                      <span className="flex items-center gap-px">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
                        {breakdown.goldCount}
                      </span>
                      <span className="flex items-center gap-px">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block"></span>
                        {breakdown.silverCount}
                      </span>
                      <span className="flex items-center gap-px">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
                        {breakdown.bronzeCount}
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* ── Expanded Detail Panel ── */}
              {isExpanded && (
                <div className={`neu-card rounded-t-none border-t-0 -mt-px px-4 pb-4 pt-3 space-y-3 ${isCurrentUser ? 'ring-2 ring-electric-500 ring-t-0' : ''}`}>
                  {/* Score breakdown bar */}
                  {user.totalScore !== 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-gray-400">
                        <span>Score Breakdown</span>
                        <span>{user.totalScore} pts</span>
                      </div>
                      <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
                        {breakdown.medalPoints > 0 && (
                          <div
                            className="bg-electric-500 transition-all duration-500"
                            style={{ width: `${Math.max((breakdown.medalPoints / (breakdown.medalPoints + Math.abs(breakdown.penalties) + breakdown.confidenceBonuses || 1)) * 100, 5)}%` }}
                          />
                        )}
                        {breakdown.confidenceBonuses > 0 && (
                          <div
                            className="bg-yellow-400 transition-all duration-500"
                            style={{ width: `${Math.max((breakdown.confidenceBonuses / (breakdown.medalPoints + Math.abs(breakdown.penalties) + breakdown.confidenceBonuses || 1)) * 100, 5)}%` }}
                          />
                        )}
                        {breakdown.penalties < 0 && (
                          <div
                            className="bg-red-400 transition-all duration-500"
                            style={{ width: `${Math.max((Math.abs(breakdown.penalties) / (breakdown.medalPoints + Math.abs(breakdown.penalties) + breakdown.confidenceBonuses || 1)) * 100, 5)}%` }}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-bold">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-electric-500 inline-block"></span> Medals {breakdown.medalPoints}</span>
                        {breakdown.confidenceBonuses > 0 && (
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span> CB +{breakdown.confidenceBonuses}</span>
                        )}
                        {breakdown.penalties < 0 && (
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Penalty {breakdown.penalties}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Country performance */}
                  {Object.keys(breakdown.byCountry || {}).length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Country Performance</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(breakdown.byCountry)
                          .sort((a, b) => b[1] - a[1])
                          .map(([code, pts]) => (
                            <div
                              key={code}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
                              style={{
                                borderColor: getCountryColor(code) + '30',
                                backgroundColor: getCountryColor(code) + '08',
                              }}
                            >
                              <span className="text-[11px] font-black" style={{ color: getCountryColor(code) }}>{code}</span>
                              <span className="text-[11px] font-black text-gray-700">{pts > 0 ? '+' : ''}{pts}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                      <Flag size={10} /> {user.draftedCountries.length}/4 countries
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                      <Zap size={10} /> {user.confidenceEvents.length} CB
                    </div>
                    {breakdown.penaltyCount > 0 && (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-red-400 uppercase tracking-wide">
                        <Flame size={10} /> {breakdown.penaltyCount} miss
                      </div>
                    )}
                  </div>

                  {/* View full team button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onUserSelect(user.id); }}
                    className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-electric-600 bg-electric-50 border border-electric-100 transition-all hover:bg-electric-100 active:scale-[0.98]"
                  >
                    View Full Portfolio
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {sortedUsers.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <TrendingUp size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold text-gray-400">No players found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
