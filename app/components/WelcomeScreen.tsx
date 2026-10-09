import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import {
  IconSparkles,
  IconCoins,
  IconTrophy,
  IconChevronRight,
  IconGift,
  IconZap,
} from "./Icons";
import { soundFx } from "../lib/soundFx";

interface WelcomeScreenProps {
  username: string;
  onProceed: () => void;
}

export function WelcomeScreen({
  username,
  onProceed,
}: WelcomeScreenProps) {
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    soundFx.playGoal();
    const timer = setTimeout(() => {
      setShowRewards(true);
      soundFx.playCashout();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    soundFx.playClick();
    onProceed();
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>STEP 4 OF 4: STADIUM ACTIVATION</span>
        </div>
      </header>

      {/* Center Welcome Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-[#13171F] rounded-[6px] p-6 sm:p-7 border border-[#222938] shadow-2xl space-y-5 text-center">
            {/* Header Icon */}
            <div className="w-12 h-12 mx-auto rounded-[4px] bg-[#1B212D] border border-amber-500/40 flex items-center justify-center text-amber-400">
              <IconGift className="w-6 h-6" />
            </div>

            {/* Salutation */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Registration Confirmed
              </span>
              <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
                Welcome, {username}
              </h1>
              <p className="text-xs text-slate-400">
                Your manager account is ready with your starter matchday grant.
              </p>
            </div>

            {/* Starter Bonus Hub */}
            {showRewards && (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Coins Bonus */}
                <div className="bg-[#0A0D12] border border-[#222938] rounded-[4px] p-3 text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Play Coins
                  </span>
                  <p className="text-xl font-mono font-bold text-white tabular-nums">
                    5,000
                  </p>
                  <p className="text-xs text-slate-500 uppercase mt-0.5">
                    Starter Stake
                  </p>
                </div>

                {/* KOR Bonus */}
                <div className="bg-[#0A0D12] border border-[#222938] rounded-[4px] p-3 text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    KOR Tokens
                  </span>
                  <p className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                    1,000
                  </p>
                  <p className="text-xs text-slate-500 uppercase mt-0.5">
                    Reward Reserve
                  </p>
                </div>
              </div>
            )}

            {/* Launch Action Button */}
            <button
              onClick={handleStart}
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
        KickOff Rivals • Official Matchday Roster Active
      </footer>
    </div>
  );
}

export default WelcomeScreen;
