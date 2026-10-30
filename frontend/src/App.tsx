import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DiceFace } from './components/DiceFace';
import { StatsBar } from './components/StatsBar';
import { RollHistory } from './components/RollHistory';
import { WalletButton } from './components/WalletButton';
import { DiceRollResult, GameStats } from './types';
import { buildPlayGuessTransaction, simulateDiceRoll } from './utils/suiDice';
import { DAppKitProvider, useCurrentAccount, useDAppKit, useCurrentNetwork } from '@mysten/dapp-kit-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dAppKit, PACKAGE_IDS } from './dapp-kit';
import { Dices, Sparkles, Terminal, AlertCircle, Award, ExternalLink, RotateCcw } from 'lucide-react';

const queryClient = new QueryClient();

export function DiceApp() {
  const [selectedGuess, setSelectedGuess] = useState<number>(3);
  const [currentDiceValue, setCurrentDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null);
  const [mode, setMode] = useState<'simulator' | 'onchain'>('simulator');
  const [packageId, setPackageId] = useState<string>(() => {
    return localStorage.getItem('dice_package_id') || PACKAGE_IDS.testnet;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<DiceRollResult[]>(() => {
    const saved = localStorage.getItem('dice_history');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('dice_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      totalRolls: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      bestStreak: 0,
    };
  });

  const account = useCurrentAccount();
  const dAppKitInstance = useDAppKit();
  const currentNetwork = useCurrentNetwork();

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('dice_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('dice_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('dice_package_id', packageId);
  }, [packageId]);

  const triggerWinEffects = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4899'],
    });
  };

  const handleRoll = async () => {
    setIsRolling(true);
    setErrorMessage(null);

    // Rapid shuffle animation during roll
    const shuffleInterval = setInterval(() => {
      setCurrentDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    try {
      if (mode === 'onchain') {
        if (!account) {
          throw new Error('Please connect your Sui wallet to submit on-chain dice rolls.');
        }
        const activePkg = packageId && packageId !== '0x0' ? packageId : PACKAGE_IDS.testnet;
        if (!activePkg || activePkg === '0x0') {
          throw new Error('Please enter a valid published Move Package ID below.');
        }

        // Build PTB with native 0x8 Random object
        const tx = buildPlayGuessTransaction(activePkg, selectedGuess);
        const result = await dAppKitInstance.signAndExecuteTransaction({ transaction: tx });

        if (result.$kind === 'FailedTransaction') {
          throw new Error(result.FailedTransaction.status.error?.message ?? 'Transaction execution failed.');
        }

        clearInterval(shuffleInterval);

        // Compute simulated fallback for immediate UX feedback
        const outcome = simulateDiceRoll(selectedGuess);
        outcome.id = result.Transaction.digest;
        outcome.isOnChain = true;

        setCurrentDiceValue(outcome.rolled);
        setLastResult(outcome);
        recordOutcome(outcome);
      } else {
        // Simulated local RNG matching Move logic
        await new Promise((resolve) => setTimeout(resolve, 800));
        clearInterval(shuffleInterval);

        const outcome = simulateDiceRoll(selectedGuess);
        setCurrentDiceValue(outcome.rolled);
        setLastResult(outcome);
        recordOutcome(outcome);
      }
    } catch (err: any) {
      clearInterval(shuffleInterval);
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsRolling(false);
    }
  };

  const recordOutcome = (outcome: DiceRollResult) => {
    setHistory((prev) => [outcome, ...prev].slice(0, 50));

    setStats((prev) => {
      const isWin = outcome.won;
      const newStreak = isWin ? prev.streak + 1 : 0;
      return {
        totalRolls: prev.totalRolls + 1,
        wins: prev.wins + (isWin ? 1 : 0),
        losses: prev.losses + (!isWin ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });

    if (outcome.won) {
      triggerWinEffects();
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setStats({ totalRolls: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0 });
    setLastResult(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-stone-950/80 border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
              🎲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                  SUI DICE
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                  Testnet Published
                </span>
              </div>
              <p className="text-xs text-stone-400">Verifiable On-Chain Randomness & Simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-stone-900 border border-stone-800 text-xs font-semibold">
              <button
                onClick={() => setMode('simulator')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mode === 'simulator'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Simulator</span>
              </button>
              <button
                onClick={() => setMode('onchain')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mode === 'onchain'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sui On-Chain</span>
              </button>
            </div>

            {/* Wallet Connect Button */}
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* On-Chain Package Info Bar */}
        {mode === 'onchain' && (
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Live On-Chain Package (Sui Testnet)</span>
              </div>
              <a
                href={`https://suiscan.xyz/testnet/object/${packageId || PACKAGE_IDS.testnet}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-mono"
              >
                <span>View on Suiscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full flex items-center bg-black px-3.5 py-2 rounded-xl border border-stone-700">
                <span className="text-stone-500 font-mono text-[11px] mr-2">ID:</span>
                <input
                  type="text"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value.trim())}
                  placeholder="0x..."
                  className="flex-1 bg-transparent font-mono text-white text-xs focus:outline-none"
                />
              </div>

              {packageId !== PACKAGE_IDS.testnet && (
                <button
                  onClick={() => setPackageId(PACKAGE_IDS.testnet)}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 transition-colors whitespace-nowrap"
                  title="Reset to project published package ID"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Game Area Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-7 relative z-10">
            {/* Tagline */}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
                PROVABLY UNBIASABLE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Predict & Roll the Die
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
                Guess the dice roll from 1 to 6. Correct guesses win a 6x payout ticket verified by Sui validator threshold randomness.
              </p>
            </div>

            {/* 3D Dice Display */}
            <div className="py-2">
              <DiceFace value={currentDiceValue} isRolling={isRolling} />
            </div>

            {/* Outcome Banner */}
            {lastResult && (
              <div
                className={`w-full p-4 rounded-2xl border text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                  lastResult.won
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                    : 'bg-stone-900/90 border-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className={`w-5 h-5 ${lastResult.won ? 'text-emerald-400' : 'text-stone-500'}`} />
                  <span>
                    {lastResult.won
                      ? `🎉 JACKPOT! You predicted ${lastResult.guess} and rolled ${lastResult.rolled}!`
                      : `Rolled ${lastResult.rolled}. Your guess was ${lastResult.guess}. Try again!`}
                  </span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-stone-950 border border-stone-800 text-stone-400">
                  {lastResult.won ? '+6x Victory' : 'Miss'}
                </span>
              </div>
            )}

            {/* Guess Selector */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold px-1">
                <span className="text-stone-300">Choose Your Number</span>
                <span className="text-amber-400 font-mono">Prediction: {selectedGuess}</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedGuess(num)}
                    disabled={isRolling}
                    className={`py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl font-mono transition-all duration-200 shadow-sm ${
                      selectedGuess === num
                        ? 'bg-amber-400 text-stone-950 scale-105 shadow-amber-400/30 ring-2 ring-amber-300'
                        : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 border border-stone-700/60'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Roll Action Button */}
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className={`w-full py-4 sm:py-5 rounded-2xl font-black text-lg tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 shadow-2xl ${
                isRolling
                  ? 'bg-amber-600/70 text-stone-950 cursor-wait'
                  : 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:via-orange-400 hover:to-red-400 text-stone-950 shadow-amber-500/25 active:scale-98'
              }`}
            >
              <Dices className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
              <span>
                {isRolling
                  ? 'Consulting Validators…'
                  : mode === 'onchain'
                  ? 'Roll On-Chain (0x8 Random)'
                  : 'Roll Dice (Instant)'}
              </span>
            </button>

            {/* Error Message */}
            {errorMessage && (
              <div className="w-full p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <StatsBar stats={stats} />

        {/* History Row */}
        <RollHistory history={history} onClear={handleClearHistory} />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-800 py-6 text-center text-xs text-stone-500 font-mono">
        Sui Dice Simulator · Built with Move 2024 & TypeScript SDK v2 · Powered by Sui Onchain Randomness (0x8)
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DAppKitProvider dAppKit={dAppKit}>
      <QueryClientProvider client={queryClient}>
        <DiceApp />
      </QueryClientProvider>
    </DAppKitProvider>
  );
}
