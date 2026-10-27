import { useState } from "react";
import { cn } from "../lib/utils";
import type { Match } from "../types";
import { TeamLogo } from "./TeamLogo";
import { soundFx } from "../lib/soundFx";
import { Chip } from "./ui/Chip";
import { Eye } from "lucide-react";

interface MatchCardProps {
  match: Match;
  minute?: number;
  displayScore?: { home: number; away: number };
  onBet: (match: Match) => void;
  onWatch: (match: Match) => void;
  onAddToBetSlip: (
    match: Match,
    selection: "home" | "draw" | "away" | "gg" | "nogg",
    odds: number,
  ) => void;
  selectedSelection?: "home" | "draw" | "away" | "gg" | "nogg" | null;
}

import { useTheme } from "../contexts/ThemeContext";

export function MatchCard({
  match,
  minute,
  displayScore,
  onWatch,
  onAddToBetSlip,
  selectedSelection,
}: MatchCardProps) {
  const [activeTab, setActiveTab] = useState<"1X2" | "GOALS">("1X2");
  const { isNeoBrutalist } = useTheme();

  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED" || match.status === "RESULT";
  const isScheduled = match.status === "SCHEDULED";
  const currentScore = displayScore || match.currentScore;

  const handleOddsClick = (
    selection: "home" | "draw" | "away" | "gg" | "nogg",
    odds: number,
  ) => {
    soundFx.playClick();
    onAddToBetSlip(match, selection, odds);
  };

  return (
    <div
      className={cn(
        "rounded-[10px] p-3.5 sm:p-4 transition-all relative flex flex-col justify-between gap-3",
        isNeoBrutalist
          ? "bg-white border-[3px] border-black shadow-[4px_4px_0_#000] text-black"
          : "bg-surface-panel border border-border-subtle text-text-primary rounded-md",
        isLive && (isNeoBrutalist ? "border-black bg-[#fffef5]" : "border-semantic-live/50 bg-surface-panel"),
        isFinished && "opacity-90"
      )}
    >
      {/* Top Bar: Status & Pitch View Trigger */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isNeoBrutalist ? (
            isLive ? (
              <span className="px-2 py-0.5 rounded bg-[#ff3366] text-white border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0_#000] flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE {minute !== undefined ? `${minute}'` : ""}
              </span>
            ) : isScheduled ? (
              <span className="px-2 py-0.5 rounded bg-[#00ff66] text-black border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0_#000]">
                BETTING OPEN
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#f0f0f0] text-black border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0_#000]">
                FINAL
              </span>
            )
          ) : isLive ? (
            <Chip variant="live" dot>
              LIVE {minute !== undefined ? `${minute}'` : ""}
            </Chip>
          ) : isScheduled ? (
            <Chip variant="open">
              BETTING OPEN
            </Chip>
          ) : (
            <Chip variant="final">
              FINAL
            </Chip>
          )}

          {match.isVerifiable && (
            <span
              className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                isNeoBrutalist
                  ? "bg-white text-black border border-black shadow-[1px_1px_0_#000]"
                  : "bg-surface-raised border border-border-subtle text-text-muted"
              }`}
              title="Deterministic PRNG Match Seed"
            >
              RNG
            </span>
          )}
        </div>

        {/* Watch Live Pitch Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onWatch(match);
          }}
          aria-label={`Watch pitch view for ${match.homeTeam.name} vs ${match.awayTeam.name}`}
          className={`flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
            isNeoBrutalist
              ? "bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600]/80 active:translate-x-[1px] active:translate-y-[1px]"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised border border-border-subtle"
          }`}
        >
          <Eye size={14} strokeWidth={isNeoBrutalist ? 2.5 : 2} />
          <span>Pitch View</span>
        </button>
      </div>

      {/* Teams & Scoreboard Arena */}
      <div
        className={`p-3 grid grid-cols-7 items-center gap-2 rounded-[8px] transition-colors ${
          isNeoBrutalist
            ? "bg-[#fcfaf2] border-2 border-black"
            : "bg-surface-page border border-border-subtle"
        }`}
      >
        {/* Home Team */}
        <div className="col-span-3 flex flex-col items-center text-center gap-1">
          <div className="relative">
            <TeamLogo
              name={match.homeTeam.name}
              color={match.homeTeam.color}
              logo={match.homeTeam.logo}
              className={`w-10 h-10 rounded-full border ${isNeoBrutalist ? "border-2 border-black" : "border-border-subtle"}`}
            />
            <span
              className={`absolute -bottom-1 -right-1 px-1 text-[10px] font-mono font-black rounded ${
                isNeoBrutalist
                  ? "bg-black text-[#ffe600] border border-black"
                  : "bg-surface-panel text-text-muted border border-border-subtle"
              }`}
            >
              {match.homeTeam.strength}
            </span>
          </div>
          <span
            className={`text-xs truncate max-w-[110px] leading-tight mt-0.5 ${
              isNeoBrutalist ? "text-black font-black uppercase" : "text-text-primary font-bold"
            }`}
          >
            {match.homeTeam.name}
          </span>
          <span className={`text-[10px] uppercase font-bold ${isNeoBrutalist ? "text-black/60" : "text-text-muted"}`}>
            Home
          </span>
        </div>

        {/* Center Score / VS */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          {isLive || isFinished ? (
            <div
              className={`flex items-center gap-1 font-black font-mono tabular-nums px-2 py-0.5 rounded transition-all ${
                isNeoBrutalist
                  ? "bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0_#000] text-base"
                  : "text-base sm:text-lg text-text-primary bg-surface-raised border border-border-subtle"
              }`}
            >
              <span>{currentScore?.home ?? 0}</span>
              <span className={isNeoBrutalist ? "text-black" : "text-text-muted"}>:</span>
              <span>{currentScore?.away ?? 0}</span>
            </div>
          ) : (
            <span className={`text-xs font-black font-mono tracking-widest ${isNeoBrutalist ? "text-black font-black" : "text-text-muted"}`}>
              VS
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-3 flex flex-col items-center text-center gap-1">
          <div className="relative">
            <TeamLogo
              name={match.awayTeam.name}
              color={match.awayTeam.color}
              logo={match.awayTeam.logo}
              className={`w-10 h-10 rounded-full border ${isNeoBrutalist ? "border-2 border-black" : "border-border-subtle"}`}
            />
            <span
              className={`absolute -bottom-1 -right-1 px-1 text-[10px] font-mono font-black rounded ${
                isNeoBrutalist
                  ? "bg-black text-[#ffe600] border border-black"
                  : "bg-surface-panel text-text-muted border border-border-subtle"
              }`}
            >
              {match.awayTeam.strength}
            </span>
          </div>
          <span
            className={`text-xs truncate max-w-[110px] leading-tight mt-0.5 ${
              isNeoBrutalist ? "text-black font-black uppercase" : "text-text-primary font-bold"
            }`}
          >
            {match.awayTeam.name}
          </span>
          <span className={`text-[10px] uppercase font-bold ${isNeoBrutalist ? "text-black/60" : "text-text-muted"}`}>
            Away
          </span>
        </div>
      </div>

      {/* Market Selector Tabs */}
      <div className="flex items-center justify-between pt-1">
        <span className={`text-xs font-black uppercase tracking-wider ${isNeoBrutalist ? "text-black/70" : "text-text-muted"}`}>
          Markets
        </span>
        <div
          className={`flex gap-1 p-0.5 rounded-[6px] text-xs ${
            isNeoBrutalist
              ? "bg-white border-2 border-black shadow-[1px_1px_0_#000]"
              : "bg-surface-page border border-border-subtle"
          }`}
        >
          <button
            onClick={() => setActiveTab("1X2")}
            className={cn(
              "px-2.5 py-0.5 rounded-[4px] font-black transition-all cursor-pointer",
              activeTab === "1X2"
                ? isNeoBrutalist
                  ? "bg-[#ffe600] text-black border border-black shadow-[1px_1px_0_#000]"
                  : "bg-surface-raised text-text-primary border border-border-strong"
                : isNeoBrutalist
                ? "text-black/60 hover:text-black"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            1X2
          </button>
          <button
            onClick={() => setActiveTab("GOALS")}
            className={cn(
              "px-2.5 py-0.5 rounded-[4px] font-black transition-all cursor-pointer",
              activeTab === "GOALS"
                ? isNeoBrutalist
                  ? "bg-[#ffe600] text-black border border-black shadow-[1px_1px_0_#000]"
                  : "bg-surface-raised text-text-primary border border-border-strong"
                : isNeoBrutalist
                ? "text-black/60 hover:text-black"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            GG / NoGG
          </button>
        </div>
      </div>

      {/* Odds Buttons Grid */}
      {activeTab === "1X2" ? (
        <div className="grid grid-cols-3 gap-2">
          {/* 1 (Home) */}
          <button
            onClick={() => handleOddsClick("home", match.odds.home)}
            disabled={!isScheduled}
            aria-label={`${match.homeTeam.name} Win at odds ${match.odds.home.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-[6px] transition-all cursor-pointer",
              isNeoBrutalist
                ? selectedSelection === "home"
                  ? "bg-[#00ff66] text-black border-2 border-black shadow-[2px_2px_0_#000] font-black"
                  : "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600] active:translate-x-[1px] active:translate-y-[1px]"
                : selectedSelection === "home"
                ? "bg-[#062E1E] border-accent text-accent font-bold border"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary border",
              !isScheduled && "opacity-40 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0"
            )}
          >
            <span className={`text-[11px] font-bold ${isNeoBrutalist ? "text-black/70" : "text-text-muted"}`}>
              1 (Home)
            </span>
            <span className="text-sm font-black font-mono tabular-nums">
              {match.odds.home.toFixed(2)}
            </span>
          </button>

          {/* X (Draw) */}
          <button
            onClick={() => handleOddsClick("draw", match.odds.draw)}
            disabled={!isScheduled}
            aria-label={`Draw at odds ${match.odds.draw.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-[6px] transition-all cursor-pointer",
              isNeoBrutalist
                ? selectedSelection === "draw"
                  ? "bg-[#00ff66] text-black border-2 border-black shadow-[2px_2px_0_#000] font-black"
                  : "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600] active:translate-x-[1px] active:translate-y-[1px]"
                : selectedSelection === "draw"
                ? "bg-[#062E1E] border-accent text-accent font-bold border"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary border",
              !isScheduled && "opacity-40 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0"
            )}
          >
            <span className={`text-[11px] font-bold ${isNeoBrutalist ? "text-black/70" : "text-text-muted"}`}>
              X (Draw)
            </span>
            <span className="text-sm font-black font-mono tabular-nums">
              {match.odds.draw.toFixed(2)}
            </span>
          </button>

          {/* 2 (Away) */}
          <button
            onClick={() => handleOddsClick("away", match.odds.away)}
            disabled={!isScheduled}
            aria-label={`${match.awayTeam.name} Win at odds ${match.odds.away.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-[6px] transition-all cursor-pointer",
              isNeoBrutalist
                ? selectedSelection === "away"
                  ? "bg-[#00ff66] text-black border-2 border-black shadow-[2px_2px_0_#000] font-black"
                  : "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600] active:translate-x-[1px] active:translate-y-[1px]"
                : selectedSelection === "away"
                ? "bg-[#062E1E] border-accent text-accent font-bold border"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary border",
              !isScheduled && "opacity-40 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0"
            )}
          >
            <span className={`text-[11px] font-bold ${isNeoBrutalist ? "text-black/70" : "text-text-muted"}`}>
              2 (Away)
            </span>
            <span className="text-sm font-black font-mono tabular-nums">
              {match.odds.away.toFixed(2)}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {/* GG (Both Teams to Score) */}
          <button
            onClick={() => handleOddsClick("gg", match.odds.gg)}
            disabled={!isScheduled}
            aria-label={`Both Teams to Score at odds ${match.odds.gg.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-[6px] transition-all cursor-pointer",
              isNeoBrutalist
                ? selectedSelection === "gg"
                  ? "bg-[#00ff66] text-black border-2 border-black shadow-[2px_2px_0_#000] font-black"
                  : "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600] active:translate-x-[1px] active:translate-y-[1px]"
                : selectedSelection === "gg"
                ? "bg-[#062E1E] border-accent text-accent font-bold border"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary border",
              !isScheduled && "opacity-40 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0"
            )}
          >
            <span className={`text-[11px] font-bold ${isNeoBrutalist ? "text-black/70" : "text-text-muted"}`}>
              GG (Both Score)
            </span>
            <span className="text-sm font-black font-mono tabular-nums">
              {match.odds.gg.toFixed(2)}
            </span>
          </button>

          {/* NoGG */}
          <button
            onClick={() => handleOddsClick("nogg", match.odds.nogg)}
            disabled={!isScheduled}
            aria-label={`Clean Sheet No GG at odds ${match.odds.nogg.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-[6px] transition-all cursor-pointer",
              isNeoBrutalist
                ? selectedSelection === "nogg"
                  ? "bg-[#00ff66] text-black border-2 border-black shadow-[2px_2px_0_#000] font-black"
                  : "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600] active:translate-x-[1px] active:translate-y-[1px]"
                : selectedSelection === "nogg"
                ? "bg-[#062E1E] border-accent text-accent font-bold border"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary border",
              !isScheduled && "opacity-40 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0"
            )}
          >
            <span className={`text-[11px] font-bold ${isNeoBrutalist ? "text-black/70" : "text-text-muted"}`}>
              NoGG (Clean Sheet)
            </span>
            <span className="text-sm font-black font-mono tabular-nums">
              {match.odds.nogg.toFixed(2)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

