import { LEAGUES } from "../../constants";
import { MatchCard } from "../MatchCard";
import type { Match, GameState } from "../../types";

interface MatchGridProps {
  matches: Match[];
  gameState: GameState;
  selectedLeagueFilter: string;
  getCurrentGameMinute: () => number;
  onBet: (match: Match) => void;
  onWatch: (match: Match) => void;
  onAddToBetSlip: (
    match: Match,
    selection: "home" | "draw" | "away" | "gg" | "nogg",
    odds: number,
  ) => void;
}

function resolveDisplayScore(m: Match, gameState: GameState, currentMinute: number) {
  if (gameState !== "LIVE" && gameState !== "FINISHED" && gameState !== "RESULT") return undefined;

  if (m.homeScore !== undefined && m.homeScore !== null) {
    return { home: m.homeScore, away: m.awayScore! };
  }

  if (m.events) {
    const homeGoals = m.events.filter(
      (e: any) =>
        e.type === "goal" && e.teamId === m.homeTeam.id && e.minute <= currentMinute,
    ).length;
    const awayGoals = m.events.filter(
      (e: any) =>
        e.type === "goal" && e.teamId === m.awayTeam.id && e.minute <= currentMinute,
    ).length;
    return { home: homeGoals, away: awayGoals };
  }

  if (m.result) {
    return { home: m.result.homeScore, away: m.result.awayScore };
  }

  return undefined;
}

export function MatchGrid({
  matches,
  gameState,
  selectedLeagueFilter,
  getCurrentGameMinute,
  onBet,
  onWatch,
  onAddToBetSlip,
}: MatchGridProps) {
  const currentMinute = getCurrentGameMinute();

  if (selectedLeagueFilter === "all") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {LEAGUES.map((league) => (
          <LeagueColumn
            key={league.id}
            league={league}
            matches={matches.filter((m) => m.leagueId === league.id)}
            gameState={gameState}
            currentMinute={currentMinute}
            onBet={onBet}
            onWatch={onWatch}
            onAddToBetSlip={onAddToBetSlip}
          />
        ))}
      </div>
    );
  }

  const filteredMatches = matches.filter(
    (m) => m.leagueId === selectedLeagueFilter,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMatches.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          minute={currentMinute}
          displayScore={resolveDisplayScore(m, gameState, currentMinute)}
          onBet={onBet}
          onWatch={onWatch}
          onAddToBetSlip={onAddToBetSlip}
        />
      ))}
    </div>
  );
}

interface LeagueColumnProps {
  league: (typeof LEAGUES)[number];
  matches: Match[];
  gameState: GameState;
  currentMinute: number;
  onBet: (match: Match) => void;
  onWatch: (match: Match) => void;
  onAddToBetSlip: (
    match: Match,
    selection: "home" | "draw" | "away" | "gg" | "nogg",
    odds: number,
  ) => void;
}

function LeagueColumn({
  league,
  matches,
  gameState,
  currentMinute,
  onBet,
  onWatch,
  onAddToBetSlip,
}: LeagueColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* League Header Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl broadcast-glass border border-white/10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <h3 className="font-extrabold text-sm text-white tracking-wide">
            {league.name}
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
          {matches.length} Matches
        </span>
      </div>

      {/* Match Cards List */}
      <div className="space-y-4">
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            minute={currentMinute}
            displayScore={resolveDisplayScore(m, gameState, currentMinute)}
            onBet={onBet}
            onWatch={onWatch}
            onAddToBetSlip={onAddToBetSlip}
          />
        ))}
      </div>
    </div>
  );
}
