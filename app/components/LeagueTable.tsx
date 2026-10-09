import { cn } from "../lib/utils";
import type { LeagueEntry, UserStats } from "../types";
import { LEAGUES, TEAMS } from "../constants";
import { TeamLogo } from "./TeamLogo";
import { soundFx } from "../lib/soundFx";
import { Trophy, ChevronDown, Star, Users } from "lucide-react";
import { Chip } from "./ui/Chip";

interface LeagueTableProps {
  entries: LeagueEntry[];
  currentLeagueId: string;
  onLeagueChange: (leagueId: string) => void;
  userStats: UserStats;
}

export function LeagueTable({
  entries,
  currentLeagueId,
  onLeagueChange,
  userStats,
}: LeagueTableProps) {
  const currentLeague = LEAGUES.find((l) => l.id === currentLeagueId);

  const teamLogoMap = Object.values(TEAMS)
    .flat()
    .reduce<Record<string, string>>((acc, team) => {
      if (team.logo) acc[team.id] = team.logo;
      return acc;
    }, {});

  const sortedEntries = [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  const isUserAlliance = (teamId: string) => {
    return (
      userStats?.allianceLeagueId === currentLeagueId &&
      userStats?.allianceTeamId === teamId
    );
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return "bg-[#382305] text-[#FBBF24] border border-[#F59E0B]/50 font-bold";
    if (position === 2) return "bg-surface-raised text-text-primary border border-border-strong font-bold";
    if (position === 3) return "bg-surface-raised text-text-muted border border-border-subtle font-bold";
    return "text-text-muted font-mono";
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full p-4 sm:p-6">
      {/* League Header & Selector Bar */}
      <div className="bg-surface-panel border border-border-subtle rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-surface-raised border border-border-subtle flex items-center justify-center text-semantic-reward">
            <Trophy size={20} strokeWidth={2} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
              LEAGUE STANDINGS
            </span>
            <h1 className="text-base sm:text-lg font-black text-text-primary font-display tracking-tight uppercase">
              {currentLeague?.name || "Official Table"}
            </h1>
          </div>
        </div>

        {/* League Dropdown */}
        <div className="relative">
          <label htmlFor="league-select" className="sr-only">
            Select League
          </label>
          <select
            id="league-select"
            value={currentLeagueId}
            onChange={(e) => {
              soundFx.playClick();
              onLeagueChange(e.target.value);
            }}
            className="h-9 pl-3 pr-8 rounded-sm text-xs font-bold bg-surface-raised border border-border-subtle text-text-primary hover:border-border-strong focus:outline-none focus:border-accent appearance-none cursor-pointer w-full sm:w-auto"
          >
            {LEAGUES.map((league) => (
              <option key={league.id} value={league.id} className="bg-surface-panel text-text-primary">
                {league.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* User Alliance Callout Banner */}
      {userStats?.allianceLeagueId === currentLeagueId && userStats?.allianceTeamId && (
        <div className="bg-surface-panel border border-accent/30 rounded-md p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <Users size={16} strokeWidth={2} />
          </div>
          <div className="text-xs">
            <span className="font-bold text-accent uppercase tracking-wider block">
              Your Alliance Squad
            </span>
            <span className="text-text-primary font-semibold">
              Supporting{" "}
              <strong className="text-semantic-reward">
                {sortedEntries.find((e) => e.teamId === userStats.allianceTeamId)?.teamName || "Selected Team"}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Semantic Broadcast Standings Table */}
      <div className="bg-surface-panel border border-border-subtle rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-raised border-b border-border-subtle text-xs font-bold text-text-muted uppercase tracking-wider sticky top-0">
              <tr>
                <th scope="col" className="py-2.5 px-3 text-center w-10">#</th>
                <th scope="col" className="py-2.5 px-3">Club</th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">P</th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">W</th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">D</th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">L</th>
                <th scope="col" className="py-2.5 px-2 text-right w-12">GD</th>
                <th scope="col" className="py-2.5 px-3 text-right text-accent font-black w-14">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <Trophy size={32} className="mx-auto mb-2 opacity-30 text-semantic-reward" />
                    <p className="font-bold text-sm text-text-primary">No Standings Recorded</p>
                    <p className="text-xs text-text-muted mt-1">
                      Standings update as match rounds finish and settle.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedEntries.map((entry, index) => {
                  const position = index + 1;
                  const isAlliance = isUserAlliance(entry.teamId);
                  const goalDiff = entry.goalsFor - entry.goalsAgainst;

                  return (
                    <tr
                      key={entry.teamId}
                      className={cn(
                        "transition-colors hover:bg-surface-raised",
                        isAlliance && "bg-accent/5 border-l-2 border-accent"
                      )}
                    >
                      {/* Position */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={cn(
                            "w-6 h-6 rounded-sm inline-flex items-center justify-center text-xs font-mono tabular-nums",
                            getPositionBadge(position)
                          )}
                        >
                          {position}
                        </span>
                      </td>

                      {/* Team Logo & Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <TeamLogo
                            name={entry.teamName}
                            color={entry.color}
                            logo={teamLogoMap[entry.teamId]}
                            className="w-6 h-6 rounded-full border border-border-subtle shrink-0"
                          />
                          <span
                            className={cn(
                              "font-bold truncate max-w-[140px] sm:max-w-[200px]",
                              isAlliance ? "text-accent font-black" : "text-text-primary"
                            )}
                          >
                            {entry.teamName}
                          </span>
                          {isAlliance && (
                            <Star size={13} className="text-semantic-reward shrink-0 fill-semantic-reward" />
                          )}
                        </div>
                      </td>

                      {/* Stats - Right Aligned Tabular Monospace */}
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-text-muted">
                        {entry.played}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-text-primary font-medium">
                        {entry.won}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-text-muted">
                        {entry.drawn}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-text-muted">
                        {entry.lost}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-text-muted">
                        {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-semantic-reward">
                        {entry.points}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Helper */}
        {sortedEntries.length > 0 && (
          <div className="px-4 py-2.5 bg-surface-raised border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-1">
            <span>P: Played • W: Won • D: Drawn • L: Lost • GD: Goal Diff</span>
            <span className="text-accent font-bold">Top 3 Qualify for Championship</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeagueTable;

