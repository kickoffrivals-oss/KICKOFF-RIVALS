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
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    soundFx.playWhistle();
    const timer1 = setTimeout(() => {
      setShowStats(true);
      soundFx.playCashout();
    }, 400);
    const timer2 = setTimeout(() => setAnimationComplete(true), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const winRate = totalBets > 0 ? Math.round((wins / totalBets) * 100) : 0;
  const losses = Math.max(0, totalBets - wins);

  const handleContinue = () => {
    soundFx.playClick();
    onProceed();
  };

  return (
    <div className="min-h-screen stadium-bg text-white flex flex-col justify-between relative overflow-hidden">
      {/* Stadium Floodlights Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <RivalsLogo size="md" variant="full" className="text-white" />
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          MATCHDAY READY
        </div>
      </header>

      {/* Main Broadcast Player Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full">
          {/* EA FC Player Heraldry Header */}
          <div className="broadcast-card rounded-3xl p-8 border border-white/10 relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-black/80 text-center">
            {/* Ambient Background Aura */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Shield / Trophy Badge */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[2px] shadow-2xl shadow-amber-500/30 animate-float">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center">
                  <IconTrophy className="w-10 h-10 text-amber-400" />
                </div>
              </div>
              <span className="absolute -bottom-2 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider">
                VETERAN
              </span>
            </div>

            {/* Broadcast Salutation */}
            <div className="mb-2">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">
                OFFICIAL MATCHDAY ROSTER
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tight mt-1">
                WELCOME BACK, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">{username}</span>
              </h1>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
                Your arena status, streak multipliers, and matchday docket have been restored.
              </p>
            </div>

            {/* Stats Performance Hub */}
            {showStats && (
              <div className="mt-8 space-y-4 animate-slide-up">
                <div className="grid grid-cols-3 gap-3">
                  {/* Total Bets Card */}
                  <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 text-center group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <IconTarget className="w-3.5 h-3.5 text-blue-400" />
                      Matches
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white led-number">
                      {totalBets}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-1">
                      {wins}W / {losses}L
                    </div>
                  </div>

                  {/* Win Rate Card */}
                  <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 text-center bg-gradient-to-b from-emerald-500/10 to-transparent group hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <IconFlame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Win Rate
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-300 led-number">
                      {winRate}%
                    </div>
                    <div className="text-[10px] text-emerald-400/70 font-semibold mt-1">
                      Form Rating
                    </div>
                  </div>

                  {/* KOR Balance Card */}
                  <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 text-center bg-gradient-to-b from-amber-500/10 to-transparent group hover:border-amber-500/50 transition-all">
                    <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <IconZap className="w-3.5 h-3.5 text-amber-400" />
                      KOR Tokens
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 led-number">
                      {Math.floor(Number(korBalance) || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-amber-400/70 font-semibold mt-1">
                      Available Staking
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Launch Action Button */}
            <div className="mt-8">
              <button
                onClick={handleContinue}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-base uppercase tracking-wider italic",
                  "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950",
                  "hover:from-emerald-400 hover:to-teal-300 transition-all duration-300 hover:scale-[1.02] active:scale-98",
                  "shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3",
                  !animationComplete && "opacity-90",
                )}
              >
                <span>ENTER STADIUM ARENA</span>
                <IconChevronRight className="w-5 h-5 text-slate-950 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Broadcast Footer Notice */}
          <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Virtual Sports Engine Synchronized • Round in Progress</span>
          </div>
        </div>
      </main>

      {/* Broadcast Ticker Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-slate-500 text-xs border-t border-white/5 bg-slate-950/60 backdrop-blur-md">
        KickOff Rivals v2.0 • Decentralized Football Simulation & Prediction Engine
      </footer>
    </div>
  );
}

export default ReturningUserWelcome;
