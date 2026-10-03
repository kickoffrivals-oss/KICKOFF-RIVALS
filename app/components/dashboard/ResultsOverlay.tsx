import { useState } from "react";
import { LEAGUES } from "../../constants";
import { MatchCard } from "../MatchCard";
import type { Match } from "../../types";
import { soundFx } from "../../lib/soundFx";

interface ResultsOverlayProps {
  timer: number;
  matches: Match[];
}

export function ResultsOverlay({ timer, matches }: ResultsOverlayProps) {
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState("all");

  return (
    <div
      id="results-overlay"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-start text-white overflow-y-auto w-full"
    >
      <div className="w-full max-w-6xl flex flex-col items-center pt-24 pb-12 px-4 relative">
        <CloseButton />

        <RoundEndedBanner timer={timer} />

        <LeagueFilterBar
          selected={selectedLeagueFilter}
          onSelect={setSelectedLeagueFilter}
          dark
        />

        <MatchResultsGrid
          matches={matches}
          selectedLeagueFilter={selectedLeagueFilter}
        />
      </div>
    </div>
  );
}

function CloseButton() {
  return (
    <button
      onClick={() => {
        soundFx.playClick();
        const el = document.getElementById("results-overlay");
        if (el) el.style.display = "none";
      }}
      className="absolute top-6 right-6 p-2.5 bg-white/10 border border-white/15 rounded-full hover:bg-white/20 text-white transition-all hover:scale-105"
      title="Close Overlay"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  );
}

function RoundEndedBanner({ timer }: { timer: number }) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-3">
        <span>🏆 MATCHDAY CONCLUDED</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
        FINAL ROUND RESULTS
      </h1>

      <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl broadcast-glass border border-white/10 shadow-xl">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Next Round In:
        </span>
        <span className="text-2xl font-black text-amber-400 led-number">
          {Math.floor(timer / 60)
            .toString()
            .padStart(2, "0")}
          :{(timer % 60).toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

interface LeagueFilterBarProps {
  selected: string;
  onSelect: (id: string) => void;
  dark?: boolean;
}

export function LeagueFilterBar({
  selected,
  onSelect,
  dark = false,
}: LeagueFilterBarProps) {
  const activeClass =
    "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 border-emerald-400";
  const inactiveClass =
    "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border-white/10";

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar px-2 w-full justify-start md:justify-center">
      <button
        onClick={() => {
          soundFx.playClick();
          onSelect("all");
        }}
        className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border ${
          selected === "all" ? activeClass : inactiveClass
        }`}
      >
        All Leagues
      </button>
      {LEAGUES.map((league) => (
        <button
          key={league.id}
          onClick={() => {
            soundFx.playClick();
            onSelect(league.id);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-2 ${
            selected === league.id ? activeClass : inactiveClass
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {league.name}
        </button>
      ))}
    </div>
  );
}

interface MatchResultsGridProps {
  matches: Match[];
  selectedLeagueFilter: string;
}

function MatchResultsGrid({
  matches,
  selectedLeagueFilter,
}: MatchResultsGridProps) {
  const filtered =
    selectedLeagueFilter === "all"
      ? matches
      : matches.filter((m) => m.leagueId === selectedLeagueFilter);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl">
      {filtered.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          onBet={() => {}}
          onWatch={() => {}}
          onAddToBetSlip={() => {}}
        />
      ))}
    </div>
  );
}
