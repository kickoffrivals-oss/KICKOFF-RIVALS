import { cn } from "../lib/utils";
import { LeagueEntry, UserStats } from "../types";
import { LEAGUES, TEAMS } from "../constants";
import { IconTrophy, IconChevronDown, IconUsers, IconStar } from "./Icons";
import { TeamLogo } from "./TeamLogo";
import { soundFx } from "../lib/soundFx";

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
    if (position === 1) return "bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black shadow-md shadow-amber-500/30";
    if (position === 2) return "bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-950 font-black shadow-md shadow-slate-400/20";
    if (position === 3) return "bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-black shadow-md shadow-amber-600/20";
    return "bg-slate-800 text-slate-400 font-bold";
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto w-full">
      {/* League Selector Header */}
      <div className="broadcast-card rounded-2xl p-5 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-[2px] shadow-lg shadow-amber-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400">
                <IconTrophy className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                OFFICIAL COMPETITION
              </span>
              <h1 className="text-lg font-black text-white uppercase italic tracking-tight">
                {currentLeague?.name || "League Standings"}
              </h1>
            </div>
          </div>

          {/* League Dropdown */}
          <div className="relative">
            <select
              value={currentLeagueId}
              onChange={(e) => {
                soundFx.playClick();
                onLeagueChange(e.target.value);
              }}
              className={cn(
                "h-10 pl-3 pr-8 rounded-xl appearance-none cursor-pointer text-xs font-bold",
                "bg-slate-900 border border-white/10 text-white hover:border-emerald-500/40 focus:outline-none focus:border-emerald-400",
              )}
            >
              {LEAGUES.map((league) => (
                <option key={league.id} value={league.id} className="bg-slate-900 text-white">
                  {league.name}
                </option>
              ))}
            </select>
            <IconChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* User Alliance Banner */}
      {userStats?.allianceLeagueId === currentLeagueId &&
        userStats?.allianceTeamId && (
          <div className="broadcast-card rounded-2xl p-4 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <IconUsers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Your Squad Alliance
                </p>
                <p className="text-xs text-white font-bold">
                  Supporting{" "}
                  <span className="text-amber-400 font-extrabold">
                    {sortedEntries.find(
                      (e) => e.teamId === userStats.allianceTeamId,
                    )?.teamName || "Selected Team"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Broadcast Table Card */}
      <div className="broadcast-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Table Column Headers */}
        <div className="grid grid-cols-[36px_1fr_32px_32px_32px_32px_44px] gap-1 px-4 py-3 bg-slate-950/90 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/10">
          <div className="text-center">#</div>
          <div>Club</div>
          <div className="text-center">P</div>
          <div className="text-center">W</div>
          <div className="text-center">D</div>
          <div className="text-center">L</div>
          <div className="text-center text-emerald-400">PTS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5 bg-slate-900/60">
          {sortedEntries.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-500">
              <IconTrophy className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
              <p className="font-bold text-sm text-slate-400 uppercase">No Standings Yet</p>
              <p className="text-xs">Standings update automatically as matchday simulations settle.</p>
            </div>
          ) : (
            sortedEntries.map((entry, index) => {
              const position = index + 1;
              const isAlliance = isUserAlliance(entry.teamId);
              const goalDiff = entry.goalsFor - entry.goalsAgainst;

              return (
                <div
                  key={entry.teamId}
                  className={cn(
                    "grid grid-cols-[36px_1fr_32px_32px_32px_32px_44px] gap-1 px-4 py-3 items-center transition-colors",
                    "hover:bg-white/5",
                    isAlliance && "bg-emerald-500/10 hover:bg-emerald-500/15 border-l-2 border-emerald-400",
                  )}
                >
                  {/* Position */}
                  <div className="flex justify-center">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px]",
                        getPositionBadge(position),
                      )}
                    >
                      {position}
                    </span>
                  </div>

                  {/* Team */}
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <TeamLogo
                      name={entry.teamName}
                      color={entry.color}
                      logo={teamLogoMap[entry.teamId]}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "font-bold text-xs truncate",
                            isAlliance ? "text-emerald-400 font-black" : "text-white",
                          )}
                        >
                          {entry.teamName}
                        </span>
                        {isAlliance && (
                          <IconStar className="w-3 h-3 text-amber-400 shrink-0 fill-amber-400" />
                        )}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        GD {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-center text-xs text-slate-400 font-semibold font-mono">
                    {entry.played}
                  </div>
                  <div className="text-center text-xs text-emerald-400 font-bold font-mono">
                    {entry.won}
                  </div>
                  <div className="text-center text-xs text-slate-400 font-semibold font-mono">
                    {entry.drawn}
                  </div>
                  <div className="text-center text-xs text-red-400 font-semibold font-mono">
                    {entry.lost}
                  </div>
                  <div className="text-center text-xs font-black text-amber-400 font-mono led-number">
                    {entry.points}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table Sub-Footer */}
        {sortedEntries.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-950/90 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>P: Played • W: Won • D: Drawn • L: Lost</span>
            <span className="text-emerald-400">Top 3 Qualify for Super Cup</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeagueTable;
