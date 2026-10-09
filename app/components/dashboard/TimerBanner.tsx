import type { GameState } from "../../types";
import { Chip } from "../ui/Chip";

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
    <div className="bg-[#13171F] border border-[#222938] rounded-[6px] px-4 py-3 sm:px-5 sm:py-3.5 mb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Round & Season */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Active Matchday
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                ROUND #{roundNumber}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-[4px] bg-[#1B212D] border border-emerald-500/30">
                SEASON 1
              </span>
            </div>
          </div>
        </div>

        {/* Center: Status & Tabular Minute / Clock */}
        <div className="flex items-center gap-3 bg-[#0A0D12] px-4 py-1.5 rounded-[4px] border border-[#222938]">
          <div>
            {isLive ? (
              <Chip variant="live" size="sm" dot>
                MATCH IN PLAY
              </Chip>
            ) : isBetting ? (
              <Chip variant="open" size="sm" dot>
                BETTING OPEN
              </Chip>
            ) : (
              <Chip variant="accent" size="sm" dot>
                SETTLING
              </Chip>
            )}
          </div>

          <span className="text-[#323C50] font-mono">|</span>

          <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-wider">
            {isLive ? (
              <span className="text-[#EF4444]">
                {getCurrentGameMinute()}'
              </span>
            ) : (
              <span className="text-white">
                {Math.floor(timer / 60).toString().padStart(2, "0")}:
                {(timer % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        {/* Right: Round Phase Telemetry Info */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            {isLive ? "Live Simulation" : isBetting ? "35s Round Cycle" : "Settlement"}
          </span>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
            {isLive
              ? "Instant 2D Radar Telemetry"
              : isBetting
              ? "1X2 & GG/NoGG Markets"
              : "Settling Bets & Winnings"}
          </p>
        </div>
      </div>
    </div>
  );
}

