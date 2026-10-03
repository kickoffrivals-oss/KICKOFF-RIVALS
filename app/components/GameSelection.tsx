import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import { IconFootball, IconChevronRight, IconZap, IconTrophy } from "./Icons";
import { soundFx } from "../lib/soundFx";

interface GameSelectionProps {
  onSelectFootball: () => void;
}

export function GameSelection({ onSelectFootball }: GameSelectionProps) {
  const handleSelectFootball = () => {
    soundFx.playWhistle();
    onSelectFootball();
  };

  return (
    <div className="min-h-screen stadium-bg text-white overflow-x-hidden flex flex-col justify-between relative">
      {/* Stadium Floodlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <RivalsLogo size="md" variant="full" className="text-white" />
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          ARENA DISPATCH ACTIVE
        </div>
      </header>

      {/* Center Arena Selection */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-emerald-400 text-xs font-black tracking-[0.3em] uppercase mb-1 block">
            CHOOSE YOUR COMPETITION
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight">
            SELECT SPORTING ARENA
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
            Select your discipline to launch matchday predictions, study live team telemetry, and win KOR tokens.
          </p>
        </div>

        {/* Sporting Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Virtual Football - Live & Active */}
          <button
            onClick={handleSelectFootball}
            className={cn(
              "broadcast-card rounded-3xl p-6 border text-left transition-all duration-300 group flex flex-col justify-between relative overflow-hidden",
              "border-emerald-400/80 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900/90",
              "hover:scale-[1.03] hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/25 active:scale-98"
            )}
          >
            {/* Live Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/30">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <IconFootball className="w-7 h-7" />
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                LIVE 24/7
              </span>
            </div>

            <div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">
                FLAGSHIP DISCIPLINE
              </span>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">
                FOOTBALL PRO
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                4 Active Leagues, 2D visual pitch simulation, 1X2 & GG/NG markets with instant settlement.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-black text-emerald-400 uppercase tracking-wider group-hover:text-emerald-300">
              <span>ENTER MATCHDAY</span>
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Basketball Pro - Coming Soon */}
          <div className="broadcast-card rounded-3xl p-6 border border-white/5 bg-slate-900/40 text-left opacity-60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500">
                  🏀
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                  SEASON 2
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">
                IN DEVELOPMENT
              </span>
              <h3 className="text-xl font-black text-slate-300 uppercase italic tracking-tight mb-2">
                BASKETBALL SLAM
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quarter-by-quarter fast-break predictions, over/under point totals, and buzzer-beater payouts.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase">
              Coming in Q2
            </div>
          </div>

          {/* Tennis Open - Coming Soon */}
          <div className="broadcast-card rounded-3xl p-6 border border-white/5 bg-slate-900/40 text-left opacity-60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500">
                  🎾
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                  SEASON 2
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">
                IN DEVELOPMENT
              </span>
              <h3 className="text-xl font-black text-slate-300 uppercase italic tracking-tight mb-2">
                TENNIS SLAM
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Set-by-set ace predictions, match tie-breaks, and live grand slam multi-odds.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase">
              Coming in Q2
            </div>
          </div>

          {/* Aviator Crash - Coming Soon */}
          <div className="broadcast-card rounded-3xl p-6 border border-white/5 bg-slate-900/40 text-left opacity-60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500">
                  🚀
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                  SEASON 2
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">
                IN DEVELOPMENT
              </span>
              <h3 className="text-xl font-black text-slate-300 uppercase italic tracking-tight mb-2">
                AVIATOR ROCKET
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                High-multiplier curve multiplier crash game with instant cashout mechanics.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase">
              Coming in Q3
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-slate-500 text-xs border-t border-white/5 bg-slate-950/60 backdrop-blur-md">
        KickOff Rivals Multi-Sport Game Hub
      </footer>
    </div>
  );
}

export default GameSelection;
