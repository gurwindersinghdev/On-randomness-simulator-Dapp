import React from 'react';
import { DiceRollResult } from '../types';
import { History, CheckCircle2, XCircle } from 'lucide-react';

interface RollHistoryProps {
  history: DiceRollResult[];
  onClear: () => void;
}

export const RollHistory: React.FC<RollHistoryProps> = ({ history, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-stone-500">
        <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">No rolls recorded yet.</p>
        <p className="text-xs text-stone-600 mt-0.5">Pick a number and roll the dice to begin!</p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-base">Recent Roll History</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-stone-500 hover:text-stone-300 font-mono transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
              item.won
                ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                : 'bg-stone-950/70 border-stone-800/80 text-stone-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.won ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-stone-600 shrink-0" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    Rolled {item.rolled}
                  </span>
                  <span className="text-stone-400">
                    (Guessed: <strong className="text-amber-300">{item.guess}</strong>)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono mt-0.5">
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span className="truncate max-w-[120px] sm:max-w-[200px]">ID: {item.id}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono ${
                  item.won
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {item.won ? 'Won (+6x)' : 'Miss'}
              </span>
              <span className="block text-[10px] text-stone-500 mt-1">
                {item.isOnChain ? 'Sui On-Chain' : 'Simulated'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

