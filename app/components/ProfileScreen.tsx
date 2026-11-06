import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import type { UserStats, DailyQuest } from "../types";
import {
  IconWallet,
  IconCoins,
  IconTrophy,
  IconStar,
  IconTarget,
  IconUsers,
  IconShare,
  IconCopy,
  IconCheck,
  IconGift,
  IconZap,
  IconSettings,
  IconLogOut,
  IconChevronRight,
  IconFlame,
  IconAward,
  IconExternalLink,
  IconRefresh,
  IconX,
  IconShield,
} from "./Icons";
import { syncQuests } from "../server/user";
import { truncateAddress, formatNumber } from "../lib/utils";
import { soundFx } from "../lib/soundFx";
import { Chip } from "./ui/Chip";
import { useTheme } from "../contexts/ThemeContext";

interface ProfileScreenProps {
  stats: UserStats;
  onLogout: () => void;
  onRedeem: (code: string) => Promise<{ success: boolean; message?: string }>;
  onQuestClaim: (
    questId: string,
    onSuccess?: (reward: number) => void,
  ) => Promise<void> | void;
  onQuestAction: (
    questId: string,
    openUrl?: boolean,
    verificationCode?: string,
  ) => void;
  onReferral: (code: string) => Promise<{ success: boolean; message?: string }>;
  onSystemSync: () => void;
  onOpenWallet: () => void;
  onClaimAllianceRewards: () => void;
  onCheckIn: () => Promise<{
    success: boolean;
    message: string;
    reward?: number;
  }>;
  onClaimWinnings: () => Promise<void>;
  onSwapRequest?: () => void;
  notify?: (message: string, type?: "success" | "error" | "info") => void;
}

export function ProfileScreen({
  stats,
  onLogout,
  onRedeem,
  onQuestClaim,
  onQuestAction,
  onReferral,
  onSystemSync,
  onOpenWallet,
  onClaimAllianceRewards,
  onCheckIn,
  onClaimWinnings,
  onSwapRequest,
  notify,
}: ProfileScreenProps) {
  const { isNeoBrutalist } = useTheme();
  const [activeSection, setActiveSection] = useState<
    "overview" | "quests" | "referral" | "settings"
  >("overview");
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [referralCode, setReferralCode] = useState("");
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
  const [referralStatus, setReferralStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [copied, setCopied] = useState(false);

  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [claimReward, setClaimReward] = useState<number>(0);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [activeQuestTab, setActiveQuestTab] = useState<
    "daily" | "weekly" | "social" | "partners"
  >("daily");

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncCooldown, setSyncCooldown] = useState(0);

  useEffect(() => {
    const lastSync = localStorage.getItem(`questSync_${stats?.walletAddress}`);
    if (lastSync) {
      const diff = Date.now() - parseInt(lastSync);
      const remaining = Math.max(0, 60 - Math.floor(diff / 60000));
      setSyncCooldown(remaining);
    }
    const timer = setInterval(() => {
      setSyncCooldown((prev) => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(timer);
  }, [stats?.walletAddress]);

  const handleSync = async () => {
    if (syncCooldown > 0 || syncLoading) return;
    soundFx.playClick();
    setSyncLoading(true);
    try {
      const result = await syncQuests({ data: { walletAddress: stats.walletAddress } });
      if (result.success) {
        localStorage.setItem(`questSync_${stats?.walletAddress}`, Date.now().toString());
        setSyncCooldown(60);
        onSystemSync();
        notify?.("Quests synchronized with database!", "success");
      }
    } catch (err) {
      console.error("Sync failed:", err);
      notify?.("Sync failed. Checking connection...", "error");
    } finally {
      setSyncLoading(false);
    }
  };

  const getFilteredQuests = (tab: typeof activeQuestTab) => {
    if (!stats?.quests || !Array.isArray(stats.quests)) return [];

    return stats.quests.filter((q) => {
      if (!q || q.status === "ARCHIVED") return false;

      const qId = String(q.id || "").toLowerCase();
      const qTitle = String(q.title || "").toLowerCase();
      const qCategory = String(q.category || "").toLowerCase();
      const qType = String(q.type || "").toLowerCase();

      const isPartnerQuest =
        qCategory === "partners" ||
        qId.includes("partner") ||
        qTitle.includes("partner") ||
        qId.startsWith("p_");

      switch (tab) {
        case "daily":
          return (
            q.frequency === "daily" &&
            !isPartnerQuest &&
            qCategory !== "social" &&
            qType !== "social"
          );
        case "weekly":
          return q.frequency === "weekly" && !isPartnerQuest;
        case "social":
          return qCategory === "social" || qType === "social";
        case "partners":
          return isPartnerQuest;
        default:
          return false;
      }
    });
  };

  const filteredQuests = getFilteredQuests(activeQuestTab);

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    soundFx.playClick();
    const result = await onRedeem(redeemCode.trim());
    if (result.success) soundFx.playCashout();
    setRedeemStatus({
      type: result.success ? "success" : "error",
      message:
        result.message || (result.success ? "Code redeemed!" : "Invalid code"),
    });
    if (result.success) {
      setRedeemCode("");
    }
  };

  const handleReferral = async () => {
    if (!referralCode.trim()) return;
    soundFx.playClick();
    setIsApplyingReferral(true);
    setReferralStatus({ type: null, message: "" });

    try {
      const result = await onReferral(referralCode.trim());
      if (result.success) soundFx.playCashout();
      setReferralStatus({
        type: result.success ? "success" : "error",
        message:
          result.message ||
          (result.success ? "Referral applied!" : "Invalid code"),
      });
      if (result.success) {
        setReferralCode("");
      }
    } finally {
      setIsApplyingReferral(false);
    }
  };

  const copyReferralCode = () => {
    if (!stats?.referralCode) return;
    soundFx.playClick();
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const winRate =
    stats?.totalBets > 0
      ? Math.round(((stats?.wins || 0) / stats.totalBets) * 100)
      : 0;

  const xpProgress = Math.min(
    100,
    ((stats?.xp || 0) / (((stats?.level || 1) + 1) * 1000)) * 100
  );

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full p-4 sm:p-6 pb-20">
      {/* Player Passport Card */}
      <div
        className={cn(
          "p-4 sm:p-5 transition-colors",
          isNeoBrutalist
            ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
            : "bg-surface-panel border border-border-subtle rounded-md"
        )}
      >
        <div className="flex items-start gap-3.5">
          {/* Avatar Frame */}
          <div className="relative">
            <div
              className={cn(
                "w-14 h-14 flex items-center justify-center font-bold text-xl font-mono",
                isNeoBrutalist
                  ? "bg-[#ffe600] border-2 border-black rounded-[8px] text-black shadow-[2px_2px_0_#000]"
                  : "rounded-sm bg-surface-raised border border-border-subtle text-text-primary"
              )}
            >
              {(stats?.username || "P")[0].toUpperCase()}
            </div>
            <div
              className={cn(
                "absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 font-mono font-bold text-xs",
                isNeoBrutalist
                  ? "bg-black text-[#ffe600] border-2 border-black rounded-[4px]"
                  : "bg-surface-panel text-semantic-reward border border-border-subtle rounded-sm"
              )}
            >
              L{stats?.level || 1}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={cn(
                    "text-xs uppercase tracking-wider block",
                    isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted font-bold"
                  )}
                >
                  PLAYER PROFILE
                </span>
                <h2
                  className={cn(
                    "text-base sm:text-lg font-bold uppercase truncate",
                    isNeoBrutalist ? "text-black font-black" : "text-text-primary"
                  )}
                >
                  {stats?.username || "Guest Player"}
                </h2>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenWallet();
                }}
                aria-label="Open wallet modal"
                className={cn(
                  "p-1.5 transition-colors focus-visible:outline-2",
                  isNeoBrutalist
                    ? "bg-white border-2 border-black rounded-[6px] text-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600]"
                    : "rounded-sm bg-surface-raised border border-border-subtle hover:border-border-strong text-text-muted hover:text-text-primary focus-visible:outline-accent"
                )}
              >
                <IconWallet className="w-4 h-4" />
              </button>
            </div>

            <p
              className={cn(
                "text-xs font-mono mt-0.5",
                isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted"
              )}
            >
              {truncateAddress(stats?.walletAddress || "")}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-mono font-medium",
                  isNeoBrutalist
                    ? "bg-[#faf8ee] border-2 border-black rounded-[4px] text-black font-bold"
                    : "rounded-sm bg-surface-raised border border-border-subtle text-text-muted"
                )}
              >
                Tier {Math.min(5, Math.floor((stats?.level || 1) / 3) + 1)} Manager
              </span>
              {(stats?.loginStreak || 0) > 0 && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-mono font-bold flex items-center gap-1",
                    isNeoBrutalist
                      ? "bg-[#ffe600] border-2 border-black rounded-[4px] text-black shadow-[1.5px_1.5px_0_#000]"
                      : "rounded-sm bg-[#382305] border border-[#F59E0B]/40 text-[#FBBF24]"
                  )}
                >
                  <IconFlame className={cn("w-3 h-3", isNeoBrutalist ? "text-black" : "text-amber-400")} />
                  {stats.loginStreak} Day Streak
                </span>
              )}
            </div>
          </div>
        </div>

        {/* XP Level Bar */}
        <div
          className={cn(
            "mt-4 pt-3",
            isNeoBrutalist ? "border-t-2 border-black" : "border-t border-border-subtle"
          )}
        >
          <div className="flex items-center justify-between text-xs mb-1 font-bold">
            <span
              className={cn(
                "uppercase tracking-wider",
                isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted"
              )}
            >
              XP Progress
            </span>
            <span
              className={cn(
                "font-mono tabular-nums",
                isNeoBrutalist ? "text-black font-black" : "text-accent"
              )}
            >
              {stats?.xp || 0} / {((stats?.level || 1) + 1) * 1000} XP
            </span>
          </div>
          <div
            className={cn(
              "h-2.5 overflow-hidden p-[1px]",
              isNeoBrutalist
                ? "bg-[#faf8ee] border-2 border-black rounded-[4px]"
                : "h-2 bg-surface-page rounded-sm border border-border-subtle"
            )}
          >
            <div
              className={cn(
                "h-full transition-all duration-300",
                isNeoBrutalist ? "bg-[#00ff66] border-r-2 border-black" : "bg-accent rounded-xs"
              )}
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unified Balance Hub */}
      <div
        className={cn(
          "p-4 sm:p-5 space-y-3 transition-colors",
          isNeoBrutalist
            ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
            : "bg-surface-panel border border-border-subtle rounded-md"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCoins className={cn("w-5 h-5", isNeoBrutalist ? "text-black" : "text-amber-400")} />
            <span
              className={cn(
                "text-xs uppercase tracking-wider",
                isNeoBrutalist ? "text-black font-black" : "text-text-muted font-bold"
              )}
            >
              Coins KOR Unified Balance
            </span>
          </div>
          <span
            className={cn(
              "text-[11px] font-mono font-bold px-2 py-0.5 flex items-center gap-1",
              isNeoBrutalist
                ? "bg-[#00ff66] text-black border-2 border-black rounded-[4px] shadow-[1.5px_1.5px_0_#000]"
                : "text-emerald-400 bg-surface-raised rounded-sm border border-border-subtle"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full animate-pulse", isNeoBrutalist ? "bg-black" : "bg-emerald-400")} />
            1:1 Synchronized
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <p
            className={cn(
              "text-2xl sm:text-3xl font-black font-mono tabular-nums",
              isNeoBrutalist ? "text-black" : "text-text-primary"
            )}
          >
            {Number(stats?.korBalance ?? stats?.coins ?? 0).toLocaleString()}
          </p>
          <span
            className={cn(
              "text-sm font-bold uppercase",
              isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted"
            )}
          >
            Coins KOR
          </span>
        </div>

        <p
          className={cn(
            "text-xs leading-relaxed",
            isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted"
          )}
        >
          Your balance is unified and automatically synchronized across Virtual Football, Daily Aviator, and all KickOff Rivals mini-games.
        </p>

        <div
          className={cn(
            "pt-2 flex items-center justify-between",
            isNeoBrutalist ? "border-t-2 border-black" : "border-t border-border-subtle"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              isNeoBrutalist ? "text-black/80 font-bold" : "text-text-muted"
            )}
          >
            <IconZap className={cn("w-3.5 h-3.5", isNeoBrutalist ? "text-black" : "text-emerald-400")} />
            <span>Universal in-game fuel & settlement</span>
          </div>
          <button
            onClick={handleSync}
            disabled={syncLoading || syncCooldown > 0}
            className={cn(
              "text-xs font-mono font-bold cursor-pointer disabled:opacity-40",
              isNeoBrutalist
                ? "text-black underline decoration-2 hover:bg-[#ffe600] px-1.5 py-0.5 rounded-[4px]"
                : "text-accent hover:underline"
            )}
          >
            {syncLoading ? "Syncing..." : syncCooldown > 0 ? `Synced (${syncCooldown}m)` : "Refresh Sync"}
          </button>
        </div>
      </div>

      {/* Unclaimed Winnings Card */}
      <div
        className={cn(
          "p-4 flex items-center justify-between gap-3 transition-colors",
          isNeoBrutalist
            ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
            : "bg-surface-panel border border-border-subtle rounded-md"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 flex items-center justify-center shrink-0",
              isNeoBrutalist
                ? "bg-[#ffe600] border-2 border-black rounded-[6px] text-black shadow-[2px_2px_0_#000]"
                : "rounded-sm bg-surface-raised border border-border-subtle text-semantic-reward"
            )}
          >
            <IconTrophy className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-amber-400")} />
          </div>
          <div>
            <p
              className={cn(
                "text-xs uppercase tracking-wider",
                isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted font-bold"
              )}
            >
              Unclaimed Winnings
            </p>
            <p
              className={cn(
                "text-lg font-black font-mono tabular-nums",
                isNeoBrutalist ? "text-black" : "text-text-primary"
              )}
            >
              {formatNumber(stats?.unclaimedBalance || 0)}{" "}
              <span className={cn("text-xs font-black", isNeoBrutalist ? "text-black" : "text-semantic-reward")}>
                KOR
              </span>
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            soundFx.playCashout();
            onClaimWinnings();
          }}
          disabled={(stats?.unclaimedBalance || 0) <= 0}
          className={cn(
            "h-9 px-4 font-bold text-xs uppercase tracking-wider transition-all focus-visible:outline-2",
            (stats?.unclaimedBalance || 0) > 0 
              ? isNeoBrutalist
                ? "bg-[#00ff66] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-[#00dd55] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                : "bg-accent text-surface-page hover:bg-accent-hover cursor-pointer rounded-sm"
              : isNeoBrutalist
                ? "bg-slate-200 text-black/40 border-2 border-black/40 rounded-[6px] cursor-not-allowed font-black"
                : "bg-surface-raised text-text-muted border border-border-subtle cursor-not-allowed rounded-sm"
          )}
        >
          {(stats?.unclaimedBalance || 0) > 0 ? "Claim Winnings" : "No Winnings"}
        </button>
      </div>

      {/* Section Switcher Tabs */}
      <div
        className={cn(
          "flex p-1 transition-all",
          isNeoBrutalist
            ? "bg-white border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000] gap-1"
            : "bg-surface-page rounded-sm border border-border-subtle"
        )}
      >
        {[
          { id: "overview", label: "Stats" },
          { id: "quests", label: "Quests" },
          { id: "referral", label: "Referrals" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundFx.playClick();
              setActiveSection(tab.id as any);
            }}
            className={cn(
              "flex-1 py-2 text-xs uppercase tracking-wider transition-all focus-visible:outline-2",
              isNeoBrutalist
                ? activeSection === tab.id
                  ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000]"
                  : "text-black/70 font-black hover:text-black hover:bg-[#faf8ee] rounded-[6px]"
                : activeSection === tab.id
                  ? "bg-surface-raised text-text-primary border border-border-strong font-bold rounded-sm"
                  : "text-text-muted hover:text-text-primary rounded-sm font-bold"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* OVERVIEW STATS TAB */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          <div
            className={cn(
              "p-4 transition-colors",
              isNeoBrutalist
                ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
                : "bg-[#13171F] rounded-[6px] border border-[#222938]"
            )}
          >
            <h3
              className={cn(
                "text-xs uppercase tracking-wider mb-3 flex items-center gap-2",
                isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
              )}
            >
              <IconTrophy className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-emerald-400")} />
              Matchday Performance Metrics
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <StatItem label="Total Bets" value={stats?.totalBets || 0} />
              <StatItem label="Wins" value={stats?.wins || 0} highlight="green" />
              <StatItem label="Win Rate" value={`${winRate}%`} highlight="green" />
              <StatItem label="Biggest Win" value={`${formatNumber(stats?.biggestWin || 0)} KOR`} highlight="yellow" />
              <StatItem label="Best Odds Won" value={`@${(stats?.bestOddsWon || 0).toFixed(2)}`} />
              <StatItem label="Current Streak" value={`${stats?.currentStreak || 0} W`} highlight={(stats?.currentStreak || 0) > 0 ? "green" : undefined} />
            </div>
          </div>

          <div
            className={cn(
              "p-4 transition-colors",
              isNeoBrutalist
                ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
                : "bg-[#13171F] rounded-[6px] border border-[#222938]"
            )}
          >
            <h3
              className={cn(
                "text-xs uppercase tracking-wider mb-3 flex items-center gap-2",
                isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
              )}
            >
              <IconAward className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-amber-400")} />
              Player Trophies & Badges
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <AchievementBadge icon={<IconTrophy className="w-4 h-4" />} label="First Win" unlocked={(stats?.wins || 0) > 0} />
              <AchievementBadge icon={<IconFlame className="w-4 h-4" />} label="Hot Streak" unlocked={(stats?.currentStreak || 0) >= 3} />
              <AchievementBadge icon={<IconStar className="w-4 h-4" />} label="Early Access" unlocked={true} />
              <AchievementBadge icon={<IconTarget className="w-4 h-4" />} label="High Roller" unlocked={(winRate || 0) >= 50} />
            </div>
          </div>
        </div>
      )}

      {/* QUESTS TAB */}
      {activeSection === "quests" && (
        <div className="space-y-4">
          {/* 4-Hourly Check-In Feature Card */}
          <div
            className={cn(
              "p-4 transition-colors",
              isNeoBrutalist
                ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
                : "bg-[#13171F] rounded-[6px] border border-[#222938]"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 flex items-center justify-center shrink-0",
                    isNeoBrutalist
                      ? "bg-[#ffe600] border-2 border-black rounded-[6px] text-black shadow-[2px_2px_0_#000]"
                      : "rounded-[4px] bg-[#1B212D] border border-[#222938] text-emerald-400"
                  )}
                >
                  <IconGift className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-xs uppercase tracking-wider",
                      isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
                    )}
                  >
                    4-Hourly Stadium Grant
                  </h3>
                  <p className={cn("text-xs", isNeoBrutalist ? "text-black/70 font-bold" : "text-slate-400")}>
                    Claim{" "}
                    <span className={cn("font-mono", isNeoBrutalist ? "text-black font-black" : "text-emerald-400 font-bold")}>
                      5,000 Coins
                    </span>{" "}
                    every 4 hours
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (stats.canCheckIn) {
                    soundFx.playGoal();
                    const res = await onCheckIn();
                    if (res.success) {
                      soundFx.playCashout();
                      setClaimReward(res.reward || 5000);
                      setShowClaimSuccess(true);
                    } else {
                      notify?.(res.message || "Claim failed", "error");
                    }
                  }
                }}
                disabled={!stats.canCheckIn}
                className={cn(
                  "h-9 px-4 text-xs uppercase tracking-wider transition-all",
                  stats.canCheckIn
                    ? isNeoBrutalist
                      ? "bg-[#00ff66] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-[#00dd55] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-[4px]"
                    : isNeoBrutalist
                      ? "bg-slate-200 text-black/40 border-2 border-black/40 rounded-[6px] cursor-not-allowed font-black"
                      : "bg-[#1B212D] text-slate-500 cursor-not-allowed border border-[#222938] font-bold rounded-[4px]"
                )}
              >
                {stats.canCheckIn ? "Claim 5,000" : `Wait ${stats.nextCheckInIn || 4}h`}
              </button>
            </div>
          </div>

          {/* Sub-Category Chips */}
          <div
            className={cn(
              "flex gap-1.5 p-1 transition-all",
              isNeoBrutalist
                ? "bg-white border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000]"
                : "bg-[#13171F] rounded-[4px] border border-[#222938]"
            )}
          >
            {[
              { id: "daily", label: "Daily" },
              { id: "weekly", label: "Weekly" },
              { id: "social", label: "Social" },
              { id: "partners", label: "Partners" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveQuestTab(tab.id as any);
                }}
                className={cn(
                  "flex-1 py-1.5 text-xs uppercase tracking-wider transition-all",
                  isNeoBrutalist
                    ? activeQuestTab === tab.id
                      ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[1.5px_1.5px_0_#000]"
                      : "text-black/70 font-black hover:text-black hover:bg-[#faf8ee] rounded-[6px]"
                    : activeQuestTab === tab.id
                      ? "bg-[#1B212D] text-emerald-400 border border-[#323C50] rounded-[4px] font-bold"
                      : "text-slate-400 hover:text-white rounded-[4px] font-bold"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quests Stream */}
          <div className="space-y-2">
            {filteredQuests.length > 0 ? (
              filteredQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  isSelected={selectedQuestId === quest.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedQuestId(quest.id);
                  }}
                />
              ))
            ) : (
              <div
                className={cn(
                  "p-8 text-center transition-colors",
                  isNeoBrutalist
                    ? "bg-white border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000]"
                    : "bg-[#13171F] rounded-[6px] border border-[#222938]"
                )}
              >
                <p className={cn("text-xs uppercase", isNeoBrutalist ? "text-black/60 font-black" : "text-slate-500 font-bold")}>
                  No {activeQuestTab} quests available.
                </p>
              </div>
            )}
          </div>

          {/* Redeem Code Panel (in Social Tab) */}
          {activeQuestTab === "social" && (
            <div
              className={cn(
                "p-4 mt-4 transition-colors",
                isNeoBrutalist
                  ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
                  : "bg-[#13171F] rounded-[6px] border border-[#222938]"
              )}
            >
              <h4
                className={cn(
                  "text-xs uppercase tracking-wider mb-2",
                  isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
                )}
              >
                Redeem Promo Code
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className={cn(
                    "flex-1 h-9 px-3 text-xs font-mono uppercase focus:outline-none transition-colors",
                    isNeoBrutalist
                      ? "bg-[#fcfaf2] border-2 border-black rounded-[6px] text-black font-black placeholder:text-black/40 focus:bg-white"
                      : "bg-[#0A0D12] border border-[#222938] rounded-[4px] text-white font-bold focus:border-emerald-500"
                  )}
                />
                <button
                  onClick={handleRedeem}
                  disabled={!redeemCode.trim()}
                  className={cn(
                    "px-4 h-9 text-xs uppercase tracking-wider transition-all",
                    isNeoBrutalist
                      ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-black hover:text-white disabled:opacity-40"
                      : "bg-emerald-500 text-slate-950 rounded-[4px] font-bold hover:bg-emerald-400 disabled:opacity-40"
                  )}
                >
                  Redeem
                </button>
              </div>
              {redeemStatus.message && (
                <p
                  className={cn(
                    "text-xs mt-2 font-bold",
                    redeemStatus.type === "success"
                      ? isNeoBrutalist ? "text-[#00aa44]" : "text-emerald-400"
                      : isNeoBrutalist ? "text-[#ff0055]" : "text-red-400"
                  )}
                >
                  {redeemStatus.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* REFERRALS TAB */}
      {activeSection === "referral" && (
        <div className="space-y-4">
          <div
            className={cn(
              "p-4 transition-colors",
              isNeoBrutalist
                ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
                : "bg-[#13171F] rounded-[6px] border border-[#222938]"
            )}
          >
            <h3
              className={cn(
                "text-xs uppercase tracking-wider mb-3 flex items-center gap-2",
                isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
              )}
            >
              <IconShare className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-emerald-400")} />
              Your Club Referral Code
            </h3>
            <div className="flex gap-2">
              <div
                className={cn(
                  "flex-1 px-3 py-2 font-mono text-sm font-bold tabular-nums",
                  isNeoBrutalist
                    ? "bg-[#fcfaf2] border-2 border-black rounded-[6px] text-black font-black"
                    : "bg-[#0A0D12] border border-[#222938] rounded-[4px] text-emerald-400"
                )}
              >
                {stats.referralCode}
              </div>
              <button
                onClick={copyReferralCode}
                className={cn(
                  "px-3 text-xs transition-all flex items-center justify-center",
                  isNeoBrutalist
                    ? copied
                      ? "bg-[#00ff66] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000]"
                      : "bg-white text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600]"
                    : copied
                      ? "bg-emerald-500 text-slate-950 border-emerald-500 rounded-[4px] font-bold"
                      : "bg-[#1B212D] border-[#222938] text-white hover:bg-[#222938] rounded-[4px] font-bold"
                )}
                aria-label="Copy referral code"
              >
                {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
              </button>
            </div>
            <p
              className={cn(
                "text-xs mt-3 leading-relaxed",
                isNeoBrutalist ? "text-black/70 font-bold" : "text-slate-400"
              )}
            >
              Invite friends to the arena. Both you and your invited friend receive{" "}
              <span className={cn("font-mono font-bold", isNeoBrutalist ? "text-black font-black" : "text-amber-400")}>
                5,000 bonus coins
              </span>{" "}
              upon wallet connection.
            </p>
          </div>

          <div
            className={cn(
              "p-4 transition-colors",
              isNeoBrutalist
                ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
                : "bg-[#13171F] rounded-[6px] border border-[#222938]"
            )}
          >
            <h4
              className={cn(
                "text-xs uppercase tracking-wider mb-3",
                isNeoBrutalist ? "text-black font-black" : "text-slate-300 font-bold"
              )}
            >
              Referral Impact
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "p-3 text-center transition-colors",
                  isNeoBrutalist
                    ? "bg-[#faf8ee] border-2 border-black rounded-[6px] shadow-[2px_2px_0_#000]"
                    : "bg-[#0A0D12] rounded-[4px] border border-[#222938]"
                )}
              >
                <p className={cn("text-xl font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-white font-bold")}>
                  {stats.referralCount}
                </p>
                <p className={cn("text-xs uppercase mt-1", isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400 font-bold")}>
                  Managers Invited
                </p>
              </div>
              <div
                className={cn(
                  "p-3 text-center transition-colors",
                  isNeoBrutalist
                    ? "bg-[#faf8ee] border-2 border-black rounded-[6px] shadow-[2px_2px_0_#000]"
                    : "bg-[#0A0D12] rounded-[4px] border border-[#222938]"
                )}
              >
                <p className={cn("text-xl font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-amber-400 font-bold")}>
                  {formatNumber(stats.referralEarnings)}
                </p>
                <p className={cn("text-xs uppercase mt-1", isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400 font-bold")}>
                  Coins Earned
                </p>
              </div>
            </div>
          </div>

          {!stats.hasReferred && (
            <div
              className={cn(
                "p-4 transition-colors",
                isNeoBrutalist
                  ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
                  : "bg-[#13171F] rounded-[6px] border border-[#222938]"
              )}
            >
              <h4
                className={cn(
                  "text-xs uppercase tracking-wider mb-2",
                  isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
                )}
              >
                Have an Inviter Code?
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="ENTER FRIEND'S CODE"
                  className={cn(
                    "flex-1 h-9 px-3 text-xs font-mono uppercase focus:outline-none transition-colors",
                    isNeoBrutalist
                      ? "bg-[#fcfaf2] border-2 border-black rounded-[6px] text-black font-black placeholder:text-black/40 focus:bg-white"
                      : "bg-[#0A0D12] border border-[#222938] rounded-[4px] text-white font-bold focus:border-emerald-500"
                  )}
                />
                <button
                  onClick={handleReferral}
                  disabled={isApplyingReferral || !referralCode.trim()}
                  className={cn(
                    "px-4 h-9 text-xs uppercase tracking-wider transition-all",
                    isNeoBrutalist
                      ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-black hover:text-white disabled:opacity-40"
                      : "bg-emerald-500 text-slate-950 rounded-[4px] font-bold hover:bg-emerald-400 disabled:opacity-40"
                  )}
                >
                  {isApplyingReferral ? "Applying..." : "Apply"}
                </button>
              </div>
              {referralStatus.message && (
                <p
                  className={cn(
                    "text-xs mt-2 font-bold",
                    referralStatus.type === "success"
                      ? isNeoBrutalist ? "text-[#00aa44]" : "text-emerald-400"
                      : isNeoBrutalist ? "text-[#ff0055]" : "text-red-400"
                  )}
                >
                  {referralStatus.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeSection === "settings" && (
        <div className="space-y-2">
          <SettingsButton
            icon={<IconWallet className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-emerald-400")} />}
            label="Wallet Management"
            description="View connected address and network"
            onClick={onOpenWallet}
          />
          <SettingsButton
            icon={<IconRefresh className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-slate-300")} />}
            label="Synchronize Account"
            description="Force update matchday balances from local state"
            onClick={onSystemSync}
          />
          <SettingsButton
            icon={<IconLogOut className={cn("w-4 h-4", isNeoBrutalist ? "text-[#ff0055]" : "text-red-400")} />}
            label="Disconnect Session"
            description="Sign out and disconnect wallet session"
            onClick={onLogout}
            variant="danger"
          />
        </div>
      )}

      {/* Claim Success Celebration Modal */}
      {showClaimSuccess && (
        <ClaimSuccessModal
          amount={claimReward}
          onClose={() => setShowClaimSuccess(false)}
        />
      )}

      {/* Quest Detail Drawer */}
      {selectedQuestId && stats?.quests && (
        <QuestDrawer
          key={selectedQuestId}
          quest={stats.quests.find((q) => q.id === selectedQuestId)!}
          onClose={() => setSelectedQuestId(null)}
          onAction={(openUrl, code) =>
            onQuestAction(selectedQuestId, openUrl, code)
          }
          onClaim={() => {
            onQuestClaim(selectedQuestId, (reward) => {
              setClaimReward(reward);
              setShowClaimSuccess(true);
              setSelectedQuestId(null);
            });
          }}
          notify={notify}
        />
      )}
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatItem({ label, value, highlight }: { label: string; value: string | number; highlight?: "green" | "yellow" | "red" }) {
  const { isNeoBrutalist } = useTheme();
  return (
    <div
      className={cn(
        "p-3 text-center transition-colors",
        isNeoBrutalist
          ? "bg-[#faf8ee] border-2 border-black rounded-[6px] shadow-[2px_2px_0_#000]"
          : "bg-[#13171F] border border-[#222938] rounded-[4px]"
      )}
    >
      <p
        className={cn(
          "text-base font-mono tabular-nums",
          isNeoBrutalist
            ? "text-black font-black"
            : highlight === "green"
            ? "text-emerald-400 font-bold"
            : highlight === "yellow"
            ? "text-amber-400 font-bold"
            : highlight === "red"
            ? "text-red-400 font-bold"
            : "text-white font-bold"
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "text-xs uppercase mt-1",
          isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400 font-bold"
        )}
      >
        {label}
      </p>
    </div>
  );
}

function AchievementBadge({ icon, label, unlocked }: { icon: React.ReactNode; label: string; unlocked: boolean }) {
  const { isNeoBrutalist } = useTheme();
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 p-2.5 transition-colors text-center",
        isNeoBrutalist
          ? unlocked
            ? "bg-[#ffe600] border-2 border-black rounded-[6px] text-black font-black shadow-[2px_2px_0_#000]"
            : "bg-slate-100 border-2 border-black/30 rounded-[6px] text-black/40 opacity-70"
          : unlocked
          ? "bg-[#1B212D] border-amber-500/40 text-amber-400 rounded-[4px] border"
          : "bg-[#13171F] border-[#222938] text-slate-600 opacity-60 rounded-[4px] border"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 flex items-center justify-center",
          isNeoBrutalist
            ? "bg-white border-2 border-black rounded-[4px] text-black"
            : "rounded-[4px] bg-[#0A0D12]"
        )}
      >
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function QuestCard({ quest, isSelected, onClick }: { quest: DailyQuest; isSelected: boolean; onClick: () => void }) {
  const { isNeoBrutalist } = useTheme();
  const isClaimed = quest.completed || quest.status === 'CLAIMED';
  const isClaimable = quest.status === 'CLAIMABLE';
  const isPending = quest.status === 'VERIFYING';

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 transition-colors cursor-pointer",
        isNeoBrutalist
          ? cn(
              "bg-white border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000] hover:bg-[#faf8ee]",
              isSelected && "bg-[#ffe600] shadow-[3px_3px_0_#000]"
            )
          : cn(
              "rounded-[4px] border bg-[#13171F] hover:border-[#323C50]",
              isSelected ? "border-emerald-500 bg-[#1B212D]" : "border-[#222938]"
            ),
        isClaimed && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "text-xs uppercase tracking-wider truncate",
              isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
            )}
          >
            {quest.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "text-xs font-mono font-bold tabular-nums",
                isNeoBrutalist ? "text-black font-black" : "text-amber-400"
              )}
            >
              +{quest.reward} COINS
            </span>
            <span className={isNeoBrutalist ? "text-black/40 text-xs font-bold" : "text-slate-600 text-xs"}>•</span>
            <span
              className={cn(
                "text-xs uppercase",
                isNeoBrutalist ? "text-black/70 font-bold" : "text-slate-400 font-bold"
              )}
            >
              {quest.frequency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isClaimed ? (
            <span
              className={cn(
                "text-xs uppercase px-2 py-0.5",
                isNeoBrutalist
                  ? "bg-slate-200 text-black/60 border border-black/40 rounded-[4px] font-black"
                  : "rounded-[4px] bg-[#1B212D] text-slate-400 border border-[#222938] font-bold"
              )}
            >
              Claimed
            </span>
          ) : isClaimable ? (
            <span
              className={cn(
                "text-xs uppercase px-2 py-0.5",
                isNeoBrutalist
                  ? "bg-[#00ff66] text-black border-2 border-black rounded-[4px] font-black shadow-[1.5px_1.5px_0_#000]"
                  : "rounded-[4px] bg-emerald-500 text-slate-950 font-bold"
              )}
            >
              Claim Now
            </span>
          ) : isPending ? (
            <span
              className={cn(
                "text-xs uppercase px-2 py-0.5",
                isNeoBrutalist
                  ? "bg-[#ffe600] text-black border-2 border-black rounded-[4px] font-black shadow-[1.5px_1.5px_0_#000]"
                  : "rounded-[4px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
              )}
            >
              Pending
            </span>
          ) : (
            <span
              className={cn(
                "text-xs font-mono uppercase px-2 py-0.5 tabular-nums",
                isNeoBrutalist
                  ? "bg-[#faf8ee] text-black border border-black/50 rounded-[4px] font-black"
                  : "rounded-[4px] bg-[#1B212D] text-slate-400 border border-[#222938] font-bold"
              )}
            >
              {quest.progress}/{quest.target}
            </span>
          )}
          <IconChevronRight className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-slate-500")} />
        </div>
      </div>
    </div>
  );
}

function ClaimSuccessModal({ amount, onClose }: { amount: number; onClose: () => void }) {
  const { isNeoBrutalist } = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={cn("absolute inset-0 backdrop-blur-sm", isNeoBrutalist ? "bg-black/60" : "bg-[#0A0D12]/80")} onClick={onClose} />
      <div
        className={cn(
          "relative p-6 max-w-xs w-full text-center transition-colors",
          isNeoBrutalist
            ? "bg-white border-[3px] border-black rounded-[12px] shadow-[6px_6px_0_#000] text-black"
            : "bg-[#13171F] rounded-[6px] border border-[#222938] shadow-lg text-white"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 mx-auto mb-3 flex items-center justify-center shrink-0",
            isNeoBrutalist
              ? "bg-[#ffe600] border-2 border-black rounded-[8px] text-black shadow-[2px_2px_0_#000]"
              : "rounded-[4px] bg-[#1B212D] border border-amber-500/40 text-amber-400"
          )}
        >
          <IconGift className="w-6 h-6" />
        </div>
        <span
          className={cn(
            "text-xs uppercase tracking-widest",
            isNeoBrutalist ? "text-black/80 font-black" : "text-emerald-400 font-bold"
          )}
        >
          REWARD CLAIMED
        </span>
        <h3
          className={cn(
            "text-xl font-mono tabular-nums mt-1 mb-2",
            isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
          )}
        >
          +{formatNumber(amount)} COINS
        </h3>
        <p className={cn("text-xs mb-5", isNeoBrutalist ? "text-black/70 font-bold" : "text-slate-400")}>
          Credited instantly to your matchday balance.
        </p>
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className={cn(
            "w-full h-10 text-xs uppercase tracking-wider transition-all",
            isNeoBrutalist
              ? "bg-[#00ff66] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-[#00dd55] cursor-pointer"
              : "rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
          )}
        >
          Collect & Continue
        </button>
      </div>
    </div>
  );
}

function QuestDrawer({
  quest,
  onClose,
  onAction,
  onClaim,
  notify,
}: {
  quest: DailyQuest;
  onClose: () => void;
  onAction: (openUrl?: boolean, verificationCode?: string) => void;
  onClaim: () => void;
  notify?: (msg: string, type?: "success" | "error") => void;
}) {
  const { isNeoBrutalist } = useTheme();
  const [verificationInput, setVerificationInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const isClaimed = quest.status === 'CLAIMED' || quest.completed;
  const canClaim = quest.status === 'CLAIMABLE';
  const isPending = quest.status === 'VERIFYING';

  const handleClaim = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    soundFx.playGoal();
    try {
      await onClaim();
    } finally {
      setIsClaiming(false);
    }
  };

  const handleVerify = () => {
    if (!verificationInput.trim()) {
      notify?.("Please enter proof details first.", "error");
      return;
    }
    soundFx.playClick();
    setIsVerifying(true);
    // Note: Social quest verification is simulated for demo / testnet purposes
    setTimeout(() => {
      onAction(false, verificationInput.trim());
      setIsVerifying(false);
      notify?.("Verification submitted for review!", "success");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className={cn("absolute inset-0 backdrop-blur-sm", isNeoBrutalist ? "bg-black/60" : "bg-[#0A0D12]/80")} onClick={onClose} />
      <div
        className={cn(
          "relative w-full max-w-md h-full p-6 flex flex-col justify-between overflow-y-auto transition-colors",
          isNeoBrutalist
            ? "bg-white border-l-[3px] border-black shadow-[-4px_0_0_#000] text-black"
            : "bg-[#13171F] border-l border-[#222938] shadow-2xl text-white"
        )}
      >
        <div>
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between pb-3 mb-4",
              isNeoBrutalist ? "border-b-2 border-black" : "border-b border-[#222938]"
            )}
          >
            <div className="flex items-center gap-2">
              <IconTarget className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-emerald-400")} />
              <span
                className={cn(
                  "text-xs uppercase tracking-wider",
                  isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
                )}
              >
                Quest Docket
              </span>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "p-1.5 transition-all",
                isNeoBrutalist
                  ? "bg-white border-2 border-black rounded-[6px] text-black shadow-[1.5px_1.5px_0_#000] hover:bg-[#ffe600]"
                  : "rounded-[4px] bg-[#1B212D] text-slate-400 hover:text-white border border-[#222938]"
              )}
              aria-label="Close quest docket"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <span
            className={cn(
              "text-xs uppercase tracking-wider block",
              isNeoBrutalist ? "text-black/70 font-black" : "text-emerald-400 font-bold"
            )}
          >
            {quest.frequency} OBJECTIVE
          </span>
          <h2
            className={cn(
              "text-lg uppercase mt-1 mb-3",
              isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
            )}
          >
            {quest.title}
          </h2>

          <div
            className={cn(
              "p-3 mb-4 transition-colors",
              isNeoBrutalist
                ? "bg-[#faf8ee] border-2 border-black rounded-[6px] shadow-[2px_2px_0_#000]"
                : "bg-[#0A0D12] rounded-[4px] border border-[#222938]"
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={cn("text-xs uppercase", isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400 font-bold")}>
                Reward Bounty
              </span>
              <span className={cn("text-xs font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-amber-400 font-bold")}>
                +{quest.reward} Coins
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={cn("text-xs uppercase", isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400 font-bold")}>
                Progress
              </span>
              <span className={cn("text-xs font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-white font-bold")}>
                {quest.progress}/{quest.target}
              </span>
            </div>
          </div>

          {/* Social or External Steps */}
          {quest.category === "social" || quest.type === "social" ? (
            <div className="space-y-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onAction(true);
                }}
                className={cn(
                  "w-full h-10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                  isNeoBrutalist
                    ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-black hover:text-white"
                    : "rounded-[4px] bg-[#1B212D] border border-[#222938] hover:bg-[#222938] text-white font-bold"
                )}
              >
                <IconExternalLink className={cn("w-4 h-4", isNeoBrutalist ? "text-black" : "text-emerald-400")} />
                Open Task Link
              </button>

              {!isClaimed && !canClaim && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    placeholder="Enter username or transaction proof"
                    className={cn(
                      "w-full h-9 px-3 text-xs focus:outline-none transition-colors",
                      isNeoBrutalist
                        ? "bg-[#fcfaf2] border-2 border-black rounded-[6px] text-black font-black placeholder:text-black/40 focus:bg-white"
                        : "bg-[#0A0D12] border border-[#222938] rounded-[4px] font-bold text-white focus:border-emerald-500"
                    )}
                  />
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || !verificationInput.trim()}
                    className={cn(
                      "w-full h-9 text-xs uppercase tracking-wider transition-all",
                      isNeoBrutalist
                        ? "bg-[#00ff66] text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-[#00dd55] disabled:opacity-40"
                        : "rounded-[4px] bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 disabled:opacity-40"
                    )}
                  >
                    {isVerifying ? "Verifying..." : "Submit Proof"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Bottom Claim Action */}
        <div
          className={cn(
            "pt-4",
            isNeoBrutalist ? "border-t-2 border-black" : "border-t border-[#222938]"
          )}
        >
          {canClaim ? (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className={cn(
                "w-full h-11 text-xs uppercase tracking-wider transition-all",
                isNeoBrutalist
                  ? "bg-[#00ff66] text-black border-2 border-black rounded-[6px] font-black shadow-[3px_3px_0_#000] hover:bg-[#00dd55] cursor-pointer"
                  : "rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              )}
            >
              {isClaiming ? "Claiming..." : `Claim ${quest.reward} Coins`}
            </button>
          ) : isClaimed ? (
            <div
              className={cn(
                "w-full h-10 flex items-center justify-center text-xs uppercase",
                isNeoBrutalist
                  ? "bg-slate-100 border-2 border-black/30 rounded-[6px] text-black/60 font-black"
                  : "rounded-[4px] bg-[#0A0D12] border border-[#222938] text-slate-500 font-bold"
              )}
            >
              Objective Complete & Claimed
            </div>
          ) : (
            <div
              className={cn(
                "w-full h-10 flex items-center justify-center text-xs uppercase",
                isNeoBrutalist
                  ? "bg-slate-100 border-2 border-black/30 rounded-[6px] text-black/60 font-black"
                  : "rounded-[4px] bg-[#0A0D12] border border-[#222938] text-slate-500 font-bold"
              )}
            >
              Requirements in progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsButton({
  icon,
  label,
  description,
  onClick,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  const { isNeoBrutalist } = useTheme();
  return (
    <button
      onClick={() => {
        soundFx.playClick();
        onClick();
      }}
      className={cn(
        "p-3 w-full flex items-center gap-3 transition-all text-left",
        isNeoBrutalist
          ? variant === "danger"
            ? "bg-white border-2 border-[#ff0055] rounded-[8px] text-black shadow-[2px_2px_0_#ff0055] hover:bg-[#ff0055]/10 active:translate-x-[1px] active:translate-y-[1px]"
            : "bg-white border-2 border-black rounded-[8px] text-black shadow-[2px_2px_0_#000] hover:bg-[#faf8ee] active:translate-x-[1px] active:translate-y-[1px]"
          : variant === "danger"
          ? "border border-red-500/30 bg-[#13171F] hover:bg-red-950/20 rounded-[4px]"
          : "border border-[#222938] bg-[#13171F] hover:bg-[#1B212D] rounded-[4px]"
      )}
    >
      <div
        className={cn(
          "p-2 shrink-0",
          isNeoBrutalist
            ? "bg-[#faf8ee] border-2 border-black rounded-[6px] text-black"
            : "rounded-[4px] bg-[#0A0D12] border border-[#222938]"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p
          className={cn(
            "text-xs uppercase tracking-wider",
            isNeoBrutalist
              ? variant === "danger"
                ? "text-[#ff0055] font-black"
                : "text-black font-black"
              : variant === "danger"
              ? "text-red-400 font-bold"
              : "text-white font-bold"
          )}
        >
          {label}
        </p>
        {description && (
          <p
            className={cn(
              "text-xs mt-0.5 truncate",
              isNeoBrutalist ? "text-black/70 font-bold" : "text-slate-400"
            )}
          >
            {description}
          </p>
        )}
      </div>
      <IconChevronRight className={cn("w-4 h-4 shrink-0", isNeoBrutalist ? "text-black" : "text-slate-500")} />
    </button>
  );
}

export default ProfileScreen;
