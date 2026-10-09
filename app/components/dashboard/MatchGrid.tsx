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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
    <div className="flex flex-col gap-3">
      {/* Match Cards List */}
      <div className="space-y-3">
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

