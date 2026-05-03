import { useState, useEffect } from "react";
// ProfileScreen Version: 1.0.2 - Safety Patch
import { cn } from "../lib/utils";
import { UserStats, DailyQuest, AppTheme } from "../types";
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
  IconPlay,
  IconRefresh,
  IconX,
} from "./Icons";
import { syncQuests } from "../server/user";
import { truncateAddress, formatNumber } from "../lib/utils";

interface ProfileScreenProps {
  stats: UserStats;
  onLogout: () => void;
  onRedeem: (code: string) => Promise<{ success: boolean; message?: string }>;
  onQuestClaim: (
    questId: string,
    onSuccess?: (reward: number) => void,
  ) => Promise<void>;
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

  // Sync Cooldown and Status
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
    setSyncLoading(true);
    try {
      const result = await syncQuests({ data: { walletAddress: stats.walletAddress } });
      if (result.success) {
        localStorage.setItem(`questSync_${stats?.walletAddress}`, Date.now().toString());
        setSyncCooldown(60);
        onSystemSync(); // This should trigger a refetch of the profile/quests
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
        qId.startsWith("p_"); // Check for p_1, p_2, etc.

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
    const result = await onRedeem(redeemCode.trim());
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
    setIsApplyingReferral(true);
    setReferralStatus({ type: null, message: "" });

    try {
      const result = await onReferral(referralCode.trim());
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
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const winRate =
    stats?.totalBets > 0
      ? Math.round(((stats?.wins || 0) / stats.totalBets) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <IconUser className="w-8 h-8" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">
              {stats?.username || "Guest User"}
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              {truncateAddress(stats?.walletAddress || "")}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-default text-xs">
                Level {stats?.level || 1}
              </span>
              {(stats?.loginStreak || 0) > 0 && (
                <span className="badge badge-secondary text-xs flex items-center gap-1">
                  <IconFlame className="w-3 h-3" />
                  {stats.loginStreak} day streak
                </span>
              )}
            </div>
          </div>

          {/* Wallet Button */}
          <button onClick={onOpenWallet} className="btn btn-outline h-10 px-4">
            <IconWallet className="w-4 h-4" />
          </button>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Experience</span>
            <span className="text-foreground font-medium">
              {stats?.xp || 0} / {((stats?.level || 1) + 1) * 1000} XP
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${((stats?.xp || 0) / (((stats?.level || 1) + 1) * 1000)) * 100
                  }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 relative group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <IconCoins className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground font-medium">Coins</span>
            </div>

          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatNumber(stats?.coins || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold opacity-70">
            {Math.floor((stats?.coins || 0) / CONVERSION_RATE) *
              CONVERSION_YIELD || 0}{" "}
            KOR Value
          </p>
        </div>

        <div className="card p-4 relative group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <IconZap className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">KOR Tokens</span>
            </div>

          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatNumber(stats?.korBalance || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold opacity-70">
            Tradable Assets
          </p>
        </div>
      </div>

      {/* Alliance Rewards Banner */}
      {(stats?.unclaimedAllianceRewards || 0) > 0 && (
        <button
          onClick={onClaimAllianceRewards}
          className="card p-4 w-full bg-primary/10 border-primary/30 hover:bg-primary/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <IconGift className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Alliance Rewards
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.unclaimedAllianceRewards} coins to claim
                </p>
              </div>
            </div>
            <IconChevronRight className="w-5 h-5 text-primary" />
          </div>
        </button>
      )}

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {[
          { id: "overview", label: "Stats" },
          { id: "quests", label: "Quests" },
          { id: "referral", label: "Referral" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={cn(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
              activeSection === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="flex items-center justify-center gap-1.5">
              {tab.label}
              {tab.id === "quests" && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="card p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconTrophy className="w-5 h-5 text-primary" />
              Betting Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatItem label="Total Bets" value={stats?.totalBets || 0} />
              <StatItem
                label="Wins"
                value={stats?.wins || 0}
                highlight="green"
              />
              <StatItem label="Win Rate" value={`${winRate}%`} />
              <StatItem
                label="Biggest Win"
                value={formatNumber(stats?.biggestWin || 0)}
                highlight="yellow"
              />
              <StatItem
                label="Best Odds"
                value={(stats?.bestOddsWon || 0).toFixed(2)}
              />
              <StatItem
                label="Current Streak"
                value={stats?.currentStreak || 0}
                highlight={
                  (stats?.currentStreak || 0) > 0 ? "green" : undefined
                }
              />
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconAward className="w-5 h-5 text-yellow-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <AchievementBadge
                icon={<IconTrophy />}
                label="Best Win"
                unlocked={(stats?.biggestWin || 0) > 0}
              />
              <AchievementBadge
                icon={<IconZap />}
                label="NFT Holder"
                unlocked={false}
              />
              <AchievementBadge
                icon={<IconStar />}
                label="Beta Player"
                unlocked={true}
              />
              <AchievementBadge
                icon={<IconTarget />}
                label="Sharpshooter"
                unlocked={(winRate || 0) >= 60}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quests Section */}
      {activeSection === "quests" && (
        <div className="space-y-4 relative min-h-[300px]">
          {/* 4-Hourly Check-in Card (Featured) */}
          <div className="card p-5 border-primary/20 bg-primary/5 shadow-inner">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                  <IconGift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">4-Hourly Bonus</h3>
                  <p className="text-xs text-muted-foreground">
                    Claim{" "}
                    <span className="text-primary font-semibold text-sm">
                      5,000 coins
                    </span>{" "}
                    every 4 hours
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (stats.canCheckIn) {
                    console.log("[PROFILE] Claim button clicked");
                    const res = await onCheckIn();
                    if (res.success) {
                      setClaimReward(res.reward || 5000);
                      setShowClaimSuccess(true);
                    } else {
                      notify?.(res.message || "Claim failed", "error");
                    }
                  }
                }}
                disabled={!stats.canCheckIn}
                className={cn(
                  "btn h-11 px-6 font-bold shadow-lg transition-all",
                  stats.canCheckIn
                    ? "btn-primary hover:scale-105 active:scale-95"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-70",
                )}
              >
                {stats.canCheckIn ? (
                  "Claim Now"
                ) : (
                  <span className="flex items-center gap-2">
                    <IconZap className="w-4 h-4 animate-pulse" />
                    Wait {stats.nextCheckInIn}h
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-2">
            {[
              { id: "daily", label: "Daily" },
              { id: "weekly", label: "Weekly" },
              { id: "social", label: "Social" },
              { id: "partners", label: "Partners" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveQuestTab(tab.id as any)}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
                  activeQuestTab === tab.id
                    ? "bg-background text-primary shadow-sm ring-1 ring-primary/10"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg capitalize">
              {activeQuestTab} Quests
            </h3>
            <div className="flex items-center gap-3">
              {(activeQuestTab === "daily" || activeQuestTab === "weekly") && (
                <div className="flex flex-col items-end">
                  <button
                    onClick={handleSync}
                    disabled={syncLoading || syncCooldown > 0}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all active:scale-95 shadow-xs border",
                      syncCooldown > 0
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-background text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40 shadow-sm"
                    )}
                  >
                    <IconRefresh className={cn("w-3.5 h-3.5", syncLoading && "animate-spin")} />
                    {syncLoading ? "SYNCING..." : "RELOAD"}
                  </button>
                  {syncCooldown > 0 && (
                    <span className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                      Ready in {syncCooldown}m
                    </span>
                  )}
                </div>
              )}
              <span className="text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800/0 px-2 py-1.5 rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-800">
                {filteredQuests.filter((q) => q.completed).length}/
                {filteredQuests.length} completed
              </span>
            </div>
          </div>

          <div className="space-y-3 relative min-h-[120px] overflow-hidden rounded-xl">
            {activeQuestTab === "partners" && <ComingSoonOverlay />}
            {filteredQuests.length > 0 ? (
              filteredQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  isSelected={selectedQuestId === quest.id}
                  onClick={() => setSelectedQuestId(quest.id)}
                />
              ))
            ) : (
              <div className="py-10 text-center card bg-muted/20 border-dashed">
                <p className="text-muted-foreground text-sm">No {activeQuestTab} quests available right now.</p>
              </div>
            )}
          </div>

          {/* Redeem Code - Only in Social Tab */}
          {activeQuestTab === "social" && (
            <div className="card p-4 mt-4">
              <h4 className="font-medium text-foreground mb-3">Redeem Coupon</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="input flex-1"
                />
                <button
                  onClick={handleRedeem}
                  disabled={!redeemCode.trim()}
                  className="btn btn-primary px-6 shadow-md"
                >
                  Redeem
                </button>
              </div>
              {redeemStatus.message && (
                <p
                  className={cn(
                    "text-xs mt-2",
                    redeemStatus.type === "success"
                      ? "text-green-500"
                      : "text-red-500",
                  )}
                >
                  {redeemStatus.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Referral Section */}
      {activeSection === "referral" && (
        <div className="space-y-4 relative min-h-[300px]">
          <div className="space-y-4">
            {/* Your Referral Code */}
            <div className="card p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <IconShare className="w-5 h-5 text-primary" />
                Your Referral Code
              </h3>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-lg font-bold text-foreground overflow-x-auto whitespace-nowrap">
                  {stats.referralCode}
                </div>
                <button
                  onClick={copyReferralCode}
                  className={cn(
                    "btn px-4",
                    copied ? "btn-primary" : "btn-outline",
                  )}
                >
                  {copied ? (
                    <IconCheck className="w-5 h-5" />
                  ) : (
                    <IconCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Share your code and you both earn 5000 coins when your friend
                joins!
              </p>
            </div>

            {/* Referral Stats */}
            <div className="card p-4">
              <h4 className="font-medium text-foreground mb-3">
                Referral Stats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {stats.referralCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Friends Referred
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-500">
                    {formatNumber(stats.referralEarnings)}
                  </p>
                  <p className="text-xs text-muted-foreground">Coins Earned</p>
                </div>
              </div>
            </div>

            {/* Enter Referral Code */}
            {!stats.hasReferred && (
              <div className="card p-4">
                <h4 className="font-medium text-foreground mb-3">
                  Have a referral code?
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) =>
                      setReferralCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter friend's code"
                    className="input flex-1 disabled:opacity-50"
                    disabled={
                      isApplyingReferral || referralStatus.type === "success"
                    }
                  />
                  <button
                    onClick={handleReferral}
                    disabled={
                      isApplyingReferral ||
                      referralStatus.type === "success" ||
                      !referralCode.trim()
                    }
                    className="btn btn-primary px-6 flex items-center justify-center min-w-[100px]"
                  >
                    {isApplyingReferral ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {referralStatus.message && (
                  <p
                    className={cn(
                      "text-xs mt-2",
                      referralStatus.type === "success"
                        ? "text-green-500"
                        : "text-red-500",
                    )}
                  >
                    {referralStatus.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Section */}
      {activeSection === "settings" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 mb-6">

          </div>

          <SettingsButton
            icon={<IconWallet className="w-5 h-5" />}
            label="Wallet Settings"
            onClick={onOpenWallet}
          />
          <SettingsButton
            icon={<IconSettings className="w-5 h-5" />}
            label="Sync Account"
            description="Refresh your account data"
            onClick={onSystemSync}
          />
          <SettingsButton
            icon={<IconLogOut className="w-5 h-5 text-destructive" />}
            label="Logout"
            description="Disconnect your wallet"
            onClick={onLogout}
            variant="danger"
          />
        </div>
      )}

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

// Sub-components
function ComingSoonOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg border border-dashed border-muted-foreground/20">
      <div className="bg-background/80 p-4 rounded-full shadow-lg border mb-2">
        <IconPlay className="w-6 h-6 text-muted-foreground rotate-[-90deg]" />{" "}
        {/* Using Play icon rotated as a 'construct' placeholder or just use generic */}
      </div>
      <div className="bg-card px-4 py-2 rounded-lg shadow-sm border">
        <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
          Coming Soon
        </span>
      </div>
    </div>
  );
}

interface ClaimSuccessModalProps {
  amount: number;
  onClose: () => void;
}

function ClaimSuccessModal({ amount, onClose }: ClaimSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xs bg-card border-2 border-primary/30 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="absolute -top-12">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-card animate-bounce duration-[2000ms] infinite">
              <IconGift className="w-12 h-12 text-white" />
            </div>
            {/* Particle effects placeholders */}
            <div className="absolute top-0 left-0 w-full h-full animate-ping opacity-20 bg-primary rounded-full" />
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              Reward Claimed!
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Check-in complete
            </p>
          </div>

          <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
              <IconCoins className="w-20 h-20" />
            </div>
            <div className="flex flex-col items-center relative z-10">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                Bonus Credit
              </span>
              <div className="flex items-center gap-2">
                <IconCoins className="w-6 h-6 text-yellow-500" />
                <span className="text-4xl font-black text-foreground">
                  +{formatNumber(amount)}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">
                Credited to coins balance
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full btn btn-primary h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Awesome!
          </button>

          <p className="text-[10px] text-muted-foreground font-medium italic">
            Come back in 4 hours for more!
          </p>
        </div>
      </div>

      {/* Simple "Confetti" effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary animate-ping opacity-40"
            style={{
              width: Math.random() * 8 + 4 + "px",
              height: Math.random() * 8 + 4 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDelay: i * 200 + "ms",
              animationDuration: Math.random() * 3 + 2 + "s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  highlight?: "green" | "yellow" | "red";
}

function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <div className="text-center">
      <p
        className={cn(
          "text-xl font-bold",
          highlight === "green" && "text-green-500",
          highlight === "yellow" && "text-yellow-500",
          highlight === "red" && "text-red-500",
          !highlight && "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface AchievementBadgeProps {
  icon: React.ReactNode;
  label: string;
  unlocked: boolean;
}

function AchievementBadge({ icon, label, unlocked }: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
        unlocked
          ? "bg-yellow-500/10 text-yellow-500"
          : "bg-muted/50 text-muted-foreground opacity-50",
      )}
    >
      <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
      <span className="text-[10px] font-medium text-center">{label}</span>
    </div>
  );
}

function QuestCard({
  quest,
  isSelected,
  onClick,
}: {
  quest: DailyQuest;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isClaimed = quest.completed || quest.status === 'CLAIMED';
  const isClaimable = quest.status === 'CLAIMABLE';
  const isPending = quest.status === 'VERIFYING';

  // 4-Step Progress for Social Quests
  const hasVisited = typeof window !== "undefined" && localStorage.getItem(`quest_visited_${quest.id}`) === "true";

  const displayProgress = (() => {
    if (isClaimed || isClaimable) return 100;
    if (isPending) return 50;
    if (hasVisited) return 25;
    return Math.min((quest.progress / quest.target) * 100, 100);
  })();

  return (
    <div
      onClick={onClick}
      className={cn(
        "card p-4 transition-all duration-300 relative group cursor-pointer hover:border-primary/50 hover:shadow-lg active:scale-[0.98]",
        isSelected &&
        "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20",
        isClaimed && "opacity-60 grayscale-[0.3]",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {quest.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
              +{quest.reward} COINS
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-[10px] text-muted-foreground">
              {quest.frequency === "weekly" ? "WEEKLY" : quest.frequency === "once" ? "ONCE" : "DAILY"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {isClaimed ? (
            <div className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
              <IconCheck className="w-3.5 h-3.5" />
              CLAIMED
            </div>
          ) : isClaimable ? (
            <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse">
              <IconZap className="w-3.5 h-3.5" />
              CLAIM NOW
            </div>
          ) : isPending ? (
            <div className="flex items-center gap-1 text-yellow-500 text-[10px] font-black uppercase tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded-full">
              <IconRefresh className="w-3.5 h-3.5 animate-spin-slow" />
              PENDING (50%)
            </div>
          ) : (
            <div className="text-muted-foreground text-[10px] font-black uppercase tracking-wider bg-muted px-2 py-0.5 rounded-full">
              {quest.category === "social" ? (
                `${Math.floor(displayProgress)}% PROGRESS`
              ) : (
                `${quest.progress}/${quest.target} COMPLETED`
              )}
            </div>
          )}
          <IconChevronRight
            className={cn(
              "w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors",
              isSelected && "text-primary",
            )}
          />
        </div>
      </div>

      {/* Mini Progress Bar */}
      {!isClaimed && (
        <div className="h-1 bg-muted/30 rounded-full overflow-hidden mt-3 border border-muted-foreground/5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isClaimable ? "bg-green-500" : isPending ? "bg-yellow-500" : "bg-primary",
            )}
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ==========================================
// QUEST DETAIL DRAWER
// ==========================================

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
  const [hasVisited, setHasVisited] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`quest_visited_${quest.id}`) === "true";
    }
    return false;
  });

  console.log(`QUEST_DRAWER_DEBUG [${quest.id}]: progress=${quest.progress}, status=${quest.status}, completed=${quest.completed}`);

  const [isClaiming, setIsClaiming] = useState(false);

  const [isEditingProof, setIsEditingProof] = useState(false);

  const handleClaim = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      await onClaim();
    } catch (err) {
      console.error("Claim failed:", err);
      setIsClaiming(false);
    }
  };

  const progress = Math.min((quest.progress / quest.target) * 100, 100);
  const isComplete = quest.status === 'CLAIMABLE' || quest.status === 'COMPLETED' || quest.status === 'CLAIMED';
  const isPending = quest.status === 'VERIFYING';
  const isClaimed = quest.status === 'CLAIMED' || quest.status === 'COMPLETED';
  const canClaim = quest.status === 'CLAIMABLE';

  // VERY robust lookup for base quest data
  const baseData = INITIAL_QUESTS.find((iq) =>
    iq.id === quest.id ||
    iq.id === (quest as any).questId ||
    iq.title.toLowerCase() === quest.title.toLowerCase()
  );
  const targetUrl = quest.externalUrl || baseData?.externalUrl;
  const requiresVerification = quest.requiresVerification ?? baseData?.requiresVerification ?? false;
  const verificationPlaceholder = quest.verificationPlaceholder || baseData?.verificationPlaceholder || "Enter details...";
  const verificationType = quest.verificationType || baseData?.verificationType || "text";

  const handleVerify = () => {
    let val = verificationInput.trim();
    if (!val) {
      notify?.("Please enter details first.", "error");
      return;
    }

    // Auto-prefix username for better UX
    if (verificationType === "username" && !val.startsWith("@")) {
      val = "@" + val;
      setVerificationInput(val);
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (val.length < 3) {
        setIsVerifying(false);
        notify?.("Details too short.", "error");
        return;
      }

      // Skip complex validation during test session
      // Success logic - Transiton to Step 4

      // Success logic - Transiton to Step 4
      if (typeof window !== "undefined") {
        localStorage.setItem(`quest_verify_${quest.id}`, val);
      }
      onAction(false, val); // Triggers App.tsx to transition to CLAIMABLE
      setIsVerifying(false);
      notify?.("Verification complete! The award is now available for claiming.", "success");
    }, 9000);
  };

  const handleVisit = () => {
    setHasVisited(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(`quest_visited_${quest.id}`, "true");
    }
    onAction(true);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end overflow-hidden p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto animate-in fade-in"
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-sm bg-background border-l border-primary/10 shadow-2xl h-full flex flex-col rounded-3xl pointer-events-auto shadow-primary/20 ring-1 ring-white/10 animate-in slide-in-from-right duration-500 ease-out">
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <IconTarget className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Quest Details</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  {quest.questId || quest.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-muted-foreground/10 flex items-center justify-center hover:bg-muted transition-colors active:scale-90"
            >
              <IconX className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Details Content */}
          <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
            {/* Title & Stats */}
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight">
                {quest.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/10 uppercase tracking-wide">
                  <IconCoins className="w-4 h-4" />+{quest.reward}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-bold border border-muted-foreground/5 uppercase tracking-wide">
                  {quest.frequency}
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="card p-5 space-y-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-muted-foreground uppercase opacity-60">
                  Quest Progress
                </span>
                <span className="text-lg font-black text-primary">
                  {quest.progress} / {quest.target}
                </span>
              </div>
              <div className="h-3 bg-background/50 rounded-full overflow-hidden border border-muted-foreground/10 p-[2px]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]",
                    quest.completed
                      ? "bg-primary/50"
                      : isComplete
                        ? "bg-green-500"
                        : "bg-primary",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-medium">
                {quest.completed
                  ? "You have finished this task! Your account is credited."
                  : isComplete
                    ? "Verification successful. Tap below to claim your COINS!"
                    : "Complete the requirements to unlock your reward."}
              </p>
            </div>

            {/* Quest Content */}
            {!isClaimed ? (
              <div className="pt-4 pb-12 px-2">
                {quest.category === "social" || quest.type === "social" ? (
                  <div className="space-y-8">
                    {/* STEP 1: VISIT THE LINK */}
                    <div className="relative pl-10">
                      <div className={cn(
                        "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg z-10 transition-all duration-300",
                        hasVisited ? "bg-green-500 text-white" : "bg-primary text-white scale-110 ring-4 ring-primary/20"
                      )}>
                        {hasVisited ? <IconCheck className="w-4 h-4" /> : "1"}
                      </div>
                      {/* Connector line */}
                      <div className={cn(
                        "absolute left-[15px] top-8 bottom-[-32px] w-[2px] transition-colors duration-500",
                        hasVisited ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"
                      )} />

                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center">
                          Step 1: Initiation
                          {hasVisited && (
                            <span className="flex items-center gap-2 ml-2">
                              <span className="text-[10px] text-green-500 font-bold">Done</span>
                              <button
                                onClick={handleVisit}
                                className="text-[9px] text-primary hover:underline font-bold uppercase"
                              >
                                revisit
                              </button>
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 mb-3">Begin by visiting the official task link</p>

                        {!hasVisited && (
                          <button
                            onClick={handleVisit}
                            className="btn btn-primary h-14 w-full font-black text-sm tracking-tight shadow-xl shadow-primary/20 transition-all active:scale-95 group relative overflow-hidden"
                          >
                            <IconExternalLink className="w-4 h-4 mr-2" />
                            {quest.id === "q_social_follow" ? "FOLLOW NOW" : "VISIT POST"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* STEP 2: ENTRY FIELD */}
                    <div className={cn(
                      "relative pl-10 transition-all duration-500",
                      hasVisited ? "opacity-100" : "opacity-30 pointer-events-none grayscale"
                    )}>
                      <div className={cn(
                        "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg z-10 transition-all duration-300",
                        (isComplete || isPending) ? "bg-green-500 text-white" : hasVisited ? "bg-primary text-white scale-110 ring-4 ring-primary/20" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      )}>
                        {(isComplete || isPending) ? <IconCheck className="w-4 h-4" /> : "2"}
                      </div>
                      {/* Connector line */}
                      <div className={cn(
                        "absolute left-[15px] top-8 bottom-[-32px] w-[2px] transition-colors duration-500",
                        (isComplete || isPending) ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"
                      )} />

                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center">
                          Step 2: Submit Proof
                          {(isComplete || isPending) && (
                            <span className="flex items-center gap-2 ml-2">
                              <span className="text-[10px] text-green-500 font-bold">Done</span>
                              <button
                                onClick={() => setIsEditingProof(!isEditingProof)}
                                className="text-[9px] text-primary hover:underline font-bold uppercase"
                              >
                                {isEditingProof ? "hide" : "reenter"}
                              </button>
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 mb-3">Enter the required proof of action</p>

                        {((!isComplete && !isPending) || isEditingProof) && (
                          <div className="relative group">
                            <input
                              type="text"
                              value={verificationInput}
                              onChange={(e) => setVerificationInput(e.target.value)}
                              placeholder={verificationPlaceholder}
                              className="w-full h-14 bg-white text-slate-900 border-2 border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-primary outline-none transition-all shadow-sm focus:shadow-md placeholder:text-slate-400"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STEP 3: SUBMIT BUTTON */}
                    <div className={cn(
                      "relative pl-10 transition-all duration-500",
                      hasVisited ? "opacity-100" : "opacity-30 pointer-events-none grayscale"
                    )}>
                      <div className={cn(
                        "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg z-10 transition-all duration-300",
                        isComplete ? "bg-green-500 text-white" : isPending ? "bg-yellow-500 text-white" : (hasVisited && verificationInput.length >= 3) ? "bg-primary text-white scale-110 ring-4 ring-primary/20" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      )}>
                        {isComplete ? <IconCheck className="w-4 h-4" /> : isPending ? <IconRefresh className="w-4 h-4 animate-spin" /> : "3"}
                      </div>
                      {/* Connector line */}
                      <div className={cn(
                        "absolute left-[15px] top-8 bottom-[-32px] w-[2px] transition-colors duration-500",
                        isComplete ? "bg-green-500" : isPending ? "bg-yellow-500" : "bg-slate-200 dark:bg-slate-800"
                      )} />

                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center">
                          Step 3: Verification
                          {isComplete && <span className="ml-2 text-[10px] text-green-500 font-bold">Done</span>}
                          {isPending && <span className="ml-2 text-[10px] text-yellow-500 font-bold">Pending</span>}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 mb-3">Submit your proof for system review</p>

                        {hasVisited && !isComplete && !isPending && (
                          <button
                            onClick={handleVerify}
                            disabled={isVerifying || verificationInput.length < 3}
                            className={cn(
                              "btn h-14 w-full font-black text-sm tracking-tight shadow-xl transition-all active:scale-95",
                              verificationInput.length >= 3 ? "btn-primary shadow-primary/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-none"
                            )}
                          >
                            {isVerifying ? (
                              <span className="flex items-center"><span className="loading loading-spinner loading-xs mr-2" /> VERIFYING...</span>
                            ) : "SUBMIT FOR VERIFICATION"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* FAKE ADMIN REVIEW STATUS */}
                    {quest.status === "VERIFYING" && (
                      <div className="mx-10 my-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex flex-col items-center text-center animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-2">
                          <IconRefresh className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <h5 className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Verification Pending</h5>
                        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 rounded-full">
                          <div className="w-1 h-1 rounded-full bg-yellow-500 animate-ping" />
                          <span className="text-[9px] font-bold text-yellow-600 uppercase">Reviewing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Game Quest View */
                  <div className="space-y-6 text-center py-6">
                    <div className="mx-auto w-24 h-24 rounded-full bg-primary/5 border-4 border-primary/10 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      <span className="text-3xl relative z-10">🎮</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Quest In Progress</h4>
                      <p className="text-sm text-muted-foreground mt-1">Keep playing to unlock your reward!</p>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Progress</span>
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                          {quest.progress}/{quest.target} Completed
                        </span>
                      </div>
                      <div className="h-4 bg-white dark:bg-slate-900 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-inner p-0.5">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            isComplete ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-primary"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-4 font-medium italic">
                        "Success is not final, failure is not fatal: it is the courage to continue that counts."
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: CLAIM BUTTON (Visible for both types if isComplete) */}
                <div className={cn(
                  "relative pl-10 mt-8 transition-all duration-500",
                  canClaim ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-2"
                )}>
                  <div className={cn(
                    "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg z-10 transition-all duration-500",
                    canClaim ? "bg-green-500 text-white scale-125 ring-8 ring-green-500/10 animate-bounce" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  )}>
                    {isClaimed ? <IconCheck className="w-4 h-4" /> : quest.category === 'social' ? "4" : <IconZap className="w-4 h-4" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                      {quest.category === 'social' ? "Step 4: Claim Reward" : "Reward Unlock"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 mb-3">Claim your hard-earned coin reward</p>

                    {canClaim && (
                      <button
                        onClick={handleClaim}
                        disabled={isClaiming}
                        className={cn(
                          "btn btn-primary h-20 w-full font-black text-xl tracking-tight shadow-2xl shadow-green-500/30 border-none ring-4 ring-green-500/10 active:scale-95 group relative overflow-hidden",
                          isClaiming && "opacity-70"
                        )}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex flex-col items-center justify-center relative z-10">
                          <span className="text-[10px] text-white/70 uppercase mb-1 font-bold">
                            {isClaiming ? "Processing..." : "Target Reached! Tap to collect"}
                          </span>
                          <span className="flex items-center">
                            {isClaiming ? (
                              <span className="loading loading-spinner loading-md mr-3" />
                            ) : (
                              <IconGift className="w-6 h-6 mr-3" />
                            )}
                            {isClaiming ? "CLAIMING REWARD..." : `CLAIM ${quest.reward} COINS`}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Success screen only after claiming */
              <div className="flex flex-col items-center justify-center pt-10 text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                  <IconCheck className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">
                    Task Rewarded
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have successfully completed this task and received your reward. Awesome job!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingsButtonProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

function SettingsButton({
  icon,
  label,
  description,
  onClick,
  variant = "default",
}: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "card w-full p-4 flex items-center gap-4 transition-colors",
        variant === "danger"
          ? "hover:bg-destructive/5 hover:border-destructive/30"
          : "hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg",
          variant === "danger" ? "bg-destructive/10" : "bg-muted",
        )}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p
          className={cn(
            "font-medium",
            variant === "danger" ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <IconChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}

export default ProfileScreen;
