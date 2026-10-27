import { useState } from "react";
import { soundFx } from "../lib/soundFx";
import { LegalFooter } from "./legal/LegalFooter";
import { CoinsKorBalance } from "./ui/CoinsKorBalance";

interface GameSelectionNeoBrutalistProps {
  onSelectFootball: () => void;
  onSelectAviator: () => void;
  onSwitchTheme?: () => void;
  balance?: number;
}

type FilterCategory = "all" | "active" | "coming_soon";

export function GameSelectionNeoBrutalist({
  onSelectFootball,
  onSelectAviator,
  onSwitchTheme,
  balance = 1000,
}: GameSelectionNeoBrutalistProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");

  const handleLaunchFootball = () => {
    soundFx.playWhistle();
    onSelectFootball();
  };

  const handleLaunchAviator = () => {
    soundFx.playClick();
    onSelectAviator();
  };

  const upcomingGames = [
    {
      id: "head-and-tail",
      title: "Head & Tail",
      tagline: "Coin Streak Flip",
      emoji: "🪙",
      badge: "IN LABS • 2X",
      badgeColor: "bg-[#ffe600] text-black",
      borderAccent: "hover:border-[#ffe600]",
    },
    {
      id: "chicken-cross",
      title: "Chicken Run",
      tagline: "Lane Survival",
      emoji: "🐔",
      badge: "IN LABS • 100X",
      badgeColor: "bg-[#ff3366] text-white",
      borderAccent: "hover:border-[#ff3366]",
    },
    {
      id: "basketball-slam",
      title: "Hoops Slam",
      tagline: "4Q Hardwood Spread",
      emoji: "🏀",
      badge: "IN LABS • LIVE",
      badgeColor: "bg-[#00f0ff] text-black",
      borderAccent: "hover:border-[#00f0ff]",
    },
    {
      id: "tennis-duel",
      title: "Tennis Duel",
      tagline: "Court Matchplay",
      emoji: "🎾",
      badge: "COMING SOON",
      badgeColor: "bg-black text-white",
      borderAccent: "hover:border-black",
    },
    {
      id: "penalty-shootout",
      title: "Penalty PK",
      tagline: "Sudden Death Kick",
      emoji: "🥅",
      badge: "COMING SOON",
      badgeColor: "bg-black text-white",
      borderAccent: "hover:border-black",
    },
    {
      id: "cyber-mines",
      title: "Cyber Mines",
      tagline: "Grid Step Multiplier",
      emoji: "💣",
      badge: "COMING SOON",
      badgeColor: "bg-black text-white",
      borderAccent: "hover:border-black",
    },
    {
      id: "lucky-dice",
      title: "Lucky Dice",
      tagline: "0-100 High/Low",
      emoji: "🎲",
      badge: "COMING SOON",
      badgeColor: "bg-black text-white",
      borderAccent: "hover:border-black",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-slate-900 flex flex-col justify-between font-sans selection:bg-[#ffe600] selection:text-black">
      {/* Background Halftone Dots Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        {/* =========================================================================
            TOP BRUTALIST HEADER BAR
        ========================================================================= */}
        <header className="px-3 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b-[3.5px] border-black bg-white shadow-[0_4px_0_#000]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-[#ffe600] border-[3px] border-black px-3.5 py-1.5 rounded-[10px] shadow-[3px_3px_0_#000] font-black italic tracking-tight text-lg sm:text-xl text-black flex items-center gap-1.5">
              <span>KICKOFF RIVALS</span>
              <span className="text-[#ff3366]">⚡</span>
            </div>
          </div>

          {/* Center/Right Controls: Revert Switcher + Balance */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Revert / Theme Switcher */}
            {onSwitchTheme && (
              <button
                onClick={onSwitchTheme}
                className="px-3 py-1.5 rounded-[8px] bg-white hover:bg-slate-100 border-[2.5px] border-black text-xs font-mono font-black text-black shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                title="Switch back to Classic UI"
              >
                <span>🏛️ Classic UI</span>
              </button>
            )}

            {/* Balance Chip Component */}
            <CoinsKorBalance balance={balance} />
          </div>
        </header>

        {/* =========================================================================
            HAZARD CAUTION TAPE / TICKER RIBBON
        ========================================================================= */}
        <div
          className="bg-[#ffe600] border-b-[3.5px] border-black px-4 py-2 overflow-x-auto no-scrollbar scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex items-center gap-6 whitespace-nowrap min-w-max text-xs sm:text-sm font-black font-mono tracking-wider text-black uppercase">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366] animate-pulse" />
              ★ ROUND #1042 LIVE NOW
            </span>
            <span>•</span>
            <span>★ AVIATOR HIT 52.81X WIN ★</span>
            <span>•</span>
            <span>★ VIRTUAL FOOTBALL 35S PAYOUTS ★</span>
            <span>•</span>
            <span>★ PROVABLY FAIR SHA-256 ★</span>
          </div>
        </div>

        {/* =========================================================================
            MAIN ARENA WORKSPACE
        ========================================================================= */}
        <main className="max-w-6xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col">
          {/* Section Heading + Filter Badges */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-[6px] bg-black text-[#ffe600] text-[10px] font-mono font-black tracking-widest uppercase mb-1.5">
                COLLECTIBLE DROPS • SERIES 01
              </div>
              <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-black leading-none">
                Arcade &amp; Stadium
              </h1>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-[8px] border-[2.5px] border-black text-xs font-mono font-black uppercase transition-all shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer ${
                  filter === "all" ? "bg-[#ffe600] text-black" : "bg-white text-slate-700"
                }`}
              >
                All Drops (9)
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1.5 rounded-[8px] border-[2.5px] border-black text-xs font-mono font-black uppercase transition-all shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer ${
                  filter === "active" ? "bg-[#ffe600] text-black" : "bg-white text-slate-700"
                }`}
              >
                ⚡ Live (2)
              </button>
              <button
                onClick={() => setFilter("coming_soon")}
                className={`px-3 py-1.5 rounded-[8px] border-[2.5px] border-black text-xs font-mono font-black uppercase transition-all shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer ${
                  filter === "coming_soon" ? "bg-[#ffe600] text-black" : "bg-white text-slate-700"
                }`}
              >
                🧪 In Labs (7)
              </button>
            </div>
          </div>

          {/* =========================================================================
              FEATURED LIVE GAMES (COLLECTIBLE STREETWEAR CARDS)
          ========================================================================= */}
          {(filter === "all" || filter === "active") && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
              {/* CARD 1: VIRTUAL FOOTBALL PRO */}
              <div className="bg-white border-[3.5px] border-black rounded-[18px] p-5 sm:p-6 shadow-[5px_5px_0_#000] flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#000]">
                <div>
                  {/* Card Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-[6px] bg-[#00f0ff] border-[2px] border-black text-[10px] font-mono font-black text-black">
                      DROP #01
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[6px] bg-[#ff3366] border-[2px] border-black text-[10px] font-mono font-black text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      24/7 LIVE
                    </span>
                  </div>

                  {/* Title & Graphic */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-black">
                        Virtual Football Pro
                      </h2>
                      <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1">
                        Premier League • 35-Second Rounds • 2D Radar Telemetry
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-[#ffe600] border-[3px] border-black flex items-center justify-center text-3xl shadow-[3px_3px_0_#000] shrink-0">
                      ⚽
                    </div>
                  </div>

                  {/* 1X2 Odds Chips */}
                  <div className="flex items-center gap-2 my-4">
                    <div className="px-3 py-1.5 rounded-[8px] bg-[#ffe600] border-[2px] border-black text-xs font-mono font-black text-black shadow-[2px_2px_0_#000]">
                      1 • 2.10
                    </div>
                    <div className="px-3 py-1.5 rounded-[8px] bg-slate-100 border-[2px] border-black text-xs font-mono font-black text-black">
                      X • 3.20
                    </div>
                    <div className="px-3 py-1.5 rounded-[8px] bg-slate-100 border-[2px] border-black text-xs font-mono font-black text-black">
                      2 • 2.85
                    </div>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleLaunchFootball}
                  className="w-full mt-2 py-3 px-4 rounded-[12px] bg-[#00ff66] hover:bg-[#05f062] border-[3px] border-black text-black font-black uppercase text-sm sm:text-base tracking-wider shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>PLAY NOW ➔</span>
                </button>
              </div>

              {/* CARD 2: THE DAILY AVIATOR */}
              <div className="bg-[#ffe600] border-[3.5px] border-black rounded-[18px] p-5 sm:p-6 shadow-[5px_5px_0_#000] flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#000]">
                <div>
                  {/* Card Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-[6px] bg-[#ff3366] border-[2px] border-black text-[10px] font-mono font-black text-white">
                      DROP #02
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[6px] bg-black border-[2px] border-black text-[10px] font-mono font-black text-[#ffe600]">
                      ● 100X MULTIPLIER
                    </span>
                  </div>

                  {/* Title & Graphic */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-black">
                        The Daily Aviator
                      </h2>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                        High Altitude Flight • Provably Fair SHA-256 • Cash Out
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-[#ff3366] border-[3px] border-black flex items-center justify-center text-3xl shadow-[3px_3px_0_#000] shrink-0">
                      ✈
                    </div>
                  </div>

                  {/* Multiplier Badges */}
                  <div className="flex items-center gap-2 my-4">
                    <div className="px-3 py-1.5 rounded-[8px] bg-black border-[2px] border-black text-xs font-mono font-black text-[#00f0ff] shadow-[2px_2px_0_#000]">
                      4.50X
                    </div>
                    <div className="px-3 py-1.5 rounded-[8px] bg-white border-[2px] border-black text-xs font-mono font-black text-black">
                      14.8X
                    </div>
                    <div className="px-3 py-1.5 rounded-[8px] bg-[#ff3366] border-[2px] border-black text-xs font-mono font-black text-white">
                      52.8X
                    </div>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleLaunchAviator}
                  className="w-full mt-2 py-3 px-4 rounded-[12px] bg-[#ff3366] hover:bg-[#e62052] border-[3px] border-black text-white font-black uppercase text-sm sm:text-base tracking-wider shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>FLY NOW ➔</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              IN LABS & UPCOMING RELEASES (BRUTALIST TILES)
          ========================================================================= */}
          {(filter === "all" || filter === "coming_soon") && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tight text-black flex items-center gap-2">
                  <span>🧪 IN LABS &amp; UPCOMING RELEASES</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-600">
                  7 EXPERIMENTS
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {upcomingGames.map((game) => (
                  <div
                    key={game.id}
                    className={`bg-white border-[3px] border-black rounded-[14px] p-3.5 sm:p-4 shadow-[4px_4px_0_#000] flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0_#000] ${game.borderAccent}`}
                  >
                    <div>
                      {/* Emoji Icon */}
                      <div className="w-12 h-12 rounded-[10px] bg-[#f4f4f0] border-[2px] border-black flex items-center justify-center text-2xl shadow-[2px_2px_0_#000] mb-3">
                        {game.emoji}
                      </div>

                      <h4 className="text-base font-black text-black leading-tight">
                        {game.title}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                        {game.tagline}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span
                        className={`inline-block w-full text-center py-1 rounded-[6px] border-[2px] border-black text-[10px] font-mono font-black ${game.badgeColor}`}
                      >
                        {game.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Legal & Compliance Footer */}
        <LegalFooter variant="neobrutalist" />

        {/* =========================================================================
            CHUNKY BOTTOM DOCK NAVIGATION
        ========================================================================= */}
        <footer className="px-3 sm:px-6 pb-4 pt-2 max-w-xl mx-auto w-full">
          <div className="bg-white border-[3.5px] border-black rounded-[16px] p-2 shadow-[4px_4px_0_#000] flex items-center justify-between">
            <button className="flex-1 py-2 rounded-[10px] bg-[#ffe600] border-[2px] border-black font-black text-xs sm:text-sm text-black text-center shadow-[2px_2px_0_#000]">
              ARENA
            </button>
            <button className="flex-1 py-2 font-black text-xs sm:text-sm text-slate-700 text-center hover:text-black">
              SLIP
            </button>
            <button className="flex-1 py-2 font-black text-xs sm:text-sm text-slate-700 text-center hover:text-black">
              RANKS
            </button>
            <button className="flex-1 py-2 font-black text-xs sm:text-sm text-slate-700 text-center hover:text-black">
              WALLET
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default GameSelectionNeoBrutalist;
