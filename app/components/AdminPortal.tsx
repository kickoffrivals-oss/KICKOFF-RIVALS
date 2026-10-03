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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <IconShield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Admin Portal</h2>
              <p className="text-xs text-muted-foreground">System Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <IconX className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 mx-4 mt-4 bg-muted rounded-lg">
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
                "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div
            className={cn(
              "mx-4 mt-4 p-3 rounded-lg flex items-center gap-2",
              message.type === "success"
                ? "bg-green-500/10 text-green-500 border border-green-500/30"
                : "bg-destructive/10 text-destructive border border-destructive/30",
            )}
          >
            {message.type === "success" ? (
              <IconCheck className="w-4 h-4" />
            ) : (
              <IconX className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconCoins className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">
                      Active Coupons
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {coupons.length}
                  </p>
                </div>

                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconUsers className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Active Quests
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {quests.filter((q) => q.status === "LIVE").length}
                  </p>
                </div>

                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconTrophy className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">
                      Current Matches
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {matches.length}
                  </p>
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-semibold text-foreground mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab("coupons")}
                    className="btn btn-outline h-12"
                  >
                    <IconPlus className="w-4 h-4 mr-2" />
                    Create Coupon
                  </button>
                  <button
                    onClick={handleResetQuests}
                    disabled={isLoading}
                    className="btn btn-outline h-12"
                  >
                    <IconRefresh className="w-4 h-4 mr-2" />
                    Reset Quests
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Coupons Tab */}
          {activeTab === "coupons" && (
            <div className="space-y-4">
              {/* Create Coupon Form */}
              <div className="card p-4">
                <h3 className="font-semibold text-foreground mb-4">
                  Create New Coupon
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Code
                    </label>
                    <input
                      type="text"
                      value={newCouponCode}
                      onChange={(e) =>
                        setNewCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="WELCOME100"
                      className="input w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        Type
                      </label>
                      <select
                        value={newCouponType}
                        onChange={(e) =>
                          setNewCouponType(e.target.value as "coins" | "theme")
                        }
                        className="input w-full"
                      >
                        <option value="coins">Coins</option>
                        <option value="theme">Theme</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        {newCouponType === "coins" ? "Amount" : "Theme ID"}
                      </label>
                      <input
                        type={newCouponType === "coins" ? "number" : "text"}
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(e.target.value)}
                        placeholder={
                          newCouponType === "coins" ? "100" : "christmas"
                        }
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={newCouponLimit}
                      onChange={(e) =>
                        setNewCouponLimit(parseInt(e.target.value))
                      }
                      placeholder="100"
                      className="input w-full"
                    />
                  </div>

                  <button
                    onClick={handleCreateCoupon}
                    disabled={isLoading || !newCouponCode.trim()}
                    className="btn btn-primary w-full h-11"
                  >
                    <IconPlus className="w-4 h-4 mr-2" />
                    Create Coupon
                  </button>
                </div>
              </div>

              {/* Existing Coupons */}
              <div className="card p-4">
                <h3 className="font-semibold text-foreground mb-4">
                  Active Coupons ({coupons.length})
                </h3>
                <div className="space-y-2">
                  {coupons.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No coupons created yet
                    </p>
                  ) : (
                    coupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-mono font-bold text-foreground">
                            {coupon.code}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {coupon.type === "coins"
                              ? `${coupon.value} coins`
                              : `Theme: ${coupon.value}`}{" "}
                            • {coupon.currentUsage}/{coupon.usageLimit} used
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.code)}
                          disabled={isLoading}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <IconTrash className="w-4 h-4" />
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Match Management
                </h3>
                <button
                  onClick={handleGenerateRound}
                  disabled={isLoading}
                  className="btn btn-primary h-9 text-sm"
                >
                  <IconPlus className="w-4 h-4 mr-2" />
                  Generate Round
                </button>
              </div>

              <div className="grid gap-3">
                {matches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active matches. Generate a round!
                  </div>
                ) : (
                  matches.map((m) => (
                    <div
                      key={m.id}
                      className="card p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`badge ${
                            m.status === "LIVE"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-muted"
                          }`}
                        >
                          {m.status}
                        </span>
                        <div className="text-sm">
                          <span className="font-bold">{m.homeTeam.name}</span>{" "}
                          vs{" "}
                          <span className="font-bold">{m.awayTeam.name}</span>
                        </div>
                        {m.status === "FINISHED" && (
                          <span className="font-mono font-bold bg-muted px-2 py-1 rounded">
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
                            className="btn btn-xs btn-outline"
                            disabled={isLoading}
                          >
                            <IconPlay className="w-3 h-3 mr-1" /> Sim Result
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Quest Management
                </h3>
                <button
                  onClick={handleResetQuests}
                  disabled={isLoading}
                  className="btn btn-outline h-9 text-sm"
                >
                  <IconRefresh className="w-4 h-4 mr-2" />
                  Reset All
                </button>
              </div>

              <div className="space-y-2">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {quest.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quest.frequency} • +{quest.reward} coins •{" "}
                        {quest.progress}/{quest.target}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "badge text-xs",
                        quest.completed
                          ? "bg-primary/10 text-primary"
                          : quest.status === "LIVE"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500",
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
            <div className="space-y-4">
              <div className="card p-4">
                <h3 className="font-semibold text-foreground mb-4">
                  Session Info
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <span className="badge bg-green-500/10 text-green-500">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Token</span>
                    <span className="text-sm font-mono text-foreground">
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
                className="btn btn-outline w-full h-11 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              >
                <IconRefresh className="w-4 h-4 mr-2" />
                Reset Game State to Round 1
              </button>

              <button
                onClick={onClose}
                className="btn btn-outline w-full h-11 text-destructive hover:bg-destructive/10"
              >
                <IconLogOut className="w-4 h-4 mr-2" />
                Logout from Admin
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button onClick={onClose} className="btn btn-outline w-full h-11">
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;
