import { useState } from "react";
import { cn } from "../lib/utils";
import { Coupon, DailyQuest } from "../types";
import {
  IconX,
  IconShield,
  IconSettings,
  IconUsers,
  IconCoins,
  IconPlus,
  IconTrash,
  IconCheck,
  IconRefresh,
  IconLogOut,
  IconTrophy,
  IconPlay,
  IconClock,
} from "./Icons";
import { TEAMS, LEAGUES, MATCH_DURATION_SEC } from "../constants";
import { Match, Team } from "../types";

interface AdminPortalProps {
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  quests: DailyQuest[];
  setQuests: (quests: DailyQuest[]) => void;
  onClose: () => void;
  sessionToken: string;
  matches: Match[];
  onRefreshMatches: () => void;
}

export function AdminPortal({
  coupons,
  setCoupons,
  quests,
  setQuests,
  onClose,
  sessionToken,
  matches,
  onRefreshMatches,
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "coupons" | "quests" | "settings" | "matches"
  >("overview");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"coins" | "theme">(
    "coins",
  );
  const [newCouponValue, setNewCouponValue] = useState<string>("100");
  const [newCouponLimit, setNewCouponLimit] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim()) {
      setMessage({ type: "error", text: "Please enter a coupon code" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          code: newCouponCode.toUpperCase(),
          type: newCouponType,
          value:
            newCouponType === "coins"
              ? parseInt(newCouponValue)
              : newCouponValue,
          usageLimit: newCouponLimit,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCoupons((prev) => [
          ...prev,
          {
            code: newCouponCode.toUpperCase(),
            type: newCouponType,
            value:
              newCouponType === "coins"
                ? parseInt(newCouponValue)
                : (newCouponValue as any),
            usageLimit: newCouponLimit,
            currentUsage: 0,
          },
        ]);
        setNewCouponCode("");
        setNewCouponValue("100");
        setNewCouponLimit(100);
        setMessage({ type: "success", text: "Coupon created successfully!" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to create coupon",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create coupon" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/coupons/${code}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.code !== code));
        setMessage({ type: "success", text: "Coupon deleted" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to delete coupon",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete coupon" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetQuests = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/quests/reset", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setQuests(
          quests.map((q) => ({
            ...q,
            progress: 0,
            completed: false,
            status: "LIVE" as const,
          })),
        );
        setMessage({ type: "success", text: "Quests reset successfully!" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to reset quests",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to reset quests" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRound = async () => {
    setIsLoading(true);
    try {
      const newMatches: Match[] = [];
      const roundId = matches.length > 0 ? matches[0].round + 1 : 1;
      const seasonId = 1; // Default for now

      LEAGUES.forEach((league) => {
        // Simple random pairing
        const shuffled = [...TEAMS[league.id]].sort(() => 0.5 - Math.random());
        for (let i = 0; i < shuffled.length; i += 2) {
          if (i + 1 >= shuffled.length) break;
          const home = shuffled[i];
          const away = shuffled[i + 1];
          const mId = `m-${seasonId}-${roundId}-${league.id}-${i / 2}`;

          // Basic odds calculation
          const totalStrength = home.strength + away.strength;
          const homeProb = home.strength / totalStrength;
          const awayProb = away.strength / totalStrength;
          const drawProb = 0.25; // Fixed draw probability

          // Adjust probabilities to sum to 1
          const factor = (1 - drawProb) / (homeProb + awayProb);

          newMatches.push({
            id: mId,
            leagueId: league.id,
            homeTeam: home,
            awayTeam: away,
            startTime: Date.now() + 60000, // Starts in 1 min
            status: "SCHEDULED" as const, // API expects uppercase from typical enums, ensure consistency
            odds: {
              home: parseFloat((1 / (homeProb * factor)).toFixed(2)),
              draw: parseFloat((1 / drawProb).toFixed(2)),
              away: parseFloat((1 / (awayProb * factor)).toFixed(2)),
              gg: 1.9,
              nogg: 1.9,
            },
            homeScore: 0,
            awayScore: 0,
            minute: 0,
            round: roundId,
            seasonId: seasonId,
            roundHash: "admin-gen",
            commitHash: "admin-gen",
            events: [],
          } as any); // Cast to any to avoid strict type checks on temporary object construction
        }
      });

      const res = await fetch("/api/matches/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches: newMatches }),
      });

      if (res.ok) {
        onRefreshMatches();
        setMessage({ type: "success", text: "New round generated!" });
      } else {
        setMessage({ type: "error", text: "Failed to generate round" });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: "Error generating round" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateMatch = async (match: Match) => {
    // Simulate a result based on odds/strength
    // For simplicity, random with weight
    const homeStr = match.homeTeam.strength;
    const awayStr = match.awayTeam.strength;

    let homeScore = 0;
    let awayScore = 0;

    // Simple simulation
    for (let i = 0; i < 5; i++) {
      if (Math.random() < homeStr / 200) homeScore++;
      if (Math.random() < awayStr / 200) awayScore++;
    }

    try {
      await fetch("/api/matches/update-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          homeScore,
          awayScore,
          status: "FINISHED",
        }),
      });

      // Also settle bets
      await fetch("/api/bets/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          homeScore,
          awayScore,
        }),
      });

      onRefreshMatches();
      setMessage({
        type: "success",
        text: `Match simulated: ${homeScore}-${awayScore}`,
      });
    } catch (e) {
      setMessage({ type: "error", text: "Simulation failed" });
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0D12]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#13171F] rounded-[6px] border border-[#222938] shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222938]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center">
              <IconShield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white uppercase tracking-wider">Admin Portal</h2>
              <p className="text-xs text-slate-400">System Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] bg-[#1B212D] border border-[#222938] text-slate-400 hover:text-white transition-colors"
            aria-label="Close portal"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 mx-4 mt-3 bg-[#0A0D12] rounded-[4px] border border-[#222938]">
          {[
            { id: "overview", label: "Overview", icon: IconSettings },
            { id: "coupons", label: "Coupons", icon: IconCoins },
            { id: "matches", label: "Matches", icon: IconTrophy },
            { id: "quests", label: "Quests", icon: IconUsers },
            { id: "settings", label: "Settings", icon: IconSettings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5",
                activeTab === tab.id
                  ? "bg-[#1B212D] text-emerald-400 border border-[#323C50]"
                  : "text-slate-400 hover:text-white",
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div
            className={cn(
              "mx-4 mt-3 p-2.5 rounded-[4px] flex items-center gap-2 text-xs font-medium border",
              message.type === "success"
                ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/30"
                : "bg-red-950/20 text-red-400 border-red-500/30",
            )}
          >
            {message.type === "success" ? (
              <IconCheck className="w-4 h-4 shrink-0" />
            ) : (
              <IconX className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0A0D12] rounded-[4px] border border-[#222938] p-3">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400 text-xs font-bold uppercase">
                    <IconCoins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Active Coupons</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-white tabular-nums">
                    {coupons.length}
                  </p>
                </div>

                <div className="bg-[#0A0D12] rounded-[4px] border border-[#222938] p-3">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400 text-xs font-bold uppercase">
                    <IconUsers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Active Quests</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-white tabular-nums">
                    {quests.filter((q) => q.status === "LIVE").length}
                  </p>
                </div>

                <div className="bg-[#0A0D12] rounded-[4px] border border-[#222938] p-3">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400 text-xs font-bold uppercase">
                    <IconTrophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Current Matches</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-white tabular-nums">
                    {matches.length}
                  </p>
                </div>
              </div>

              <div className="bg-[#0A0D12] rounded-[4px] border border-[#222938] p-4">
                <h3 className="font-bold text-xs uppercase text-white tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab("coupons")}
                    className="h-9 px-3 rounded-[4px] bg-[#1B212D] border border-[#222938] hover:bg-[#222938] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <IconPlus className="w-3.5 h-3.5 text-emerald-400" />
                    Create Coupon
                  </button>
                  <button
                    onClick={handleResetQuests}
                    disabled={isLoading}
                    className="h-9 px-3 rounded-[4px] bg-[#1B212D] border border-[#222938] hover:bg-[#222938] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <IconRefresh className="w-3.5 h-3.5 text-slate-400" />
                    Reset Quests
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Coupons Tab */}
          {activeTab === "coupons" && (
            <div className="space-y-3">
              {/* Create Coupon Form */}
              <div className="bg-[#0A0D12] rounded-[4px] border border-[#222938] p-4">
                <h3 className="font-bold text-xs uppercase text-white tracking-wider mb-3">
                  Create New Coupon
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">
                      Code
                    </label>
                    <input
                      type="text"
                      value={newCouponCode}
                      onChange={(e) =>
                        setNewCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="WELCOME100"
                      className="w-full h-9 bg-[#13171F] border border-[#222938] rounded-[4px] px-3 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">
                        Type
                      </label>
                      <select
                        value={newCouponType}
                        onChange={(e) =>
                          setNewCouponType(e.target.value as "coins" | "theme")
                        }
                        className="w-full h-9 bg-[#13171F] border border-[#222938] rounded-[4px] px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="coins">Coins</option>
                        <option value="theme">Theme</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">
                        {newCouponType === "coins" ? "Amount" : "Theme ID"}
                      </label>
                      <input
                        type={newCouponType === "coins" ? "number" : "text"}
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(e.target.value)}
                        placeholder={
                          newCouponType === "coins" ? "100" : "christmas"
                        }
                        className="w-full h-9 bg-[#13171F] border border-[#222938] rounded-[4px] px-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={newCouponLimit}
                      onChange={(e) =>
                        setNewCouponLimit(parseInt(e.target.value))
                      }
                      placeholder="100"
                      className="w-full h-9 bg-[#13171F] border border-[#222938] rounded-[4px] px-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleCreateCoupon}
                    disabled={isLoading || !newCouponCode.trim()}
                    className="w-full h-9 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <IconPlus className="w-3.5 h-3.5" />
                    Create Coupon
                  </button>
                </div>
              </div>

              {/* Existing Coupons */}
              <div className="bg-[#0A0D12] rounded-[4px] border border-[#222938] p-4">
                <h3 className="font-bold text-xs uppercase text-white tracking-wider mb-3">
                  Active Coupons ({coupons.length})
                </h3>
                <div className="space-y-1.5">
                  {coupons.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6 font-bold uppercase">
                      No coupons created yet
                    </p>
                  ) : (
                    coupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="flex items-center justify-between p-2.5 bg-[#13171F] rounded-[4px] border border-[#222938]"
                      >
                        <div>
                          <p className="font-mono font-bold text-xs text-emerald-400">
                            {coupon.code}
                          </p>
                          <p className="text-xs text-slate-400 font-mono tabular-nums">
                            {coupon.type === "coins"
                              ? `${coupon.value} coins`
                              : `Theme: ${coupon.value}`}{" "}
                            • {coupon.currentUsage}/{coupon.usageLimit} used
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.code)}
                          disabled={isLoading}
                          className="p-1.5 rounded-[4px] bg-[#1B212D] text-slate-400 hover:text-red-400 border border-[#222938] transition-colors"
                          aria-label="Delete coupon"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === "matches" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase text-white tracking-wider">
                  Match Management
                </h3>
                <button
                  onClick={handleGenerateRound}
                  disabled={isLoading}
                  className="h-8 px-3 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  Generate Round
                </button>
              </div>

              <div className="space-y-1.5">
                {matches.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-bold uppercase">
                    No active matches. Generate a round!
                  </div>
                ) : (
                  matches.map((m) => (
                    <div
                      key={m.id}
                      className="bg-[#0A0D12] rounded-[4px] border border-[#222938] p-2.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-[4px] text-xs font-bold uppercase font-mono",
                            m.status === "LIVE"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-[#1B212D] text-slate-400 border border-[#222938]"
                          )}
                        >
                          {m.status}
                        </span>
                        <div className="text-xs">
                          <span className="font-bold text-white">{m.homeTeam.name}</span>{" "}
                          <span className="text-slate-500">vs</span>{" "}
                          <span className="font-bold text-white">{m.awayTeam.name}</span>
                        </div>
                        {m.status === "FINISHED" && (
                          <span className="font-mono font-bold text-xs bg-[#1B212D] px-2 py-0.5 rounded-[4px] border border-[#222938] text-emerald-400 tabular-nums">
                            {m.currentScore
                              ? `${m.currentScore.home} - ${m.currentScore.away}`
                              : "?-?"}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {m.status !== "FINISHED" && (
                          <button
                            onClick={() => handleSimulateMatch(m)}
                            className="h-7 px-2.5 rounded-[4px] bg-[#1B212D] border border-[#222938] hover:bg-[#222938] text-white font-bold text-xs uppercase flex items-center gap-1 transition-colors"
                            disabled={isLoading}
                          >
                            <IconPlay className="w-3 h-3 text-emerald-400" /> Sim Result
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Quests Tab */}
          {activeTab === "quests" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase text-white tracking-wider">
                  Quest Management
                </h3>
                <button
                  onClick={handleResetQuests}
                  disabled={isLoading}
                  className="h-8 px-3 rounded-[4px] bg-[#1B212D] border border-[#222938] hover:bg-[#222938] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <IconRefresh className="w-3.5 h-3.5" />
                  Reset All
                </button>
              </div>

              <div className="space-y-1.5">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="flex items-center justify-between p-2.5 bg-[#0A0D12] rounded-[4px] border border-[#222938]"
                  >
                    <div>
                      <p className="font-bold text-xs text-white">
                        {quest.title}
                      </p>
                      <p className="text-xs text-slate-400 font-mono tabular-nums">
                        {quest.frequency} • +{quest.reward} coins •{" "}
                        {quest.progress}/{quest.target}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-[4px] text-xs font-bold uppercase font-mono",
                        quest.completed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : quest.status === "LIVE"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                      )}
                    >
                      {quest.completed ? "Completed" : quest.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-3">
              <div className="bg-[#0A0D12] rounded-[4px] border border-[#222938] p-3 space-y-2">
                <h3 className="font-bold text-xs uppercase text-white tracking-wider mb-2">
                  Session Info
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Status
                    </span>
                    <span className="px-2 py-0.5 rounded-[4px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Token</span>
                    <span className="text-xs font-mono text-slate-300 tabular-nums">
                      {sessionToken.slice(0, 12)}...
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (confirm("Reset local game data back to Round 1 with fresh balances?")) {
                    setIsLoading(true);
                    try {
                      const res = await fetch("/api/game/reset", { method: "POST" });
                      const data = await res.json();
                      if (data.success) {
                        alert("Game data reset to Round 1! Reloading page...");
                        window.location.reload();
                      }
                    } catch (e) {
                      alert("Reset failed: " + e);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                disabled={isLoading}
                className="w-full h-10 rounded-[4px] bg-[#1B212D] border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              >
                <IconRefresh className="w-4 h-4" />
                Reset Game State to Round 1
              </button>

              <button
                onClick={onClose}
                className="w-full h-10 rounded-[4px] bg-[#1B212D] border border-red-500/30 text-red-400 hover:bg-red-950/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <IconLogOut className="w-4 h-4" />
                Logout from Admin
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#222938]">
          <button
            onClick={onClose}
            className="w-full h-9 rounded-[4px] bg-[#1B212D] border border-[#222938] text-slate-300 hover:bg-[#222938] font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;
