import { useState, useEffect } from "react";
import { useSignMessage } from "wagmi";
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

  const { signMessageAsync } = useSignMessage();
  const [convertKorAmount, setConvertKorAmount] = useState<number>(() => {
    const bal = stats?.korBalance || 0;
    if (bal >= 100) return 100;
    if (bal >= 50) return 50;
    return Math.max(10, Math.min(bal, 50));
  });
  const [isConverting, setIsConverting] = useState(false);
  const [convertMessage, setConvertMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncCooldown, setSyncCooldown] = useState(0);

  const handleConvert = async () => {
    if (convertKorAmount <= 0 || convertKorAmount > (stats?.korBalance || 0)) {
      setConvertMessage({ type: "error", text: "Invalid KOR amount" });
      return;
    }
    setIsConverting(true);
    setConvertMessage(null);
    try {
      // Prompt wallet signature for converting KOR to Coins
      try {
        const message = `KickOff Rivals - Convert KOR to Coins

Account: ${stats.walletAddress}
Convert: ${convertKorAmount.toLocaleString()} KOR
Receive: ${(convertKorAmount * 10).toLocaleString()} Coins
Timestamp: ${Date.now()}

Authorize converting your KOR reward tokens into Game Coins.
This action does not cost gas.`;

        await signMessageAsync({ message });
      } catch (signErr: any) {
        if (signErr.message?.includes("User rejected") || signErr.message?.includes("User denied")) {
          setConvertMessage({ type: "error", text: "Signature request was cancelled" });
          setIsConverting(false);
          return;
        }
        console.warn("Wallet signing skipped or unsupported:", signErr);
      }

      const res = await fetch("/api/user/convert-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: stats.walletAddress,
          amount: convertKorAmount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        soundFx.playCashout();
        setConvertMessage({
          type: "success",
          text: `Converted ${convertKorAmount} KOR into ${(convertKorAmount * 10).toLocaleString()} Coins!`,
        });
        onSystemSync();
      } else {
        setConvertMessage({ type: "error", text: data.error || "Conversion failed" });
      }
    } catch (e: any) {
      setConvertMessage({ type: "error", text: e.message || "Failed to convert" });
    } finally {
      setIsConverting(false);
    }
  };

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
      <div className="bg-surface-panel border border-border-subtle rounded-md p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Avatar Frame */}
          <div className="relative">
            <div className="w-14 h-14 rounded-sm bg-surface-raised border border-border-subtle flex items-center justify-center text-text-primary font-bold text-xl font-mono">
              {(stats?.username || "P")[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 bg-surface-panel text-semantic-reward border border-border-subtle font-mono font-bold text-xs rounded-sm">
              L{stats?.level || 1}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  PLAYER PROFILE
                </span>
                <h2 className="text-base sm:text-lg font-bold text-text-primary uppercase truncate">
                  {stats?.username || "Guest Player"}
                </h2>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenWallet();
                }}
                aria-label="Open wallet modal"
                className="p-1.5 rounded-sm bg-surface-raised border border-border-subtle hover:border-border-strong text-text-muted hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              >
                <IconWallet className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-muted font-mono mt-0.5">
              {truncateAddress(stats?.walletAddress || "")}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-sm bg-surface-raised border border-border-subtle text-text-muted text-xs font-mono font-medium">
                Tier {Math.min(5, Math.floor((stats?.level || 1) / 3) + 1)} Manager
              </span>
              {(stats?.loginStreak || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-sm bg-[#382305] border border-[#F59E0B]/40 text-[#FBBF24] text-xs font-mono font-bold flex items-center gap-1">
                  <IconFlame className="w-3 h-3 text-amber-400" />
                  {stats.loginStreak} Day Streak
                </span>
              )}
            </div>
          </div>
        </div>

        {/* XP Level Bar */}
        <div className="mt-4 pt-3 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs mb-1 font-bold">
            <span className="text-text-muted uppercase tracking-wider">
              XP Progress
            </span>
            <span className="text-accent font-mono tabular-nums">
              {stats?.xp || 0} / {((stats?.level || 1) + 1) * 1000} XP
            </span>
          </div>
          <div className="h-2 bg-surface-page rounded-sm overflow-hidden border border-border-subtle p-[1px]">
            <div
              className="h-full bg-accent rounded-xs transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Balance Hub Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Coins Panel */}
        <div className="bg-surface-panel border border-border-subtle rounded-md p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Game Coins
            </span>
            <IconCoins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary font-mono tabular-nums">
            {formatNumber(stats?.coins || 0)}
          </p>
          <p className="text-xs text-text-muted uppercase mt-0.5">
            Betting Fuel
          </p>
        </div>

        {/* KOR Tokens Panel */}
        <div className="bg-surface-panel border border-border-subtle rounded-md p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              KOR Balance
            </span>
            <IconZap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-semantic-reward font-mono tabular-nums">
            {formatNumber(stats?.korBalance || 0)}
          </p>
          <p className="text-xs text-text-muted uppercase mt-0.5">
            ≈ {((stats?.korBalance || 0) * 10).toLocaleString()} Coins Value
          </p>
        </div>
      </div>

      {/* KOR to Coins Converter Form */}
      <div className="bg-surface-panel border border-border-subtle rounded-md p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary font-mono">
              Convert KOR to Coins
            </h3>
            <p className="text-xs text-text-muted">
              Rate: <span className="font-mono font-bold text-accent">1 KOR = 10 Coins</span>
            </p>
          </div>
          <span className="text-xs font-mono text-semantic-reward font-bold bg-surface-raised px-2.5 py-0.5 rounded-sm border border-border-subtle tabular-nums">
            {formatNumber(stats?.korBalance || 0)} KOR
          </span>
        </div>

        {/* Form Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="profile-convert-input" className="text-text-muted uppercase tracking-wider font-bold">
              KOR Amount
            </label>
            <span className="text-semantic-reward font-mono font-bold tabular-nums">
              Yield: +{(convertKorAmount * 10).toLocaleString()} Coins
            </span>
          </div>

          <div className="flex items-center gap-2 bg-surface-page p-1.5 rounded-sm border border-border-subtle focus-within:border-accent">
            <button
              onClick={() => {
                soundFx.playClick();
                setConvertKorAmount((prev) => Math.max(10, prev - 50));
              }}
              disabled={convertKorAmount <= 10}
              aria-label="Decrease KOR amount"
              className="w-8 h-8 rounded-sm bg-surface-raised border border-border-subtle text-text-primary flex items-center justify-center font-bold hover:border-border-strong disabled:opacity-30 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
            >
              -
            </button>

            <div className="flex-1 flex items-center justify-center">
              <input
                id="profile-convert-input"
                type="number"
                value={convertKorAmount || ""}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setConvertKorAmount(Math.min(val, stats?.korBalance || 0));
                }}
                min={1}
                max={stats?.korBalance || 0}
                placeholder="0"
                className="w-full bg-transparent text-center font-mono font-bold text-semantic-reward text-xl focus:outline-none tabular-nums"
              />
              <span className="text-xs font-bold text-text-muted mr-2">KOR</span>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setConvertKorAmount((prev) => Math.min(prev + 50, stats?.korBalance || 0));
              }}
              disabled={convertKorAmount + 10 > (stats?.korBalance || 0)}
              aria-label="Increase KOR amount"
              className="w-8 h-8 rounded-sm bg-surface-raised border border-border-subtle text-text-primary flex items-center justify-center font-bold hover:border-border-strong disabled:opacity-30 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
            >
              +
            </button>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex gap-1.5">
            {[50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  soundFx.playClick();
                  setConvertKorAmount(Math.min(amt, stats?.korBalance || 0));
                }}
                disabled={amt > (stats?.korBalance || 0)}
                className={cn(
                  "flex-1 py-1 rounded-sm text-xs font-mono font-bold border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                  convertKorAmount === amt
                    ? "bg-surface-raised text-text-primary border-border-strong"
                    : "bg-surface-page text-text-muted border-border-subtle hover:text-text-primary hover:border-border-strong",
                  amt > (stats?.korBalance || 0) && "opacity-30 cursor-not-allowed"
                )}
              >
                {amt}
              </button>
            ))}
            <button
              onClick={() => {
                soundFx.playClick();
                setConvertKorAmount(stats?.korBalance || 0);
              }}
              disabled={(stats?.korBalance || 0) <= 0}
              className="flex-1 py-1 rounded-sm text-xs font-mono font-bold bg-surface-page text-semantic-reward border border-border-subtle hover:border-semantic-reward disabled:opacity-30 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Convert Action Button */}
        <button
          onClick={handleConvert}
          disabled={
            isConverting ||
            (stats?.korBalance || 0) < 10 ||
            convertKorAmount <= 0 ||
            convertKorAmount > (stats?.korBalance || 0)
          }
          className={cn(
            "w-full h-11 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-accent",
            (stats?.korBalance || 0) >= 10 && convertKorAmount > 0 && convertKorAmount <= (stats?.korBalance || 0) && !isConverting
              ? "bg-accent text-surface-page hover:bg-accent-hover cursor-pointer"
              : "bg-surface-raised text-text-muted border border-border-subtle cursor-not-allowed"
          )}
        >
          {isConverting ? (
            <span>Converting...</span>
          ) : (stats?.korBalance || 0) < 10 ? (
            "Minimum 10 KOR to Convert"
          ) : (
            <>
              <IconCoins className="w-4 h-4" />
              Convert {convertKorAmount.toLocaleString()} KOR → +{(convertKorAmount * 10).toLocaleString()} Coins
            </>
          )}
        </button>

        {convertMessage && (
          <p
            className={cn(
              "text-xs text-center font-semibold",
              convertMessage.type === "success" ? "text-semantic-win" : "text-semantic-loss"
            )}
          >
            {convertMessage.text}
          </p>
        )}
      </div>

      {/* Unclaimed Winnings Card */}
      <div className="bg-surface-panel border border-border-subtle rounded-md p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-surface-raised border border-border-subtle flex items-center justify-center text-semantic-reward">
            <IconTrophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Unclaimed Winnings
            </p>
            <p className="text-lg font-black text-text-primary font-mono tabular-nums">
              {formatNumber(stats?.unclaimedBalance || 0)} <span className="text-xs text-semantic-reward">KOR</span>
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
            "h-9 px-4 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-accent",
            (stats?.unclaimedBalance || 0) > 0 
              ? "bg-accent text-surface-page hover:bg-accent-hover cursor-pointer" 
              : "bg-surface-raised text-text-muted border border-border-subtle cursor-not-allowed"
          )}
        >
          {(stats?.unclaimedBalance || 0) > 0 ? "Claim Winnings" : "No Winnings"}
        </button>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex bg-surface-page p-1 rounded-sm border border-border-subtle">
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
              "flex-1 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              activeSection === tab.id
                ? "bg-surface-raised text-text-primary border border-border-strong font-bold"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* OVERVIEW STATS TAB */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <IconTrophy className="w-4 h-4 text-emerald-400" />
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

          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <IconAward className="w-4 h-4 text-amber-400" />
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
          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-emerald-400">
                  <IconGift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase text-white tracking-wider">
                    4-Hourly Stadium Grant
                  </h3>
                  <p className="text-xs text-slate-400">
                    Claim <span className="text-emerald-400 font-mono font-bold">5,000 Coins</span> every 4 hours
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
                  "h-9 px-4 rounded-[4px] font-bold text-xs uppercase tracking-wider transition-colors",
                  stats.canCheckIn
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    : "bg-[#1B212D] text-slate-500 cursor-not-allowed border border-[#222938]",
                )}
              >
                {stats.canCheckIn ? "Claim 5,000" : `Wait ${stats.nextCheckInIn || 4}h`}
              </button>
            </div>
          </div>

          {/* Sub-Category Chips */}
          <div className="flex gap-1.5 p-1 bg-[#13171F] rounded-[4px] border border-[#222938]">
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
                  "flex-1 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors",
                  activeQuestTab === tab.id
                    ? "bg-[#1B212D] text-emerald-400 border border-[#323C50]"
                    : "text-slate-400 hover:text-white",
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
              <div className="bg-[#13171F] rounded-[6px] p-8 text-center border border-[#222938]">
                <p className="text-slate-500 text-xs font-bold uppercase">No {activeQuestTab} quests available.</p>
              </div>
            )}
          </div>

          {/* Redeem Code Panel (in Social Tab) */}
          {activeQuestTab === "social" && (
            <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938] mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Redeem Promo Code</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 h-9 bg-[#0A0D12] border border-[#222938] rounded-[4px] px-3 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleRedeem}
                  disabled={!redeemCode.trim()}
                  className="px-4 h-9 rounded-[4px] bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                >
                  Redeem
                </button>
              </div>
              {redeemStatus.message && (
                <p className={cn("text-xs mt-2 font-medium", redeemStatus.type === "success" ? "text-emerald-400" : "text-red-400")}>
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
          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
              <IconShare className="w-4 h-4 text-emerald-400" />
              Your Club Referral Code
            </h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0A0D12] border border-[#222938] rounded-[4px] px-3 py-2 font-mono text-sm font-bold text-emerald-400 tabular-nums">
                {stats.referralCode}
              </div>
              <button
                onClick={copyReferralCode}
                className={cn(
                  "px-3 rounded-[4px] font-bold text-xs transition-colors flex items-center justify-center border",
                  copied ? "bg-emerald-500 text-slate-950 border-emerald-500" : "bg-[#1B212D] border-[#222938] text-white hover:bg-[#222938]"
                )}
                aria-label="Copy referral code"
              >
                {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Invite friends to the arena. Both you and your invited friend receive <span className="text-amber-400 font-mono font-bold">5,000 bonus coins</span> upon wallet connection.
            </p>
          </div>

          <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Referral Impact
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0A0D12] rounded-[4px] p-3 text-center border border-[#222938]">
                <p className="text-xl font-bold font-mono text-white tabular-nums">{stats.referralCount}</p>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Managers Invited</p>
              </div>
              <div className="bg-[#0A0D12] rounded-[4px] p-3 text-center border border-[#222938]">
                <p className="text-xl font-bold font-mono text-amber-400 tabular-nums">{formatNumber(stats.referralEarnings)}</p>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Coins Earned</p>
              </div>
            </div>
          </div>

          {!stats.hasReferred && (
            <div className="bg-[#13171F] rounded-[6px] p-4 border border-[#222938]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                Have an Inviter Code?
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="ENTER FRIEND'S CODE"
                  className="flex-1 h-9 bg-[#0A0D12] border border-[#222938] rounded-[4px] px-3 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleReferral}
                  disabled={isApplyingReferral || !referralCode.trim()}
                  className="px-4 h-9 rounded-[4px] bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                >
                  {isApplyingReferral ? "Applying..." : "Apply"}
                </button>
              </div>
              {referralStatus.message && (
                <p className={cn("text-xs mt-2 font-medium", referralStatus.type === "success" ? "text-emerald-400" : "text-red-400")}>
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
            icon={<IconWallet className="w-4 h-4 text-emerald-400" />}
            label="Wallet Management"
            description="View connected address and network"
            onClick={onOpenWallet}
          />
          <SettingsButton
            icon={<IconRefresh className="w-4 h-4 text-slate-300" />}
            label="Synchronize Account"
            description="Force update matchday balances from local state"
            onClick={onSystemSync}
          />
          <SettingsButton
            icon={<IconLogOut className="w-4 h-4 text-red-400" />}
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
  return (
    <div className="bg-[#13171F] border border-[#222938] rounded-[4px] p-3 text-center">
      <p className={cn(
        "text-base font-bold font-mono tabular-nums",
        highlight === "green" ? "text-emerald-400" :
        highlight === "yellow" ? "text-amber-400" :
        highlight === "red" ? "text-red-400" :
        "text-white"
      )}>
        {value}
      </p>
      <p className="text-xs text-slate-400 font-bold uppercase mt-1">{label}</p>
    </div>
  );
}

function AchievementBadge({ icon, label, unlocked }: { icon: React.ReactNode; label: string; unlocked: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1.5 p-2.5 rounded-[4px] border transition-colors text-center",
      unlocked
        ? "bg-[#1B212D] border-amber-500/40 text-amber-400"
        : "bg-[#13171F] border-[#222938] text-slate-600 opacity-60"
    )}>
      <div className="w-7 h-7 rounded-[4px] bg-[#0A0D12] flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function QuestCard({ quest, isSelected, onClick }: { quest: DailyQuest; isSelected: boolean; onClick: () => void }) {
  const isClaimed = quest.completed || quest.status === 'CLAIMED';
  const isClaimable = quest.status === 'CLAIMABLE';
  const isPending = quest.status === 'VERIFYING';

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[4px] p-3 border transition-colors cursor-pointer",
        isSelected ? "border-emerald-500 bg-[#1B212D]" : "border-[#222938] bg-[#13171F] hover:border-[#323C50]",
        isClaimed && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider truncate">
            {quest.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
              +{quest.reward} COINS
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {quest.frequency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isClaimed ? (
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-[4px] bg-[#1B212D] text-slate-400 border border-[#222938]">
              Claimed
            </span>
          ) : isClaimable ? (
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-[4px] bg-emerald-500 text-slate-950">
              Claim Now
            </span>
          ) : isPending ? (
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Pending
            </span>
          ) : (
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-[4px] bg-[#1B212D] text-slate-400 border border-[#222938] tabular-nums">
              {quest.progress}/{quest.target}
            </span>
          )}
          <IconChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
}

function ClaimSuccessModal({ amount, onClose }: { amount: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0A0D12]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13171F] rounded-[6px] p-6 max-w-xs w-full text-center border border-[#222938] shadow-lg">
        <div className="w-12 h-12 mx-auto mb-3 rounded-[4px] bg-[#1B212D] border border-amber-500/40 flex items-center justify-center text-amber-400">
          <IconGift className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          REWARD CLAIMED
        </span>
        <h3 className="text-xl font-bold font-mono text-white tabular-nums mt-1 mb-2">
          +{formatNumber(amount)} COINS
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Credited instantly to your matchday balance.
        </p>
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="w-full h-10 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
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
      <div className="absolute inset-0 bg-[#0A0D12]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#13171F] border-l border-[#222938] h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#222938] mb-4">
            <div className="flex items-center gap-2">
              <IconTarget className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase text-white tracking-wider">Quest Docket</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-[4px] bg-[#1B212D] text-slate-400 hover:text-white border border-[#222938]" aria-label="Close quest docket">
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
            {quest.frequency} OBJECTIVE
          </span>
          <h2 className="text-lg font-bold text-white uppercase mt-1 mb-3">
            {quest.title}
          </h2>

          <div className="bg-[#0A0D12] rounded-[4px] p-3 border border-[#222938] mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Reward Bounty</span>
              <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">+{quest.reward} Coins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Progress</span>
              <span className="text-xs font-mono font-bold text-white tabular-nums">{quest.progress}/{quest.target}</span>
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
                className="w-full h-10 rounded-[4px] bg-[#1B212D] border border-[#222938] hover:bg-[#222938] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <IconExternalLink className="w-4 h-4 text-emerald-400" />
                Open Task Link
              </button>

              {!isClaimed && !canClaim && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    placeholder="Enter username or transaction proof"
                    className="w-full h-9 bg-[#0A0D12] border border-[#222938] rounded-[4px] px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || !verificationInput.trim()}
                    className="w-full h-9 rounded-[4px] bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                  >
                    {isVerifying ? "Verifying..." : "Submit Proof"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Bottom Claim Action */}
        <div className="pt-4 border-t border-[#222938]">
          {canClaim ? (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full h-11 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {isClaiming ? "Claiming..." : `Claim ${quest.reward} Coins`}
            </button>
          ) : isClaimed ? (
            <div className="w-full h-10 rounded-[4px] bg-[#0A0D12] border border-[#222938] flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
              Objective Complete & Claimed
            </div>
          ) : (
            <div className="w-full h-10 rounded-[4px] bg-[#0A0D12] border border-[#222938] flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
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
  return (
    <button
      onClick={() => {
        soundFx.playClick();
        onClick();
      }}
      className={cn(
        "rounded-[4px] p-3 w-full flex items-center gap-3 transition-colors border text-left",
        variant === "danger"
          ? "border-red-500/30 bg-[#13171F] hover:bg-red-950/20"
          : "border-[#222938] bg-[#13171F] hover:bg-[#1B212D]"
      )}
    >
      <div className="p-2 rounded-[4px] bg-[#0A0D12] border border-[#222938]">
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={cn("font-bold text-xs uppercase tracking-wider", variant === "danger" ? "text-red-400" : "text-white")}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>
        )}
      </div>
      <IconChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
    </button>
  );
}

export default ProfileScreen;
