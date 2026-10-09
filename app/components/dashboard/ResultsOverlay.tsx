import { useState } from "react";
import { LEAGUES } from "../../constants";
import { MatchCard } from "../MatchCard";
import type { Match } from "../../types";
import { soundFx } from "../../lib/soundFx";
import { Chip } from "../ui/Chip";
import { X } from "lucide-react";

interface ResultsOverlayProps {
  timer: number;
  matches: Match[];
}

export function ResultsOverlay({ timer, matches }: ResultsOverlayProps) {
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState("all");

  return (
    <div
      id="results-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Matchday Results"
      className="fixed inset-0 z-50 bg-surface-page/95 flex flex-col items-center justify-start text-text-primary overflow-y-auto w-full p-4 sm:p-6"
    >
      <div className="w-full max-w-6xl flex flex-col items-center pt-16 pb-12 relative">
        <CloseButton />

        <RoundEndedBanner timer={timer} />

        <LeagueFilterBar
          selected={selectedLeagueFilter}
          onSelect={setSelectedLeagueFilter}
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
      aria-label="Close results overlay"
      className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-surface-raised border border-border-subtle rounded-sm hover:border-border-strong hover:bg-surface-panel text-text-muted hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-accent"
    >
      <X size={20} strokeWidth={2} />
    </button>
  );
}

function RoundEndedBanner({ timer }: { timer: number }) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="mb-3">
        <Chip variant="reward">
          MATCHDAY CONCLUDED
        </Chip>
      </div>

      <h1 className="text-2xl sm:text-4xl font-black text-text-primary tracking-tight font-display mb-3">
        FINAL ROUND RESULTS
      </h1>

      <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-surface-panel border border-border-subtle">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Next Round In:
        </span>
        <span className="text-xl font-black text-semantic-reward font-mono tabular-nums">
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
}: LeagueFilterBarProps) {
  const activeClass =
    "bg-[#1B212D] text-white border-emerald-500 font-bold";
  const inactiveClass =
    "bg-[#13171F] text-[#94A3B8] hover:text-white hover:bg-[#1B212D] hover:border-[#323C50] border-[#222938]";

  return (
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar px-0.5 w-full justify-start md:justify-center">
      <button
        onClick={() => {
          soundFx.playClick();
          onSelect("all");
        }}
        className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border focus-visible:outline-2 focus-visible:outline-emerald-500 flex items-center gap-1.5 ${
          selected === "all" ? activeClass : inactiveClass
        }`}
      >
        {selected === "all" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        <span>All Leagues</span>
      </button>
      {LEAGUES.map((league) => (
        <button
          key={league.id}
          onClick={() => {
            soundFx.playClick();
            onSelect(league.id);
          }}
          className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-emerald-500 ${
            selected === league.id ? activeClass : inactiveClass
          }`}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: league.color }}
          />
          <span>{league.name}</span>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
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

