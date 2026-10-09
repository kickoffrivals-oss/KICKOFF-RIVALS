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
import { Chip } from "../ui/Chip";
import { Stat } from "../ui/Stat";

interface NavTab {
  to: "/dashboard/home" | "/dashboard/league" | "/dashboard/bets" | "/dashboard/leaderboard" | "/dashboard/profile";
  label: string;
  badge?: string;
  icon: React.ReactNode;
}

const NAV_TABS: NavTab[] = [
  {
    to: "/dashboard/home",
    label: "Matches",
    badge: "LIVE",
    icon: <IconHome className="w-4 h-4 shrink-0" />,
  },
  {
    to: "/dashboard/bets",
    label: "My Bets",
    icon: <IconTicket className="w-4 h-4 shrink-0" />,
  },
  {
    to: "/dashboard/league",
    label: "Standings",
    icon: <IconTable className="w-4 h-4 shrink-0" />,
  },
  {
    to: "/dashboard/leaderboard",
    label: "Leaderboard",
    icon: <IconTrophy className="w-4 h-4 shrink-0" />,
  },
  {
    to: "/dashboard/profile",
    label: "Profile",
    icon: <IconUser className="w-4 h-4 shrink-0" />,
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

  const getPhaseChip = () => {
    if (gameState === "LIVE") {
      return (
        <Chip variant="live" size="sm" dot>
          Live In-Play
        </Chip>
      );
    }
    if (gameState === "BETTING") {
      return (
        <Chip variant="open" size="sm" dot>
          Betting Open
        </Chip>
      );
    }
    return (
      <Chip variant="accent" size="sm" dot>
        Settling
      </Chip>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-[#13171F] border-b border-[#222938]">
      {/* Top Status Bar */}
      <div className="bg-[#0E1218] border-b border-[#222938] px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {getPhaseChip()}

          <div className="flex items-center gap-2 text-[#94A3B8] font-medium text-xs">
            <span>Matchday #{roundNumber || 1}</span>
            <span className="text-[#323C50]">•</span>
            <span className="font-mono tabular-nums text-[#FFFFFF]">
              {timer > 0 ? `${timer}s remaining` : "Calculating Results..."}
            </span>
          </div>
        </div>

        {/* Audio Toggle & Network */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
            className="text-[#94A3B8] hover:text-[#FFFFFF] px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
          >
            <span>{isMuted ? "SFX Off" : "SFX On"}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex justify-between items-center px-4 sm:px-6 h-16 max-w-7xl mx-auto w-full gap-4">
        {/* Brand & Logo + Sport Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/play"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] rounded-[4px]"
            onClick={() => soundFx.playClick()}
            title="Return to Arena Selection"
          >
            <RivalsLogo variant="full" size="sm" disableLink={true} />
          </Link>
          <Link
            to="/play"
            onClick={() => soundFx.playClick()}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#1B212D] hover:bg-[#222938] border border-[#222938] hover:border-[#323C50] text-xs font-mono text-[#94A3B8] hover:text-[#FFFFFF] transition-colors"
            title="Switch Sporting Arena"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-white uppercase text-[11px]">Football</span>
            <span className="text-[#323C50]">•</span>
            <span className="text-[#94A3B8] text-[11px] underline">Change</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0E1218] p-1 rounded-[4px] border border-[#222938]">
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => soundFx.playClick()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                  isActive
                    ? "bg-[#1B212D] text-[#FFFFFF] border border-[#222938]"
                    : "text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#1B212D]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && gameState === "LIVE" && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Balance Chips & Profile Controls */}
        {walletState.isConnected && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Coins Balance */}
            <div className="flex items-center gap-2.5 bg-[#1B212D] px-3 py-1.5 rounded-[4px] border border-[#222938]">
              <div className="w-5 h-5 rounded-[4px] bg-[#382305] text-[#F59E0B] flex items-center justify-center">
                <IconCoins className="w-3.5 h-3.5" />
              </div>
              <Stat
                label="Coins"
                value={isLoading ? "..." : formatNumber(profile?.coins || 0)}
                size="sm"
              />
            </div>

            {/* KOR Token Balance */}
            <div className="hidden sm:flex items-center gap-2.5 bg-[#1B212D] px-3 py-1.5 rounded-[4px] border border-[#222938]">
              <div className="w-5 h-5 rounded-[4px] bg-[#382305] text-[#FBBF24] flex items-center justify-center">
                <IconZap className="w-3.5 h-3.5" />
              </div>
              <Stat
                label="KOR"
                value={isLoading ? "..." : formatNumber(profile?.korBalance || 0)}
                variant="reward"
                size="sm"
              />
            </div>

            {/* Profile Link */}
            <Link
              to="/dashboard/profile"
              onClick={() => soundFx.playClick()}
              className="flex items-center gap-2 bg-[#1B212D] hover:bg-[#242C3C] p-1.5 sm:px-3 sm:py-1.5 rounded-[4px] border border-[#222938] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
              title="View Profile"
            >
              <div className="w-6 h-6 rounded-[4px] bg-[#10B981] text-[#0A0D12] flex items-center justify-center font-bold text-xs">
                {(profile?.username || "P")[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-[#FFFFFF] truncate max-w-[90px]">
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
              aria-label="Refresh matchday data"
              className="p-2.5 rounded-[4px] bg-[#1B212D] border border-[#222938] text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#242C3C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
              title={isRoundEnded ? "Refresh Game Data" : "Available when round finishes"}
            >
              <IconRefresh className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#10B981]" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (44px min touch target) */}
      <nav className="md:hidden border-t border-[#222938] bg-[#0E1218] px-2 py-1">
        <div className="flex justify-around items-center">
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => soundFx.playClick()}
                className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-[#10B981] bg-[#1B212D]"
                    : "text-[#94A3B8] hover:text-[#FFFFFF]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
