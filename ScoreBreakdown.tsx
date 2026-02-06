
import React, { useState } from 'react';
import { User, OlympicEvent, MedalResult } from './types';
import { ChevronDown, Trophy, Zap, AlertTriangle, Flag } from './Icons';
import { calculateUserScore } from './scoringEngine';

interface ScoreBreakdownProps {
  user: User;
  events: OlympicEvent[];
  results: MedalResult[];
  compact?: boolean;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ 
  user, events, results, compact = false 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const { total, details, breakdown } = calculateUserScore(user, results, events);
  
  const medalDetails = details.filter(d => d.medal && !d.isPenalty);
  const penalties = details.filter(d => d.isPenalty);
  
  if (compact) {
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 hover:text-electric-600 transition-colors bg-gray-50 px-2 py-1 rounded-lg"
      >
        <span>🥇{breakdown.goldCount}</span>
        <span>🥈{breakdown.silverCount}</span>
        <span>🥉{breakdown.bronzeCount}</span>
        {breakdown.penaltyCount > 0 && (
          <span className="text-red-500 flex items-center gap-0.5">⚠️{breakdown.penaltyCount}</span>
        )}
      </button>
    );
  }
  
  return (
    <div className="neu-card p-5 space-y-4">
      {/* Header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-electric-50 rounded-xl flex items-center justify-center text-electric-600">
            <Trophy size={20} />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Score Breakdown
            </div>
            <div className="text-2xl font-black text-electric-600 italic">
              {total} pts
            </div>
          </div>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      {expanded && (
        <div className="space-y-4 pt-4 animate-fade-in">
          
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gold-50 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-gold-600">{breakdown.goldCount}</div>
              <div className="text-[8px] font-bold text-gold-500 uppercase">Gold</div>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-gray-500">{breakdown.silverCount}</div>
              <div className="text-[8px] font-bold text-gray-400 uppercase">Silver</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-orange-600">{breakdown.bronzeCount}</div>
              <div className="text-[8px] font-bold text-orange-500 uppercase">Bronze</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-red-600">{breakdown.penaltyCount}</div>
              <div className="text-[8px] font-bold text-red-500 uppercase">Penalties</div>
            </div>
          </div>
          
          {/* Detailed Event List */}
          {medalDetails.length > 0 && (
            <div className="space-y-2">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                Medal Points ({medalDetails.length} events)
              </div>
              {medalDetails.map((detail, idx) => (
                <div 
                  key={idx}
                  className="bg-white/60 rounded-2xl p-3 flex items-center gap-3"
                >
                  <div className="text-lg">
                    {detail.medal === 'Gold' ? '🥇' : detail.medal === 'Silver' ? '🥈' : '🥉'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">
                      {detail.eventName}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-2">
                      <span className="flex items-center gap-1 font-bold">
                        <Flag size={10} /> {detail.contributingCountry}
                      </span>
                      <span>•</span>
                      <span className={detail.roundMultiplier > 1 ? "text-electric-600 font-bold" : ""}>
                        {detail.roundMultiplier}x Round
                      </span>
                      {detail.isConfidence && (
                        <>
                          <span>•</span>
                          <span className="text-gold-600 font-black flex items-center gap-0.5">
                            <Zap size={10} /> 2x CB
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-electric-600">
                      +{detail.points}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Penalties */}
          {penalties.length > 0 && (
            <div className="space-y-2">
              <div className="text-[9px] font-black text-red-500 uppercase tracking-widest px-1 flex items-center gap-1">
                <AlertTriangle size={12} /> CB Penalties
              </div>
              {penalties.map((detail, idx) => (
                <div 
                  key={idx}
                  className="bg-red-50/80 rounded-2xl p-3 flex items-center gap-3"
                >
                  <div className="text-lg">⚠️</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-red-700 truncate">
                      {detail.eventName}
                    </div>
                    <div className="text-[10px] text-red-500">
                      No medals won in Confidence Boost event
                    </div>
                  </div>
                  <div className="text-lg font-black text-red-600">
                    {detail.points}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Formula Explanation */}
          <div className="neu-inset p-4 bg-electric-50/30 mt-4">
            <div className="text-[9px] font-black text-electric-600 uppercase tracking-widest mb-2">
              Scoring Formula
            </div>
            <div className="text-[11px] text-gray-600 leading-relaxed font-medium">
              <strong>Points = Medal Value × Round Multiplier × CB Bonus</strong>
              <div className="mt-1 space-y-0.5 text-[10px] opacity-80">
                <div>• Gold=5, Silver=3, Bronze=1</div>
                <div>• Rounds: 1x, 5x, 10x, 20x</div>
                <div>• Confidence Boost (CB): 2x Points (or -100 penalty)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreBreakdown;
