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
    <div className="min-h-screen stadium-bg text-white overflow-x-hidden flex flex-col justify-between relative">
      {/* Floodlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-amber-500/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <RivalsLogo size="md" variant="full" className="text-white" />
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          MATCHDAY GATEWAY
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-emerald-400 text-xs font-black tracking-[0.3em] uppercase mb-1 block">
            PLAYER REGISTRATION & ACCESS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight">
            SELECT ACCESS PASS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
            Register as a new manager with a starter pack or connect your existing test profile to continue matchday predictions.
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {/* New Manager Pass */}
          <button
            onClick={handleNew}
            className={cn(
              "broadcast-card rounded-3xl p-7 text-left border transition-all duration-300 group flex flex-col justify-between relative overflow-hidden",
              "border-amber-400/70 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900/90",
              "hover:scale-[1.03] hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/20 active:scale-98"
            )}
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-[2px] shadow-lg shadow-amber-500/30">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <IconSparkles className="w-7 h-7" />
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md">
                5K COINS + 1K KOR
              </span>
            </div>

            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">
                NEW SQUAD CREATION
              </span>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">
                CREATE NEW MANAGER
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Pick your squad name, choose your favorite club alliance, and unlock the 5,000 Coin starter grant.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-black text-amber-400 uppercase tracking-wider group-hover:text-amber-300">
              <span>START ONBOARDING</span>
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Quick Connect / Existing Manager */}
          <button
            onClick={handleReturning}
            className={cn(
              "broadcast-card rounded-3xl p-7 text-left border transition-all duration-300 group flex flex-col justify-between relative overflow-hidden",
              "border-emerald-400/70 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900/90",
              "hover:scale-[1.03] hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-98"
            )}
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/30">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <IconUser className="w-7 h-7" />
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md">
                INSTANT CONNECT
              </span>
            </div>

            <div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">
                EXISTING ROSTER
              </span>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">
                QUICK PLAY / ROSTER
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Choose a preloaded test wallet or enter an existing manager address to jump directly into the live arena.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-black text-emerald-400 uppercase tracking-wider group-hover:text-emerald-300">
              <span>ENTER ARENA</span>
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-slate-500 text-xs border-t border-white/5 bg-slate-950/60 backdrop-blur-md">
        KickOff Rivals • Unified Player Onboarding Gateway
      </footer>
    </div>
  );
}

export default EntryChoice;
