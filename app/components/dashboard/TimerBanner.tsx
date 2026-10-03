import type { GameState } from "../../types";
import { IconClock, IconPlay, IconCheck, IconTrophy } from "../Icons";

interface TimerBannerProps {
  timer: number;
  gameState: GameState;
  roundNumber: number;
  getCurrentGameMinute: () => number;
}

export function TimerBanner({
  timer,
  gameState,
  roundNumber,
  getCurrentGameMinute,
}: TimerBannerProps) {
  const isLive = gameState === "LIVE";
  const isBetting = gameState === "BETTING";

  return (
    <div className="relative overflow-hidden rounded-2xl broadcast-glass p-5 mb-6 border border-white/10 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
      {/* Volumetric background lights */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        {/* Left: Round & State Capsule */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Active Matchday
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white led-number">
                ROUND #{roundNumber}
              </span>
              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                SEASON 1
              </span>
            </div>
          </div>
        </div>

        {/* Center: High-Impact LED Digital Clock */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-white/10 mb-1.5 shadow-inner">
            {isLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-black tracking-widest uppercase text-red-400">
                  MATCH IN PLAY
                </span>
              </>
            ) : isBetting ? (
              <>
                <IconClock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-300">
                  BETTING WINDOW OPEN
                </span>
              </>
            ) : (
              <>
                <IconCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-300">
                  SETTLEMENT COMPLETE
                </span>
              </>
            )}
          </div>

          <div className="text-4xl sm:text-5xl font-black led-number tracking-wider">
            {isLive ? (
              <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                {getCurrentGameMinute()}'
              </span>
            ) : (
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {Math.floor(timer / 60).toString().padStart(2, "0")}:
                {(timer % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Action Guidance */}
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {isLive ? "Live Multi-Screen" : isBetting ? "Lock In Picks" : "Next Round"}
          </span>
          <p className="text-xs font-semibold text-slate-300 max-w-[200px]">
            {isLive
              ? "Watch live pitch simulation and event telemetry."
              : isBetting
              ? "Select odds from any league to build your combo slip."
              : "Preparing next round fixtures..."}
          </p>
        </div>
      </div>
    </div>
  );
}
