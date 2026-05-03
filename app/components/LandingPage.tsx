import { useState, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import {
  IconFootball,
  IconTrophy,
  IconZap,
  IconUsers,
  IconWallet,
  IconTarget,
  IconShield,
  IconChevronRight,
  IconArrowRight,
  IconCoins,
  IconStar,
  IconCrown,
  IconMedal,
  IconFlame,
  IconSparkles,
} from "./Icons";

interface LandingPageProps {
  onEnter: () => void;
}

const FLOATING_ICONS = [
  IconFootball,
  IconTrophy,
  IconZap,
  IconCoins,
  IconStar,
  IconCrown,
  IconMedal,
  IconFlame,
  IconSparkles,
  IconTarget,
];

function FloatingIcon({
  Icon,
  delay,
  duration,
  top,
  left,
  size,
  opacity,
}: {
  Icon: React.ElementType;
  delay: string;
  duration: string;
  top: string;
  left: string;
  size: string;
  opacity: number;
}) {
  return (
    <div
      className="absolute text-emerald-500/20 animate-float"
      style={{
        top,
        left,
        animationDelay: delay,
        animationDuration: duration,
        opacity,
      }}
    >
      <Icon className={size} />
    </div>
  );
}

export function LandingPage({ onEnter }: LandingPageProps) {
  // Generate random positions for icons on mount to avoid hydration mismatch
  const [icons, setIcons] = useState<
    Array<{
      Icon: React.ElementType;
      top: string;
      left: string;
      size: string;
      delay: string;
      duration: string;
      opacity: number;
    }>
  >([]);

  useEffect(() => {
    const newIcons = Array.from({ length: 15 }).map((_, i) => ({
      Icon: FLOATING_ICONS[Math.floor(Math.random() * FLOATING_ICONS.length)],
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `w-${Math.floor(Math.random() * 8 + 4)} h-${Math.floor(
        Math.random() * 8 + 4
      )}`, // random size between w-4 and w-12 roughly
      // Actually let's use fixed pixel sizes or standardized tailwind classes to be safe
      // changing size to class string
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 10}s`, // 10-20s float duration
      opacity: Math.random() * 0.15 + 0.05, // 0.05 - 0.2 opacity
    }));
    setIcons(
      newIcons.map((icon) => ({
        ...icon,
        size: ["w-6 h-6", "w-8 h-8", "w-10 h-10", "w-12 h-12", "w-16 h-16"][
          Math.floor(Math.random() * 5)
        ],
      }))
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Floating Icons */}
        {icons.map((icon, i) => (
          <FloatingIcon key={i} {...icon} />
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[120px] animate-float" />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[100px]"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <RivalsLogo size="md" variant="full" className="text-white" />
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a href="#stats" className="hover:text-white transition-colors">
            Stats
          </a>
        </div>
        {/*<button
          onClick={onEnter}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-all"
        >
          <IconWallet className="w-4 h-4" />
          Connect Wallet
        </button>*/}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Live badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            Live Matches Available
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-center leading-[1.1] mb-6 max-w-4xl">
          The Ultimate Virtual
          <br />
          <span className="text-gradient">Football</span> Betting League
        </h1>

        <p className="text-slate-400 text-center text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Bet, compete, and win in the world's most immersive virtual soccer
          arena. Real-time simulations, instant rewards, and blockchain-powered
          fairness.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={onEnter}
            className={cn(
              "group relative px-10 py-4 rounded-2xl font-bold text-lg",
              "bg-gradient-to-r from-emerald-500 to-emerald-600",
              "text-white shadow-lg shadow-emerald-500/25",
              "hover:shadow-xl hover:shadow-emerald-500/40",
              "hover:from-emerald-400 hover:to-emerald-500",
              "transition-all duration-300 hover:scale-105 active:scale-100",
              "animate-glow-pulse"
            )}
          >
            <span className="relative z-10 flex items-center gap-2">
              Enter Arena
              <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-6 py-4 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            How it works
            <IconChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Stats Bar */}
        {/* <div id="stats" className="flex items-center gap-6 md:gap-12">
          <StatItem value="10K+" label="Players" />
          <div className="w-px h-10 bg-white/10" />
          <StatItem value="1M+" label="Bets Placed" />
          <div className="w-px h-10 bg-white/10" />
          <StatItem value="500K+" label="KOR Won" />
        </div> */}
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 px-6 md:px-12 py-20 md:py-28"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Win
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A complete platform built for competitive sports prediction with
              Web3 rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={<IconFootball className="w-7 h-7" />}
              title="Live Matches"
              description="Real-time virtual matches with dynamic odds. Bet on the action as it unfolds, 24/7."
              gradient="from-emerald-500/20 to-emerald-900/10"
              delay={0}
            />
            <FeatureCard
              icon={<IconZap className="w-7 h-7" />}
              title="Instant Bets"
              description="Place bets seamlessly and get instant results. No waiting — just action."
              gradient="from-blue-500/20 to-blue-900/10"
              delay={100}
            />
            <FeatureCard
              icon={<IconTrophy className="w-7 h-7" />}
              title="Win Rewards"
              description="Earn KOR tokens and exclusive digital assets with every winning prediction."
              gradient="from-yellow-500/20 to-yellow-900/10"
              delay={200}
            />
            <FeatureCard
              icon={<IconUsers className="w-7 h-7" />}
              title="Alliances"
              description="Form squads, compete in team leagues, and climb the global leaderboard."
              gradient="from-purple-500/20 to-purple-900/10"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative z-10 px-6 md:px-12 py-20 md:py-28"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
              Getting Started
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Your path to glory in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StepCard
              step={1}
              icon={<IconWallet className="w-6 h-6" />}
              title="Connect Wallet"
              description="Link your crypto wallet to start your journey in the virtual arena."
            />
            <StepCard
              step={2}
              icon={<IconShield className="w-6 h-6" />}
              title="Select Your Squad"
              description="Draft your virtual team, pick your league, and join an alliance."
            />
            <StepCard
              step={3}
              icon={<IconTarget className="w-6 h-6" />}
              title="Predict & Win"
              description="Analyze stats, make informed predictions, and place your bets."
            />
            <StepCard
              step={4}
              icon={<IconTrophy className="w-6 h-6" />}
              title="Earn Rewards"
              description="Collect your winnings in KOR tokens and unlock premium features."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <RivalsLogo size="sm" variant="full" className="text-white" />
            <p className="text-slate-500 text-xs">
              © 2024 KickOff Rivals. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
          <p className="text-slate-600 text-xs">
            Play responsibly. Virtual currency only.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* —— Sub-components —— */

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-black text-white tracking-tight">
        {value}
      </div>
      <div className="text-slate-500 text-xs md:text-sm mt-0.5">{label}</div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
}: FeatureCardProps) {
  return (
    <div
      className="glass-card glow-border p-6 transition-all duration-300 hover:translate-y-[-4px] group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
          "bg-gradient-to-br",
          gradient,
          "text-emerald-400 group-hover:text-white transition-colors"
        )}
      >
        {icon}
      </div>

      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

interface StepCardProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function StepCard({ step, icon, title, description }: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center group">
      {/* Step number */}
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
        <span className="text-emerald-400 font-bold text-lg">{step}</span>
      </div>

      {/* Icon */}
      <div className="text-slate-300 mb-3 group-hover:text-emerald-400 transition-colors">
        {icon}
      </div>

      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed max-w-[220px]">
        {description}
      </p>
    </div>
  );
}

export default LandingPage;
