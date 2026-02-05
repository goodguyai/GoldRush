
import React, { act } from 'react';
import { Settings, Edit3, Check, Clock, Zap, Activity, Trophy } from './Icons';

interface PhaseIndicatorProps {
  phase: string;
  waveStatus?: string;
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ phase, waveStatus }) => {
  const getPhaseInfo = () => {
    if (phase === 'setup') {
      return { label: 'Setup', color: 'bg-gray-200 text-gray-600', icon: Settings };
    }
    if (phase === 'phase1_nation_draft') {
      if (waveStatus === 'live') {
        return { label: 'Draft Live', color: 'bg-green-100 text-green-700 animate-pulse', icon: Edit3 };
      }
      if (waveStatus === 'completed') {
        return { label: 'Draft Done', color: 'bg-blue-100 text-blue-600', icon: Check };
      }
      return { label: 'Pre-Draft', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
    }
    if (phase === 'phase2_confidence_picks') {
      return { label: 'CBs Open', color: 'bg-purple-100 text-purple-700', icon: Zap };
    }
    if (phase === 'phase3_games_live') {
      return { label: 'Games Live', color: 'bg-red-100 text-red-700 animate-pulse', icon: Activity };
    }
    if (phase === 'phase4_complete') {
      return { label: 'Complete', color: 'bg-gold-100 text-gold-700', icon: Trophy };
    }
    return { label: phase, color: 'bg-gray-100 text-gray-500', icon: Activity };
  };

  const { label, color, icon: Icon } = getPhaseInfo();

  return (
    <div className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${color}`}>
      <Icon size={10} />
      {label}
    </div>
  );
};

export default PhaseIndicator;
