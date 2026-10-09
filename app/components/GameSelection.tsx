import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import { IconFootball, IconChevronRight, IconZap, IconTrophy, IconActivity } from "./Icons";
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
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>SPORTING DISPATCH ACTIVE</span>
        </div>
      </header>

      {/* Center Arena Selection */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
            Select Your Arena
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Matchday Competition
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Choose your sporting discipline to launch live matchday predictions and simulation telemetry.
          </p>
        </div>

        {/* Sporting Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {/* Virtual Football - Live & Active */}
          <button
            onClick={handleSelectFootball}
            className="bg-[#13171F] rounded-[6px] p-5 border border-emerald-500 hover:bg-[#1B212D] transition-colors text-left flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#0A0D12] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <IconFootball className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-[2px] bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE 24/7
                </span>
              </div>

              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Active League
              </span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1.5">
                Football Pro
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                3 Active Leagues, 2D radar pitch simulation, 1X2 & GG/NoGG markets with instant settlement.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#222938] text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Enter Matchday</span>
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Basketball Pro - Coming Soon */}
          <div className="bg-[#13171F] rounded-[6px] p-5 border border-[#222938] text-left opacity-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#0A0D12] border border-[#222938] flex items-center justify-center text-slate-500">
                  <IconActivity className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-[2px] bg-[#1B212D] border border-[#222938] text-slate-400 text-xs font-mono font-bold">
                  Season 2
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                In Development
              </span>
              <h3 className="text-base font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Basketball Slam
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quarter-by-quarter fast-break predictions, over/under point totals, and buzzer-beater payouts.
              </p>
            </div>
            <div className="pt-3 border-t border-[#222938] text-xs font-mono font-bold text-slate-500 uppercase">
              Coming in Season 2
            </div>
          </div>

          {/* Tennis Open - Coming Soon */}
          <div className="bg-[#13171F] rounded-[6px] p-5 border border-[#222938] text-left opacity-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#0A0D12] border border-[#222938] flex items-center justify-center text-slate-500">
                  <IconTrophy className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-[2px] bg-[#1B212D] border border-[#222938] text-slate-400 text-xs font-mono font-bold">
                  Season 2
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                In Development
              </span>
              <h3 className="text-base font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Tennis Slam
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Set-by-set ace predictions, match tie-breaks, and live grand slam multi-odds.
              </p>
            </div>
            <div className="pt-3 border-t border-[#222938] text-xs font-mono font-bold text-slate-500 uppercase">
              Coming in Season 2
            </div>
          </div>

          {/* Aviator Crash - Coming Soon */}
          <div className="bg-[#13171F] rounded-[6px] p-5 border border-[#222938] text-left opacity-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#0A0D12] border border-[#222938] flex items-center justify-center text-slate-500">
                  <IconZap className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-[2px] bg-[#1B212D] border border-[#222938] text-slate-400 text-xs font-mono font-bold">
                  Season 2
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                In Development
              </span>
              <h3 className="text-base font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Speed Multiplier
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rapid curve multipliers with cashout timing and progressive tournament jackpots.
              </p>
            </div>
            <div className="pt-3 border-t border-[#222938] text-xs font-mono font-bold text-slate-500 uppercase">
              Coming in Season 2
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3.5 text-center text-slate-500 text-xs border-t border-[#222938] bg-[#0A0D12]">
        KickOff Rivals • Multi-Discipline Arena Dispatch
      </footer>
    </div>
  );
}

export default GameSelection;
