import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "../lib/utils";
import { Match, MatchResult } from "../types";
import { IconX, IconPlay, IconPause, IconClock, IconShield, IconFootball } from "./Icons";
import { TeamLogo } from "./TeamLogo";
import { soundFx } from "../lib/soundFx";

interface SimulationScreenProps {
  match: Match;
  result?: MatchResult | null;
  currentMinute: number;
  onFinish: () => void;
}

export function SimulationScreen({
  match,
  result,
  currentMinute,
  onFinish,
}: SimulationScreenProps) {
  const [displayedEvents, setDisplayedEvents] = useState<any[]>([]);
  const [latestGoal, setLatestGoal] = useState<{ minute: number; teamName: string; color: string } | null>(null);
  const eventsContainerRef = useRef<HTMLDivElement>(null);
  const lastGoalCountRef = useRef<number>(0);

  const homeScore = match.currentScore?.home ?? match.homeScore ?? result?.homeScore ?? 0;
  const awayScore = match.currentScore?.away ?? match.awayScore ?? result?.awayScore ?? 0;

  const matchEvents = useMemo(() => {
    const rawEvents = result?.events || match.events || [];
    if (rawEvents.length > 0) return rawEvents;

    // Fallback generation if no precomputed events exist
    const genEvents = [];
    for (let i = 0; i < homeScore; i++) {
      genEvents.push({
        minute: Math.min(85, 18 + i * 28),
        type: "goal" as const,
        teamId: match.homeTeam.id,
        description: `Goal scored by ${match.homeTeam.name}`,
      });
    }
    for (let i = 0; i < awayScore; i++) {
      genEvents.push({
        minute: Math.min(88, 26 + i * 28),
        type: "goal" as const,
        teamId: match.awayTeam.id,
        description: `Goal scored by ${match.awayTeam.name}`,
      });
    }
    return genEvents.sort((a, b) => a.minute - b.minute);
  }, [result?.events, match.events, homeScore, awayScore, match.homeTeam.id, match.homeTeam.name, match.awayTeam.id, match.awayTeam.name]);

  // Filter events up to current minute, sorted newest first
  useEffect(() => {
    const eventsToShow = matchEvents
      .filter((event) => event.minute <= currentMinute)
      .sort((a, b) => b.minute - a.minute); // Newest first
    setDisplayedEvents(eventsToShow);

    // Detect new goals and trigger sound + restrained alert
    const goalEvents = eventsToShow.filter((e) => e.type === "goal");
    if (goalEvents.length > lastGoalCountRef.current) {
      const recentGoal = goalEvents[0];
      const isHome = recentGoal.teamId === match.homeTeam.id;
      const teamName = isHome ? match.homeTeam.name : match.awayTeam.name;
      const teamColor = isHome ? match.homeTeam.color : match.awayTeam.color;

      soundFx.playGoal();
      setLatestGoal({ minute: recentGoal.minute, teamName, color: teamColor });

      const timer = setTimeout(() => {
        setLatestGoal(null);
      }, 2500);
      lastGoalCountRef.current = goalEvents.length;
      return () => clearTimeout(timer);
    }
  }, [currentMinute, matchEvents, match.homeTeam, match.awayTeam]);

  const isMatchFinished = currentMinute >= 90;

  // Ball position on pitch simulation based on minute & recent action
  const ballX = Math.sin(currentMinute * 0.4) * 35 + 50; // 15% to 85% width
  const ballY = Math.cos(currentMinute * 0.3) * 30 + 50; // 20% to 80% height

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0D12]/95 backdrop-blur-sm flex flex-col overflow-hidden text-white">
      {/* Top Broadcast TV Scorebug Banner */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "px-2 py-0.5 rounded-[4px] text-xs font-mono font-bold uppercase flex items-center gap-1.5",
                isMatchFinished
                  ? "bg-[#1B212D] text-slate-400 border border-[#222938]"
                  : "bg-red-500/20 text-red-400 border border-red-500/40"
              )}
            >
              {!isMatchFinished && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none" />}
              {isMatchFinished ? "FULL TIME" : "LIVE SIMULATION"}
            </span>
          </div>

          <div className="px-2.5 py-0.5 rounded-[4px] bg-[#0A0D12] border border-[#222938] font-mono font-bold text-base text-amber-400 tabular-nums">
            {currentMinute > 90 ? "90" : currentMinute}'
          </div>
        </div>

        {/* Center Teams Scoreboard Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-white hidden sm:inline">{match.homeTeam.name}</span>
            <TeamLogo name={match.homeTeam.name} color={match.homeTeam.color} logo={match.homeTeam.logo} className="w-6 h-6" />
          </div>

          <div className="px-3 py-1 rounded-[4px] bg-[#0A0D12] border border-[#222938] text-base font-bold font-mono text-white tabular-nums">
            <span className={homeScore > awayScore ? "text-emerald-400" : ""}>{homeScore}</span>
            <span className="text-slate-500 mx-1.5">-</span>
            <span className={awayScore > homeScore ? "text-emerald-400" : ""}>{awayScore}</span>
          </div>

          <div className="flex items-center gap-2">
            <TeamLogo name={match.awayTeam.name} color={match.awayTeam.color} logo={match.awayTeam.logo} className="w-6 h-6" />
            <span className="text-xs font-bold uppercase text-white hidden sm:inline">{match.awayTeam.name}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onFinish();
          }}
          className="p-1.5 rounded-[4px] bg-[#1B212D] hover:bg-[#222938] border border-[#222938] text-slate-400 hover:text-white transition-colors"
          aria-label="Return to match arena"
        >
          <IconX className="w-4 h-4" />
        </button>
      </header>

      {/* Main Broadcast Split-Screen Viewport */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left: Interactive 2D Tactical Pitch Viewport (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-[6px] bg-[#13171F] border border-[#222938] p-4 relative overflow-hidden">
          {/* Restrained Goal Alert Banner */}
          {latestGoal && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-[4px] bg-[#0A0D12] border border-emerald-500 shadow-lg animate-fade-in motion-reduce:animate-none">
              <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500 text-slate-950 text-xs font-bold uppercase font-mono">
                GOAL
              </span>
              <span className="text-xs font-bold text-white uppercase">{latestGoal.teamName}</span>
              <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">({latestGoal.minute}')</span>
            </div>
          )}

          {/* 2D Flat Tactical Pitch */}
          <div className="relative w-full aspect-[16/9] bg-[#0E2319] rounded-[4px] border border-[#1F4A33] overflow-hidden flex items-center justify-center">
            {/* Pitch Markings: Center Line & Circle */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1F4A33] -translate-x-1/2" />
            <div className="w-24 h-24 rounded-full border border-[#1F4A33] flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1F4A33]" />
            </div>

            {/* Left Penalty Box (Home) */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-24 border-r border-y border-[#1F4A33] pointer-events-none" />
            <div className="absolute left-0 top-[37.5%] bottom-[37.5%] w-10 border-r border-y border-[#1F4A33] pointer-events-none" />

            {/* Right Penalty Box (Away) */}
            <div className="absolute right-0 top-1/4 bottom-1/4 w-24 border-l border-y border-[#1F4A33] pointer-events-none" />
            <div className="absolute right-0 top-[37.5%] bottom-[37.5%] w-10 border-l border-y border-[#1F4A33] pointer-events-none" />

            {/* Dynamic Ball */}
            <div
              className="absolute w-3 h-3 rounded-full bg-white border border-slate-900 transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 z-20 motion-reduce:transition-none"
              style={{
                left: `${ballX}%`,
                top: `${ballY}%`,
              }}
            />

            {/* Player Puck: Home Attacker */}
            <div
              className="absolute w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold text-white border border-black/40 transition-all duration-500 -translate-x-1/2 -translate-y-1/2 motion-reduce:transition-none"
              style={{
                backgroundColor: match.homeTeam.color,
                left: `${Math.max(15, ballX - 10)}%`,
                top: `${Math.max(20, ballY - 8)}%`,
              }}
            >
              H
            </div>

            {/* Player Puck: Away Defender */}
            <div
              className="absolute w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold text-white border border-black/40 transition-all duration-500 -translate-x-1/2 -translate-y-1/2 motion-reduce:transition-none"
              style={{
                backgroundColor: match.awayTeam.color,
                left: `${Math.min(85, ballX + 10)}%`,
                top: `${Math.min(80, ballY + 8)}%`,
              }}
            >
              A
            </div>
          </div>

          {/* Bottom Pitch Stats: Possession */}
          <div className="mt-3 bg-[#0A0D12] p-2.5 rounded-[4px] border border-[#222938] space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: match.homeTeam.color }} />
                {match.homeTeam.name} 52%
              </span>
              <span className="text-xs uppercase font-bold text-slate-400">Match Possession</span>
              <span className="flex items-center gap-1.5">
                48% {match.awayTeam.name}
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: match.awayTeam.color }} />
              </span>
            </div>
            {/* Possession Track */}
            <div className="w-full h-1.5 rounded-[2px] bg-[#1B212D] overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: "52%" }} />
              <div className="h-full bg-slate-500 transition-all duration-300" style={{ width: "48%" }} />
            </div>
          </div>
        </div>

        {/* Right: Live Match Events Timeline Commentary (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col rounded-[6px] bg-[#13171F] border border-[#222938] p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#222938] mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Commentary Feed
            </h3>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {displayedEvents.length} Events
            </span>
          </div>

          {/* Timeline Feed Container (Newest First) */}
          <div
            ref={eventsContainerRef}
            className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[50vh] lg:max-h-none"
          >
            {displayedEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <IconClock className="w-6 h-6 mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase">Simulation Initializing...</p>
              </div>
            ) : (
              displayedEvents.map((event, idx) => {
                const isGoal = event.type === "goal";
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-2 rounded-[4px] border text-xs flex items-start gap-2",
                      isGoal
                        ? "bg-[#1B212D] border-emerald-500/40 text-emerald-300 font-bold"
                        : "bg-[#0A0D12] border-[#222938] text-slate-300"
                    )}
                  >
                    <span className="font-mono font-bold text-amber-400 bg-[#13171F] px-1.5 py-0.5 rounded-[2px] text-xs shrink-0 tabular-nums border border-[#222938]">
                      {event.minute}'
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="leading-tight">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationScreen;
