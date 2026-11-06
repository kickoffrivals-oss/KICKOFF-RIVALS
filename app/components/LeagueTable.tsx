import { cn } from "../lib/utils";
import type { LeagueEntry, UserStats } from "../types";
import { LEAGUES, TEAMS } from "../constants";
import { TeamLogo } from "./TeamLogo";
import { soundFx } from "../lib/soundFx";
import { Trophy, ChevronDown, Star, Users } from "lucide-react";
import { Chip } from "./ui/Chip";
import { useTheme } from "../contexts/ThemeContext";

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
  const { isNeoBrutalist } = useTheme();
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
    if (isNeoBrutalist) {
      if (position === 1) return "bg-[#ffe600] text-black border-2 border-black font-black shadow-[1px_1px_0_#000]";
      if (position === 2) return "bg-white text-black border-2 border-black font-black shadow-[1px_1px_0_#000]";
      if (position === 3) return "bg-[#00ff66] text-black border-2 border-black font-black shadow-[1px_1px_0_#000]";
      return "text-black/80 font-mono font-bold bg-[#fcfaf2] border border-black/30";
    }
    if (position === 1) return "bg-[#382305] text-[#FBBF24] border border-[#F59E0B]/50 font-bold";
    if (position === 2) return "bg-surface-raised text-text-primary border border-border-strong font-bold";
    if (position === 3) return "bg-surface-raised text-text-muted border border-border-subtle font-bold";
    return "text-text-muted font-mono";
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full p-4 sm:p-6">
      {/* League Header & Selector Bar */}
      <div
        className={cn(
          "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors",
          isNeoBrutalist
            ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
            : "bg-surface-panel border border-border-subtle rounded-md"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 flex items-center justify-center shrink-0",
              isNeoBrutalist
                ? "bg-[#ffe600] border-2 border-black rounded-[6px] text-black shadow-[2px_2px_0_#000]"
                : "rounded-sm bg-surface-raised border border-border-subtle text-semantic-reward"
            )}
          >
            <Trophy size={20} strokeWidth={isNeoBrutalist ? 2.5 : 2} />
          </div>
          <div>
            <span
              className={cn(
                "text-xs uppercase tracking-wider block",
                isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted font-bold"
              )}
            >
              LEAGUE STANDINGS
            </span>
            <h1
              className={cn(
                "text-base sm:text-lg font-black font-display tracking-tight uppercase",
                isNeoBrutalist ? "text-black font-black" : "text-text-primary"
              )}
            >
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
            className={cn(
              "h-9 pl-3 pr-8 text-xs font-bold appearance-none cursor-pointer w-full sm:w-auto transition-all",
              isNeoBrutalist
                ? "bg-white border-2 border-black rounded-[6px] text-black font-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600]"
                : "rounded-sm bg-surface-raised border border-border-subtle text-text-primary hover:border-border-strong focus:outline-none focus:border-accent"
            )}
          >
            {LEAGUES.map((league) => (
              <option
                key={league.id}
                value={league.id}
                className={isNeoBrutalist ? "bg-white text-black font-bold" : "bg-surface-panel text-text-primary"}
              >
                {league.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className={cn(
              "absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
              isNeoBrutalist ? "text-black" : "text-text-muted"
            )}
          />
        </div>
      </div>

      {/* User Alliance Callout Banner */}
      {userStats?.allianceLeagueId === currentLeagueId && userStats?.allianceTeamId && (
        <div
          className={cn(
            "p-3 flex items-center gap-3 transition-colors",
            isNeoBrutalist
              ? "bg-[#ffe600] border-2 border-black rounded-[8px] shadow-[3px_3px_0_#000] text-black"
              : "bg-surface-panel border border-accent/30 rounded-md"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 flex items-center justify-center shrink-0",
              isNeoBrutalist
                ? "bg-white border-2 border-black rounded-[4px] text-black shadow-[1px_1px_0_#000]"
                : "rounded-sm bg-accent/10 border border-accent/20 text-accent"
            )}
          >
            <Users size={16} strokeWidth={isNeoBrutalist ? 2.5 : 2} />
          </div>
          <div className="text-xs">
            <span
              className={cn(
                "uppercase tracking-wider block",
                isNeoBrutalist ? "font-black text-black" : "font-bold text-accent"
              )}
            >
              Your Alliance Squad
            </span>
            <span className={cn(isNeoBrutalist ? "text-black font-bold" : "text-text-primary font-semibold")}>
              Supporting{" "}
              <strong className={isNeoBrutalist ? "text-[#ff0055] font-black" : "text-semantic-reward"}>
                {sortedEntries.find((e) => e.teamId === userStats.allianceTeamId)?.teamName || "Selected Team"}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Semantic Broadcast Standings Table */}
      <div
        className={cn(
          "overflow-hidden transition-colors",
          isNeoBrutalist
            ? "bg-white border-2 sm:border-[3px] border-black rounded-[10px] shadow-[4px_4px_0_#000] text-black"
            : "bg-surface-panel border border-border-subtle rounded-md"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead
              className={cn(
                "text-xs uppercase tracking-wider sticky top-0",
                isNeoBrutalist
                  ? "bg-[#fcfaf2] border-b-2 border-black text-black font-black"
                  : "bg-surface-raised border-b border-border-subtle font-bold text-text-muted"
              )}
            >
              <tr>
                <th scope="col" className="py-2.5 px-3 text-center w-10">#</th>
                <th scope="col" className="py-2.5 px-3">Club</th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">P</th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">W</th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">D</th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">L</th>
                <th scope="col" className="py-2.5 px-2 text-right w-12">GD</th>
                <th
                  scope="col"
                  className={cn(
                    "py-2.5 px-3 text-right font-black w-14",
                    isNeoBrutalist ? "text-black" : "text-accent"
                  )}
                >
                  PTS
                </th>
              </tr>
            </thead>
            <tbody
              className={cn(
                "text-xs",
                isNeoBrutalist ? "divide-y divide-black/15" : "divide-y divide-border-subtle"
              )}
            >
              {sortedEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className={cn(
                      "py-12 text-center",
                      isNeoBrutalist ? "text-black/70" : "text-text-muted"
                    )}
                  >
                    <Trophy
                      size={32}
                      className={cn(
                        "mx-auto mb-2",
                        isNeoBrutalist ? "text-black" : "opacity-30 text-semantic-reward"
                      )}
                    />
                    <p className={cn("text-sm", isNeoBrutalist ? "font-black text-black" : "font-bold text-text-primary")}>
                      No Standings Recorded
                    </p>
                    <p className="text-xs mt-1">
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
                        "transition-colors",
                        isNeoBrutalist
                          ? isAlliance
                            ? "bg-[#ffe600]/25 border-l-4 border-black"
                            : "hover:bg-[#fffef0]"
                          : isAlliance
                          ? "bg-accent/5 border-l-2 border-accent hover:bg-surface-raised"
                          : "hover:bg-surface-raised"
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
                            className={cn(
                              "w-6 h-6 rounded-full shrink-0",
                              isNeoBrutalist ? "border-2 border-black" : "border border-border-subtle"
                            )}
                          />
                          <span
                            className={cn(
                              "truncate max-w-[140px] sm:max-w-[200px]",
                              isNeoBrutalist
                                ? "font-black text-black"
                                : isAlliance
                                ? "text-accent font-black"
                                : "font-bold text-text-primary"
                            )}
                          >
                            {entry.teamName}
                          </span>
                          {isAlliance && (
                            <Star size={13} className={isNeoBrutalist ? "text-black fill-black shrink-0" : "text-semantic-reward shrink-0 fill-semantic-reward"} />
                          )}
                        </div>
                      </td>

                      {/* Stats - Right Aligned Tabular Monospace */}
                      <td className={cn("py-2.5 px-2 text-right font-mono tabular-nums", isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted")}>
                        {entry.played}
                      </td>
                      <td className={cn("py-2.5 px-2 text-right font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-text-primary font-medium")}>
                        {entry.won}
                      </td>
                      <td className={cn("py-2.5 px-2 text-right font-mono tabular-nums", isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted")}>
                        {entry.drawn}
                      </td>
                      <td className={cn("py-2.5 px-2 text-right font-mono tabular-nums", isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted")}>
                        {entry.lost}
                      </td>
                      <td className={cn("py-2.5 px-2 text-right font-mono tabular-nums", isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted")}>
                        {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                      </td>
                      <td className={cn("py-2.5 px-3 text-right font-mono tabular-nums font-black", isNeoBrutalist ? "text-black text-sm" : "text-semantic-reward")}>
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
          <div
            className={cn(
              "px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs gap-1",
              isNeoBrutalist
                ? "bg-[#fcfaf2] border-t-2 border-black text-black font-bold"
                : "bg-surface-raised border-t border-border-subtle text-text-muted"
            )}
          >
            <span>P: Played • W: Won • D: Drawn • L: Lost • GD: Goal Diff</span>
            <span className={cn(isNeoBrutalist ? "text-black font-black" : "text-accent font-bold")}>
              Top 3 Qualify for Championship
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeagueTable;

