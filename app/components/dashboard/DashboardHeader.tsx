import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  IconHome,
  IconTicket,
  IconUser,
  IconTable,
  IconCoins,
  IconZap,
  IconRefresh,
  IconTrophy,
} from "../Icons";
import { RivalsLogo } from "../RivalsLogo";
import { useUserStore } from "../../stores/userStore";
import { useProfile } from "../../hooks/useProfile";
import { useGame } from "../../contexts/GameContext";
import { formatNumber } from "../../lib/utils";
import { soundFx } from "../../lib/soundFx";

interface NavTab {
  to: "/dashboard/home" | "/dashboard/league" | "/dashboard/bets" | "/dashboard/leaderboard" | "/dashboard/profile";
  label: string;
  badge?: string;
  icon: React.ReactNode;
}

const NAV_TABS: NavTab[] = [
  {
    to: "/dashboard/home",
    label: "Live Arena",
    badge: "LIVE",
    icon: <IconHome className="w-4 h-4" />,
  },
  {
    to: "/dashboard/league",
    label: "Standings",
    icon: <IconTable className="w-4 h-4" />,
  },
  {
    to: "/dashboard/bets",
    label: "My Slips",
    icon: <IconTicket className="w-4 h-4" />,
  },
  {
    to: "/dashboard/leaderboard",
    label: "Rankings",
    icon: <IconTrophy className="w-4 h-4" />,
  },
  {
    to: "/dashboard/profile",
    label: "Club HQ",
    icon: <IconUser className="w-4 h-4" />,
  },
];

export function DashboardHeader() {
  const { walletState } = useUserStore();
  const { profile, isLoading, refresh, isFetching } = useProfile();
  const { gameState, roundNumber, timer } = useGame();
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const location = useLocation();

  const isRoundEnded = gameState === "FINISHED" || gameState === "RESULT";
  const canRefresh = isRoundEnded && !isFetching;

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  return (
    <header className="sticky top-0 z-50 broadcast-glass border-b border-white/10 backdrop-blur-2xl">
      {/* Top Stadium Marquee Ticker */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950/80 to-blue-950/60 border-b border-white/5 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-extrabold tracking-wider text-emerald-300 uppercase text-[10px]">
              {gameState === "LIVE" ? "MATCH SIMULATION" : gameState === "BETTING" ? "BETTING WINDOW" : "SETTLING"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-300 font-medium">
            <span>Round {roundNumber || 1}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold led-number">
              {timer > 0 ? `${timer}s remaining` : "Processing Results..."}
            </span>
          </div>
        </div>

        {/* Audio Toggle & Network Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[11px] font-medium flex items-center gap-1 transition-all"
            title={isMuted ? "Unmute Stadium Sound FX" : "Mute Sound FX"}
          >
            <span>{isMuted ? "🔇 SFX Off" : "🔊 SFX On"}</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            AVAX FUJI
          </div>
        </div>
      </div>

      {/* Main Broadcast Header */}
      <div className="flex justify-between items-center px-4 sm:px-6 h-16 max-w-7xl mx-auto w-full">
        {/* Brand & Logo */}
        <Link to="/dashboard/home" className="flex items-center gap-3 group" onClick={() => soundFx.playClick()}>
          <RivalsLogo variant="full" size="sm" disableLink={true} />
          <span className="hidden lg:inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-sm">
            PRO
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-white/5">
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => soundFx.playClick()}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Balance & Profile Controls */}
        {walletState.isConnected && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins Balance Capsule */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400">
                <IconCoins className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-amber-300/80 font-bold leading-none">Coins</span>
                <span className="text-xs font-extrabold text-amber-400 leading-tight led-number">
                  {isLoading ? "..." : formatNumber(profile?.coins || 0)}
                </span>
              </div>
            </div>

            {/* DOODL / KOR Token Balance */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                <IconZap className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-emerald-300/80 font-bold leading-none">KOR Token</span>
                <span className="text-xs font-extrabold text-emerald-400 leading-tight led-number">
                  {isLoading ? "..." : formatNumber(profile?.korBalance || 0)}
                </span>
              </div>
            </div>

            {/* User Avatar & Level Capsule */}
            <Link
              to="/dashboard/profile"
              onClick={() => soundFx.playClick()}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-1 sm:pr-3 rounded-full border border-white/10 transition-all hover:border-white/20"
              title="View Club Profile"
            >
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                {(profile?.username || "P")[0].toUpperCase()}
                <div className="absolute -bottom-1 -right-1 px-1 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full shadow">
                  {profile?.level || 1}
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-bold text-slate-200 truncate max-w-[90px]">
                {profile?.username || "Player"}
              </span>
            </Link>

            {/* Refresh Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                refresh();
              }}
              disabled={!canRefresh}
              className={`p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${
                !canRefresh ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95 text-slate-300 hover:text-white"
              }`}
              title={isRoundEnded ? "Refresh Game Data" : "Available when round ends"}
            >
              <IconRefresh className={`w-4 h-4 ${isFetching ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom-Bar Navigation Deck */}
      <div className="md:hidden border-t border-white/5 bg-slate-950/90 backdrop-blur-xl px-2 py-1">
        <div className="flex justify-around items-center">
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => soundFx.playClick()}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                  isActive ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
