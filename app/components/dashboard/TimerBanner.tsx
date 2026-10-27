import type { GameState } from "../../types";
import { Chip } from "../ui/Chip";
import { useTheme } from "../../contexts/ThemeContext";

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
  const { isNeoBrutalist } = useTheme();

  return (
    <div
      className={`rounded-[10px] px-4 py-3 sm:px-5 sm:py-3.5 mb-4 transition-all ${
        isNeoBrutalist
          ? "bg-[#ffe600] border-[3px] border-black shadow-[4px_4px_0_#000] text-black"
          : "bg-[#13171F] border border-[#222938] text-white rounded-[6px]"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Round & Season */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <div className={`text-[11px] font-black uppercase tracking-wider ${isNeoBrutalist ? "text-black/70" : "text-[#94A3B8]"}`}>
              Active Matchday
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isNeoBrutalist ? "text-black" : "text-white"}`}>
                ROUND #{roundNumber}
              </span>
              <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-[4px] border ${
                isNeoBrutalist
                  ? "bg-white text-black border-black shadow-[1px_1px_0_#000]"
                  : "text-emerald-400 bg-[#1B212D] border-emerald-500/30"
              }`}>
                SEASON 1
              </span>
            </div>
          </div>
        </div>

        {/* Center: Status & Tabular Minute / Clock */}
        <div className={`flex items-center gap-3 px-4 py-1.5 rounded-[8px] border transition-all ${
          isNeoBrutalist
            ? "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
            : "bg-[#0A0D12] border-[#222938]"
        }`}>
          <div>
            {isNeoBrutalist ? (
              isLive ? (
                <span className="px-2 py-0.5 rounded bg-[#ff3366] text-white text-[10px] font-black border border-black uppercase animate-pulse">
                  IN PLAY
                </span>
              ) : isBetting ? (
                <span className="px-2 py-0.5 rounded bg-[#00ff66] text-black text-[10px] font-black border border-black uppercase">
                  BETTING
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-[#ffe600] text-black text-[10px] font-black border border-black uppercase">
                  SETTLING
                </span>
              )
            ) : isLive ? (
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

          <span className={`font-mono ${isNeoBrutalist ? "text-black" : "text-[#323C50]"}`}>|</span>

          <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-wider">
            {isLive ? (
              <span className={isNeoBrutalist ? "text-[#ff3366]" : "text-[#EF4444]"}>
                {getCurrentGameMinute()}'
              </span>
            ) : (
              <span className={isNeoBrutalist ? "text-black" : "text-white"}>
                {Math.floor(timer / 60).toString().padStart(2, "0")}:
                {(timer % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        {/* Right: Round Phase Telemetry Info */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className={`text-[11px] font-black uppercase tracking-wider ${isNeoBrutalist ? "text-black" : "text-[#94A3B8]"}`}>
            {isLive ? "Live Simulation" : isBetting ? "1m Betting Window" : "Settlement"}
          </span>
          <p className={`text-xs font-mono mt-0.5 ${isNeoBrutalist ? "text-black/70 font-bold" : "text-[#94A3B8]"}`}>
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

