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

export function MatchCard({
  match,
  minute,
  displayScore,
  onWatch,
  onAddToBetSlip,
  selectedSelection,
}: MatchCardProps) {
  const [activeTab, setActiveTab] = useState<"1X2" | "GOALS">("1X2");

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
        "bg-surface-panel border border-border-subtle rounded-md p-3.5 sm:p-4 transition-colors relative flex flex-col justify-between gap-3",
        isLive && "border-semantic-live/50 bg-surface-panel",
        isFinished && "opacity-85"
      )}
    >
      {/* Top Bar: Status & Pitch View Trigger */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isLive ? (
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
              className="text-xs font-mono font-medium px-1.5 py-0.5 rounded-sm bg-surface-raised border border-border-subtle text-text-muted"
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
          className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-surface-raised px-2 py-1 rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Eye size={14} strokeWidth={2} />
          <span>Pitch View</span>
        </button>
      </div>

      {/* Teams & Scoreboard Arena */}
      <div className="bg-surface-page border border-border-subtle rounded-sm p-3 grid grid-cols-7 items-center gap-2">
        {/* Home Team */}
        <div className="col-span-3 flex flex-col items-center text-center gap-1">
          <div className="relative">
            <TeamLogo
              name={match.homeTeam.name}
              color={match.homeTeam.color}
              logo={match.homeTeam.logo}
              className="w-10 h-10 rounded-full border border-border-subtle"
            />
            <span className="absolute -bottom-1 -right-1 px-1 bg-surface-panel text-xs font-mono font-bold rounded-sm border border-border-subtle text-text-muted">
              {match.homeTeam.strength}
            </span>
          </div>
          <span className="text-xs font-bold text-text-primary truncate max-w-[110px] leading-tight mt-0.5">
            {match.homeTeam.name}
          </span>
          <span className="text-xs font-semibold text-text-muted uppercase">Home</span>
        </div>

        {/* Center Score / VS */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          {isLive || isFinished ? (
            <div className="flex items-center gap-1 text-base sm:text-lg font-black font-mono tabular-nums text-text-primary bg-surface-raised px-2 py-0.5 rounded-sm border border-border-subtle">
              <span className={currentScore && currentScore.home > currentScore.away ? "text-accent" : ""}>
                {currentScore?.home ?? 0}
              </span>
              <span className="text-text-muted">:</span>
              <span className={currentScore && currentScore.away > currentScore.home ? "text-accent" : ""}>
                {currentScore?.away ?? 0}
              </span>
            </div>
          ) : (
            <span className="text-xs font-black font-mono text-text-muted tracking-widest">VS</span>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-3 flex flex-col items-center text-center gap-1">
          <div className="relative">
            <TeamLogo
              name={match.awayTeam.name}
              color={match.awayTeam.color}
              logo={match.awayTeam.logo}
              className="w-10 h-10 rounded-full border border-border-subtle"
            />
            <span className="absolute -bottom-1 -right-1 px-1 bg-surface-panel text-xs font-mono font-bold rounded-sm border border-border-subtle text-text-muted">
              {match.awayTeam.strength}
            </span>
          </div>
          <span className="text-xs font-bold text-text-primary truncate max-w-[110px] leading-tight mt-0.5">
            {match.awayTeam.name}
          </span>
          <span className="text-xs font-semibold text-text-muted uppercase">Away</span>
        </div>
      </div>

      {/* Market Selector Tabs */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Markets
        </span>
        <div className="flex gap-1 bg-surface-page p-0.5 rounded-sm border border-border-subtle text-xs">
          <button
            onClick={() => setActiveTab("1X2")}
            className={cn(
              "px-2 py-0.5 rounded-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              activeTab === "1X2"
                ? "bg-surface-raised text-text-primary border border-border-strong"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            1X2
          </button>
          <button
            onClick={() => setActiveTab("GOALS")}
            className={cn(
              "px-2 py-0.5 rounded-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              activeTab === "GOALS"
                ? "bg-surface-raised text-text-primary border border-border-strong"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            GG / NoGG
          </button>
        </div>
      </div>

      {/* Odds Buttons Grid */}
      {activeTab === "1X2" ? (
        <div className="grid grid-cols-3 gap-1.5">
          {/* 1 (Home) */}
          <button
            onClick={() => handleOddsClick("home", match.odds.home)}
            disabled={!isScheduled}
            aria-label={`${match.homeTeam.name} Win at odds ${match.odds.home.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-sm border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              selectedSelection === "home"
                ? "bg-[#062E1E] border-accent text-accent font-bold"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary",
              !isScheduled && "opacity-50 cursor-not-allowed hover:border-border-subtle hover:bg-surface-raised"
            )}
          >
            <span className="text-xs font-medium text-text-muted">1 (Home)</span>
            <span className="text-sm font-bold font-mono tabular-nums">
              {match.odds.home.toFixed(2)}
            </span>
          </button>

          {/* X (Draw) */}
          <button
            onClick={() => handleOddsClick("draw", match.odds.draw)}
            disabled={!isScheduled}
            aria-label={`Draw at odds ${match.odds.draw.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-sm border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              selectedSelection === "draw"
                ? "bg-[#062E1E] border-accent text-accent font-bold"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary",
              !isScheduled && "opacity-50 cursor-not-allowed hover:border-border-subtle hover:bg-surface-raised"
            )}
          >
            <span className="text-xs font-medium text-text-muted">X (Draw)</span>
            <span className="text-sm font-bold font-mono tabular-nums">
              {match.odds.draw.toFixed(2)}
            </span>
          </button>

          {/* 2 (Away) */}
          <button
            onClick={() => handleOddsClick("away", match.odds.away)}
            disabled={!isScheduled}
            aria-label={`${match.awayTeam.name} Win at odds ${match.odds.away.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-sm border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              selectedSelection === "away"
                ? "bg-[#062E1E] border-accent text-accent font-bold"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary",
              !isScheduled && "opacity-50 cursor-not-allowed hover:border-border-subtle hover:bg-surface-raised"
            )}
          >
            <span className="text-xs font-medium text-text-muted">2 (Away)</span>
            <span className="text-sm font-bold font-mono tabular-nums">
              {match.odds.away.toFixed(2)}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {/* GG (Both Teams to Score) */}
          <button
            onClick={() => handleOddsClick("gg", match.odds.gg)}
            disabled={!isScheduled}
            aria-label={`Both Teams to Score at odds ${match.odds.gg.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-sm border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              selectedSelection === "gg"
                ? "bg-[#062E1E] border-accent text-accent font-bold"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary",
              !isScheduled && "opacity-50 cursor-not-allowed hover:border-border-subtle hover:bg-surface-raised"
            )}
          >
            <span className="text-xs font-medium text-text-muted">GG (Both Score)</span>
            <span className="text-sm font-bold font-mono tabular-nums">
              {match.odds.gg.toFixed(2)}
            </span>
          </button>

          {/* NoGG */}
          <button
            onClick={() => handleOddsClick("nogg", match.odds.nogg)}
            disabled={!isScheduled}
            aria-label={`Clean Sheet No GG at odds ${match.odds.nogg.toFixed(2)}`}
            className={cn(
              "p-2 flex flex-col items-center justify-center rounded-sm border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              selectedSelection === "nogg"
                ? "bg-[#062E1E] border-accent text-accent font-bold"
                : "bg-surface-raised border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary",
              !isScheduled && "opacity-50 cursor-not-allowed hover:border-border-subtle hover:bg-surface-raised"
            )}
          >
            <span className="text-xs font-medium text-text-muted">NoGG (Clean Sheet)</span>
            <span className="text-sm font-bold font-mono tabular-nums">
              {match.odds.nogg.toFixed(2)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

