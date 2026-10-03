import { useState, useEffect } from "react";
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
} from "./Icons";
import { soundFx } from "../lib/soundFx";

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const handleLaunch = () => {
    soundFx.playWhistle();
    onEnter();
  };

  return (
    <div className="min-h-screen stadium-bg text-white overflow-x-hidden font-sans flex flex-col justify-between relative">
      {/* Stadium Floodlights & Volumetric Atmospheric Beams */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-[100px]" />
        <div className="absolute top-[30%] -right-20 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] animate-float" />
        <div className="absolute bottom-[10%] -left-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Broadcast Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/10 broadcast-glass backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
          <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-sm">
            NEXT-GEN ENGINE
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors" onClick={() => soundFx.playClick()}>
            Game Engine
          </a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors" onClick={() => soundFx.playClick()}>
            How To Play
          </a>
          <a href="#tokenomics" className="hover:text-emerald-400 transition-colors" onClick={() => soundFx.playClick()}>
            Rewards
          </a>
        </div>

        <button
          onClick={handleLaunch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/25"
        >
          <IconZap className="w-3.5 h-3.5 fill-slate-950" />
          <span>Launch Arena</span>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-12 md:pt-24 md:pb-16 text-center max-w-5xl mx-auto w-full">
        {/* Live Matchday Ticker Capsule */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 mb-8 shadow-xl shadow-emerald-500/10 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
            MATCHDAY ROUND IN PROGRESS • CONTINUOUS 3-PHASE SIMULATION
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tight text-white leading-[1.05] mb-6">
          THE NEXT-GEN VIRTUAL <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
            FOOTBALL PREDICTION
          </span> LEAGUE
        </h1>

        <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
          Experience non-stop 2D pitch telemetry, dynamic combo accumulators, and instantaneous decentralized rewards in a premier sports broadcast arena.
        </p>

        {/* CTA Launch Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleLaunch}
            className={cn(
              "w-full sm:w-auto px-10 py-4.5 rounded-2xl font-black text-base uppercase tracking-wider italic",
              "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950",
              "hover:from-emerald-400 hover:to-teal-300 transition-all duration-300 hover:scale-105 active:scale-95",
              "shadow-2xl shadow-emerald-500/35 flex items-center justify-center gap-3",
            )}
          >
            <span>ENTER STADIUM ARENA</span>
            <IconArrowRight className="w-5 h-5 stroke-[3]" />
          </button>

          <a
            href="#how-it-works"
            onClick={() => soundFx.playClick()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 bg-slate-900/60 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span>How Matchday Works</span>
            <IconChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Broadcast Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl mt-16 pt-8 border-t border-white/10">
          <StatBox label="Active Leagues" value="4 Leagues" sub="Premier, LaLiga, Serie A, UCL" />
          <StatBox label="Round Cycle" value="3 Minutes" sub="Betting → Live → Settle" />
          <StatBox label="Starter Grant" value="5,000 Coins" sub="+ 1,000 KOR Tokens Free" />
          <StatBox label="Settlement" value="Instant" sub="Provably Fair Random Seeds" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-4 md:px-12 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-xs font-black tracking-[0.25em] uppercase mb-2 block">
            STADIUM HIGHLIGHTS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tight">
            ENGINEERED FOR SPORTS PREDICTORS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={<IconFootball className="w-7 h-7" />}
            title="Live 2D Pitch Radar"
            desc="Watch continuous tactical ball movements, possession meters, commentary logs, and instant goal alerts."
            accent="emerald"
          />
          <FeatureCard
            icon={<IconZap className="w-7 h-7" />}
            title="Dynamic Accumulators"
            desc="Stack multiple match picks into combo tickets with live multiplier gauges and massive return potentials."
            accent="gold"
          />
          <FeatureCard
            icon={<IconTrophy className="w-7 h-7" />}
            title="Global Hall of Fame"
            desc="Climb the real-time leaderboard, unlock daily check-in grants, and win seasonal prize distributions."
            accent="blue"
          />
          <FeatureCard
            icon={<IconUsers className="w-7 h-7" />}
            title="Squad Alliances"
            desc="Draft your favorite club, represent your league alliance, and earn collaborative victory rewards."
            accent="purple"
          />
        </div>
      </section>

      {/* How It Works Steps */}
      <section id="how-it-works" className="relative z-10 px-4 md:px-12 py-16 max-w-5xl mx-auto w-full">
        <div className="broadcast-card rounded-3xl p-8 sm:p-12 border border-white/10 text-center shadow-2xl relative overflow-hidden">
          <span className="text-amber-400 text-xs font-black tracking-[0.25em] uppercase mb-2 block">
            4-STEP MATCHDAY PLAYBOOK
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tight mb-10">
            FROM ROOKIE TO CHAMPION
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <StepItem
              num="01"
              title="Instant Entry"
              desc="Enter instantly with test credentials or custom manager profiles without gas delays."
            />
            <StepItem
              num="02"
              title="Analyze Odds"
              desc="Study team OVR ratings, head-to-head records, 1X2 lines, and Both Teams to Score (GG/NG) markets."
            />
            <StepItem
              num="03"
              title="Watch Pitch Live"
              desc="Follow real-time 90-minute compressed simulations on the visual radar pitch with commentary."
            />
            <StepItem
              num="04"
              title="Collect Winnings"
              desc="Receive automatic payouts credited directly to your balance as the referee blows full-time."
            />
          </div>

          <div className="mt-10">
            <button
              onClick={handleLaunch}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
            >
              Start Playing Now
            </button>
          </div>
        </div>
      </section>

      {/* Broadcast Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl text-center text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <RivalsLogo size="sm" variant="full" className="text-white" />
          <span>© 2026 KickOff Rivals Engine</span>
        </div>
        <div>
          Virtual Sports Entertainment Architecture • Provably Fair Settlement
        </div>
      </footer>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="broadcast-card rounded-2xl p-4 border border-white/5 text-center">
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
      <div className="text-xl sm:text-2xl font-black text-white my-0.5 led-number">{value}</div>
      <div className="text-[10px] text-emerald-400 font-semibold truncate">{sub}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: "emerald" | "gold" | "blue" | "purple" }) {
  const borderCol =
    accent === "emerald" ? "border-emerald-500/30 hover:border-emerald-400" :
    accent === "gold" ? "border-amber-500/30 hover:border-amber-400" :
    accent === "blue" ? "border-blue-500/30 hover:border-blue-400" :
    "border-purple-500/30 hover:border-purple-400";

  const iconCol =
    accent === "emerald" ? "text-emerald-400 bg-emerald-500/20" :
    accent === "gold" ? "text-amber-400 bg-amber-500/20" :
    accent === "blue" ? "text-blue-400 bg-blue-500/20" :
    "text-purple-400 bg-purple-500/20";

  return (
    <div className={cn("broadcast-card rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between", borderCol)}>
      <div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/10", iconCol)}>
          {icon}
        </div>
        <h3 className="text-base font-black text-white uppercase italic tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function StepItem({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4">
      <div className="text-2xl font-black text-emerald-400 font-mono mb-2">{num}</div>
      <div className="text-sm font-black text-white uppercase italic mb-1">{title}</div>
      <div className="text-xs text-slate-400 leading-relaxed">{desc}</div>
    </div>
  );
}

export default LandingPage;
