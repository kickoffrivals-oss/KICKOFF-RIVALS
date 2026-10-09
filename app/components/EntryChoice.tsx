import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import { IconUser, IconSparkles, IconChevronRight, IconZap, IconTrophy } from "./Icons";
import { soundFx } from "../lib/soundFx";

interface EntryChoiceProps {
  onNewUser: () => void;
  onReturningUser: () => void;
}

export function EntryChoice({ onNewUser, onReturningUser }: EntryChoiceProps) {
  const handleNew = () => {
    soundFx.playClick();
    onNewUser();
  };

  const handleReturning = () => {
    soundFx.playClick();
    onReturningUser();
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>STEP 1 OF 4: ACCESS SELECTION</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-8 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
            Matchday Access Gateway
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Select Your Player Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Choose how you want to access the virtual matchday arena.
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* New Manager Pass */}
          <button
            onClick={handleNew}
            className={cn(
              "bg-[#13171F] rounded-[6px] p-5 text-left border border-[#222938] hover:border-emerald-500 transition-colors group flex flex-col justify-between"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-amber-400">
                  <IconSparkles className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#1B212D] border border-amber-500/40 text-amber-400 font-mono text-xs font-bold tabular-nums">
                  5,000 Coins Grant
                </span>
              </div>

              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                New Registration
              </span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1.5">
                Create Manager Profile
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Register a new manager nickname, choose your club alliance, and receive the full 5,000 Coin starter allocation.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#222938] text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Start Onboarding</span>
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Quick Demo Play / Returning */}
          <button
            onClick={handleReturning}
            className={cn(
              "bg-[#13171F] rounded-[6px] p-5 text-left border border-[#222938] hover:border-emerald-500 transition-colors group flex flex-col justify-between"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-emerald-400">
                  <IconUser className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#1B212D] border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
                  Demo Account (Instant)
                </span>
              </div>

              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Direct Session
              </span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1.5">
                Quick Demo Play
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Use a pre-configured in-memory demo account to instantly explore active matchday odds and live simulations.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#222938] text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Select Demo Account</span>
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3.5 text-center text-slate-500 text-xs border-t border-[#222938] bg-[#0A0D12]">
        KickOff Rivals • Player Authentication Gateway
      </footer>
    </div>
  );
}

export default EntryChoice;
