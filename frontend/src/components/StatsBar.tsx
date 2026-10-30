import React from 'react';
import { GameStats } from '../types';
import { Trophy, Flame, Target, Percent } from 'lucide-react';

interface StatsBarProps {
  stats: GameStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const winRate = stats.totalRolls > 0 ? Math.round((stats.wins / stats.totalRolls) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-mono text-stone-400 block uppercase">Total Rolls</span>
          <span className="text-xl font-bold font-mono text-white">{stats.totalRolls}</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-mono text-stone-400 block uppercase">Victories</span>
          <span className="text-xl font-bold font-mono text-emerald-300">{stats.wins}</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Percent className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-mono text-stone-400 block uppercase">Win Rate</span>
          <span className="text-xl font-bold font-mono text-cyan-300">{winRate}%</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-mono text-stone-400 block uppercase">Best Streak</span>
          <span className="text-xl font-bold font-mono text-orange-300">{stats.bestStreak}</span>
        </div>
      </div>
    </div>
  );
};

