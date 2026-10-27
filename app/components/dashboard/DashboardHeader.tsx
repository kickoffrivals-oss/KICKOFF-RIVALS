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
import { CoinsKorBalance } from "../ui/CoinsKorBalance";

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

import { useTheme } from "../../contexts/ThemeContext";

export function DashboardHeader() {
  const { walletState } = useUserStore();
  const { profile, isLoading, refresh, isFetching } = useProfile();
  const { gameState, roundNumber, timer } = useGame();
  const { isNeoBrutalist } = useTheme();
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
    if (isNeoBrutalist) {
      if (gameState === "LIVE") {
        return (
          <span className="px-2 py-0.5 rounded-[4px] bg-[#ff3366] text-white border-2 border-black text-[11px] font-black uppercase shadow-[2px_2px_0_#000] flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            LIVE IN-PLAY
          </span>
        );
      }
      if (gameState === "BETTING") {
        return (
          <span className="px-2 py-0.5 rounded-[4px] bg-[#00ff66] text-black border-2 border-black text-[11px] font-black uppercase shadow-[2px_2px_0_#000] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            BETTING OPEN
          </span>
        );
      }
      return (
        <span className="px-2 py-0.5 rounded-[4px] bg-[#ffe600] text-black border-2 border-black text-[11px] font-black uppercase shadow-[2px_2px_0_#000]">
          SETTLING
        </span>
      );
    }

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

  const userBal = profile?.korBalance ?? profile?.coins ?? 0;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        isNeoBrutalist
          ? "bg-[#fffef0] border-b-[3px] border-black text-black shadow-[0_4px_0_#000]"
          : "bg-[#13171F] border-b border-[#222938] text-white"
      }`}
    >
      {/* Top Status Bar */}
      <div
        className={`px-4 py-1.5 flex items-center justify-between text-xs transition-colors ${
          isNeoBrutalist
            ? "bg-[#ffe600] border-b-2 border-black text-black font-mono font-bold"
            : "bg-[#0E1218] border-b border-[#222938] text-xs"
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          {getPhaseChip()}

          <div
            className={`flex items-center gap-1.5 sm:gap-2 font-medium text-xs ${
              isNeoBrutalist ? "text-black font-black" : "text-[#94A3B8]"
            }`}
          >
            <span className="hidden sm:inline">Matchday #{roundNumber || 1}</span>
            <span className="sm:hidden">#{roundNumber || 1}</span>
            <span className={isNeoBrutalist ? "text-black" : "text-[#323C50]"}>•</span>
            <span
              className={`font-mono tabular-nums ${
                isNeoBrutalist ? "text-black font-black" : "text-[#FFFFFF]"
              }`}
            >
              {timer > 0 ? (
                <>
                  <span className="hidden sm:inline">{timer}s remaining</span>
                  <span className="sm:hidden">{timer}s</span>
                </>
              ) : (
                "Calculating Results..."
              )}
            </span>
          </div>
        </div>

        {/* Audio Toggle & Network */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isNeoBrutalist
                ? "bg-white text-black border-2 border-black rounded-[6px] shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px]"
                : "text-[#94A3B8] hover:text-[#FFFFFF] rounded-[4px] bg-[#1B212D] border border-[#222938]"
            }`}
          >
            <span>{isMuted ? "SFX Off" : "SFX On"}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex justify-between items-center px-4 sm:px-6 h-16 max-w-7xl mx-auto w-full gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/play"
            className="flex items-center gap-3 focus-visible:outline-none rounded-[4px]"
            onClick={() => soundFx.playClick()}
            title="Return to Arena Selection"
          >
            {isNeoBrutalist ? (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#ffe600] border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000]">
                <span className="font-sport font-black italic tracking-tighter text-black text-lg">
                  KICKOFF<span className="text-[#ff3366]">RIVALS</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-black text-[#ffe600] text-[10px] font-mono font-black">
                  PRO
                </span>
              </div>
            ) : (
              <RivalsLogo variant="full" size="sm" disableLink={true} />
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav
          className={`hidden md:flex items-center gap-1 p-1 rounded-[8px] transition-colors ${
            isNeoBrutalist
              ? "bg-white border-2 border-black shadow-[3px_3px_0_#000]"
              : "bg-[#0E1218] border border-[#222938]"
          }`}
        >
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => soundFx.playClick()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
                  isNeoBrutalist
                    ? isActive
                      ? "bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0_#000]"
                      : "text-black/80 hover:bg-[#f0f0f0] border-2 border-transparent"
                    : isActive
                    ? "bg-[#1B212D] text-[#FFFFFF] border border-[#222938]"
                    : "text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#1B212D]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && gameState === "LIVE" && !isActive && (
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      isNeoBrutalist ? "bg-[#ff3366] border border-black" : "bg-[#EF4444]"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Balance Chips & Action Controls */}
        {walletState.isConnected && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Unified Coins KOR Balance Chip Component */}
            <CoinsKorBalance balance={userBal} />

            {/* Refresh Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                refresh();
              }}
              disabled={!canRefresh}
              aria-label="Refresh matchday data"
              className={`p-2.5 rounded-[8px] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isNeoBrutalist
                  ? "bg-white hover:bg-[#ffe600] border-2 border-black shadow-[2px_2px_0_#000] text-black"
                  : "bg-[#1B212D] border border-[#222938] text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#242C3C]"
              }`}
              title={isRoundEnded ? "Refresh Game Data" : "Available when round finishes"}
            >
              <IconRefresh className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#10B981]" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (44px min touch target) */}
      <nav
        className={`md:hidden px-2 py-1 transition-colors ${
          isNeoBrutalist
            ? "border-t-[3px] border-black bg-[#fffef0]"
            : "border-t border-[#222938] bg-[#0E1218]"
        }`}
      >
        <div className="flex justify-around items-center">
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => soundFx.playClick()}
                className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
                  isNeoBrutalist
                    ? isActive
                      ? "text-black bg-[#ffe600] border-2 border-black shadow-[2px_2px_0_#000]"
                      : "text-black/70 hover:text-black"
                    : isActive
                    ? "text-[#10B981] bg-[#1B212D]"
                    : "text-[#94A3B8] hover:text-[#FFFFFF]"
                }`}
              >
                {tab.icon}
                <span className="text-[10px] font-black">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
