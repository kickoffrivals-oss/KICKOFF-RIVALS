import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "../lib/utils";
import { Match, MatchResult } from "../types";
import { IconX, IconPlay, IconPause, IconClock, IconShield } from "./Icons";
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
        description: `GOAL! ${match.homeTeam.name} scores!`,
      });
    }
    for (let i = 0; i < awayScore; i++) {
      genEvents.push({
        minute: Math.min(88, 26 + i * 28),
        type: "goal" as const,
        teamId: match.awayTeam.id,
        description: `GOAL! ${match.awayTeam.name} scores!`,
      });
    }
    return genEvents.sort((a, b) => a.minute - b.minute);
  }, [result?.events, match.events, homeScore, awayScore, match.homeTeam.id, match.homeTeam.name, match.awayTeam.id, match.awayTeam.name]);

  // Filter events up to current minute
  useEffect(() => {
    const eventsToShow = matchEvents.filter((event) => event.minute <= currentMinute);
    setDisplayedEvents(eventsToShow);

    // Detect new goals and trigger sound + celebration
    const goalEvents = eventsToShow.filter((e) => e.type === "goal");
    if (goalEvents.length > lastGoalCountRef.current) {
      const recentGoal = goalEvents[goalEvents.length - 1];
      const isHome = recentGoal.teamId === match.homeTeam.id;
      const teamName = isHome ? match.homeTeam.name : match.awayTeam.name;
      const teamColor = isHome ? match.homeTeam.color : match.awayTeam.color;

      soundFx.playGoal();
      setLatestGoal({ minute: recentGoal.minute, teamName, color: teamColor });

      const timer = setTimeout(() => {
        setLatestGoal(null);
      }, 3500);
      lastGoalCountRef.current = goalEvents.length;
      return () => clearTimeout(timer);
    }
  }, [currentMinute, matchEvents, match.homeTeam, match.awayTeam]);

  // Auto-scroll to latest event
  useEffect(() => {
    if (eventsContainerRef.current) {
      eventsContainerRef.current.scrollTop = eventsContainerRef.current.scrollHeight;
    }
  }, [displayedEvents]);

  const isMatchFinished = currentMinute >= 90;

  // Ball position on pitch simulation based on minute & recent action
  const ballX = Math.sin(currentMinute * 0.4) * 35 + 50; // 15% to 85% width
  const ballY = Math.cos(currentMinute * 0.3) * 30 + 50; // 20% to 80% height

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col overflow-hidden">
      {/* Top Broadcast TV Scorebug Banner */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black tracking-widest uppercase">
              {isMatchFinished ? "FULL TIME" : "LIVE SIMULATION"}
            </span>
          </div>

          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 font-black text-lg led-number text-amber-400">
            {currentMinute > 90 ? "90" : currentMinute}'
          </div>
        </div>

        {/* Center Teams Scoreboard Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white">{match.homeTeam.name}</span>
            <TeamLogo name={match.homeTeam.name} color={match.homeTeam.color} logo={match.homeTeam.logo} className="w-7 h-7" />
          </div>

          <div className="px-4 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-xl font-black text-white led-number shadow-inner">
            <span className={homeScore > awayScore ? "text-emerald-400" : ""}>{homeScore}</span>
            <span className="text-slate-500 mx-2">:</span>
            <span className={awayScore > homeScore ? "text-emerald-400" : ""}>{awayScore}</span>
          </div>

          <div className="flex items-center gap-2">
            <TeamLogo name={match.awayTeam.name} color={match.awayTeam.color} logo={match.awayTeam.logo} className="w-7 h-7" />
            <span className="text-xs font-black text-white">{match.awayTeam.name}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onFinish();
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all hover:scale-105"
          title="Return to Match Arena"
        >
          <IconX className="w-5 h-5" />
        </button>
      </header>

      {/* Main Broadcast Split-Screen Viewport */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left: Interactive 2D Tactical Pitch Viewport (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl broadcast-glass border border-white/10 p-4 relative overflow-hidden bg-gradient-to-b from-slate-900 to-emerald-950/40 shadow-2xl">
          {/* Goal Explosion Celebration Banner */}
          {latestGoal && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-none">
              <div className="text-5xl sm:text-7xl font-black text-amber-400 italic tracking-tighter drop-shadow-[0_0_35px_rgba(245,158,11,0.8)] animate-bounce">
                GOOOOOAL!
              </div>
              <div className="mt-3 text-xl sm:text-2xl font-black text-white flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/20">
                <span>{latestGoal.teamName}</span>
                <span className="text-emerald-400">({latestGoal.minute}')</span>
              </div>
            </div>
          )}

          {/* 2D Football Stadium Grass Pitch */}
          <div className="relative w-full aspect-[16/9] bg-[#0d542b] rounded-xl border-4 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Pitch Grass Stripes */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, #0f6132 0px, #0f6132 30px, #0d542b 30px, #0d542b 60px)",
              }}
            />

            {/* Pitch Markings: Center Line & Circle */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30 -translate-x-1/2" />
            <div className="w-28 h-28 rounded-full border-2 border-white/30 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-white/60" />
            </div>

            {/* Left Penalty Box (Home) */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-28 border-r-2 border-y-2 border-white/30 pointer-events-none" />
            {/* Right Penalty Box (Away) */}
            <div className="absolute right-0 top-1/4 bottom-1/4 w-28 border-l-2 border-y-2 border-white/30 pointer-events-none" />

            {/* Dynamic Animated Ball */}
            <div
              className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#ffffff] transition-all duration-700 ease-out -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
              style={{
                left: `${ballX}%`,
                top: `${ballY}%`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-slate-900" />
            </div>

            {/* Player Puck: Home Attacker */}
            <div
              className="absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg transition-all duration-1000 -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundColor: match.homeTeam.color,
                left: `${Math.max(20, ballX - 12)}%`,
                top: `${Math.max(25, ballY - 10)}%`,
              }}
            >
              H
            </div>

            {/* Player Puck: Away Defender */}
            <div
              className="absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg transition-all duration-1000 -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundColor: match.awayTeam.color,
                left: `${Math.min(80, ballX + 12)}%`,
                top: `${Math.min(75, ballY + 10)}%`,
              }}
            >
              A
            </div>
          </div>

          {/* Bottom Pitch Stats: Possession & Momentum Bar */}
          <div className="mt-4 bg-slate-950/80 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: match.homeTeam.color }} />
                {match.homeTeam.name} 52%
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Live Possession</span>
              <span className="flex items-center gap-1.5">
                48% {match.awayTeam.name}
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: match.awayTeam.color }} />
              </span>
            </div>
            {/* Possession Gradient Track */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: "52%" }} />
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: "48%" }} />
            </div>
          </div>
        </div>

        {/* Right: Live Match Events Timeline Commentary (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl broadcast-glass border border-white/10 p-4 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Live Commentary Ticker
            </h3>
            <span className="text-[10px] font-bold text-slate-500">
              {displayedEvents.length} Events
            </span>
          </div>

          {/* Timeline Feed Container */}
          <div
            ref={eventsContainerRef}
            className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[50vh] lg:max-h-none scrollbar-thin scrollbar-thumb-white/10"
          >
            {displayedEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <IconClock className="w-8 h-8 mb-2 opacity-40 animate-spin" />
                <p className="text-xs font-semibold">Match starting... telemetry initializing.</p>
              </div>
            ) : (
              displayedEvents.map((event, idx) => {
                const isGoal = event.type === "goal";
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all text-xs flex items-start gap-2.5",
                      isGoal
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-bold"
                        : "bg-slate-900/60 border-white/5 text-slate-300"
                    )}
                  >
                    <span className="font-black led-number text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded text-[10px]">
                      {event.minute}'
                    </span>
                    <div className="flex-1">
                      <p className="leading-snug">
                        {isGoal ? "⚽ GOAL! Ball hit the back of the net!" : event.description}
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
