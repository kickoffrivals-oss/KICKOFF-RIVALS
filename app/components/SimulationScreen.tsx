import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "../lib/utils";
import { Match, MatchResult } from "../types";
import { IconX, IconClock } from "./Icons";
import { soundFx } from "../lib/soundFx";
import { useTheme } from "../contexts/ThemeContext";

interface SimulationScreenProps {
  match: Match;
  result?: MatchResult | null;
  currentMinute: number;
  onFinish: () => void;
}

function getTeamCode(name: string): string {
  if (!name) return "TEM";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2 && words[0].length <= 4) return words[0].slice(0, 3).toUpperCase();
  return name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase();
}

interface Point {
  x: number;
  y: number;
}

export function SimulationScreen({
  match,
  result,
  currentMinute,
  onFinish,
}: SimulationScreenProps) {
  const { isNeoBrutalist } = useTheme();
  const [activeEventBadge, setActiveEventBadge] = useState<{
    text: string;
    type: string;
    x: number;
    y: number;
    teamCode: string;
    isHome?: boolean;
  } | null>(null);
  const [goalHighlight, setGoalHighlight] = useState<"home" | "away" | null>(null);
  const [ariaGoalAnnouncement, setAriaGoalAnnouncement] = useState<string>("");

  const eventsContainerRef = useRef<HTMLDivElement>(null);
  const lastEventMinuteRef = useRef<number>(-1);
  const ballHistoryRef = useRef<Point[]>([]);

  const finalHomeScore = match.homeScore ?? result?.homeScore ?? match.currentScore?.home ?? 0;
  const finalAwayScore = match.awayScore ?? result?.awayScore ?? match.currentScore?.away ?? 0;

  const homeCode = getTeamCode(match.homeTeam.name);
  const awayCode = getTeamCode(match.awayTeam.name);

  const homeTeamId = match.homeTeam?.id || (match as any).homeTeamId || (match as any).home_team_id;
  const awayTeamId = match.awayTeam?.id || (match as any).awayTeamId || (match as any).away_team_id;

  const isHomeEvent = (teamId: any) => {
    if (!teamId) return true;
    if (teamId === homeTeamId || String(teamId).toLowerCase() === String(homeTeamId).toLowerCase()) return true;
    if (teamId === match.homeTeam?.name || String(teamId).toLowerCase() === String(match.homeTeam?.name).toLowerCase()) return true;
    return false;
  };

  const matchEvents = useMemo(() => {
    const rawEvents = result?.events || match.events || [];
    if (rawEvents.length > 0) return rawEvents;

    // Fallback generation if no precomputed events exist
    const genEvents: any[] = [];
    const usedMin = new Set<number>();
    const getMin = (preferred: number) => {
      let m = Math.max(2, Math.min(88, preferred));
      while (usedMin.has(m) && m < 88) m++;
      usedMin.add(m);
      return m;
    };

    for (let i = 0; i < finalHomeScore; i++) {
      const min = getMin(16 + i * 26);
      const desc = i === 0 && finalHomeScore > 1
        ? `⚡ PENALTY GOAL! ${match.homeTeam.name} calmly converts from the penalty spot!`
        : i === 1
        ? `🎯 FREE KICK GOAL! Magnificent curling set-piece from ${match.homeTeam.name} bends into the top corner!`
        : `⚽ GOAL! Clinical strike into the corner by ${match.homeTeam.name}!`;
      genEvents.push({
        minute: min,
        type: "goal" as const,
        teamId: homeTeamId,
        description: desc,
      });
    }

    for (let i = 0; i < finalAwayScore; i++) {
      const min = getMin(24 + i * 26);
      const desc = i === 0 && finalAwayScore > 1
        ? `🎯 FREE KICK GOAL! Sensational dipping free kick from ${match.awayTeam.name} leaves keeper rooted!`
        : `⚽ GOAL! Swift counter-attack executed with perfection by ${match.awayTeam.name}!`;
      genEvents.push({
        minute: min,
        type: "goal" as const,
        teamId: awayTeamId,
        description: desc,
      });
    }

    // Add 2 dramatic entertainment events
    genEvents.push({
      minute: getMin(34),
      type: "save" as const,
      teamId: awayTeamId,
      description: `🧤 OUTSTANDING SAVE! ${match.awayTeam.name} goalkeeper dives full-stretch to tip a bullet shot over the crossbar!`,
    });
    genEvents.push({
      minute: getMin(62),
      type: "near_miss" as const,
      teamId: homeTeamId,
      description: `🎯 Free kick by ${match.homeTeam.name} curls viciously over the wall but clips the top of the crossbar!`,
    });

    return genEvents.sort((a, b) => a.minute - b.minute);
  }, [result?.events, match.events, finalHomeScore, finalAwayScore, homeTeamId, awayTeamId, match.homeTeam.name, match.awayTeam.name]);

  // Derived in-sync commentary events up to current minute
  const displayedEvents = useMemo(() => {
    return matchEvents
      .filter((event) => event.minute <= currentMinute)
      .sort((a, b) => b.minute - a.minute);
  }, [matchEvents, currentMinute]);

  // Live score derived strictly from active commentary goal events so the scoreboard
  // and commentary feed are always 100% in sync on both desktop and mobile
  const liveHomeScore = useMemo(() => {
    if (currentMinute >= 90) {
      return match.homeScore ?? result?.homeScore ?? matchEvents.filter((e) => e.type === "goal" && isHomeEvent(e.teamId)).length;
    }
    return displayedEvents.filter((e) => e.type === "goal" && isHomeEvent(e.teamId)).length;
  }, [displayedEvents, matchEvents, homeTeamId, match.homeScore, result?.homeScore, currentMinute]);

  const liveAwayScore = useMemo(() => {
    if (currentMinute >= 90) {
      return match.awayScore ?? result?.awayScore ?? matchEvents.filter((e) => e.type === "goal" && !isHomeEvent(e.teamId)).length;
    }
    return displayedEvents.filter((e) => e.type === "goal" && !isHomeEvent(e.teamId)).length;
  }, [displayedEvents, matchEvents, homeTeamId, match.awayScore, result?.awayScore, currentMinute]);

  // Ball trajectory coordinates (0..105, 0..68)
  const { ballX, ballY, currentEventType } = useMemo(() => {
    const recentEvent = matchEvents.find(
      (e) => e.minute === currentMinute || e.minute === currentMinute - 1
    );

    if (recentEvent) {
      const isHome = isHomeEvent(recentEvent.teamId);
      const desc = recentEvent.description || "";

      if (recentEvent.type === "goal") {
        return {
          ballX: isHome ? 104 : 1, // Into opponent's goal
          ballY: 34 + Math.sin(currentMinute) * 2,
          currentEventType: "goal" as const,
        };
      }
      if (recentEvent.type === "save") {
        return {
          ballX: isHome ? 7 : 98, // Parried right in front of net
          ballY: 34 + Math.sin(currentMinute * 2) * 5,
          currentEventType: "save" as const,
        };
      }
      if (desc.includes("PENALTY")) {
        return {
          ballX: isHome ? 94 : 11, // Penalty spot
          ballY: 34,
          currentEventType: "shot" as const,
        };
      }
      if (desc.includes("FREE KICK")) {
        return {
          ballX: isHome ? 80 : 25, // Free kick outside box
          ballY: 22 + Math.sin(currentMinute) * 12,
          currentEventType: "shot" as const,
        };
      }
      const evType = recentEvent.type as string;
      if (evType === "shot" || evType === "chance" || evType === "near_miss") {
        return {
          ballX: isHome ? 96 : 9, // Danger zone
          ballY: 34 + Math.sin(currentMinute * 2) * 8,
          currentEventType: evType,
        };
      }
      if (evType === "corner") {
        return {
          ballX: isHome ? 104 : 1,
          ballY: currentMinute % 2 === 0 ? 2 : 66,
          currentEventType: "corner" as const,
        };
      }
    }

    // Default continuous tactical ball movement across the pitch
    const xBase = Math.sin(currentMinute * 0.45) * 38 + 52.5; // ~14.5 to 90.5m
    const yBase = Math.cos(currentMinute * 0.35) * 24 + 34;   // ~10 to 58m
    return {
      ballX: Math.max(4, Math.min(101, xBase)),
      ballY: Math.max(4, Math.min(64, yBase)),
      currentEventType: null,
    };
  }, [currentMinute, matchEvents, homeTeamId]);

  // Dynamic in-game possession that realistically shifts and undulates throughout the 90 minutes
  const { homePossession, awayPossession } = useMemo(() => {
    const homeStrength = match.homeTeam.strength || 80;
    const awayStrength = match.awayTeam.strength || 80;
    const totalStrength = homeStrength + awayStrength;
    const baseHome = (homeStrength / totalStrength) * 100;

    // Match-specific deterministic seed offset
    const seedOffset = (match.id.charCodeAt(match.id.length - 1) || 5) * 0.7;

    // Macro momentum wave (longer swings of pressure, period ~16-20 mins)
    const macroWave = Math.sin((currentMinute + seedOffset) * 0.32) * 6.5;

    // Micro momentum spell (shorter tactical spells, period ~6 mins)
    const microWave = Math.cos((currentMinute + seedOffset * 1.5) * 0.85) * 3;

    // Ball territory pressure bias (when ball is in attacking half, pressing team gains share)
    const territoryShift = ((ballX - 52.5) / 52.5) * 4;

    // Scoreline dynamic: trailing team pushes more for possession
    const scoreDiff = liveHomeScore - liveAwayScore;
    const urgencyShift = scoreDiff * -1.5;

    const rawHome = baseHome + macroWave + microWave + territoryShift + urgencyShift;
    const clampedHome = Math.max(36, Math.min(64, Math.round(rawHome)));

    return {
      homePossession: clampedHome,
      awayPossession: 100 - clampedHome,
    };
  }, [match.homeTeam.strength, match.awayTeam.strength, match.id, currentMinute, ballX, liveHomeScore, liveAwayScore]);

  // Initialize lastGoalCountRef with existing goal count so opening pitch view mid-game doesn't re-trigger past celebrations
  const initialGoalCount = useMemo(() => {
    return matchEvents.filter((e) => e.type === "goal" && e.minute <= currentMinute).length;
  }, []);
  const lastGoalCountRef = useRef<number>(initialGoalCount);

  // Keep ball trail of 4 previous positions
  useEffect(() => {
    ballHistoryRef.current = [
      { x: ballX, y: ballY },
      ...ballHistoryRef.current.slice(0, 4),
    ];
  }, [ballX, ballY]);

  // Goal announcement and pitch banner events
  useEffect(() => {
    const goalEvents = displayedEvents.filter((e) => e.type === "goal");
    if (goalEvents.length > lastGoalCountRef.current) {
      const recentGoal = goalEvents[0];
      const isHome = isHomeEvent(recentGoal.teamId);
      const teamCode = isHome ? homeCode : awayCode;
      const teamName = isHome ? match.homeTeam.name : match.awayTeam.name;

      if (recentGoal.minute === currentMinute || recentGoal.minute === currentMinute - 1) {
        soundFx.playGoal();
        setGoalHighlight(isHome ? "away" : "home"); // Highlight the defending net that conceded
        setAriaGoalAnnouncement(`Goal! ${teamName} scores at minute ${recentGoal.minute}.`);

        const isPenalty = recentGoal.description.includes("PENALTY");
        const isFreeKick = recentGoal.description.includes("FREE KICK");
        const goalLabel = isPenalty ? "⚡ PENALTY GOAL" : isFreeKick ? "🎯 FREE KICK GOAL" : "GOAL";

        setActiveEventBadge({
          text: `${goalLabel} • ${teamCode} ${recentGoal.minute}'`,
          type: "goal",
          x: isHome ? 87.5 : 17.5, // Top-Right for right net goal; Top-Left for left net goal
          y: 5.5,
          teamCode,
          isHome,
        });

        const timer = setTimeout(() => {
          setGoalHighlight(null);
          setActiveEventBadge(null);
        }, 2200);
        lastGoalCountRef.current = goalEvents.length;
        return () => clearTimeout(timer);
      } else {
        lastGoalCountRef.current = goalEvents.length;
      }
    }

    // Check for other in-game events (Saves, Penalty Misses, Free Kick Misses, Big Chances, Cards)
    if (displayedEvents.length > 0 && currentMinute !== lastEventMinuteRef.current) {
      const topEvent = displayedEvents[0];
      if (topEvent.minute === currentMinute && topEvent.type !== "goal") {
        const isHome = isHomeEvent(topEvent.teamId);
        const teamCode = isHome ? homeCode : awayCode;
        const desc = topEvent.description || "";

        let badgeText = topEvent.type.toUpperCase();
        if (desc.includes("SAVE")) badgeText = "🧤 SAVE";
        else if (desc.includes("PENALTY")) badgeText = "❌ PENALTY MISS";
        else if (desc.includes("FREE KICK")) badgeText = "🎯 FREE KICK";
        else if (desc.includes("WOODWORK") || desc.includes("POST")) badgeText = "💥 OFF THE POST";
        else if (desc.includes("CHANCE")) badgeText = "⚡ BIG CHANCE";
        else if (topEvent.type === "card") badgeText = "🟨 YELLOW CARD";

        // Position all on-pitch notifications in the top corner (top-right or top-left)
        // exactly where the goal notification shows
        const isRightHalf = ballX >= 52.5 || (isHome && !desc.includes("SAVE")) || (!isHome && desc.includes("SAVE"));
        const posX = isRightHalf ? 87.5 : 17.5;

        setActiveEventBadge({
          text: `${badgeText} • ${teamCode}`,
          type: topEvent.type,
          x: posX,
          y: 5.5,
          teamCode,
          isHome,
        });

        const timer = setTimeout(() => {
          setActiveEventBadge(null);
        }, 1800);
        lastEventMinuteRef.current = currentMinute;
        return () => clearTimeout(timer);
      }
    }
  }, [displayedEvents, currentMinute, homeTeamId, homeCode, awayCode, match.homeTeam.name, match.awayTeam.name, ballX, ballY]);

  // Formations: 5 players per team shifting towards the ball
  const homePlayers: Point[] = useMemo(() => [
    { x: 5 + ballX * 0.04, y: 34 + (ballY - 34) * 0.15 },            // GK
    { x: 18 + ballX * 0.18, y: 18 + (ballY - 34) * 0.2 },          // DEF Top
    { x: 18 + ballX * 0.18, y: 50 + (ballY - 34) * 0.2 },          // DEF Bottom
    { x: 36 + ballX * 0.28, y: 34 + (ballY - 34) * 0.35 },         // MID
    { x: 52 + ballX * 0.36, y: 26 + (ballY - 34) * 0.35 },         // FWD
  ], [ballX, ballY]);

  const awayPlayers: Point[] = useMemo(() => [
    { x: 100 - (105 - ballX) * 0.04, y: 34 + (ballY - 34) * 0.15 },        // GK
    { x: 87 - (105 - ballX) * 0.18, y: 18 + (ballY - 34) * 0.2 },          // DEF Top
    { x: 87 - (105 - ballX) * 0.18, y: 50 + (ballY - 34) * 0.2 },          // DEF Bottom
    { x: 69 - (105 - ballX) * 0.28, y: 34 + (ballY - 34) * 0.35 },         // MID
    { x: 53 - (105 - ballX) * 0.36, y: 42 + (ballY - 34) * 0.35 },         // FWD
  ], [ballX, ballY]);

  // Determine closest player as ball carrier
  const { carrierTeam, carrierIndex }: { carrierTeam: "home" | "away"; carrierIndex: number } = useMemo(() => {
    let closestDist = Infinity;
    let team: "home" | "away" = "home";
    let index = 0;

    homePlayers.forEach((p, i) => {
      const d = Math.hypot(p.x - ballX, p.y - ballY);
      if (d < closestDist) {
        closestDist = d;
        team = "home";
        index = i;
      }
    });

    awayPlayers.forEach((p, i) => {
      const d = Math.hypot(p.x - ballX, p.y - ballY);
      if (d < closestDist) {
        closestDist = d;
        team = "away";
        index = i;
      }
    });

    return { carrierTeam: team, carrierIndex: index };
  }, [homePlayers, awayPlayers, ballX, ballY]);

  const isMatchFinished = currentMinute >= 90;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 backdrop-blur-sm flex flex-col overflow-hidden",
        isNeoBrutalist ? "bg-black/80 text-black" : "bg-[#0A0D12]/95 text-white"
      )}
    >
      {/* Screen Reader Announcement Region */}
      <div aria-live="polite" className="sr-only">
        {ariaGoalAnnouncement}
      </div>

      {/* Top Header Bar */}
      <header
        className={cn(
          "relative z-10 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b",
          isNeoBrutalist
            ? "bg-[#ffe600] border-black border-b-[3px] text-black font-black"
            : "bg-[#13171F] border-[#222938] text-white"
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "px-2.5 py-1 rounded-[4px] text-xs font-mono font-bold uppercase flex items-center gap-1.5",
              isNeoBrutalist
                ? isMatchFinished
                  ? "bg-white text-black border-2 border-black font-black shadow-[2px_2px_0_#000]"
                  : "bg-black text-[#00ff66] border-2 border-black font-black shadow-[2px_2px_0_#000]"
                : isMatchFinished
                ? "bg-[#1B212D] text-slate-400 border border-[#222938]"
                : "bg-red-500/20 text-red-400 border border-red-500/40"
            )}
          >
            {!isMatchFinished && (
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse motion-reduce:animate-none",
                  isNeoBrutalist ? "bg-[#00ff66]" : "bg-red-500"
                )}
              />
            )}
            {isMatchFinished ? "FULL TIME" : "LIVE SIMULATION"}
          </span>
          <span
            className={cn(
              "text-xs font-mono hidden sm:inline",
              isNeoBrutalist ? "text-black/80 font-bold" : "text-slate-400"
            )}
          >
            Tactical 2D Pitch Radar
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onFinish();
          }}
          className={cn(
            "p-1.5 rounded-[4px] transition-all focus-visible:outline-none cursor-pointer",
            isNeoBrutalist
              ? "bg-white hover:bg-black hover:text-white border-2 border-black text-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              : "bg-[#1B212D] hover:bg-[#222938] border border-[#222938] text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500"
          )}
          aria-label="Close pitch view"
        >
          <IconX className="w-4 h-4" />
        </button>
      </header>

      {/* Main Broadcast Split-Screen Viewport */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 overflow-y-auto lg:overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left: Pitch & Scoreboard Container (8 Columns) */}
        <div
          className={cn(
            "lg:col-span-8 flex flex-col justify-between rounded-[8px] p-3 sm:p-4 overflow-hidden",
            isNeoBrutalist
              ? "bg-[#fffef0] border-[3px] border-black shadow-[6px_6px_0_#000] text-black"
              : "bg-[#13171F] border border-[#222938] text-white"
          )}
        >
          {/* 1. Scoreboard Strip above Pitch */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-[6px] border mb-3",
              isNeoBrutalist
                ? "bg-white border-[2.5px] border-black shadow-[3px_3px_0_#000] text-black"
                : "bg-[#0A0D12] border-[#222938] text-white"
            )}
          >
            {/* Home Team */}
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-[2px] shrink-0",
                  isNeoBrutalist
                    ? "border-2 border-black shadow-[1px_1px_0_#000]"
                    : "border border-black/40"
                )}
                style={{
                  backgroundColor: isNeoBrutalist ? "#00ff66" : match.homeTeam.color,
                }}
              />
              <span
                className={cn(
                  "font-bold text-xs uppercase tracking-wider",
                  isNeoBrutalist ? "text-black font-black" : "text-white"
                )}
              >
                {match.homeTeam.name}
              </span>
              <span
                className={cn(
                  "font-mono text-xs font-bold hidden sm:inline",
                  isNeoBrutalist ? "text-black/60" : "text-slate-400"
                )}
              >
                ({homeCode})
              </span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] hidden md:inline font-bold",
                  isNeoBrutalist
                    ? "bg-[#00ff66] text-black border border-black shadow-[1px_1px_0_#000]"
                    : "text-emerald-400 bg-[#1B212D] border border-emerald-500/30"
                )}
              >
                ATT ▶
              </span>
            </div>

            {/* Score & Minute */}
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-1 rounded-[6px] border",
                isNeoBrutalist
                  ? "bg-[#ffe600] border-2 border-black shadow-[2px_2px_0_#000] text-black"
                  : "bg-[#13171F] border-[#222938] text-white"
              )}
            >
              <div
                className={cn(
                  "font-mono font-black text-lg sm:text-xl tabular-nums flex items-center gap-1.5",
                  isNeoBrutalist ? "text-black" : "text-white"
                )}
              >
                <span
                  className={
                    liveHomeScore > liveAwayScore
                      ? isNeoBrutalist
                        ? "text-black underline decoration-2"
                        : "text-emerald-400"
                      : ""
                  }
                >
                  {liveHomeScore}
                </span>
                <span
                  className={
                    isNeoBrutalist ? "text-black/60 font-bold" : "text-slate-500 font-normal"
                  }
                >
                  -
                </span>
                <span
                  className={
                    liveAwayScore > liveHomeScore
                      ? isNeoBrutalist
                        ? "text-black underline decoration-2"
                        : "text-emerald-400"
                      : ""
                  }
                >
                  {liveAwayScore}
                </span>
              </div>
              <span
                className={
                  isNeoBrutalist
                    ? "text-black font-bold font-mono"
                    : "text-[#323C50] font-mono"
                }
              >
                |
              </span>
              <div
                className={cn(
                  "font-mono font-black text-sm sm:text-base tabular-nums",
                  isNeoBrutalist
                    ? "text-black bg-white px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0_#000]"
                    : "text-amber-400"
                )}
              >
                {currentMinute > 90 ? "90" : currentMinute}'
              </div>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 justify-end min-w-0">
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] hidden md:inline font-bold",
                  isNeoBrutalist
                    ? "bg-[#ff0055] text-white border border-black shadow-[1px_1px_0_#000]"
                    : "text-emerald-400 bg-[#1B212D] border border-emerald-500/30"
                )}
              >
                ◀ ATT
              </span>
              <span
                className={cn(
                  "font-mono text-xs font-bold hidden sm:inline",
                  isNeoBrutalist ? "text-black/60" : "text-slate-400"
                )}
              >
                ({awayCode})
              </span>
              <span
                className={cn(
                  "font-bold text-xs uppercase tracking-wider",
                  isNeoBrutalist ? "text-black font-black" : "text-white"
                )}
              >
                {match.awayTeam.name}
              </span>
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-[2px] shrink-0",
                  isNeoBrutalist
                    ? "border-2 border-black shadow-[1px_1px_0_#000]"
                    : "border border-black/40"
                )}
                style={{
                  backgroundColor: isNeoBrutalist ? "#ff0055" : match.awayTeam.color,
                }}
              />
            </div>
          </div>

          {/* 2. Responsive 105:68 SVG Pitch View */}
          <div
            className={cn(
              "relative w-full aspect-[105/68] rounded-[6px] overflow-hidden select-none",
              isNeoBrutalist
                ? "bg-[#fcfaf2] border-[3px] border-black shadow-[4px_4px_0_#000]"
                : "bg-[#0E2319] border border-[#1F4A33]"
            )}
          >
            <svg
              viewBox="-4 -3 113 74"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Pitch Grass Base */}
              <rect
                x="0"
                y="0"
                width="105"
                height="68"
                fill={isNeoBrutalist ? "#fcfaf2" : "#0E2319"}
              />

              {/* Mowing Stripes (10 Vertical Bands) */}
              {[...Array(10)].map((_, i) => (
                <rect
                  key={i}
                  x={i * 10.5}
                  y="0"
                  width="10.5"
                  height="68"
                  fill={
                    isNeoBrutalist
                      ? i % 2 === 0
                        ? "#f5f2e1"
                        : "#fcfaf2"
                      : i % 2 === 0
                      ? "#112C1F"
                      : "#0E2319"
                  }
                />
              ))}

              {/* Attacking Third Subtle Highlight */}
              {ballX >= 70 && (
                <rect
                  x="70"
                  y="0"
                  width="35"
                  height="68"
                  fill={
                    isNeoBrutalist
                      ? "rgba(255, 230, 0, 0.15)"
                      : "rgba(255, 255, 255, 0.06)"
                  }
                />
              )}
              {ballX <= 35 && (
                <rect
                  x="0"
                  y="0"
                  width="35"
                  height="68"
                  fill={
                    isNeoBrutalist
                      ? "rgba(255, 230, 0, 0.15)"
                      : "rgba(255, 255, 255, 0.06)"
                  }
                />
              )}

              {/* Outer Pitch Border */}
              <rect
                x="0"
                y="0"
                width="105"
                height="68"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />

              {/* Halfway Line */}
              <line
                x1="52.5"
                y1="0"
                x2="52.5"
                y2="68"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />

              {/* Center Circle & Center Spot */}
              <circle
                cx="52.5"
                cy="34"
                r="9.15"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />
              <circle
                cx="52.5"
                cy="34"
                r="0.6"
                fill={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.6)"}
              />

              {/* Home Side (Left) Markings */}
              <rect
                x="0"
                y="13.84"
                width="16.5"
                height="40.32"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />
              <rect
                x="0"
                y="24.84"
                width="5.5"
                height="18.32"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />
              <circle
                cx="11"
                cy="34"
                r="0.6"
                fill={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.6)"}
              />
              <path
                d="M 16.5 26.69 A 9.15 9.15 0 0 1 16.5 41.31"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />

              {/* Away Side (Right) Markings */}
              <rect
                x="88.5"
                y="13.84"
                width="16.5"
                height="40.32"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />
              <rect
                x="99.5"
                y="24.84"
                width="5.5"
                height="18.32"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />
              <circle
                cx="94"
                cy="34"
                r="0.6"
                fill={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.6)"}
              />
              <path
                d="M 88.5 26.69 A 9.15 9.15 0 0 0 88.5 41.31"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />

              {/* Corner Arcs */}
              <path
                d="M 0 1.5 A 1.5 1.5 0 0 0 1.5 0"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />
              <path
                d="M 0 66.5 A 1.5 1.5 0 0 1 1.5 68"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />
              <path
                d="M 105 1.5 A 1.5 1.5 0 0 1 103.5 0"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />
              <path
                d="M 105 66.5 A 1.5 1.5 0 0 0 103.5 68"
                fill="none"
                stroke={isNeoBrutalist ? "#000000" : "rgba(255, 255, 255, 0.45)"}
                strokeWidth={isNeoBrutalist ? "0.8" : "0.5"}
              />

              {/* Left Outer Goal (Home Goal) */}
              <rect
                x="-3"
                y="30.34"
                width="3"
                height="7.32"
                fill={
                  goalHighlight === "home"
                    ? isNeoBrutalist
                      ? "#ff0055"
                      : "rgba(16,185,129,0.3)"
                    : "none"
                }
                stroke={
                  goalHighlight === "home"
                    ? isNeoBrutalist
                      ? "#000000"
                      : "#10B981"
                    : isNeoBrutalist
                    ? "#000000"
                    : "rgba(255,255,255,0.45)"
                }
                strokeWidth={isNeoBrutalist ? "0.8" : "0.6"}
              />

              {/* Right Outer Goal (Away Goal) */}
              <rect
                x="105"
                y="30.34"
                width="3"
                height="7.32"
                fill={
                  goalHighlight === "away"
                    ? isNeoBrutalist
                      ? "#00ff66"
                      : "rgba(16,185,129,0.3)"
                    : "none"
                }
                stroke={
                  goalHighlight === "away"
                    ? isNeoBrutalist
                      ? "#000000"
                      : "#10B981"
                    : isNeoBrutalist
                    ? "#000000"
                    : "rgba(255,255,255,0.45)"
                }
                strokeWidth={isNeoBrutalist ? "0.8" : "0.6"}
              />

              {/* Home Team Players (5 Dots: Neon Green in Neo-Brutalist) */}
              {homePlayers.map((p, idx) => {
                const isCarrier = (carrierTeam as string) === "home" && carrierIndex === idx;
                const playerColor = isNeoBrutalist ? "#00ff66" : match.homeTeam.color;
                return (
                  <g
                    key={`home-p-${idx}`}
                    className="transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="2.4"
                      fill={playerColor}
                      stroke="#000000"
                      strokeWidth={isNeoBrutalist ? "0.9" : "0.7"}
                    />
                    {isCarrier && (
                      <g>
                        <rect
                          x="-4.2"
                          y="-6"
                          width="8.4"
                          height="3.6"
                          rx="0.8"
                          fill={isNeoBrutalist ? "#ffe600" : "#0A0D12"}
                          stroke="#000000"
                          strokeWidth={isNeoBrutalist ? "0.6" : "0.3"}
                        />
                        <text
                          x="0"
                          y="-3.4"
                          textAnchor="middle"
                          fill={isNeoBrutalist ? "#000000" : "#FFFFFF"}
                          fontSize="2.2"
                          fontFamily="monospace"
                          fontWeight="900"
                        >
                          {homeCode}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Away Team Players (5 Dots: Neon Magenta in Neo-Brutalist) */}
              {awayPlayers.map((p, idx) => {
                const isCarrier = (carrierTeam as string) === "away" && carrierIndex === idx;
                const playerColor = isNeoBrutalist ? "#ff0055" : match.awayTeam.color;
                return (
                  <g
                    key={`away-p-${idx}`}
                    className="transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="2.4"
                      fill={playerColor}
                      stroke="#000000"
                      strokeWidth={isNeoBrutalist ? "0.9" : "0.7"}
                    />
                    {isCarrier && (
                      <g>
                        <rect
                          x="-4.2"
                          y="-6"
                          width="8.4"
                          height="3.6"
                          rx="0.8"
                          fill={isNeoBrutalist ? "#00ffff" : "#0A0D12"}
                          stroke="#000000"
                          strokeWidth={isNeoBrutalist ? "0.6" : "0.3"}
                        />
                        <text
                          x="0"
                          y="-3.4"
                          textAnchor="middle"
                          fill={isNeoBrutalist ? "#000000" : "#FFFFFF"}
                          fontSize="2.2"
                          fontFamily="monospace"
                          fontWeight="900"
                        >
                          {awayCode}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Ball Fading Trail */}
              {ballHistoryRef.current.map((pt, i) => (
                <circle
                  key={`trail-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={1.2 - i * 0.18}
                  fill={isNeoBrutalist ? "#000000" : "#FFFFFF"}
                  opacity={isNeoBrutalist ? 0.3 - i * 0.06 : 0.45 - i * 0.1}
                  className="motion-reduce:hidden pointer-events-none"
                />
              ))}

              {/* Ball with Vector Shadow */}
              <circle
                cx={ballX + 0.4}
                cy={ballY + 0.5}
                r="1.5"
                fill={isNeoBrutalist ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.4)"}
                className="transition-transform duration-200 ease-out motion-reduce:transition-none"
              />
              <circle
                cx={ballX}
                cy={ballY}
                r="1.5"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth={isNeoBrutalist ? "0.7" : "0.4"}
                className="transition-transform duration-200 ease-out motion-reduce:transition-none"
              />

              {/* On-Pitch Event Badge (All notifications render cleanly in top-right or top-left corner) */}
              {activeEventBadge && (() => {
                const isGoalBadge = activeEventBadge.type === "goal";
                const posX = activeEventBadge.x;
                const posY = activeEventBadge.y;

                return (
                  <g
                    className="animate-fade-in transition-opacity duration-300 pointer-events-none"
                    style={{
                      transform: `translate(${posX}px, ${posY}px)`,
                    }}
                  >
                    {/* Neo-Brutalist shadow offset for alert banner */}
                    {isNeoBrutalist && (
                      <rect
                        x="-14.2"
                        y="-2.7"
                        width="30"
                        height="7"
                        rx="1"
                        fill="#000000"
                      />
                    )}
                    <rect
                      x="-15"
                      y="-3.5"
                      width="30"
                      height="7"
                      rx="1"
                      fill={
                        isNeoBrutalist
                          ? isGoalBadge
                            ? activeEventBadge.isHome
                              ? "#00ff66"
                              : "#ff0055"
                            : activeEventBadge.type === "save"
                            ? "#00ffff"
                            : activeEventBadge.type === "near_miss"
                            ? "#ffcc00"
                            : activeEventBadge.type === "card"
                            ? "#ffe600"
                            : "#ffffff"
                          : "#0A0D12"
                      }
                      stroke="#000000"
                      strokeWidth={isNeoBrutalist ? "0.9" : "0.5"}
                    />
                    <text
                      x="0"
                      y="1.1"
                      textAnchor="middle"
                      fill={
                        isNeoBrutalist
                          ? isGoalBadge && !activeEventBadge.isHome
                            ? "#FFFFFF"
                            : "#000000"
                          : isGoalBadge
                          ? "#10B981"
                          : "#FFFFFF"
                      }
                      fontSize="2.2"
                      fontFamily="monospace"
                      fontWeight="900"
                    >
                      {activeEventBadge.text}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* 3. Team-Colored Possession Bar below Pitch */}
          <div
            className={cn(
              "mt-3 p-2.5 rounded-[6px] border space-y-1.5",
              isNeoBrutalist
                ? "bg-white border-[2.5px] border-black shadow-[3px_3px_0_#000] text-black"
                : "bg-[#0A0D12] border-[#222938] text-white"
            )}
          >
            <div className="flex justify-between items-center text-xs font-bold">
              <span
                className={cn(
                  "flex items-center gap-1.5 font-mono tabular-nums",
                  isNeoBrutalist ? "text-black font-black" : "text-white"
                )}
              >
                <span
                  className={cn(
                    "w-3 h-3 rounded-[2px]",
                    isNeoBrutalist && "border border-black"
                  )}
                  style={{
                    backgroundColor: isNeoBrutalist
                      ? "#00ff66"
                      : match.homeTeam.color,
                  }}
                />
                <span>{homeCode}</span>
                <span
                  className={
                    isNeoBrutalist
                      ? "text-black/60 font-bold"
                      : "text-slate-400 font-bold"
                  }
                >
                  {homePossession}%
                </span>
              </span>

              <span
                className={cn(
                  "text-[11px] uppercase tracking-wider font-bold",
                  isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400"
                )}
              >
                Possession
              </span>

              <span
                className={cn(
                  "flex items-center gap-1.5 font-mono tabular-nums",
                  isNeoBrutalist ? "text-black font-black" : "text-white"
                )}
              >
                <span
                  className={
                    isNeoBrutalist
                      ? "text-black/60 font-bold"
                      : "text-slate-400 font-bold"
                  }
                >
                  {awayPossession}%
                </span>
                <span>{awayCode}</span>
                <span
                  className={cn(
                    "w-3 h-3 rounded-[2px]",
                    isNeoBrutalist && "border border-black"
                  )}
                  style={{
                    backgroundColor: isNeoBrutalist
                      ? "#ff0055"
                      : match.awayTeam.color,
                  }}
                />
              </span>
            </div>

            {/* Split Progress Track with Team Colors */}
            <div
              className={cn(
                "w-full h-2 rounded-[2px] overflow-hidden flex",
                isNeoBrutalist ? "bg-slate-200 border border-black" : "bg-[#1B212D]"
              )}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${homePossession}%`,
                  backgroundColor: isNeoBrutalist
                    ? "#00ff66"
                    : match.homeTeam.color,
                }}
              />
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${awayPossession}%`,
                  backgroundColor: isNeoBrutalist
                    ? "#ff0055"
                    : match.awayTeam.color,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Live Match Events Commentary Feed (4 Columns) */}
        <div
          className={cn(
            "lg:col-span-4 flex flex-col rounded-[8px] p-3 sm:p-4 overflow-hidden",
            isNeoBrutalist
              ? "bg-[#fffef0] border-[3px] border-black shadow-[6px_6px_0_#000] text-black"
              : "bg-[#13171F] border border-[#222938] text-white"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between pb-2.5 border-b mb-3",
              isNeoBrutalist ? "border-black" : "border-[#222938]"
            )}
          >
            <h3
              className={cn(
                "text-xs font-black uppercase tracking-wider flex items-center gap-2",
                isNeoBrutalist ? "text-black" : "text-white"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isNeoBrutalist ? "bg-[#00ff66] border border-black" : "bg-emerald-500"
                )}
              />
              Commentary Feed
            </h3>
            <span
              className={cn(
                "text-xs font-mono tabular-nums font-bold",
                isNeoBrutalist ? "text-black/60" : "text-slate-400"
              )}
            >
              {displayedEvents.length} Events
            </span>
          </div>

          {/* Timeline Feed Container (Newest First) */}
          <div
            ref={eventsContainerRef}
            className="flex-1 overflow-y-auto space-y-2 pr-0.5 max-h-[45vh] lg:max-h-none"
          >
            {displayedEvents.length === 0 ? (
              <div
                className={cn(
                  "h-full flex flex-col items-center justify-center text-center p-6",
                  isNeoBrutalist ? "text-black/50" : "text-slate-500"
                )}
              >
                <IconClock className="w-6 h-6 mb-2 opacity-50" />
                <p className="text-xs font-black uppercase">Simulation In Progress...</p>
              </div>
            ) : (
              displayedEvents.map((event, idx) => {
                const isGoal = event.type === "goal";
                const desc = event.description || "";

                let tagLabel = "EVENT";
                let tagBg = "bg-white text-black";
                let cardStyle = isNeoBrutalist
                  ? "bg-white border-2 border-black text-black font-bold shadow-[2px_2px_0_#000]"
                  : "bg-[#0A0D12] border-[#222938] text-slate-300";

                if (isGoal) {
                  if (desc.includes("PENALTY")) {
                    tagLabel = "⚡ PENALTY GOAL";
                    tagBg = isNeoBrutalist ? "bg-[#ffe600] text-black" : "bg-emerald-500 text-black";
                  } else if (desc.includes("FREE KICK")) {
                    tagLabel = "🎯 FREE KICK GOAL";
                    tagBg = isNeoBrutalist ? "bg-[#00ffff] text-black" : "bg-emerald-500 text-black";
                  } else {
                    tagLabel = "⚽ GOAL";
                    tagBg = isNeoBrutalist ? "bg-black text-[#00ff66]" : "bg-emerald-500 text-black";
                  }
                  cardStyle = isNeoBrutalist
                    ? "bg-[#00ff66] border-[2.5px] border-black text-black font-black shadow-[3px_3px_0_#000]"
                    : "bg-[#1B212D] border-emerald-500/40 text-emerald-300 font-bold";
                } else if (event.type === "save" || desc.includes("SAVE")) {
                  tagLabel = "🧤 SAVE";
                  tagBg = isNeoBrutalist ? "bg-[#00ffff] text-black" : "bg-cyan-500/30 text-cyan-300";
                  cardStyle = isNeoBrutalist
                    ? "bg-[#e6ffff] border-2 border-black text-black font-bold shadow-[2px_2px_0_#000]"
                    : "bg-[#0c1c24] border-cyan-500/30 text-cyan-200";
                } else if (desc.includes("PENALTY")) {
                  tagLabel = "❌ PENALTY MISS";
                  tagBg = isNeoBrutalist ? "bg-[#ff0055] text-white" : "bg-rose-500/30 text-rose-300";
                  cardStyle = isNeoBrutalist
                    ? "bg-[#fff0f5] border-2 border-black text-black font-bold shadow-[2px_2px_0_#000]"
                    : "bg-[#1f0e14] border-rose-500/30 text-rose-200";
                } else if (desc.includes("FREE KICK")) {
                  tagLabel = "🎯 FREE KICK MISS";
                  tagBg = isNeoBrutalist ? "bg-[#ffe600] text-black" : "bg-amber-500/30 text-amber-300";
                  cardStyle = isNeoBrutalist
                    ? "bg-[#fffef0] border-2 border-black text-black font-bold shadow-[2px_2px_0_#000]"
                    : "bg-[#1f1a0e] border-amber-500/30 text-amber-200";
                } else if (desc.includes("WOODWORK") || desc.includes("POST")) {
                  tagLabel = "💥 OFF THE POST";
                  tagBg = isNeoBrutalist ? "bg-[#ff9900] text-black" : "bg-orange-500/30 text-orange-300";
                  cardStyle = isNeoBrutalist
                    ? "bg-white border-2 border-black text-black font-bold shadow-[2px_2px_0_#000]"
                    : "bg-[#0A0D12] border-[#222938] text-slate-300";
                } else if (event.type === "card") {
                  tagLabel = "🟨 CARD";
                  tagBg = isNeoBrutalist ? "bg-[#ffe600] text-black" : "bg-yellow-500/30 text-yellow-300";
                  cardStyle = isNeoBrutalist
                    ? "bg-[#fffef0] border-2 border-black text-black font-bold shadow-[2px_2px_0_#000]"
                    : "bg-[#1f1a0e] border-yellow-500/30 text-yellow-200";
                } else if (event.type === "chance") {
                  tagLabel = "⚡ CHANCE";
                  tagBg = isNeoBrutalist ? "bg-white text-black" : "bg-slate-700 text-white";
                  cardStyle = isNeoBrutalist
                    ? "bg-white border-2 border-black text-black font-bold shadow-[2px_2px_0_#000]"
                    : "bg-[#0A0D12] border-[#222938] text-slate-300";
                }

                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-2.5 rounded-[4px] border text-xs flex flex-col gap-1 transition-all",
                      cardStyle
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "font-mono font-black px-1.5 py-0.5 rounded-[2px] text-[10px] shrink-0 tabular-nums border",
                          isNeoBrutalist
                            ? "bg-[#ffe600] text-black border-black shadow-[1px_1px_0_#000]"
                            : "text-amber-400 bg-[#13171F] border-[#222938]"
                        )}
                      >
                        {event.minute}'
                      </span>
                      <span
                        className={cn(
                          "text-[9px] uppercase font-mono font-black px-1.5 py-0.5 rounded-[2px] border",
                          isNeoBrutalist ? "border-black shadow-[1px_1px_0_#000]" : "border-white/20",
                          tagBg
                        )}
                      >
                        {tagLabel}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="leading-tight text-xs font-bold pl-0.5">{event.description}</p>
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

