import { useState } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import {
  IconFootball,
  IconTrophy,
  IconZap,
  IconUsers,
  IconTarget,
  IconShield,
  IconChevronRight,
  IconArrowRight,
  IconCoins,
  IconFlame,
  IconSparkles,
  IconClock,
  IconCheck,
} from "./Icons";
import { soundFx } from "../lib/soundFx";

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [selectedDemoOdds, setSelectedDemoOdds] = useState<string>("1");

  const handleLaunch = () => {
    soundFx.playWhistle();
    onEnter();
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white overflow-x-hidden flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Broadcast Navigation */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#13171F] border-b border-[#222938]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono font-bold text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>35S ROUND CYCLE</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-400">
          <a
            href="#markets"
            className="hover:text-white transition-colors"
            onClick={() => soundFx.playClick()}
          >
            Markets & Odds
          </a>
          <a
            href="#telemetry"
            className="hover:text-white transition-colors"
            onClick={() => soundFx.playClick()}
          >
            Pitch Telemetry
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors"
            onClick={() => soundFx.playClick()}
          >
            Rules & Payouts
          </a>
        </div>

        <button
          onClick={handleLaunch}
          className="flex items-center gap-1.5 h-9 px-4 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <span>Enter Arena</span>
          <IconChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero Section: Left Headline + Right Live Scoreboard Terminal Preview */}
      <section className="px-4 sm:px-8 py-10 sm:py-14 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Left-aligned dense broadcast text */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#13171F] border border-[#222938] text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ROUND #1042 IN PROGRESS • 3 LEAGUES ACTIVE</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.05]">
                VIRTUAL FOOTBALL <br />
                <span className="text-emerald-400">PREDICTION LEAGUE</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
                Fast-paced simulated matchdays running continuous 35-second rounds.
                Analyze 1X2 and GG/NoGG markets, build accumulator slips, and follow
                2D tactical radar pitch telemetry with instant coin settlements.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={handleLaunch}
                className="h-11 px-6 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <span>Launch Matchday Terminal</span>
                <IconArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#how-it-works"
                onClick={() => soundFx.playClick()}
                className="h-11 px-5 rounded-[4px] bg-[#13171F] border border-[#222938] hover:bg-[#1B212D] text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>Read Game Rules</span>
              </a>
            </div>

            {/* Fast Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-[#222938]">
              <div className="bg-[#13171F] rounded-[4px] p-2.5 border border-[#222938]">
                <span className="text-xs text-slate-400 uppercase font-bold block">Round Time</span>
                <span className="text-lg font-mono font-bold text-white tabular-nums">35 Seconds</span>
              </div>
              <div className="bg-[#13171F] rounded-[4px] p-2.5 border border-[#222938]">
                <span className="text-xs text-slate-400 uppercase font-bold block">Competitions</span>
                <span className="text-lg font-mono font-bold text-white tabular-nums">3 Leagues</span>
              </div>
              <div className="bg-[#13171F] rounded-[4px] p-2.5 border border-[#222938]">
                <span className="text-xs text-slate-400 uppercase font-bold block">Starter Grant</span>
                <span className="text-lg font-mono font-bold text-amber-400 tabular-nums">5,000 Coins</span>
              </div>
              <div className="bg-[#13171F] rounded-[4px] p-2.5 border border-[#222938]">
                <span className="text-xs text-slate-400 uppercase font-bold block">RNG Seed</span>
                <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">PRNG Verified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Matchday Scoreboard Terminal Preview */}
          <div className="lg:col-span-5">
            <div className="bg-[#13171F] rounded-[6px] border border-[#222938] shadow-2xl p-4 space-y-3.5">
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#222938]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[4px] bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-300">Premier Division</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-400">
                  <IconClock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white tabular-nums">00:24</span>
                </div>
              </div>

              {/* Match Score Strip */}
              <div className="bg-[#0A0D12] rounded-[4px] p-3 border border-[#222938]">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm text-white">Arsenal</p>
                    <p className="text-xs text-slate-500 font-mono">Rating: 88</p>
                  </div>
                  <div className="px-3 py-1 bg-[#13171F] rounded-[4px] border border-[#222938] font-mono font-bold text-lg text-white tabular-nums">
                    2 - 1
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-sm text-white">Chelsea</p>
                    <p className="text-xs text-slate-500 font-mono">Rating: 84</p>
                  </div>
                </div>
              </div>

              {/* Interactive 1X2 Odds Selector Demo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase">1X2 Match Result Markets</span>
                  <span className="text-slate-500 font-mono">Single Pick Demo</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setSelectedDemoOdds("1")}
                    className={cn(
                      "p-2 rounded-[4px] border text-center transition-colors font-mono",
                      selectedDemoOdds === "1"
                        ? "bg-emerald-500 text-slate-950 border-emerald-500 font-bold"
                        : "bg-[#0A0D12] border-[#222938] text-slate-300 hover:border-[#323C50]"
                    )}
                  >
                    <span className="text-xs block opacity-70">1 (Home)</span>
                    <span className="text-sm font-bold tabular-nums">1.85</span>
                  </button>

                  <button
                    onClick={() => setSelectedDemoOdds("X")}
                    className={cn(
                      "p-2 rounded-[4px] border text-center transition-colors font-mono",
                      selectedDemoOdds === "X"
                        ? "bg-emerald-500 text-slate-950 border-emerald-500 font-bold"
                        : "bg-[#0A0D12] border-[#222938] text-slate-300 hover:border-[#323C50]"
                    )}
                  >
                    <span className="text-xs block opacity-70">X (Draw)</span>
                    <span className="text-sm font-bold tabular-nums">3.40</span>
                  </button>

                  <button
                    onClick={() => setSelectedDemoOdds("2")}
                    className={cn(
                      "p-2 rounded-[4px] border text-center transition-colors font-mono",
                      selectedDemoOdds === "2"
                        ? "bg-emerald-500 text-slate-950 border-emerald-500 font-bold"
                        : "bg-[#0A0D12] border-[#222938] text-slate-300 hover:border-[#323C50]"
                    )}
                  >
                    <span className="text-xs block opacity-70">2 (Away)</span>
                    <span className="text-sm font-bold tabular-nums">4.10</span>
                  </button>
                </div>
              </div>

              {/* Mini Bet Slip Summary */}
              <div className="bg-[#0A0D12] rounded-[4px] p-2.5 border border-[#222938] space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Selected Stake:</span>
                  <span className="font-mono font-bold text-white tabular-nums">1,000 Coins</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Potential Return:</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {selectedDemoOdds === "1"
                      ? "1,850 Coins"
                      : selectedDemoOdds === "X"
                      ? "3,400 Coins"
                      : "4,100 Coins"}
                  </span>
                </div>
              </div>

              {/* Instant CTA inside card */}
              <button
                onClick={handleLaunch}
                className="w-full h-10 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>Place Live Predictions</span>
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid / Core Markets */}
      <section id="markets" className="px-4 sm:px-8 py-12 max-w-7xl mx-auto w-full border-t border-[#222938]">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            Core Architecture
          </span>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            Matchday Features & Markets
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938] space-y-2">
            <div className="w-8 h-8 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-emerald-400">
              <IconFootball className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              2D Pitch Radar
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time ball and player coordinate movement on a tactical radar pitch with time-stamped commentary logs.
            </p>
          </div>

          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938] space-y-2">
            <div className="w-8 h-8 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-amber-400">
              <IconZap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Accumulator Combos
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combine multiple match outcomes into single accumulator tickets with compounded odds multipliers.
            </p>
          </div>

          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938] space-y-2">
            <div className="w-8 h-8 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-emerald-400">
              <IconUsers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Club Alliances
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Align with top clubs in Premier Division, La Liga, or UCL to represent team standings and earn bonuses.
            </p>
          </div>

          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938] space-y-2">
            <div className="w-8 h-8 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-amber-400">
              <IconCoins className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Instant Settlement
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic pseudo-random simulations settle bets automatically as the full-time whistle sounds.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section id="how-it-works" className="px-4 sm:px-8 py-12 max-w-7xl mx-auto w-full border-t border-[#222938]">
        <div className="bg-[#13171F] rounded-[6px] p-6 sm:p-8 border border-[#222938]">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Playbook
            </span>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">
              4 Steps to Matchday Prediction
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            <div className="bg-[#0A0D12] rounded-[4px] p-3.5 border border-[#222938]">
              <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">01</span>
              <h4 className="font-bold text-xs uppercase text-white tracking-wider mb-1">Select Access</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect via instant Demo Account with preloaded test Coins or register custom player nickname.
              </p>
            </div>

            <div className="bg-[#0A0D12] rounded-[4px] p-3.5 border border-[#222938]">
              <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">02</span>
              <h4 className="font-bold text-xs uppercase text-white tracking-wider mb-1">Analyze Odds</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review team strength ratings, head-to-head records, 1X2 lines, and GG/NoGG markets.
              </p>
            </div>

            <div className="bg-[#0A0D12] rounded-[4px] p-3.5 border border-[#222938]">
              <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">03</span>
              <h4 className="font-bold text-xs uppercase text-white tracking-wider mb-1">Watch 2D Pitch</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Follow real-time 35-second compressed radar simulations with active events and goal notifications.
              </p>
            </div>

            <div className="bg-[#0A0D12] rounded-[4px] p-3.5 border border-[#222938]">
              <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">04</span>
              <h4 className="font-bold text-xs uppercase text-white tracking-wider mb-1">Claim Winnings</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Winning tickets credit Game Coins and KOR reward tokens directly to your balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Broadcast Footer */}
      <footer className="px-4 sm:px-8 py-5 border-t border-[#222938] bg-[#0A0D12] text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RivalsLogo size="sm" variant="full" className="text-white" />
          <span>© 2026 KickOff Rivals</span>
        </div>
        <div className="text-slate-500">
          Virtual Sportsbook Simulation Terminal • Deterministic PRNG Settlement
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
