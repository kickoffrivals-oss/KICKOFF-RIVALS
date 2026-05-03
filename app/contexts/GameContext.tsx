import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUserStore } from "../stores/userStore";
import { useProfile } from "../hooks/useProfile";
import {
  TEAMS,
  INITIAL_BALANCE,
  LEAGUES,
  ROUND_DURATION_SEC,
  MATCH_DURATION_SEC,
  RESULT_DURATION_SEC,
  INITIAL_QUESTS,
  CONVERSION_RATE,
  CONVERSION_YIELD,
} from "../constants";
import type {
  Match,
  Bet,
  LeagueEntry,
  Transaction,
  UserStats,
  GameState,
  Coupon,
  DailyQuest,
  WalletState,
  BetSlipSelection,
} from "../types";
import { generateMatchResult, calculateOdds } from "../services/matchService";
import {
  hasValidAdminSession,
  getSessionToken,
  logoutAdmin,
  clearSessionToken,
} from "../services/adminAuthService";

const API_URL = "";

const generateHash = () =>
  "0x" +
  Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

const generate6DigitCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

interface GameContextType {
  isInitializing: boolean;
  walletState: any;
  profile: any;
  isNewUser: boolean;

  // Registration
  registrationData: {
    username: string;
    leagueId: string;
    teamId: string;
  } | null;
  setRegistrationData: (
    data: {
      username: string;
      leagueId: string;
      teamId: string;
    } | null,
  ) => void;

  // Balance
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;

  // Game State
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  timer: number;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
  roundNumber: number;
  setRoundNumber: React.Dispatch<React.SetStateAction<number>>;
  seasonId: number;
  setSeasonId: React.Dispatch<React.SetStateAction<number>>;

  // Matches
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;

  // Bets
  activeBets: Bet[];
  setActiveBets: React.Dispatch<React.SetStateAction<Bet[]>>;
  betSlipSelections: BetSlipSelection[];
  setBetSlipSelections: React.Dispatch<
    React.SetStateAction<BetSlipSelection[]>
  >;

  // League Tables
  leagueTables: Record<string, LeagueEntry[]>;
  setLeagueTables: React.Dispatch<
    React.SetStateAction<Record<string, LeagueEntry[]>>
  >;

  // Transactions
  transactions: Transaction[];
  addTransaction: (
    type: Transaction["type"],
    amount: number,
    currency: "kor" | "coins",
    description: string,
  ) => void;

  // Coupons
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;

  // Handlers
  handleWalletConnected: (address: string, checkOnly?: boolean) => void;
  handleMessageSigned: () => void;
  handleProceedFromWelcome: () => void;
  handleLogout: () => void;
  refreshProfile: (address: string, checkOnly?: boolean) => Promise<void>;
  handleBetPlacement: (
    match: Match,
    selection: Bet["selection"],
    stake: number,
  ) => Promise<boolean>;
  handleAddToBetSlip: (
    match: Match,
    selection: "home" | "draw" | "away" | "gg" | "nogg",
    odds: number,
  ) => void;
  handleRemoveFromBetSlip: (matchId: string) => void;
  handleClearBetSlip: () => void;
  handlePlaceBetSlip: (
    stake: number,
    betType: "single" | "accumulator",
  ) => Promise<boolean>;
  handleQuestAction: (
    id: string,
    openUrl?: boolean,
    verificationCode?: string,
  ) => void;
  handleQuestClaim: (id: string, onSuccess?: (reward: number) => void) => void;
  handleRedeem: (
    code: string,
  ) => Promise<{ success: boolean; message?: string }>;
  handleReferral: (
    code: string,
  ) => Promise<{ success: boolean; message?: string }>;
  handleClaimAllianceRewards: () => Promise<void>;
  handleCheckIn: () => Promise<{
    success: boolean;
    message: string;
    reward?: number;
  }>;
  handleAdminSyncRequest: () => void;
  handleAdminAuthSuccess: () => void;
  handleAdminLogout: () => Promise<void>;

  // UI State
  bettingOn: Match | null;
  setBettingOn: React.Dispatch<React.SetStateAction<Match | null>>;
  watchingMatchId: string | null;
  setWatchingMatchId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedLeagueId: string;
  setSelectedLeagueId: React.Dispatch<React.SetStateAction<string>>;
  showWallet: boolean;
  setShowWallet: React.Dispatch<React.SetStateAction<boolean>>;
  showSwapConfirm: boolean;
  setShowSwapConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  showAdmin: boolean;
  setShowAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  showAdminAuth: boolean;
  setShowAdminAuth: React.Dispatch<React.SetStateAction<boolean>>;
  notification: { message: string; type: "success" | "error" | "info" } | null;
  notify: (message: string, type?: "success" | "error" | "info") => void;
  adminSessionValid: boolean;
  adminSessionToken: string | null;

  // Game Loop
  generateRoundMatches: (
    round: number,
    sId: number,
    clientSeed: string,
  ) => Promise<void>;
  handleStateTransition: () => void;
  updateLiveScores: () => void;
  processResults: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchStandings: () => Promise<void>;
  fetchActiveBets: () => Promise<void>;
  getCurrentGameMinute: () => number;
  dashboardMounted: boolean;
  setDashboardMounted: React.Dispatch<React.SetStateAction<boolean>>;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

// ==========================================
// PROVIDER
// ==========================================

export function GameProvider({ children }: { children: React.ReactNode }) {
  const {
    address: wagmiAddress,
    isConnected: isWagmiConnected,
    status: wagmiStatus,
  } = useAccount();
  const [isInitializing, setIsInitializing] = useState(true);

  // New storage integration
  const {
    walletState,
    setWalletAddress,
    setWalletVerified,
    setIsNewUser: setStoreIsNewUser,
    isNewUser: storeIsNewUser,
    logout: storeLogout,
    setOnboardingComplete,
    registrationData,
    setRegistrationData,
  } = useUserStore();
  const { profile, refresh: refreshProfileQuery } = useProfile();

  // Global Notification System
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const notify = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setNotification({ message, type });
      // Auto-clear
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    },
    [],
  );

  const adminSessionTokenRef = useRef<string | null>(null);

  const queryClient = useQueryClient();

  // Balance (Local state for game loop UI)
  const [balance, setBalance] = useState(INITIAL_BALANCE);

  // Sync state balance with profile's korBalance
  useEffect(() => {
    if (profile?.korBalance !== undefined) {
      const pBalance = Number(profile.korBalance);
      if (pBalance !== balance) {
        setBalance(pBalance);
      }
    }
  }, [profile?.korBalance, balance]);

  // Game State
  const [gameState, setGameState] = useState<GameState>("BETTING");
  const [timer, setTimer] = useState(ROUND_DURATION_SEC);
  const [roundNumber, setRoundNumber] = useState(1);
  const [seasonId, setSeasonId] = useState(1);

  // Matches
  const [matches, setMatches] = useState<Match[]>([]);
  const serverSeedsRef = useRef<Record<string, string>>({});

  // Bets
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [betSlipSelections, setBetSlipSelections] = useState<
    BetSlipSelection[]
  >([]);

  // League Tables
  const [leagueTables, setLeagueTables] = useState<
    Record<string, LeagueEntry[]>
  >({});

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kor_transactions");
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Failed to load transactions from localStorage", e);
        return [];
      }
    }
    return [];
  });

  // Persist transactions to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kor_transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // UI State
  const [bettingOn, setBettingOn] = useState<Match | null>(null);
  const [watchingMatchId, setWatchingMatchId] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState(LEAGUES[0].id);
  const [showWallet, setShowWallet] = useState(false);
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminSessionValid, setAdminSessionValid] = useState(false);

  // Dashboard tracking
  const [dashboardMounted, setDashboardMounted] = useState(false);

  // Throttling / Rate limiting for API calls
  const lastActiveBetsFetchRef = useRef<number>(0);
  const lastMatchesFetchRef = useRef<number>(0);
  const lastStandingsFetchRef = useRef<number>(0);

  const isFetchingMatchesRef = useRef<boolean>(false);
  const isFetchingStandingsRef = useRef<boolean>(false);
  const isFetchingActiveBetsRef = useRef<boolean>(false);

  const hasRefreshedThisRoundRef = useRef<boolean>(false);
  const timerRef = useRef<number>(0);

  // Sync timerRef with timer state
  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const addTransaction = useCallback(
    (
      type: Transaction["type"],
      amount: number,
      currency: "kor" | "coins",
      description: string,
    ) => {
      setTransactions((prev) => [
        {
          id: `t${Date.now()}`,
          type,
          amount,
          currency,
          description,
          timestamp: Date.now(),
          hash: generateHash(),
        },
        ...prev.slice(0, 49),
      ]);
    },
    [],
  );

  const refreshProfile = useCallback(
    async (address: string) => {
      refreshProfileQuery();
    },
    [refreshProfileQuery],
  );

  const handleWalletConnected = useCallback(
    (address: string) => {
      setWalletAddress(address);
      refreshProfileQuery();
    },
    [setWalletAddress, refreshProfileQuery],
  );

  const handleMessageSigned = useCallback(() => {
    setWalletVerified(true);
  }, [setWalletVerified]);

  const handleProceedFromWelcome = useCallback(() => {
    if (!profile?.walletAddress) return;
    localStorage.setItem(`user_${profile.walletAddress}`, profile.username);
    setOnboardingComplete(true);
  }, [profile?.walletAddress, profile?.username, setOnboardingComplete]);

  const handleLogout = useCallback(() => {
    setBalance(INITIAL_BALANCE);
    setActiveBets([]);
    setTransactions([]);
    storeLogout();
  }, [storeLogout]);

  // ==========================================
  // SYNC WAGMI STATE
  // ==========================================

  useEffect(() => {
    const sync = async () => {
      console.log("Sync Check:", {
        wagmiStatus,
        isWagmiConnected,
        wagmiAddress,
        currentWallet: walletState.address,
        isInitializing,
      });

      if (
        (wagmiStatus === "reconnecting" ||
          (wagmiStatus === "connecting" && !walletState.isConnected)) &&
        !wagmiAddress
      ) {
        console.log(
          "[SYNC] Wagmi still connecting and no address yet. Skipping sync.",
        );
        return;
      }

      if (wagmiAddress) {
        if (walletState.address !== wagmiAddress) {
          console.log("[SYNC] Address mismatch/init. Syncing...", wagmiAddress);
          setWalletAddress(wagmiAddress);
          try {
            await refreshProfile(wagmiAddress);
          } catch (e) {
            console.error("[SYNC] Profile refresh failed", e);
          }
        } else {
          // Address matches, but make sure we have a username
          // If username is missing, we MUST refresh the profile, even (and especially) during initialization
          if (!profile?.username) {
            console.log(
              "[SYNC] Address matched but no username. Refreshing profile...",
            );
            await refreshProfile(wagmiAddress);
          }
        }
      } else if (wagmiStatus === "disconnected") {
        console.log("[SYNC] Wagmi disconnected.");
        if (walletState.isConnected) {
          console.log("[SYNC] Wallet was connected, logging out.");
          handleLogout();
        } else {
          // Check local storage for manual onboarding completion if needed
          const completed = localStorage.getItem("onboarding_complete");
          if (completed === "true") {
            // If we were manually onboarded but disconnected, maybe we shouldn't fully logout?
            // For now, let's allow the disconnect to handle state clean up
          }
        }
      }

      // Delay finishing initialization slightly to ensure state propagation
      if (isInitializing) {
        console.log(
          "[SYNC] Initialization complete. Setting isInitializing to false in 500ms.",
        );
        setTimeout(() => setIsInitializing(false), 500);
      }
    };
    sync();
  }, [
    wagmiAddress,
    isWagmiConnected,
    wagmiStatus,
    refreshProfile,
    handleLogout,
    walletState.address,
    walletState.isConnected,
    isInitializing,
  ]);

  // ==========================================
  // BETTING HANDLERS
  // ==========================================

  const handleBetPlacement = useCallback(
    async (match: Match, selection: Bet["selection"], stake: number) => {
      if (stake > (profile?.korBalance || 0)) return false;
      if (!match.odds) return false;

      try {
        const oddValue =
          match.odds[selection as keyof typeof match.odds] || 1.5;
        const res = await fetch(`${API_URL}/api/minigame/bet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress:
              walletState.address ||
              profile?.walletAddress ||
              (profile?.username ? `guest-${profile.username}` : "guest-user"),
            matchId: match.id,
            selection,
            stake,
            odds: oddValue,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setBalance(data.newBalance);
          const bet: Bet = {
            id: data.bet.id,
            matchId: match.id,
            selection,
            odds: oddValue,
            stake,
            potentialReturn: stake * oddValue,
            status: "pending",
            timestamp: Date.now(),
            txHash: generateHash(),
          };
          setActiveBets((prev) => [bet, ...prev]);
          addTransaction("bet", stake, "kor", "Match wager");
          refreshProfileQuery();
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.error("Bet placement failed", e);
        return false;
      }
    },
    [
      profile?.korBalance,
      profile?.walletAddress,
      profile?.username,
      walletState.address,
      addTransaction,
      refreshProfileQuery,
    ],
  );

  const handleAddToBetSlip = useCallback(
    (
      match: Match,
      selection: "home" | "draw" | "away" | "gg" | "nogg",
      odds: number,
    ) => {
      const exists = betSlipSelections.some(
        (sel) => sel.matchId === match.id && sel.selection === selection,
      );
      if (exists) {
        setBetSlipSelections((prev) =>
          prev.filter(
            (sel) => !(sel.matchId === match.id && sel.selection === selection),
          ),
        );
        return;
      }
      // Generate label from selection
      const labels = {
        home: match.homeTeam.name,
        away: match.awayTeam.name,
        draw: "Draw",
        gg: "Both Teams Score",
        nogg: "No Goals",
      };
      const label = labels[selection] || selection;
      setBetSlipSelections((prev) => [
        ...prev,
        { matchId: match.id, match, selection, odds, selectionLabel: label },
      ]);
    },
    [betSlipSelections],
  );

  const handleRemoveFromBetSlip = useCallback((matchId: string) => {
    setBetSlipSelections((prev) =>
      prev.filter((sel) => sel.matchId !== matchId),
    );
  }, []);

  const handleClearBetSlip = useCallback(() => {
    setBetSlipSelections([]);
  }, []);

  const fetchActiveBets = useCallback(async () => {
    if (isFetchingActiveBetsRef.current) return;
    isFetchingActiveBetsRef.current = true;

    const activeAddress =
      walletState.address ||
      profile?.walletAddress ||
      (profile?.username ? `guest-${profile.username}` : "guest-user");

    // Don't fetch if no valid user/guest identifier found
    if (!activeAddress) {
      isFetchingActiveBetsRef.current = false;
      return;
    }

    try {
      lastActiveBetsFetchRef.current = Date.now();
      const res = await fetch(
        `${API_URL}/api/bets/active?walletAddress=${activeAddress}`,
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.bets)) {
        setActiveBets(data.bets);
      }
    } catch (error) {
      console.error("Failed to fetch active bets:", error);
    } finally {
      isFetchingActiveBetsRef.current = false;
    }
  }, [walletState.address, profile?.walletAddress, profile?.username]);

  const handlePlaceBetSlip = useCallback(
    async (stake: number, betType: "single" | "accumulator") => {
      if (betSlipSelections.length === 0) return false;

      // Determine the best wallet address to use
      const userWallet =
        walletState.address ||
        profile?.walletAddress ||
        (profile?.username ? `guest-${profile.username}` : "guest-user");

      console.log("Placing bet slip:", { betType, stake, userWallet });

      try {
        if (betType === "single") {
          for (const sel of betSlipSelections) {
            const res = await fetch(`${API_URL}/api/minigame/bet`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                walletAddress: userWallet,
                matchId: sel.matchId,
                selection: sel.selection,
                stake,
                odds: sel.odds,
                betType: "single",
              }),
            });
            const data = await res.json();
            if (data.success) {
              setActiveBets((prev) => [
                ...prev,
                {
                  id: data.betId || `bet-${Date.now()}-${Math.random()}`,
                  matchId: sel.matchId,
                  selection: sel.selection,
                  odds: sel.odds,
                  stake,
                  potentialReturn: stake * sel.odds,
                  status: "pending",
                  timestamp: Date.now(),
                  txHash: generateHash(),
                  betType: "single",
                },
              ]);
              if (data.newBalance !== undefined) {
                setBalance(data.newBalance);
              }
            } else {
              console.error("Single bet failed:", data);
            }
          }
          const totalStake = stake * betSlipSelections.length;
          // Stats will be updated via backend + useProfile refresh

          addTransaction(
            "bet",
            totalStake,
            "kor",
            `${betSlipSelections.length} single bets`,
          );
          setBetSlipSelections([]); // Clear slip on success
          return true;
        } else {
          // Accumulator Logic
          const accumulatorId = `acc-${Date.now()}`;
          const totalOdds = betSlipSelections.reduce(
            (acc, sel) => acc * sel.odds,
            1,
          );

          console.log("Placing accumulator bet:", {
            accumulatorId,
            stake,
            totalOdds,
            selections: betSlipSelections.length,
            userWallet,
          });

          const res = await fetch(`${API_URL}/api/minigame/bet-accumulator`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress: userWallet,
              selections: betSlipSelections.map((sel) => ({
                matchId: sel.matchId,
                selection: sel.selection,
                odds: sel.odds,
              })),
              stake,
              totalOdds,
              accumulatorId,
            }),
          });
          const data = await res.json();

          if (!data.success) {
            console.error("Accumulator bet failed (server response):", data);
            // Assuming 'toast' is available in the scope, e.g., from a library like react-hot-toast
            toast.error(data.error || "Failed to place bet. Please try again.");
            return false;
          }

          if (data.success) {
            console.log(
              "[ACCUMULATOR] Bet success, new balance:",
              data.newBalance,
            );
            const newBets: Bet[] = betSlipSelections.map((sel) => ({
              id: `${accumulatorId}-${sel.matchId}`,
              matchId: sel.matchId,
              selection: sel.selection,
              odds: sel.odds,
              stake,
              potentialReturn: stake * totalOdds,
              status: "pending",
              timestamp: Date.now(),
              txHash: generateHash(),
              betType: "accumulator",
              accumulatorId,
            }));

            // Batch update active bets
            setActiveBets((prev) => [...newBets, ...prev]);

            if (data.newBalance !== undefined) {
              setBalance(data.newBalance);
            }

            addTransaction(
              "bet",
              stake,
              "kor",
              `Accumulator (${betSlipSelections.length} selections)`,
            );
          } else {
            return false;
          }
        }
        fetchActiveBets();
        setBetSlipSelections([]);
        return true;
      } catch (e) {
        console.error("Bet slip placement execution error:", e);
        return false;
      }
    },
    [
      betSlipSelections,
      walletState.address,
      profile?.walletAddress,
      profile?.username,
      addTransaction,
      fetchActiveBets,
    ],
  );

  // ==========================================
  // QUEST & PROFILE HANDLERS
  // ==========================================

  const handleQuestAction = useCallback(
    (id: string, openUrl: boolean = true, verificationCode?: string) => {
      if (!profile?.quests) return;
      const quest = profile.quests.find((q: any) => q.id === id);
      if (!quest) return;

      // Fallback URL from INITIAL_QUESTS if missing in current state
      const targetUrl =
        quest.externalUrl ||
        INITIAL_QUESTS.find((iq) => iq.id === id)?.externalUrl;

      if (quest.category === "social" || quest.type === "external") {
        // Mark as visited locally for the UI (un-dims the input/button)
        if (typeof window !== "undefined") {
          localStorage.setItem(`quest_visited_${id}`, "true");
        }

        if (openUrl && targetUrl) {
          window.open(targetUrl, "_blank");
        }

        if (quest.requiresVerification && openUrl) {
          // Just opened the link, don't mark as complete yet
        } else {
          // Mark as complete in LS for local persistence
          if (typeof window !== "undefined") {
            localStorage.setItem(`quest_completed_${id}`, "true");
          }

          // 1. UPDATE SERVER (DB)
          fetch(`${API_URL}/api/user/submit-quest-verification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress: profile.walletAddress,
              questId: id,
              verificationCode:
                verificationCode || localStorage.getItem(`quest_verify_${id}`),
            }),
          })
            .then(() => {
              // Refresh profile to sync DB state
              refreshProfileQuery();
            })
            .catch((err) => console.error("Quest submission DB error:", err));
        }
      } else if (quest.type === "click") {
        // Simple click complete
        if (typeof window !== "undefined") {
          localStorage.setItem(`quest_completed_${id}`, "true");
        }
        refreshProfileQuery();
      }
    },
    [profile, refreshProfileQuery],
  );

  const handleQuestClaim = useCallback(
    async (id: string, onSuccess?: (reward: number) => void) => {
      if (!profile?.walletAddress) return;
      const quest = profile.quests.find((q: any) => q.id === id);
      if (!quest) return;

      try {
        console.log(`[QUEST] Syncing quest ${id} with DB...`);
        const res = await fetch(`${API_URL}/api/user/claim-social-reward`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: profile.walletAddress,
            questId: id,
          }),
        });
        const result = await res.json();

        if (result.success) {
          const reward = result.reward || quest.reward;
          console.log(`[QUEST] DB confirmed! +${reward} coins.`);

          // 1. Persist to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(`quest_completed_${id}`, "true");
          }

          // 2. OPTIMISTIC UPDATE: Update profile cache instantly
          queryClient.setQueryData(
            ["profile", profile.walletAddress],
            (old: any) => {
              if (!old) return old;
              return {
                ...old,
                korBalance: (old.korBalance || 0) + reward,
                quests: (old.quests || []).map((q: any) =>
                  q.id === id ? { ...q, completed: true } : q,
                ),
              };
            },
          );

          // 3. Add to local transactions list
          addTransaction(
            "redeem",
            reward,
            "kor",
            `Quest Reward: ${quest.title}`,
          );

          // 4. Refresh eventually to stay 100% in sync
          refreshProfileQuery();

          // 5. Success feedback
          onSuccess?.(reward);
        } else {
          toast.error(result.error || "Claim failed");
        }
      } catch (e) {
        console.error("Claim error", e);
        toast.error("Network error during claim.");
      }
    },
    [profile, refreshProfileQuery, addTransaction, queryClient],
  );

  const handleRedeem = useCallback(
    async (code: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const res = await fetch(`${API_URL}/api/coupons/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            walletAddress: profile?.walletAddress,
          }),
        });
        const data = await res.json();
        if (data.success) {
          // Success handled by backend, we just notify user
          if (data.type === "coins" && typeof data.value === "number") {
            addTransaction("redeem", data.value, "coins", `Coupon: ${code}`);
          }
          refreshProfileQuery();
          return { success: true, message: data.message || "Code redeemed!" };
        }
        return { success: false, message: data.error || "Invalid code" };
      } catch {
        return { success: false, message: "Connection failed" };
      }
    },
    [profile?.walletAddress, addTransaction],
  );

  const handleReferral = useCallback(
    async (code: string): Promise<{ success: boolean; message?: string }> => {
      try {
        if (!walletState.address)
          return { success: false, message: "Wallet not connected" };
        const res = await fetch(`${API_URL}/api/user/register-referral`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: walletState.address,
            referralCode: code,
          }),
        });
        const json = await res.json();
        if (!res.ok) return { success: false, message: json.error || "Failed" };
        return { success: true, message: "Referral linked!" };
      } catch {
        return { success: false, message: "Connection failed" };
      }
    },
    [walletState.address],
  );

  const handleClaimAllianceRewards = useCallback(async () => {
    try {
      if (!profile?.walletAddress) return;
      const res = await fetch(`${API_URL}/api/user/claim-alliance-rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: profile.walletAddress }),
      });
      const data = await res.json();
      if (data.success) {
        addTransaction("bonus", data.claimed, "kor", "Alliance Rewards");
        alert(`SUCCESS! Claimed ${data.claimed} KOR from Alliance matches.`);
        refreshProfileQuery();
      } else {
        alert(data.error || "Claim failed");
      }
    } catch (e) {
      console.error("Claim error", e);
    }
  }, [profile?.walletAddress, refreshProfileQuery]);

  const handleCheckIn = useCallback(async (): Promise<{
    success: boolean;
    message: string;
    reward?: number;
  }> => {
    if (!walletState.address) {
      return { success: false, message: "Wallet not connected" };
    }

    try {
      const res = await fetch(`${API_URL}/api/user/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: walletState.address }),
      });
      const data = await res.json();

      if (data.success) {
        addTransaction("bonus", data.reward, "kor", "4-Hourly Check-in Bonus");
        refreshProfileQuery();
        return { success: true, message: data.message, reward: data.reward };
      } else {
        return {
          success: false,
          message: data.error || data.message || "Claim failed",
        };
      }
    } catch (e) {
      console.error("Check-in failed", e);
      return { success: false, message: "Connection error" };
    }
  }, [walletState.address, addTransaction, refreshProfileQuery]);

  // ==========================================
  // ADMIN HANDLERS
  // ==========================================

  const handleAdminSyncRequest = useCallback(() => {
    setShowAdminAuth(true);
  }, []);

  const handleAdminAuthSuccess = useCallback(() => {
    adminSessionTokenRef.current = getSessionToken();
    setAdminSessionValid(true);
    setShowAdminAuth(false);
    setShowAdmin(true);
  }, []);

  const handleAdminLogout = useCallback(async () => {
    if (adminSessionTokenRef.current) {
      await logoutAdmin(adminSessionTokenRef.current);
    }
    clearSessionToken();
    adminSessionTokenRef.current = null;
    setAdminSessionValid(false);
    setShowAdmin(false);
  }, []);

  // Check for existing admin session on mount
  useEffect(() => {
    const check = async () => {
      const hasSession = await hasValidAdminSession();
      if (hasSession) {
        adminSessionTokenRef.current = getSessionToken();
        setAdminSessionValid(true);
      }
    };
    check();
  }, []);

  // ==========================================
  // GAME LOOP & DATA FETCHING
  // ==========================================

  const fetchMatches = useCallback(async () => {
    if (isFetchingMatchesRef.current) return;
    isFetchingMatchesRef.current = true;
    try {
      lastMatchesFetchRef.current = Date.now();
      const res = await fetch(`${API_URL}/api/matches/current`);
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);

        // Update Round Info & Timer from Server Logic
        if (data.matches.length > 0) {
          const first = data.matches[0];
          setRoundNumber(first.round);
          setSeasonId(first.seasonId);

          if (data.serverTime && first.startTime) {
            const serverTime = new Date(data.serverTime).getTime();
            const roundStartTime = new Date(first.startTime).getTime();
            const bettingEndTime = roundStartTime + ROUND_DURATION_SEC * 1000;
            const matchEndTime = bettingEndTime + MATCH_DURATION_SEC * 1000;

            if (serverTime < bettingEndTime) {
              // BETTING PHASE
              setGameState("BETTING");
              const remaining = Math.max(
                0,
                Math.floor((bettingEndTime - serverTime) / 1000),
              );
              setTimer(remaining);
            } else if (serverTime < matchEndTime) {
              // LIVE PHASE
              setGameState("LIVE");
              const elapsed = Math.floor((serverTime - bettingEndTime) / 1000);
              setTimer(elapsed);
            } else {
              // FINISHED PHASE (Intermission)
              const finishedEndTime = matchEndTime + RESULT_DURATION_SEC * 1000;
              if (serverTime < finishedEndTime) {
                setGameState("FINISHED");
                const remaining = Math.max(
                  0,
                  Math.floor((finishedEndTime - serverTime) / 1000),
                );
                setTimer(remaining);
              } else {
                // Round truly over, waiting for next generation
                setGameState("FINISHED");
                setTimer(0);
              }
            }
          }
        }

        // Update game state based on matches status
        const hasLiveMatches = data.matches.some(
          (m: Match) => m.status === "LIVE",
        );
        const hasFinishedMatches = data.matches.some(
          (m: Match) => m.status === "FINISHED",
        );

        if (hasLiveMatches) {
          setGameState("LIVE");
        } else if (hasFinishedMatches && !hasLiveMatches) {
          // Keep it as FINISHED, but rely on time logic above for timer
          if (gameState !== "FINISHED") setGameState("FINISHED");
        } else {
          if (gameState === "FINISHED" && timerRef.current === 0) {
            // Only switch to betting if we are done with finished phase
            setGameState("BETTING");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      isFetchingMatchesRef.current = false;
    }
  }, [selectedLeagueId, gameState]); // Removed timer dependency

  // Define fetchActiveBets before useEffect

  // Unused placeholders kept to satisfy interface
  const generateRoundMatches = useCallback(async () => {
    console.log("Client generation disabled - waiting for server");
  }, []);
  const handleStateTransition = useCallback(() => {
    fetchMatches();
  }, [fetchMatches]);
  const updateLiveScores = useCallback(() => {
    // Only used for client-side visual interpolation if needed
    // But real data comes from polling
  }, []);
  const processResults = useCallback(async () => {
    fetchMatches();
  }, [fetchMatches]);
  const fetchStandings = useCallback(
    async (overrideSeasonId?: number) => {
      if (isFetchingStandingsRef.current) return;
      isFetchingStandingsRef.current = true;
      try {
        lastStandingsFetchRef.current = Date.now();
        // Use active seasonId if not overridden. If both are null/0, send undefined.
        // Server handles undefined by finding active season.
        const targetSeasonId = overrideSeasonId || seasonId;

        const query = targetSeasonId ? `?seasonId=${targetSeasonId}` : "";

        const res = await fetch(`${API_URL}/api/leagues/standings${query}`);
        const data = await res.json();

        console.log("fetchStandings response:", data);

        if (data && data.success && Array.isArray(data.standings)) {
          // Group by leagueId
          const grouped: Record<string, LeagueEntry[]> = {};
          data.standings.forEach((team: any) => {
            if (!grouped[team.leagueId]) grouped[team.leagueId] = [];
            grouped[team.leagueId].push(team);
          });
          console.log("Grouped Standings:", grouped);
          setLeagueTables(grouped);
        } else if (
          data &&
          typeof data === "object" &&
          !data.error &&
          !data.standings
        ) {
          console.log("Setting League Tables (Standard Object):", data);
          setLeagueTables(data);
        } else {
          console.warn("Unexpected standings format:", data);
        }
      } catch (error) {
        console.error("Failed to fetch standings:", error);
      } finally {
        isFetchingStandingsRef.current = false;
      }
    },
    [seasonId],
  );

  // ==========================================
  // SIDE EFFECTS & POLLING
  // ==========================================

  // Timer logic for visual countdown/countup
  useEffect(() => {
    // No longer blocking on dashboardMounted!
    // This allows the background to stay in sync even on landing/selection pages
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (gameState === "BETTING") {
          if (prev <= 0) {
            // Throttle even at 0: only check every 10 seconds if we're stuck
            const now = Date.now();
            if (now - lastMatchesFetchRef.current >= 10000) {
              fetchMatches();
            }
            return 0;
          }
          return prev - 1;
        } else if (gameState === "LIVE") {
          // Count UP
          if (prev >= MATCH_DURATION_SEC) {
            fetchMatches();
            return prev;
          }
          return prev + 1;
        } else if (gameState === "FINISHED") {
          // Count DOWN (Intermission)
          if (prev <= 0) {
            fetchMatches();
            return 0;
          }
          return prev - 1;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchMatches, gameState]);

  // Reset round-refresh flag when moving from RESULT back to BETTING
  useEffect(() => {
    if (gameState === "BETTING") {
      hasRefreshedThisRoundRef.current = false;
    }
  }, [gameState]);

  // PREFETCH DATA: Start fetching as soon as initialization is complete
  useEffect(() => {
    if (!isInitializing) {
      console.log("[PREFETCH] App initialized. Fetching background data...");
      fetchMatches();
      fetchStandings();
    }
  }, [isInitializing, fetchMatches, fetchStandings]);

  // Refresh profile when matches are finished to reflect winnings/xp
  useEffect(() => {
    if (
      (gameState === "FINISHED" || gameState === "RESULT") &&
      walletState.address
    ) {
      if (!hasRefreshedThisRoundRef.current) {
        console.log("[GAME] Round ended. Triggering final sync...");
        hasRefreshedThisRoundRef.current = true;
        refreshProfile(walletState.address || "");
        fetchActiveBets(); // Refresh history
        fetchStandings(); // Final standings update
      }
    }
  }, [
    gameState,
    walletState.address,
    refreshProfile,
    fetchActiveBets,
    fetchStandings,
  ]);

  // Poll for matches and bets
  useEffect(() => {
    if (!dashboardMounted) return;

    fetchMatches();
    fetchStandings(); // Initial fetch

    // Poll matches and standings: 3-minute interval (180,000ms)
    const interval = setInterval(() => {
      const now = Date.now();
      // Only poll if it's been at least 3 minutes
      if (now - lastMatchesFetchRef.current >= 180000) {
        fetchMatches();
        lastMatchesFetchRef.current = now;
      }

      if (now - lastStandingsFetchRef.current >= 180000) {
        fetchStandings();
        lastStandingsFetchRef.current = now;
      }
    }, 60000); // Check every minute, but obey 3-min cooldown

    // Poll bets if user is connected
    let betInterval: ReturnType<typeof setInterval>;
    if (walletState.isConnected && walletState.address) {
      betInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastActiveBetsFetchRef.current >= 180000) {
          fetchActiveBets();
          lastActiveBetsFetchRef.current = now;
        }
      }, 60000);
    }

    return () => {
      clearInterval(interval);
      if (betInterval) clearInterval(betInterval);
    };
  }, [
    dashboardMounted,
    fetchMatches,
    fetchStandings,
    fetchActiveBets,
    walletState.isConnected,
    walletState.address,
  ]);

  const getCurrentGameMinute = useCallback(() => {
    if (gameState !== "LIVE") return 0;
    const total = MATCH_DURATION_SEC;
    const elapsed = timer;
    const minute = Math.floor((elapsed / total) * 90);
    return Math.min(90, Math.max(0, minute));
  }, [gameState, timer]);

  return (
    <GameContext.Provider
      value={{
        walletState,
        isInitializing,
        profile,
        isNewUser: storeIsNewUser,
        registrationData,
        setRegistrationData,
        balance,
        setBalance,
        gameState,
        setGameState,
        timer,
        setTimer,
        roundNumber,
        setRoundNumber,
        seasonId,
        setSeasonId,
        matches,
        setMatches,
        activeBets,
        setActiveBets,
        betSlipSelections,
        setBetSlipSelections,
        leagueTables,
        setLeagueTables,
        transactions,
        addTransaction,
        coupons,
        setCoupons,
        bettingOn,
        setBettingOn,
        watchingMatchId,
        setWatchingMatchId,
        selectedLeagueId,
        setSelectedLeagueId,
        showWallet,
        setShowWallet,
        showSwapConfirm,
        setShowSwapConfirm,
        showAdmin,
        setShowAdmin,
        showAdminAuth,
        setShowAdminAuth,
        adminSessionValid,
        adminSessionToken: adminSessionTokenRef.current,
        generateRoundMatches,
        handleStateTransition,
        updateLiveScores,
        processResults,
        fetchMatches,
        fetchStandings,
        fetchActiveBets,
        getCurrentGameMinute,
        dashboardMounted,
        setDashboardMounted,
        handleWalletConnected,
        handleMessageSigned,
        handleProceedFromWelcome,
        handleLogout,
        refreshProfile,
        handleBetPlacement,
        handleAddToBetSlip,
        handleRemoveFromBetSlip,
        handleClearBetSlip,
        handlePlaceBetSlip,
        handleQuestAction,
        handleQuestClaim,
        handleRedeem,
        handleReferral,
        handleClaimAllianceRewards,
        handleCheckIn,
        handleAdminSyncRequest,
        handleAdminAuthSuccess,
        handleAdminLogout,
        notification,
        notify,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
