import { useState, useEffect } from "react";
import { useSignMessage } from "wagmi";
import { cn } from "../lib/utils";
import { UserStats, DailyQuest } from "../types";
import {
  CONVERSION_RATE,
  CONVERSION_YIELD,
  INITIAL_QUESTS,
} from "../constants";
import {
  IconUser,
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
    <div className="space-y-4 max-w-xl mx-auto w-full pb-16">
      {/* Player Heraldry Club Card */}
      <div className="broadcast-card rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4">
          {/* Avatar with Glow Ring */}
          <div className="relative">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white font-black text-2xl">
                {(stats?.username || "P")[0].toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[10px] rounded-full shadow-md uppercase tracking-wider">
              LVL {stats?.level || 1}
            </div>
          </div>

          {/* Club Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">
                  PLAYER PASSPORT
                </span>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight truncate">
                  {stats?.username || "Guest Player"}
                </h2>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenWallet();
                }}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                title="Wallet Settings"
              >
                <IconWallet className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {truncateAddress(stats?.walletAddress || "")}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold">
                Tier {Math.min(5, Math.floor((stats?.level || 1) / 3) + 1)} Manager
              </span>
              {(stats?.loginStreak || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                  <IconFlame className="w-3 h-3 text-amber-400 animate-pulse" />
                  {stats.loginStreak} Day Streak
                </span>
              )}
            </div>
          </div>
        </div>

        {/* XP Level Bar */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">
              XP Progression
            </span>
            <span className="text-emerald-400 led-number">
              {stats?.xp || 0} / {((stats?.level || 1) + 1) * 1000} XP
            </span>
          </div>
          <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Balance Hub Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Coins Capsule */}
        <div className="broadcast-card rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-slate-900/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider">
              Play Coins
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <IconCoins className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 led-number">
            {formatNumber(stats?.coins || 0)}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
            Betting Fuel
          </p>
        </div>

        {/* KOR Tokens Capsule */}
        <div className="broadcast-card rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-slate-900/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-wider">
              KOR Tokens
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IconZap className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 led-number">
            {formatNumber(stats?.korBalance || 0)}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
            ≈ {((stats?.korBalance || 0) * 10).toLocaleString()} Coins Value
          </p>
        </div>
      </div>

      {/* KOR to Coins Converter Card */}
      <div className="broadcast-card rounded-3xl p-5 border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px]">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-emerald-400">
                <IconZap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Convert KOR to Coins
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">
                Rate: <span className="text-emerald-400">1 KOR = 10 Coins</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 led-number">
            Balance: {formatNumber(stats?.korBalance || 0)} KOR
          </span>
        </div>

        {/* Amount Input & Steppers */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">
              Select Amount of KOR
            </span>
            <span className="text-amber-400 led-number text-[11px]">
              Receiving: +{(convertKorAmount * 10).toLocaleString()} Coins
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                soundFx.playClick();
                setConvertKorAmount((prev) => Math.max(10, prev - 50));
              }}
              disabled={convertKorAmount <= 10}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center text-lg font-black hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              -
            </button>

            <div className="flex-1 flex items-center justify-center gap-1.5">
              <input
                type="number"
                value={convertKorAmount || ""}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setConvertKorAmount(Math.min(val, stats?.korBalance || 0));
                }}
                min={1}
                max={stats?.korBalance || 0}
                placeholder="0"
                className="w-full bg-transparent text-center font-black text-emerald-400 text-2xl focus:outline-none led-number"
              />
              <span className="text-xs font-black text-emerald-400/80 mr-2">KOR</span>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setConvertKorAmount((prev) => Math.min(prev + 50, stats?.korBalance || 0));
              }}
              disabled={convertKorAmount + 10 > (stats?.korBalance || 0)}
              className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center text-lg font-black hover:bg-emerald-400 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-emerald-500/20"
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
                  "flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  convertKorAmount === amt
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white",
                  amt > (stats?.korBalance || 0) && "opacity-40 cursor-not-allowed"
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
              className="flex-1 py-1.5 rounded-xl text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 disabled:opacity-40"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Conversion Yield Preview Row */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-white/5 text-xs">
          <div className="text-center p-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Paying</span>
            <span className="text-sm font-black text-emerald-400 led-number">
              {convertKorAmount.toLocaleString()} KOR
            </span>
          </div>
          <div className="text-center p-1.5 border-l border-white/5">
            <span className="text-[9px] font-bold text-amber-400 uppercase block mb-0.5">Receiving</span>
            <span className="text-sm font-black text-amber-400 led-number">
              +{(convertKorAmount * 10).toLocaleString()} Coins
            </span>
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
            "w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2",
            (stats?.korBalance || 0) >= 10 && convertKorAmount > 0 && convertKorAmount <= (stats?.korBalance || 0) && !isConverting
              ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/25 cursor-pointer"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          )}
        >
          {isConverting ? (
            <span className="animate-spin">Converting...</span>
          ) : (stats?.korBalance || 0) < 10 ? (
            "Need Minimum 10 KOR to Convert"
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
              "text-xs text-center font-bold animate-fade-in",
              convertMessage.type === "success" ? "text-emerald-400" : "text-red-400"
            )}
          >
            {convertMessage.text}
          </p>
        )}
      </div>

      {/* Unclaimed Winnings Card */}
      <div className={cn(
        "broadcast-card rounded-2xl p-4 border transition-all",
        (stats?.unclaimedBalance || 0) > 0 
          ? "border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 shadow-lg shadow-emerald-500/10" 
          : "border-white/5 bg-slate-900/60 opacity-80"
      )}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              (stats?.unclaimedBalance || 0) > 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
            )}>
              <IconTrophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Unclaimed Winnings
              </p>
              <p className="text-xl font-black text-white led-number">
                {formatNumber(stats?.unclaimedBalance || 0)} <span className="text-xs text-amber-400">KOR</span>
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
              "h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
              (stats?.unclaimedBalance || 0) > 0 
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
          >
            {(stats?.unclaimedBalance || 0) > 0 ? "Claim Winnings" : "Nothing to Claim"}
          </button>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
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
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
              activeSection === tab.id
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white",
            )}
          >
            <div className="flex items-center justify-center gap-1.5">
              {tab.label}
              {tab.id === "quests" && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* OVERVIEW STATS TAB */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          <div className="broadcast-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <IconTrophy className="w-4 h-4 text-emerald-400" />
              Matchday Performance Metrics
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <StatItem label="Total Bets" value={stats?.totalBets || 0} />
              <StatItem label="Wins" value={stats?.wins || 0} highlight="green" />
              <StatItem label="Win Rate" value={`${winRate}%`} highlight="green" />
              <StatItem label="Biggest Win" value={`${formatNumber(stats?.biggestWin || 0)} KOR`} highlight="yellow" />
              <StatItem label="Best Odds Won" value={`@${(stats?.bestOddsWon || 0).toFixed(2)}`} />
              <StatItem label="Current Streak" value={`${stats?.currentStreak || 0} W`} highlight={(stats?.currentStreak || 0) > 0 ? "green" : undefined} />
            </div>
          </div>

          <div className="broadcast-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <IconAward className="w-4 h-4 text-amber-400" />
              Player Trophies & Badges
            </h3>
            <div className="grid grid-cols-4 gap-2.5">
              <AchievementBadge icon={<IconTrophy className="w-5 h-5" />} label="First Win" unlocked={(stats?.wins || 0) > 0} />
              <AchievementBadge icon={<IconFlame className="w-5 h-5" />} label="Hot Streak" unlocked={(stats?.currentStreak || 0) >= 3} />
              <AchievementBadge icon={<IconStar className="w-5 h-5" />} label="Early Access" unlocked={true} />
              <AchievementBadge icon={<IconTarget className="w-5 h-5" />} label="High Roller" unlocked={(winRate || 0) >= 50} />
            </div>
          </div>
        </div>
      )}

      {/* QUESTS TAB */}
      {activeSection === "quests" && (
        <div className="space-y-4">
          {/* 4-Hourly Check-In Feature Card */}
          <div className="broadcast-card rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <IconGift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-white tracking-wide">
                    4-Hourly Stadium Grant
                  </h3>
                  <p className="text-xs text-slate-400">
                    Claim <span className="text-emerald-400 font-bold">5,000 Coins</span> every 4 hours
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
                  "h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
                  stats.canCheckIn
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed",
                )}
              >
                {stats.canCheckIn ? "Claim 5K" : `Wait ${stats.nextCheckInIn || 4}h`}
              </button>
            </div>
          </div>

          {/* Sub-Category Chips */}
          <div className="flex gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-white/5">
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
                  "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                  activeQuestTab === tab.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quests Stream */}
          <div className="space-y-2.5">
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
              <div className="broadcast-card rounded-2xl p-10 text-center border border-white/5">
                <p className="text-slate-500 text-xs font-bold uppercase">No {activeQuestTab} quests available.</p>
              </div>
            )}
          </div>

          {/* Redeem Code Panel (in Social Tab) */}
          {activeQuestTab === "social" && (
            <div className="broadcast-card rounded-2xl p-4 border border-white/10 mt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2">Redeem Promo Code</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 h-11 bg-slate-950 border border-white/10 rounded-xl px-3 text-xs font-bold text-white uppercase focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleRedeem}
                  disabled={!redeemCode.trim()}
                  className="px-5 h-11 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-40 transition-all"
                >
                  Redeem
                </button>
              </div>
              {redeemStatus.message && (
                <p className={cn("text-xs mt-2 font-semibold", redeemStatus.type === "success" ? "text-emerald-400" : "text-red-400")}>
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
          <div className="broadcast-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-3 flex items-center gap-2">
              <IconShare className="w-4 h-4 text-emerald-400" />
              Your Club Referral Code
            </h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 font-mono text-base font-black text-emerald-400">
                {stats.referralCode}
              </div>
              <button
                onClick={copyReferralCode}
                className={cn(
                  "px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center",
                  copied ? "bg-emerald-500 text-slate-950" : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                )}
              >
                {copied ? <IconCheck className="w-5 h-5" /> : <IconCopy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Invite friends to the arena. Both you and your invited friend receive <span className="text-amber-400 font-bold">5,000 bonus coins</span> upon wallet connection!
            </p>
          </div>

          <div className="broadcast-card rounded-2xl p-5 border border-white/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3">
              Referral Impact
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 rounded-xl p-3 text-center border border-white/5">
                <p className="text-2xl font-black text-white led-number">{stats.referralCount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Managers Invited</p>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-3 text-center border border-white/5">
                <p className="text-2xl font-black text-amber-400 led-number">{formatNumber(stats.referralEarnings)}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Coins Earned</p>
              </div>
            </div>
          </div>

          {!stats.hasReferred && (
            <div className="broadcast-card rounded-2xl p-5 border border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2">
                Have an Inviter Code?
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="ENTER FRIEND'S CODE"
                  className="flex-1 h-11 bg-slate-950 border border-white/10 rounded-xl px-3 text-xs font-bold text-white uppercase focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleReferral}
                  disabled={isApplyingReferral || !referralCode.trim()}
                  className="px-5 h-11 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-40 transition-all"
                >
                  {isApplyingReferral ? "Applying..." : "Apply"}
                </button>
              </div>
              {referralStatus.message && (
                <p className={cn("text-xs mt-2 font-semibold", referralStatus.type === "success" ? "text-emerald-400" : "text-red-400")}>
                  {referralStatus.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeSection === "settings" && (
        <div className="space-y-3">
          <SettingsButton
            icon={<IconWallet className="w-5 h-5 text-emerald-400" />}
            label="Wallet Management"
            description="View connected address and network"
            onClick={onOpenWallet}
          />
          <SettingsButton
            icon={<IconRefresh className="w-5 h-5 text-blue-400" />}
            label="Synchronize Account"
            description="Force update matchday balances from local state"
            onClick={onSystemSync}
          />
          <SettingsButton
            icon={<IconLogOut className="w-5 h-5 text-red-400" />}
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
    <div className="bg-slate-950/70 border border-white/5 rounded-xl p-3 text-center">
      <p className={cn(
        "text-lg font-black font-mono led-number",
        highlight === "green" ? "text-emerald-400" :
        highlight === "yellow" ? "text-amber-400" :
        highlight === "red" ? "text-red-400" :
        "text-white"
      )}>
        {value}
      </p>
      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{label}</p>
    </div>
  );
}

function AchievementBadge({ icon, label, unlocked }: { icon: React.ReactNode; label: string; unlocked: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
      unlocked
        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10"
        : "bg-slate-950/40 border-white/5 text-slate-600 opacity-50"
    )}>
      <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
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
        "broadcast-card rounded-2xl p-4 border transition-all cursor-pointer hover:scale-[1.01] active:scale-99",
        isSelected ? "border-emerald-400 bg-emerald-500/10" : "border-white/10 bg-slate-900/80 hover:border-white/20",
        isClaimed && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider truncate">
            {quest.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-amber-400 uppercase">
              +{quest.reward} COINS
            </span>
            <span className="text-slate-600 text-[10px]">•</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              {quest.frequency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isClaimed ? (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              Claimed
            </span>
          ) : isClaimable ? (
            <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 animate-pulse">
              Claim Now
            </span>
          ) : isPending ? (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              Pending
            </span>
          ) : (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative broadcast-card rounded-3xl p-8 max-w-xs w-full text-center border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 animate-slide-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-[2px] shadow-lg shadow-amber-500/30 animate-bounce">
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400">
            <IconGift className="w-8 h-8" />
          </div>
        </div>
        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em]">
          REWARD CLAIMED
        </span>
        <h3 className="text-2xl font-black text-white uppercase italic mt-1 mb-2">
          +{formatNumber(amount)} COINS
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Credited instantly to your matchday balance. Good luck in the upcoming round!
        </p>
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
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
    setTimeout(() => {
      onAction(false, verificationInput.trim());
      setIsVerifying(false);
      notify?.("Verification submitted for review!", "success");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <IconTarget className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-black uppercase text-white tracking-wider">Quest Docket</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white">
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">
            {quest.frequency} OBJECTIVE
          </span>
          <h2 className="text-xl font-black text-white uppercase italic mt-1 mb-3">
            {quest.title}
          </h2>

          <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/5 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Reward Bounty</span>
              <span className="text-sm font-black text-amber-400">+{quest.reward} Coins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
              <span className="text-sm font-black text-white">{quest.progress}/{quest.target}</span>
            </div>
          </div>

          {/* Social or External Steps */}
          {quest.category === "social" || quest.type === "social" ? (
            <div className="space-y-4">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onAction(true);
                }}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
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
                    className="w-full h-12 bg-slate-950 border border-white/10 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || !verificationInput.trim()}
                    className="w-full h-12 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-40 transition-all"
                  >
                    {isVerifying ? "Verifying..." : "Submit Proof"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Bottom Claim Action */}
        <div className="pt-6 border-t border-white/5">
          {canClaim ? (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/30"
            >
              {isClaiming ? "Claiming..." : `Claim ${quest.reward} Coins`}
            </button>
          ) : isClaimed ? (
            <div className="w-full h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
              Objective Complete & Claimed
            </div>
          ) : (
            <div className="w-full h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
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
        "broadcast-card rounded-2xl p-4 w-full flex items-center gap-4 transition-all hover:scale-[1.01] active:scale-99 border",
        variant === "danger"
          ? "border-red-500/20 bg-red-950/20 hover:border-red-500/40"
          : "border-white/10 bg-slate-900/80 hover:border-white/20"
      )}
    >
      <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={cn("font-bold text-xs uppercase tracking-wider", variant === "danger" ? "text-red-400" : "text-white")}>
          {label}
        </p>
        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <IconChevronRight className="w-4 h-4 text-slate-500" />
    </button>
  );
}

export default ProfileScreen;
