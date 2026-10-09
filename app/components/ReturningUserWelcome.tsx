import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import { IconTrophy, IconChevronRight, IconZap, IconCoins, IconFlame, IconTarget } from "./Icons";
import { soundFx } from "../lib/soundFx";

interface ReturningUserWelcomeProps {
  username: string;
  totalBets: number;
  wins: number;
  korBalance: number;
  onProceed: () => void;
}

export function ReturningUserWelcome({
  username,
  totalBets,
  wins,
  korBalance,
  onProceed,
}: ReturningUserWelcomeProps) {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    soundFx.playWhistle();
    const timer = setTimeout(() => {
      setShowStats(true);
      soundFx.playCashout();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const winRate = totalBets > 0 ? Math.round((wins / totalBets) * 100) : 0;
  const losses = Math.max(0, totalBets - wins);

  const handleContinue = () => {
    soundFx.playClick();
    onProceed();
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>MATCHDAY RE-ENTRY</span>
        </div>
      </header>

      {/* Main Broadcast Player Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-[#13171F] rounded-[6px] p-6 sm:p-7 border border-[#222938] shadow-2xl space-y-5 text-center">
            {/* Header Icon */}
            <div className="w-12 h-12 mx-auto rounded-[4px] bg-[#1B212D] border border-amber-500/40 flex items-center justify-center text-amber-400">
              <IconTrophy className="w-6 h-6" />
            </div>

            {/* Salutation */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Manager Session Restored
              </span>
              <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
                Welcome Back, {username}
              </h1>
              <p className="text-xs text-slate-400">
                Your performance stats and live matchday slips have been loaded.
              </p>
            </div>

            {/* Stats Performance Hub */}
            {showStats && (
              <div className="grid grid-cols-3 gap-2">
                {/* Total Bets Card */}
                <div className="bg-[#0A0D12] border border-[#222938] rounded-[4px] p-3 text-center">
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Matches
                  </span>
                  <p className="text-xl font-mono font-bold text-white tabular-nums">
                    {totalBets}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 tabular-nums">
                    {wins}W / {losses}L
                  </p>
                </div>

                {/* Win Rate Card */}
                <div className="bg-[#0A0D12] border border-[#222938] rounded-[4px] p-3 text-center">
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Win Rate
                  </span>
                  <p className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                    {winRate}%
                  </p>
                  <p className="text-xs text-emerald-500 font-mono mt-0.5">
                    Form Rating
                  </p>
                </div>

                {/* KOR Balance Card */}
                <div className="bg-[#0A0D12] border border-[#222938] rounded-[4px] p-3 text-center">
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    KOR Tokens
                  </span>
                  <p className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                    {Math.floor(Number(korBalance) || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-500/70 font-mono mt-0.5">
                    Winnings
                  </p>
                </div>
              </div>
            )}

            {/* Launch Action Button */}
            <button
              onClick={handleContinue}
              className="w-full h-11 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Enter Stadium Arena</span>
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3.5 text-center text-slate-500 text-xs border-t border-[#222938] bg-[#0A0D12]">
        KickOff Rivals • Continuous Matchday Simulation
      </footer>
    </div>
  );
}

export default ReturningUserWelcome;
