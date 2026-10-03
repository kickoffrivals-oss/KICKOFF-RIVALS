import { useState } from "react";
import { cn } from "../lib/utils";
import { Match } from "../types";
import { IconClock, IconPlay, IconCheck, IconPlus, IconShield, IconEye } from "./Icons";
import { TeamLogo } from "./TeamLogo";
import { soundFx } from "../lib/soundFx";

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
  onBet,
  onWatch,
  onAddToBetSlip,
  selectedSelection,
}: MatchCardProps) {
  const [activeTab, setActiveTab] = useState<"1X2" | "GOALS">("1X2");

  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED" || match.status === "RESULT";
  const isScheduled = match.status === "SCHEDULED";
  const currentScore = displayScore || match.currentScore;

  const handleOddsClick = (selection: "home" | "draw" | "away" | "gg" | "nogg", odds: number) => {
    soundFx.playClick();
    onAddToBetSlip(match, selection, odds);
  };

  return (
    <div
      className={cn(
        "broadcast-card p-4.5 transition-all duration-300 relative overflow-hidden group/match",
        isLive && "ring-1 ring-emerald-500/60 shadow-xl shadow-emerald-950/40 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20",
        isFinished && "opacity-80 bg-slate-950/80"
      )}
    >
      {/* Top Banner: Status & League Indicator */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-black text-[10px] tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              LIVE {minute !== undefined ? `${minute}'` : ""}
            </span>
          ) : isScheduled ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] tracking-wider">
              <IconClock className="w-3 h-3" />
              OPEN
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-400 font-bold text-[10px]">
              <IconCheck className="w-3 h-3" />
              FINAL
            </span>
          )}

          {match.isVerifiable && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold" title="Verified by Chainlink VRF on Avalanche">
              <IconShield className="w-3 h-3 text-blue-400" />
              VRF
            </span>
          )}
        </div>

        {/* Watch Live Action Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onWatch(match);
          }}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 rounded-md transition-all"
        >
          <IconEye className="w-3.5 h-3.5" />
          <span>Pitch View</span>
        </button>
      </div>

      {/* Teams & Score Display (EA FC Style) */}
      <div className="grid grid-cols-7 items-center gap-2 mb-4 bg-slate-950/60 p-3 rounded-xl border border-white/5">
        {/* Home Team */}
        <div className="col-span-3 flex flex-col items-center text-center gap-1.5">
          <div className="relative">
            <TeamLogo
              name={match.homeTeam.name}
              color={match.homeTeam.color}
              logo={match.homeTeam.logo}
              className="w-10 h-10 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 px-1 bg-slate-800 text-[9px] font-black rounded border border-white/10 text-slate-300">
              {match.homeTeam.strength}
            </span>
          </div>
          <span className="text-xs font-black text-slate-100 truncate max-w-[100px] leading-tight">
            {match.homeTeam.name}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Home</span>
        </div>

        {/* Center Scoreboard / VS */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          {isLive || isFinished ? (
            <div className="flex items-center gap-1 text-base sm:text-lg font-black text-white led-number bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10 shadow-inner">
              <span className={currentScore && currentScore.home > currentScore.away ? "text-emerald-400" : ""}>
                {currentScore?.home ?? 0}
              </span>
              <span className="text-slate-600">:</span>
              <span className={currentScore && currentScore.away > currentScore.home ? "text-emerald-400" : ""}>
                {currentScore?.away ?? 0}
              </span>
            </div>
          ) : (
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">VS</span>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-3 flex flex-col items-center text-center gap-1.5">
          <div className="relative">
            <TeamLogo
              name={match.awayTeam.name}
              color={match.awayTeam.color}
              logo={match.awayTeam.logo}
              className="w-10 h-10 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 px-1 bg-slate-800 text-[9px] font-black rounded border border-white/10 text-slate-300">
              {match.awayTeam.strength}
            </span>
          </div>
          <span className="text-xs font-black text-slate-100 truncate max-w-[100px] leading-tight">
            {match.awayTeam.name}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Away</span>
        </div>
      </div>

      {/* Market Selector Tabs */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Match Odds
        </span>
        <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-white/5 text-[10px]">
          <button
            onClick={() => setActiveTab("1X2")}
            className={cn(
              "px-2 py-0.5 rounded font-bold transition-all",
              activeTab === "1X2" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
            )}
          >
            1X2
          </button>
          <button
            onClick={() => setActiveTab("GOALS")}
            className={cn(
              "px-2 py-0.5 rounded font-bold transition-all",
              activeTab === "GOALS" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
            )}
          >
            GG/NoGG
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
            className={cn(
              "odds-btn p-2 flex flex-col items-center justify-center relative group",
              selectedSelection === "home" && "selected",
              !isScheduled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">1 (Home)</span>
            <span className="text-xs font-extrabold text-white led-number">
              {match.odds.home.toFixed(2)}
            </span>
          </button>

          {/* X (Draw) */}
          <button
            onClick={() => handleOddsClick("draw", match.odds.draw)}
            disabled={!isScheduled}
            className={cn(
              "odds-btn p-2 flex flex-col items-center justify-center relative group",
              selectedSelection === "draw" && "selected",
              !isScheduled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">X (Draw)</span>
            <span className="text-xs font-extrabold text-white led-number">
              {match.odds.draw.toFixed(2)}
            </span>
          </button>

          {/* 2 (Away) */}
          <button
            onClick={() => handleOddsClick("away", match.odds.away)}
            disabled={!isScheduled}
            className={cn(
              "odds-btn p-2 flex flex-col items-center justify-center relative group",
              selectedSelection === "away" && "selected",
              !isScheduled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">2 (Away)</span>
            <span className="text-xs font-extrabold text-white led-number">
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
            className={cn(
              "odds-btn p-2 flex flex-col items-center justify-center relative group",
              selectedSelection === "gg" && "selected",
              !isScheduled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">GG (Both Score)</span>
            <span className="text-xs font-extrabold text-white led-number">
              {match.odds.gg.toFixed(2)}
            </span>
          </button>

          {/* NoGG */}
          <button
            onClick={() => handleOddsClick("nogg", match.odds.nogg)}
            disabled={!isScheduled}
            className={cn(
              "odds-btn p-2 flex flex-col items-center justify-center relative group",
              selectedSelection === "nogg" && "selected",
              !isScheduled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">NoGG (Clean Sheet)</span>
            <span className="text-xs font-extrabold text-white led-number">
              {match.odds.nogg.toFixed(2)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
