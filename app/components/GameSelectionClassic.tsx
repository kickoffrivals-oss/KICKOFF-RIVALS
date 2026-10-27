import { useState } from "react";
import { RivalsLogo } from "./RivalsLogo";
import { IconFootball, IconChevronRight, IconLock } from "./Icons";
import { soundFx } from "../lib/soundFx";
import { LegalFooter } from "./legal/LegalFooter";
import { CoinsKorBalance } from "./ui/CoinsKorBalance";

interface GameSelectionClassicProps {
  onSelectFootball: () => void;
  onSelectAviator: () => void;
  onSwitchTheme?: () => void;
  balance?: number;
}

type FilterCategory = "all" | "active" | "coming_soon";

export function GameSelectionClassic({
  onSelectFootball,
  onSelectAviator,
  onSwitchTheme,
  balance = 1000,
}: GameSelectionClassicProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");

  const handleSelectFootball = () => {
    soundFx.playWhistle();
    onSelectFootball();
  };

  const handleSelectAviator = () => {
    soundFx.playClick();
    onSelectAviator();
  };

  const games = [
    {
      id: "football",
      title: "Virtual Football Pro",
      status: "active",
      category: "Football • 3 Leagues",
      badge: "LIVE 24/7",
      description:
        "Premier, LaLiga & Serie A 2D radar pitch simulation with 1X2 & GG/NoGG markets and instant coin settlement.",
      features: ["3 Active Leagues", "1m Bet Window", "Instant Settle"],
      ctaText: "Enter Arena",
      onSelect: handleSelectFootball,
      accentColor: "emerald",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
          <IconFootball className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: "aviator",
      title: "The Daily Aviator",
      status: "active",
      category: "Multiplier Crash • Flight",
      badge: "LIVE 24/7",
      description:
        "High-altitude paper plane flight with soaring multipliers, provably fair SHA-256 ledger, and live cashout telemetry.",
      features: ["Provably Fair RNG", "Up to 100x+", "Instant Cashout"],
      ctaText: "Launch Flight",
      onSelect: handleSelectAviator,
      accentColor: "amber",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
        </div>
      ),
    },
    {
      id: "head-and-tail",
      title: "Head & Tail",
      status: "coming_soon",
      category: "Coin Flip • Streak Multiplier",
      badge: "COMING SOON",
      description:
        "High-stakes coin toss showdown. Pick Heads or Tails, build your win streaks, and double your stack with instant flips.",
      features: ["Instant Flips", "Streak Multiplier", "50/50 Fair RNG"],
      ctaText: "In Labs",
      onSelect: undefined,
      accentColor: "yellow",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-slate-700/60 flex items-center justify-center text-amber-400/80 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 8v8M8 12h4M12 8v8" />
            <path d="M15 8h4M17 8v8" />
          </svg>
        </div>
      ),
    },
    {
      id: "chicken-cross-road",
      title: "Chicken Cross Road",
      status: "coming_soon",
      category: "Arcade Survival • Step Run",
      badge: "COMING SOON",
      description:
        "Guide the fearless chicken across hyper-speed traffic lanes. Each safe step increases your cashout multiplier exponentially.",
      features: ["Lane Multipliers", "Step Cashout", "Dynamic Hazard"],
      ctaText: "In Labs",
      onSelect: undefined,
      accentColor: "orange",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-slate-700/60 flex items-center justify-center text-orange-400/80 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M8 21h8M12 17v4" />
            <path d="M16 11c0 3.3-2 6-5 6s-5-2.7-5-6c0-2.8 1.8-5 4-5.8V4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.2c2.2.8 4 3 4 5.8z" />
            <circle cx="11" cy="8" r="1" fill="currentColor" />
            <path d="M16 8l3-1-3 3" />
          </svg>
        </div>
      ),
    },
    {
      id: "basketball",
      title: "Basketball Slam",
      status: "coming_soon",
      category: "Hardwood • 4 Quarters",
      badge: "COMING SOON",
      description:
        "Fast-paced hoops competition with buzzer beaters, 3-point shootouts, spread handicaps, and dynamic momentum tracking.",
      features: ["4 Quarter Feeds", "Spread & Totals", "Shot Telemetry"],
      ctaText: "Coming Soon",
      onSelect: undefined,
      accentColor: "orange",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M5.6 5.6 18.4 18.4" />
            <path d="m13.5 3c2 3.5 2 7 0 10.5" />
            <path d="M3 13.5c3.5-2 7-2 10.5 0" />
          </svg>
        </div>
      ),
    },
    {
      id: "tennis",
      title: "Tennis Grand Slam",
      status: "coming_soon",
      category: "Racquet Ace • Surface Clash",
      badge: "COMING SOON",
      description:
        "Head-to-head tennis showdowns across Clay, Grass, and Hardcourt surfaces with tiebreak rush and break-point markets.",
      features: ["Surface Modifiers", "Game & Set Feeds", "Tiebreak Rush"],
      ctaText: "Coming Soon",
      onSelect: undefined,
      accentColor: "sky",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 1 9 9" />
            <path d="M12 21a9 9 0 0 1-9-9" />
          </svg>
        </div>
      ),
    },
    {
      id: "penalty",
      title: "Penalty Shootout Pro",
      status: "coming_soon",
      category: "Sudden Death • Striker vs Keeper",
      badge: "COMING SOON",
      description:
        "Step up to the spot in high-tension sudden death shootouts. Pick your shot corner and beat the keeper AI.",
      features: ["Corner Targeting", "Keeper AI Feeds", "Sudden Death"],
      ctaText: "Coming Soon",
      onSelect: undefined,
      accentColor: "red",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <rect x="3" y="5" width="18" height="12" rx="1" />
            <path d="M3 9h18M3 13h18M8 5v12M16 5v12" />
            <circle cx="12" cy="19.5" r="1.5" fill="currentColor" />
          </svg>
        </div>
      ),
    },
    {
      id: "mines",
      title: "Mines Rush",
      status: "coming_soon",
      category: "5x5 Grid • Tactical Defusal",
      badge: "COMING SOON",
      description:
        "Uncover hidden gems while avoiding hidden mines across the grid. Cash out whenever or push for the jackpot tile.",
      features: ["Custom Mines (1-24)", "Dynamic Payout", "Tile Reveal FX"],
      ctaText: "Coming Soon",
      onSelect: undefined,
      accentColor: "purple",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
          </svg>
        </div>
      ),
    },
    {
      id: "dice",
      title: "Dice Roll Royale",
      status: "coming_soon",
      category: "Provably Fair • Over/Under",
      badge: "COMING SOON",
      description:
        "Classic crypto high-low dice rolling with adjustable win-chance sliders, automated betting, and instant resolution.",
      features: ["0.00-99.99 Roll", "Edge Slider", "Auto-Bet Engine"],
      ctaText: "Coming Soon",
      onSelect: undefined,
      accentColor: "cyan",
      icon: (
        <div className="w-10 h-10 rounded-[6px] bg-[#0A0D12] border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <rect x="4" y="4" width="16" height="16" rx="2.5" />
            <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
            <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" />
            <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" />
            <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
          </svg>
        </div>
      ),
    },
  ];

  const filteredGames = games.filter((game) => {
    if (filter === "active") return game.status === "active";
    if (filter === "coming_soon") return game.status === "coming_soon";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <header className="px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          {onSwitchTheme && (
            <button
              onClick={onSwitchTheme}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[4px] bg-[#1B212D] hover:bg-[#252c3c] border border-[#ffe600]/40 text-[#ffe600] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>⚡ Switch to Neo-Brutalist</span>
            </button>
          )}

          {/* Synchronized Coins KOR Balance Chip Component */}
          <CoinsKorBalance balance={balance} />

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>DISPATCH ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Center Area */}
      <main className="flex-1 flex flex-col items-center justify-start px-3 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto w-full">
        {/* Title Block */}
        <div className="text-center mb-5 sm:mb-6 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block font-mono">
            Arena Selection Board
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Arcade & Sports
          </h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Choose an active discipline to launch live predictions, or explore upcoming simulations in development.
          </p>

          {/* New UI/UX Concepts Preview Banner */}
          <div className="pt-1.5">
            <a
              href="/concepts"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <span>✨ Reviewing Lobby Redesigns? Preview 4 New UI/UX Concepts</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setFilter("all");
              }}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-[#13171F] text-slate-400 border border-[#222938] hover:text-white"
              }`}
            >
              All Arenas ({games.length})
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setFilter("active");
              }}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === "active"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-[#13171F] text-slate-400 border border-[#222938] hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Live Now (2)</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setFilter("coming_soon");
              }}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                filter === "coming_soon"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-[#13171F] text-slate-400 border border-[#222938] hover:text-white"
              }`}
            >
              Coming Soon (7)
            </button>
          </div>
        </div>

        {/* 3x3 Responsive Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 w-full">
          {filteredGames.map((game) => {
            const isActive = game.status === "active";

            if (isActive) {
              const isFootball = game.id === "football";
              const borderClass = isFootball
                ? "border-emerald-500/70 hover:border-emerald-400 hover:shadow-emerald-500/10"
                : "border-amber-500/70 hover:border-amber-400 hover:shadow-amber-500/10";
              const categoryColor = isFootball ? "text-emerald-400" : "text-amber-400";
              const dotColor = isFootball ? "bg-emerald-500" : "bg-amber-500";
              const actionBg = isFootball
                ? "bg-emerald-500/10 border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400";
              const actionTextColor = isFootball
                ? "text-emerald-400 group-hover:text-emerald-300"
                : "text-amber-400 group-hover:text-amber-300";

              return (
                <button
                  key={game.id}
                  onClick={game.onSelect}
                  className={`bg-[#13171F] rounded-[6px] p-4 sm:p-4.5 border-2 ${borderClass} hover:bg-[#1B212D] transition-all text-left flex flex-col justify-between group shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 h-full`}
                >
                  <div>
                    {/* Header: Icon & Live Badge */}
                    <div className="flex items-center justify-between mb-3">
                      {game.icon}
                      <span className="px-2 py-0.5 rounded-[3px] bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {game.badge}
                      </span>
                    </div>

                    {/* Category & Title */}
                    <span className={`text-[10px] font-bold ${categoryColor} uppercase tracking-wider block mb-0.5 font-mono`}>
                      {game.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mb-1.5 leading-tight">
                      {game.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2 min-h-[32px]">
                      {game.description}
                    </p>

                    {/* Features Strip */}
                    <div className="grid grid-cols-3 gap-1 py-2 border-y border-[#222938] text-[10px] font-mono text-slate-300 mb-3">
                      {game.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1 min-w-0">
                          <span className={`w-1 h-1 rounded-full ${dotColor} shrink-0`} />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className={`flex items-center justify-between pt-1 text-xs font-bold ${actionTextColor} uppercase tracking-wider transition-colors`}>
                    <span>{game.ctaText}</span>
                    <div className={`w-6 h-6 rounded-[3px] border flex items-center justify-center transition-colors ${actionBg}`}>
                      <IconChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            }

            // Compact Coming Soon Card
            return (
              <div
                key={game.id}
                className="bg-[#10141D]/90 rounded-[6px] p-4 sm:p-4.5 border border-[#222938] text-left flex flex-col justify-between opacity-80 hover:opacity-95 transition-opacity relative overflow-hidden h-full"
              >
                <div>
                  {/* Header: Icon & Coming Soon Badge */}
                  <div className="flex items-center justify-between mb-3">
                    {game.icon}
                    <span className="px-2 py-0.5 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <IconLock className="w-2.5 h-2.5" />
                      {game.badge}
                    </span>
                  </div>

                  {/* Category & Title */}
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 font-mono">
                    {game.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-300 uppercase tracking-tight mb-1.5 leading-tight">
                    {game.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2 min-h-[32px]">
                    {game.description}
                  </p>

                  {/* Features Strip */}
                  <div className="grid grid-cols-3 gap-1 py-2 border-y border-[#1A202C] text-[10px] font-mono text-slate-500 mb-3">
                    {game.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1 min-w-0">
                        <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locked Action Strip */}
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-amber-400/90 font-bold">
                    <IconLock className="w-3 h-3 text-amber-400" />
                    <span>COMING SOON</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/90 border border-amber-500/20">
                    IN LABS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Legal & Compliance Broadcast Footer */}
      <LegalFooter variant="classic" />
    </div>
  );
}

export default GameSelectionClassic;
