import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  useCallback,
} from "react";
import { cn } from "../lib/utils";
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
  MAX_ROUNDS,
} from "../constants";
import {
  Match,
  MatchResult, // Added import
  Bet,
  LeagueEntry,
  Transaction,
  UserStats,
  GameState,
  SeasonArchive,
  AppTheme,
  Coupon,
  DailyQuest,
  WalletState,
  BetSlipSelection,
} from "../types";
import { MatchCard } from "./MatchCard";
import { generateMatchResult, calculateOdds } from "../services/matchService";
import { SimulationScreen } from "./SimulationScreen";
import { LeagueTable } from "./LeagueTable";
import { ProfileScreen } from "./ProfileScreen";
import { WalletModal } from "./WalletModal";
import {
  IconHome,
  IconTicket,
  IconUser,
  IconTable,
  IconTrophy,
  IconCheck,
  IconZap,
  IconInfo,
} from "./Icons";
import { Leaderboard } from "./Leaderboard";
import { ConnectWallet } from "./ConnectWallet";
import { SwapConfirm } from "./SwapConfirm";
import { BetModal } from "./BetModal";
import { BetSlip } from "./BetSlip";
import { RivalsLogo } from "./RivalsLogo";
import { Onboarding } from "./Onboarding";
const AdminPortal = lazy(() =>
  import("./AdminPortal").then((mod) => ({ default: mod.AdminPortal })),
);
import { AdminAuth } from "./AdminAuth";
import { SignMessage } from "./SignMessage";
import { WelcomeScreen } from "./WelcomeScreen";
import { ReturningUserScreen } from "./ReturningUserScreen";
import {
  hasValidAdminSession,
  getSessionToken,
  logoutAdmin,
  clearSessionToken,
} from "../services/adminAuthService";
import { verifyCoupon } from "../services/couponService";
import { LandingPage } from "./LandingPage";
import { GameSelection } from "./GameSelection";
import { claimSocialReward } from "../server/user";
import { AllianceSetup } from "./AllianceSetup";
import { EntryChoice } from "./EntryChoice";
import { useGame } from "../contexts/GameContext";

// Session token management - no admin wallet exposed
let adminSessionToken: string | null = null;

// API URL - empty string for same-origin requests in TanStack Start
const API_URL = "";

const generateHash = () =>
  "0x" +
  Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

const generate6DigitCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const App: React.FC = () => {
  // Enhanced Entry Flow: landing -> selection -> entryChoice -> onboarding/alliance -> connect -> sign -> welcome -> main
  const [appView, setAppView] = useState<
    | "landing"
    | "selection"
    | "entryChoice"
    | "onboarding"
    | "alliance"
    | "connect"
    | "sign"
    | "welcome"
    | "main"
  >(() => {
    // If they've already connected before, we still show the selection screen for a platform feel
    // but skipping the landing page.
    if (localStorage.getItem("onboarding_complete") === "true") {
      return "selection";
    }
    return "landing";
  });

  // Alliance Registration State
  const [registrationData, setRegistrationData] = useState<{
    username: string;
    leagueId: string;
    teamId: string;
  } | null>(null);
  const [gameState, setGameState] = useState<GameState>("BETTING");
  const [timer, setTimer] = useState(ROUND_DURATION_SEC);
  const [roundNumber, setRoundNumber] = useState(1);
  const [seasonId, setSeasonId] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "home" | "league" | "bets" | "leaderboard" | "profile"
  >("home");
  const [betTab, setBetTab] = useState<"ongoing" | "ended">("ongoing");
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [showWallet, setShowWallet] = useState(false);
  // Mystery box removed
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [bettingOn, setBettingOn] = useState<Match | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminSessionValid, setAdminSessionValid] = useState(false);
  const [themeTransition, setThemeTransition] = useState(false);
  const [betSlipSelections, setBetSlipSelections] = useState<
    BetSlipSelection[]
  >([]);
  const [debugStatus, setDebugStatus] = useState<string>("Init");
  const [isNewUser, setIsNewUser] = useState(true);
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    isVerified: false,
    verificationSignature: null,
    verificationTimestamp: null,
  });
  const { onClaimWinnings } = useGame();

  const [matches, setMatches] = useState<Match[]>([]);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [leagueTables, setLeagueTables] = useState<
    Record<string, LeagueEntry[]>
  >({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([
    // Empty - coupons are managed server-side now
    // Don't expose coupon codes in frontend!
  ]);

  const serverSeedsRef = useRef<Record<string, string>>({});
  const initialFetchRef = useRef(false);
  const adminCheckRef = useRef(false);
  const profileFetchInProgress = useRef<string | null>(null);
  const standingsFetchRef = useRef<Record<number, boolean>>({});
  const matchesFetchInProgress = useRef(false);
  const processedMatchesRef = useRef<Set<string>>(new Set());

  const [userStats, setUserStats] = useState<UserStats>({
    username: "",
    level: 1,
    xp: 0,
    totalBets: 0,
    wins: 0,
    biggestWin: 0,
    walletAddress: "",
    currentStreak: 0,
    longestStreak: 0,
    bestOddsWon: 0,
    dailyWalkPoints: 0,
    lastWalkDate: "",
    coins: 1000,
    korBalance: 1000,
    referralCode: generate6DigitCode(),
    hasReferred: false,
    referralCount: 0,
    referralEarnings: 0,
    loginStreak: 1,
    lastLoginDate: "",
    quests: [...INITIAL_QUESTS],
    activeTheme: "default",
    unclaimedAllianceRewards: 0,
    canCheckIn: true,
    nextCheckInIn: 0,
    lastCheckInDate: null,
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const notify = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
    },
    [],
  );

  const [watchingMatchId, setWatchingMatchId] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState(LEAGUES[0].id);

  useEffect(() => {
    const tables: Record<string, LeagueEntry[]> = {};
    LEAGUES.forEach((league) => {
      tables[league.id] = TEAMS[league.id].map((team) => ({
        teamId: team.id,
        teamName: team.name,
        color: team.color,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      }));
    });
    setLeagueTables(tables);
  }, []);

  // SYNC WITH SERVER STATE
  async function fetchMatches() {
    if (matchesFetchInProgress.current) return;
    matchesFetchInProgress.current = true;
    try {
      const res = await fetch(`${API_URL}/api/matches/current`); // Fetch ALL leagues
      const data = await res.json();

      if (data.success && data.matches && data.matches.length > 0) {
        const serverMatches = data.matches.map((m: any) => {
          const lId = m.leagueId || m.league_id || "l1";
          const teamList = TEAMS[lId] || TEAMS["l1"];

          // Prefer server-provided names, fallback to local lookup
          const hTeam = m.home_team_name
            ? {
                id: m.home_team_id,
                name: m.home_team_name,
                color: "#000",
                strength: 50,
                leagueId: lId,
              }
            : teamList.find((t) => t.id === m.home_team_id) || {
                id: "unknown",
                name: "Unknown",
                color: "#000",
                strength: 50,
                leagueId: lId,
              };

          const aTeam = m.away_team_name
            ? {
                id: m.away_team_id,
                name: m.away_team_name,
                color: "#000",
                strength: 50,
                leagueId: lId,
              }
            : teamList.find((t) => t.id === m.away_team_id) || {
                id: "unknown",
                name: "Unknown",
                color: "#000",
                strength: 50,
                leagueId: lId,
              };

          return {
            id: m.id,
            leagueId: lId,
            seasonId: m.seasonId || m.season_id,
            round: m.round || m.round_number,
            homeTeam: hTeam,
            awayTeam: aTeam,
            startTime: new Date(m.scheduled_time).getTime(),
            status: m.status.toUpperCase(),
            homeScore: m.homeScore, // Usually final or live static score from DB
            awayScore: m.awayScore,
            // Calculate current display score if LIVE
            currentScore:
              m.status.toUpperCase() === "LIVE"
                ? { home: m.homeScore, away: m.awayScore }
                : undefined,
            odds: m.odds || {
              home: 2.0,
              draw: 3.0,
              away: 2.0,
              gg: 1.75,
              nogg: 2.1,
            },
            roundHash: m.round_hash || "",
            commitHash: m.commit_hash || "",
            liveStartTime: m.live_start_time
              ? new Date(m.live_start_time).getTime()
              : undefined,
            events: m.events,
            result:
              m.homeScore !== null && m.awayScore !== null
                ? {
                    homeScore: m.homeScore,
                    awayScore: m.awayScore,
                    events: m.events || [],
                  }
                : undefined,
          };
        });

        setMatches(serverMatches);

        // Update Global State from the first match found
        if (serverMatches.length > 0) {
          const first = serverMatches[0];
          const sId = Number(first.seasonId) || 1;
          const rNum = Number(first.round) || 1;

          setSeasonId(sId);
          setRoundNumber(rNum);
          fetchStandings(sId);
        }
      } else {
        // Fallback if server empty
        generateRoundMatches(1, 1, generateHash());
        fetchStandings(1);
      }
    } catch (e) {
      console.error("Sync failed, falling back", e);
      generateRoundMatches(1, 1, generateHash());
    } finally {
      matchesFetchInProgress.current = false;
    }
  }

  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    fetchMatches();
  }, []);

  useEffect(() => {
    if (appView !== "main") return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleStateTransition();
          return 0;
        }
        return prev - 1;
      });
      if (gameState === "LIVE") updateLiveScores();
    }, 1000);
    return () => clearInterval(interval);
  }, [appView, gameState, timer]);

  async function refreshProfile(address: string) {
    if (!address) return;

    // Prevent overlapping fetches for the same address
    if (profileFetchInProgress.current === address) return;
    profileFetchInProgress.current = address;

    let data: any = null;
    try {
      // Include alliance data if we are in registration phase
      let url = `${API_URL}/api/user/profile?walletAddress=${address}`;
      if (registrationData) {
        const { username, leagueId, teamId } = registrationData;
        url += `&username=${encodeURIComponent(
          username,
        )}&leagueId=${encodeURIComponent(leagueId)}&teamId=${encodeURIComponent(
          teamId,
        )}`;
      }

      // Fetch profile from Backend (Supabase)
      const res = await fetch(url);
      data = await res.json();

      if (data && data.success) {
        // Clear registration data once synced
        setRegistrationData(null);
        const userData = data.user || data;

        setDebugStatus(`OK: ${userData.username}`);

        // Use server-provided isNew flag, or default to false if we found a profile
        const isNew =
          typeof data.isNew !== "undefined"
            ? data.isNew
            : typeof userData.isNew !== "undefined"
            ? userData.isNew
            : false;
        console.log(
          `[PROFILE] Synced. Username: ${userData.username}, isNew: ${isNew}`,
        );
        setIsNewUser(isNew);

        setUserStats((prev) => ({
          ...prev,
          walletAddress: address,
          username: userData.username || prev.username,
          coins: Number(userData.coins) || 0,
          korBalance: Number(userData.korBalance) || 0,
          level: Number(userData.level) || 1,
          xp: Number(userData.xp) || 0,
          totalBets: Number(userData.totalBets) || 0,
          wins: Number(userData.wins) || 0,
          biggestWin: Number(userData.biggestWin) || 0,
          currentStreak: Number(userData.currentStreak) || 0,
          longestStreak: Number(userData.longestStreak) || 0,
          bestOddsWon: Number(userData.bestOddsWon) || 0,
          referralEarnings: Number(userData.referralEarnings) || 0,
          referralCount: Number(userData.referralCount) || 0,
          unclaimedAllianceRewards: Number(userData.unclaimedAllianceRewards) || 0,
          allianceLeagueId: userData.allianceLeagueId,
          allianceTeamId: userData.allianceTeamId,
          canCheckIn: userData.canCheckIn,
          nextCheckInIn: userData.nextCheckInIn,
          lastCheckInDate: userData.lastCheckInDate,
          quests: (() => {
            // DB quests tell us what's COMPLETED. Preserve in-memory progress for live tracking.
            const dbCompletedIds = new Set(
              (userData.quests || [])
                .filter((q: any) => q.completed)
                .map((q: any) => q.questId || q.id),
            );
            const masterQuests =
              userData.masterQuests && userData.masterQuests.length > 0
                ? userData.masterQuests
                : INITIAL_QUESTS;

            return masterQuests.map((baseQuest: any) => {
              const dbQuest = (userData.quests || []).find(
                (dq: any) => (dq.questId || String(dq.id)) === String(baseQuest.id)
              );
              
              const isCompleted =
                dbCompletedIds.has(String(baseQuest.id)) ||
                dbQuest?.completed === true;
                
              return {
                ...baseQuest,
                id: String(baseQuest.id), // FORCE STRING ID
                progress: Number(dbQuest?.progress) || 0,
                completed: isCompleted,
                status: dbQuest?.status || (isCompleted ? "CLAIMABLE" : "LIVE"),
                // STRICT OVERRIDE FOR TEST/PROD INTEGRITY
                requiresVerification: baseQuest.requiresVerification === true,
                verificationPlaceholder: baseQuest.verificationPlaceholder,
                verificationType: baseQuest.verificationType,
                type: baseQuest.type, // FORCE CORRECT TYPE
                externalUrl: baseQuest.externalUrl,
                category: baseQuest.category || (String(baseQuest.id).startsWith('p_') ? 'partners' : 'social'),
              };
            });
          })(),
        }));
        setBalance(Number(userData.korBalance) || 0);
      } else {
        // Fallback for failed profile fetch - don't block the user
        console.warn(
          "Profile fetch failed or returned unsuccessful, using defaults/state",
        );
        setDebugStatus(`FALLBACK: ${address.slice(0, 6)}`);
        setUserStats((prev) => ({
          ...prev,
          walletAddress: address,
          username:
            prev.username || `Rival_${address.slice(2, 6).toUpperCase()}`,
        }));
      }
    } catch (err: any) {
      setDebugStatus(`ERR: ${err.message}`);
      console.error("Failed to sync profile", err);
      // Ensure address is set even on network error
      setUserStats((prev) => ({ ...prev, walletAddress: address }));
    } finally {
      profileFetchInProgress.current = null;
    }

    // Always proceed to next view if we have an address
    if (address) {
      const isVerified = localStorage.getItem(`verified_${address}`) === "true";

      // Check if user exists in DB before proceeding
      if (data?.success) {
        if (isVerified) {
          setWalletState((prev) => ({
            ...prev,
            isVerified: true,
            verificationTimestamp: Date.now(),
          }));
          // Route to welcome screen so they see ReturningUserScreen
          setAppView("welcome");
        } else {
          setAppView("sign");
        }
      } else {
        // User not in DB -> Send to Sign Up (Onboarding)
        setAppView("onboarding");
      }
    }
  }

  function handleStateTransition() {
    if (gameState === "BETTING") {
      setGameState("LIVE");
      setTimer(MATCH_DURATION_SEC);
      setMatches((prev) =>
        prev.map((m) => {
          const seed = serverSeedsRef.current[m.id] || generateHash();
          const blockHash = generateHash();
          return {
            ...m,
            status: "LIVE",
            liveStartTime: Date.now(), // Track when match went live for 10-second betting window
            blockHash,
            result: generateMatchResult({ ...m, blockHash }, seed),
            currentScore: { home: 0, away: 0 },
          };
        }),
      );
    } else if (gameState === "LIVE") {
      setGameState("RESULT");
      setTimer(RESULT_DURATION_SEC);
      processResults();
      // IMMEDIATE REFRESH: Fetch updated balance (winnings) right after game ends
      if (walletState.isConnected && walletState.address) {
        setTimeout(() => refreshProfile(walletState.address!), 2000); // Small delay to let backend process
      }
    } else if (gameState === "RESULT") {
      const nextRound = roundNumber >= MAX_ROUNDS ? 1 : roundNumber + 1;
      const nextSeason = roundNumber >= MAX_ROUNDS ? seasonId + 1 : seasonId;
      setGameState("BETTING");
      setTimer(ROUND_DURATION_SEC);
      setRoundNumber(nextRound);
      setSeasonId(nextSeason);
      generateRoundMatches(nextRound, nextSeason, generateHash());
    }
  }

  async function generateRoundMatches(
    round: number,
    sId: number,
    clientSeed: string,
  ) {
    const newMatches: Match[] = [];
    LEAGUES.forEach((league) => {
      const shuffled = [...TEAMS[league.id]].sort(() => 0.5 - Math.random());
      for (let i = 0; i < shuffled.length; i += 2) {
        const mId = `m-${sId}-${round}-${league.id}-${i / 2}`;
        const serverSeed = generateHash();
        serverSeedsRef.current[mId] = serverSeed;
        newMatches.push({
          id: mId,
          leagueId: league.id,
          homeTeam: shuffled[i],
          awayTeam: shuffled[i + 1],
          status: "SCHEDULED",
          startTime: Date.now(),
          odds: calculateOdds(shuffled[i].strength, shuffled[i + 1].strength),
          roundHash: clientSeed,
          commitHash: generateHash(),
          seasonId: sId,
          round: round,
        });
      }
    });
    setMatches(newMatches);

    // Save matches to database
    try {
      await fetch(`${API_URL}/api/matches/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches: newMatches }),
      });
      console.log(`[MATCHES] Saved ${newMatches.length} matches to database`);
    } catch (err) {
      console.error("Failed to save matches:", err);
    }
  }

  function updateLiveScores() {
    const progress = (MATCH_DURATION_SEC - timer) / MATCH_DURATION_SEC;
    const currentMin = Math.floor(progress * 90);
    setMatches((prev) =>
      prev.map((m) => {
        if (!m.result && !m.events) return m;

        const events = m.result?.events || m.events || [];

        let h = 0,
          a = 0;
        events.forEach((e) => {
          if (e.minute <= currentMin && e.type === "goal") {
            const teamId =
              e.teamId ||
              ((e as any).side === "home" ? m.homeTeam.id : m.awayTeam.id);
            if (teamId === m.homeTeam.id) h++;
            else a++;
          }
        });
        return { ...m, currentScore: { home: h, away: a } };
      }),
    );
  }

  async function processResults() {
    const finishedMatches = matches.map((m) => {
      // If match has result from local simulation, use it
      if (m.result) {
        return {
          ...m,
          status: "FINISHED" as const,
          currentScore: { home: m.result.homeScore, away: m.result.awayScore },
        };
      }
      // If match has scores from server (fetched as live/finished), use them
      if (m.homeScore !== undefined && m.awayScore !== undefined) {
        const pseudoResult: MatchResult = {
          homeScore: m.homeScore!,
          awayScore: m.awayScore!,
          events: m.events || [],
          summary: "Match finished",
        };
        return {
          ...m,
          status: "FINISHED" as const,
          result: pseudoResult,
          currentScore: { home: m.homeScore!, away: m.awayScore! },
        };
      }
      return { ...m, status: "FINISHED" as const };
    });
    setMatches(finishedMatches);

    // Sync all match results to database and settle bets
    for (const match of finishedMatches) {
      if (!match.result || processedMatchesRef.current.has(match.id)) continue;
      processedMatchesRef.current.add(match.id);

      try {
        // 1. Update match result in database
        console.log(
          `[SYNC] Updating match ${match.id} score: ${match.result.homeScore}-${match.result.awayScore}`,
        );
        await fetch(`${API_URL}/api/matches/update-result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId: match.id,
            homeScore: match.result.homeScore,
            awayScore: match.result.awayScore,
            events: match.result.events,
            status: "finished",
          }),
        });

        // 2. Settle all bets for this match
        const settleRes = await fetch(`${API_URL}/api/bets/settle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId: match.id,
            homeScore: match.result.homeScore,
            awayScore: match.result.awayScore,
          }),
        });

        const settleData = await settleRes.json();
        console.log(
          `[SETTLEMENT] Match ${match.id}: ${settleData.settled}/${settleData.total} bets settled`,
        );
      } catch (err) {
        console.error(`Failed to process match ${match.id}:`, err);
      }
    }

    // 3. Refresh user balance from database (winners will have updated balance)
    try {
      const profileRes = await fetch(
        `${API_URL}/api/user/profile?walletAddress=${userStats.walletAddress}`,
      );
      const profileData = await profileRes.json();

      if (profileData.success && profileData.user) {
        const newBalance = Number(profileData.user.korBalance) || 0;
        const oldBalance = balance;
        const winnings = newBalance - oldBalance;

        setBalance(newBalance);
        setUserStats((prev) => ({ ...prev, korBalance: newBalance }));

        if (winnings > 0) {
          console.log(`[WINNINGS] You won ${winnings} DOODL!`);
          addTransaction("win", winnings, "kor", "Match Winnings");
        }
      }
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }

    // 4. Fetch updated bets
    fetchBets();

    // 5. Refresh standings from database
    fetchStandings();
  }

  const fetchBets = useCallback(async () => {
    if (!userStats.walletAddress) return;
    try {
      const betsRes = await fetch(
        `${API_URL}/api/bets/active?walletAddress=${userStats.walletAddress}`,
      );
      const betsData = await betsRes.json();

      if (betsData.success) {
        // Transform DB bets to frontend format
        const dbBets = betsData.bets.map((b: any) => ({
          ...b,
          timestamp: new Date(b.createdAt || b.timestamp).getTime(),
          txHash: b.txHash || b.tx_hash || generateHash(),
        }));
        setActiveBets(dbBets);
      }
    } catch (err) {
      console.error("Failed to fetch bets:", err);
    }
  }, [userStats.walletAddress]);

  useEffect(() => {
    if (
      userStats.walletAddress &&
      (activeTab === "bets" || activeTab === "profile")
    ) {
      fetchBets();
    }
  }, [userStats.walletAddress, activeTab, fetchBets]);

  async function fetchStandings(overrideSeasonId?: number) {
    const sid = overrideSeasonId || seasonId || 1;
    if (standingsFetchRef.current[sid]) return;
    standingsFetchRef.current[sid] = true;

    try {
      console.log(`[STANDINGS] Fetching for Season ID: ${sid}`);
      const res = await fetch(
        `${API_URL}/api/leagues/standings?seasonId=${sid}`,
      );
      const data = await res.json();
      console.log("[STANDINGS] Received:", data);

      if (data.success && data.standings) {
        const tables: Record<string, LeagueEntry[]> = {};
        LEAGUES.forEach((league) => {
          const leagueStandings = data.standings.filter(
            (s: any) => s.leagueId === league.id,
          );
          tables[league.id] = leagueStandings.map((s: any) => ({
            teamId: s.teamId,
            teamName: s.teamName,
            color: s.color,
            played: s.played,
            won: s.won,
            drawn: s.drawn,
            lost: s.lost,
            goalsFor: s.goalsFor,
            goalsAgainst: s.goalsAgainst,
            points: s.points,
          }));

          // Add missing teams if any
          TEAMS[league.id].forEach((team) => {
            if (!tables[league.id].find((e) => e.teamId === team.id)) {
              tables[league.id].push({
                teamId: team.id,
                teamName: team.name,
                color: team.color,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0,
              });
            }
          });

          // Sort by points, then goal difference
          tables[league.id].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
          });
        });
        setLeagueTables(tables);
      }
    } catch (err) {
      console.error("Failed to fetch standings:", err);
    } finally {
      setTimeout(() => {
        standingsFetchRef.current[sid] = false;
      }, 180000); // Allow re-fetch after 3 minutes
    }
  }

  function addTransaction(
    type: Transaction["type"],
    amount: number,
    currency: "kor" | "coins",
    description: string,
  ) {
    setTransactions((prev) => [
      ...prev,
      {
        id: `tx-${Date.now()}`,
        type,
        amount,
        currency,
        description,
        timestamp: Date.now(),
        hash: generateHash(),
      },
    ]);
  }

  function handleWalletConnected(address: string) {
    setWalletState((prev) => ({ ...prev, address, isConnected: true }));
    refreshProfile(address);
  }

  function handleMessageSigned() {
    // Mark wallet as verified with timestamp
    setWalletState((prev) => ({
      ...prev,
      isVerified: true,
      verificationTimestamp: Date.now(),
    }));

    // Persist verification status for this wallet
    if (walletState.address) {
      localStorage.setItem(`verified_${walletState.address}`, "true");
    }

    setAppView("main");
  }

  // Check for existing admin session on mount
  useEffect(() => {
    if (adminCheckRef.current) return;
    adminCheckRef.current = true;

    const checkExistingSession = async () => {
      const hasSession = await hasValidAdminSession();
      if (hasSession) {
        adminSessionToken = getSessionToken();
        setAdminSessionValid(true);
        setShowAdmin(true);
      }
    };
    checkExistingSession();
  }, []);

  function handleAdminSyncRequest() {
    setShowAdminAuth(true);
  }

  function handleAdminAuthSuccess() {
    // Get token from localStorage (set by AdminAuth component)
    adminSessionToken = getSessionToken();
    setAdminSessionValid(true);
    setShowAdminAuth(false);
    setShowAdmin(true);
  }

  async function handleAdminLogout() {
    if (adminSessionToken) {
      await logoutAdmin(adminSessionToken);
    }
    clearSessionToken();
    adminSessionToken = null;
    setAdminSessionValid(false);
    setShowAdmin(false);
  }

  function handleClaimMysteryBox() {
    // Mystery box removed - no-op
  }

  function handleProceedFromWelcome() {
    localStorage.setItem(`user_${userStats.walletAddress}`, userStats.username);
    localStorage.setItem("onboarding_complete", "true");
    setAppView("main");
  }

  async function handleClaimAllianceRewards() {
    try {
      const res = await fetch(`${API_URL}/api/user/claim-alliance-rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: userStats.walletAddress }),
      });
      const data = await res.json();
      if (data.success) {
        notify(
          `SUCCESS! Claimed ${data.claimed} KOR from Alliance matches.`,
          "success",
        );
        if (userStats.walletAddress) refreshProfile(userStats.walletAddress);
      } else {
        notify(data.error || "Claim failed", "error");
      }
    } catch (e) {
      console.error("Claim error", e);
    }
  }

  function handleLogout() {
    setAppView("connect");
    setActiveTab("home");
    setBalance(INITIAL_BALANCE);
    setActiveBets([]);
    setTransactions([]);
    setUserStats({
      username: "",
      level: 1,
      xp: 0,
      totalBets: 0,
      wins: 0,
      biggestWin: 0,
      walletAddress: "",
      currentStreak: 0,
      longestStreak: 0,
      bestOddsWon: 0,
      dailyWalkPoints: 0,
      lastWalkDate: "",
      coins: 1000,
      korBalance: 1000,
      referralCode: generate6DigitCode(),
      hasReferred: false,
      referralCount: 0,
      referralEarnings: 0,
      loginStreak: 1,
      lastLoginDate: "",
      quests: [...INITIAL_QUESTS],
      activeTheme: "default",
      unclaimedAllianceRewards: 0,
    });

    // Force full reload to ensure clean slate
    window.location.reload();
  }

  // Register referral code with backend
  async function handleReferral(
    code: string,
  ): Promise<{ success: boolean; message?: string }> {
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
      if (!res.ok) {
        console.warn("Referral failed", json);
        return { success: false, message: json.error || "Failed" };
      } else {
        console.log("Referral registered", json);
        // Refresh profile to update referral stats
        if (walletState.address) {
          setTimeout(() => refreshProfile(walletState.address!), 1000);
        }
        return { success: true, message: json.message || "Referral linked!" };
      }
    } catch (err: any) {
      console.error("Referral error", err);
      return { success: false, message: "Connection failed" };
    }
  }

  async function handleBetPlacement(
    match: Match,
    selection: Bet["selection"],
    stake: number,
  ): Promise<boolean> {
    if (!match) return false;
    if (stake > userStats.korBalance) return false; // Use userStats which is synced
    if (!match.odds) {
      console.error("Invalid match or odds data:", match);
      return false;
    }

    // Call API to place bet
    try {
      const oddValue = match.odds[selection as keyof typeof match.odds] || 1.5;

      const res = await fetch(`${API_URL}/api/minigame/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletState.address || userStats.walletAddress,
          matchId: match.id,
          selection,
          stake,
          odds: oddValue,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local state
        setBalance(data.newBalance);
        setUserStats((prev) => ({ ...prev, korBalance: data.newBalance }));

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
        addTransaction("bet", stake, "kor", `Match wager`);

        // Update Quest Progress
        setUserStats((prev) => ({
          ...prev,
          quests: prev.quests.map((q) =>
            q.type === "bet"
              ? { ...q, progress: q.progress + Number(stake) }
              : q,
          ),
        }));

        setBettingOn(null);
        return true;
      } else {
        notify("Bet Failed: " + data.error, "error");
        return false;
      }
    } catch (e) {
      console.error("Bet placement failed", e);
      notify("Failed to place bet", "error");
      return false;
    }
  }

  // Bet Slip Handlers
  function handleAddToBetSlip(
    match: Match,
    selection: "home" | "draw" | "away" | "gg" | "nogg",
    odds: number,
  ) {
    // Check if selection already exists
    const exists = betSlipSelections.some(
      (sel) => sel.matchId === match.id && sel.selection === selection,
    );
    if (exists) {
      // Remove if already selected
      setBetSlipSelections((prev) =>
        prev.filter(
          (sel) => !(sel.matchId === match.id && sel.selection === selection),
        ),
      );
      return;
    }

    // Add new selection
    const newSelection: BetSlipSelection = {
      matchId: match.id,
      match,
      selection,
      odds,
      selectionLabel: selection,
    };
    setBetSlipSelections((prev) => [...prev, newSelection]);
  }

  function handleRemoveFromBetSlip(matchId: string) {
    setBetSlipSelections((prev) =>
      prev.filter((sel) => sel.matchId !== matchId),
    );
  }

  function handleClearBetSlip() {
    setBetSlipSelections([]);
  }

  async function handlePlaceBetSlip(
    stake: number,
    betType: "single" | "accumulator",
  ): Promise<boolean> {
    if (betSlipSelections.length === 0) return false;

    try {
      if (betType === "single") {
        // Place each selection as a separate bet
        // Note: This logic assumes all succeed or we handle partials.
        // For simplicity, we return true if at least the process finished without exception.

        let successCount = 0;

        for (const sel of betSlipSelections) {
          const oddValue = sel.odds;
          const res = await fetch(`${API_URL}/api/minigame/bet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress: walletState.address || userStats.walletAddress,
              matchId: sel.matchId,
              selection: sel.selection,
              stake,
              odds: oddValue,
              betType: "single",
            }),
          });
          const data = await res.json();
          if (data.success) {
            successCount++;
            const newBet: Bet = {
              id: data.betId || `bet-${Date.now()}-${Math.random()}`,
              matchId: sel.matchId,
              selection: sel.selection,
              odds: oddValue,
              stake,
              potentialReturn: stake * oddValue,
              status: "pending",
              timestamp: Date.now(),
              txHash: generateHash(),
              betType: "single",
            };
            setActiveBets((prev) => [...prev, newBet]);
          }
        }

        const totalStake = stake * betSlipSelections.length;
        setUserStats((s) => ({
          ...s,
          korBalance: s.korBalance - totalStake,
          totalBets: s.totalBets + betSlipSelections.length,
        }));
        setBalance((prev) => prev - totalStake);
        addTransaction(
          "bet",
          totalStake,
          "kor",
          `${betSlipSelections.length} single bets`,
        );
      } else {
        // Place accumulator bet
        const accumulatorId = `acc-${Date.now()}`;
        const totalOdds = betSlipSelections.reduce(
          (acc, sel) => acc * sel.odds,
          1,
        );

        const res = await fetch(`${API_URL}/api/minigame/bet-accumulator`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: walletState.address || userStats.walletAddress,
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
        if (data.success) {
          // Create bet entries for each selection in the accumulator
          betSlipSelections.forEach((sel) => {
            const newBet: Bet = {
              id: `${accumulatorId}-${sel.matchId}`,
              matchId: sel.matchId,
              selection: sel.selection,
              odds: sel.odds,
              stake: stake,
              potentialReturn: stake * totalOdds,
              status: "pending",
              timestamp: Date.now(),
              txHash: generateHash(),
              betType: "accumulator",
              accumulatorId,
            };
            setActiveBets((prev) => [...prev, newBet]);
          });

          setUserStats((s) => ({
            ...s,
            korBalance: s.korBalance - stake,
            totalBets: s.totalBets + 1,
          }));
          setBalance((prev) => prev - stake);
          addTransaction(
            "bet",
            stake,
            "kor",
            `Accumulator (${betSlipSelections.length} selections)`,
          );
        } else {
          notify("Accumulator Bet Failed: " + data.error, "error");
          return false;
        }
      }

      // Clear bet slip after placing
      setBetSlipSelections([]);
      return true;
    } catch (e) {
      console.error("Bet slip placement failed", e);
      notify("Failed to place bets", "error");
      return false;
    }
  }

  async function handleCheckIn(): Promise<{
    success: boolean;
    message: string;
    reward?: number;
  }> {
    if (!walletState.address) {
      console.warn("[CHECK-IN] Abandoned: No wallet address connected");
      return { success: false, message: "Wallet not connected" };
    }

    console.log(`[CHECK-IN] Starting claim for ${walletState.address}...`);

    try {
      const res = await fetch(`${API_URL}/api/user/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: walletState.address }),
      });
      const data = await res.json();
      console.log("[CHECK-IN] Server response:", data);

      if (data.success) {
        console.log(`[CHECK-IN] Success! Reward: ${data.reward}`);
        // Update local stats
        setUserStats((prev) => ({
          ...prev,
          coins: prev.coins + data.reward,
          canCheckIn: false,
          nextCheckInIn: 4,
          lastCheckInDate: new Date(),
        }));

        addTransaction(
          "bonus",
          data.reward,
          "coins",
          "4-Hourly Check-in Bonus",
        );
        return { success: true, message: data.message, reward: data.reward };
      } else {
        return { success: false, message: data.error };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: "Network error" };
    }
  }

  async function handleQuestAction(
    id: string,
    openUrl: boolean = true,
    verificationCode?: string,
  ) {
    const quest = userStats.quests.find((q) => q.id === id);
    if (!quest) return;

    // VERY robust lookup for base quest data
    const baseData = INITIAL_QUESTS.find((iq) => 
      iq.id === quest.id || 
      iq.id === (quest as any).questId ||
      iq.title.toLowerCase() === quest.title.toLowerCase()
    );
    
    const targetUrl = quest.externalUrl || baseData?.externalUrl;
    const requiresVerification = quest.requiresVerification ?? baseData?.requiresVerification ?? false;

    if (quest.category === "social" || quest.type === "external" || (baseData && (baseData.category === "social" || baseData.type === "external"))) {
      // Mark as visited locally for the UI
      if (typeof window !== "undefined") {
        localStorage.setItem(`quest_visited_${id}`, "true");
      }

      if (openUrl && targetUrl) {
        window.open(targetUrl, "_blank");
      }

      if (requiresVerification && openUrl) {
        // Just opened the link, don't mark as complete yet
        setUserStats(prev => ({...prev}));
      } else {
        // Mark as verified/visit in LS
        if (typeof window !== "undefined") {
           localStorage.setItem(`quest_visited_${id}`, "true");
           if (requiresVerification && verificationCode) {
             localStorage.setItem(`quest_verify_${id}`, verificationCode);
           }
        }

        // 1. UPDATE SERVER (DB)
        fetch(`${API_URL}/api/user/submit-quest-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: userStats.walletAddress,
            questId: id,
            verificationCode:
              verificationCode || localStorage.getItem(`quest_verify_${id}`),
          }),
        }).catch((err) => console.error("Quest submission DB error:", err));

        // 2. UPDATE LOCAL STATE - Transition to CLAIMABLE, not COMPLETED
        console.log("QUEST_DEBUG: handleQuestAction updating local state for ID:", id);
        
        // Force React Query to refetch so ProfileScreen sees the change
        queryClient.invalidateQueries({ queryKey: ['profile'] });

        setUserStats((prev) => {
          const newQuests = prev.quests.map((q) =>
            q.id === id ? { ...q, progress: Math.max(q.progress, q.target || 1), status: "CLAIMABLE" } : q
          );
          console.log("QUEST_DEBUG: New status for quest:", newQuests.find(q => q.id === id)?.status);
          return {
            ...prev,
            quests: newQuests
          };
        });
      }
    } else if (quest.type === "click") {
      // Simple click complete
      if (typeof window !== "undefined") {
        localStorage.setItem(`quest_completed_${id}`, "true");
      }
      setUserStats((prev) => ({
        ...prev,
        quests: prev.quests.map((q) =>
          q.id === id ? { ...q, progress: q.target } : q,
        ),
      }));
    }
  }

  async function handleQuestClaim(
    id: string,
    onSuccess?: (reward: number) => void,
  ) {
    const quest = userStats.quests.find((q) => q.id === id);
    if (!quest) return;

    const isSocial = quest.category === "social" || quest.type === "external";
    const hasSubmission =
      typeof window !== "undefined"
        ? !!localStorage.getItem(`quest_verify_${id}`)
        : false;
    const isReady =
      isSocial && quest.requiresVerification
        ? hasSubmission
        : quest.progress >= quest.target;

    if (!isReady) {
      notify?.("Complete the quest first before claiming.", "error");
      return;
    }

    // Server-First Approach: DB decides if reward is valid
    try {
      console.log(`[QUEST] Syncing quest ${id} with DB...`);
      const res = await fetch(`${API_URL}/api/user/claim-social-reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: userStats.walletAddress,
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

        // 2. Update local state immediately
        setUserStats((prev) => ({
          ...prev,
          coins: (prev.coins || 0) + reward,
          quests: prev.quests.map((q) => {
            if (q.id === id) {
              return { ...q, completed: true, status: "CLAIMED", progress: q.target || 1 };
            }
            return q;
          }),
        }));
        addTransaction(
          "redeem",
          reward,
          "coins",
          `Quest Reward: ${quest.title}`,
        );

        // 3. Trigger the success modal in ProfileScreen
        onSuccess?.(reward);

        // 4. Re-sync profile balance from server
        if (userStats.walletAddress) refreshProfile(userStats.walletAddress);
      } else {
        console.error(`[QUEST] DB Error:`, result.error);
        notify?.(result.error || "Failed to claim reward", "error");
      }
    } catch (err) {
      console.error("[QUEST] API call failed:", err);
      notify?.("Connection failed. Please try again.", "error");
    }
  }

  async function handleRedeem(
    code: string,
  ): Promise<{ success: boolean; message?: string }> {
    if (!code || !userStats.walletAddress) {
      return { success: false, message: "Invalid input" };
    }

    try {
      // Verify coupon server-side - codes are hidden on backend
      const result = await verifyCoupon(code, userStats.walletAddress);

      if (!result.success) {
        return { success: false, message: result.error };
      }

      // Apply reward based on type
      if (result.type === "coins" && typeof result.value === "number") {
        setUserStats((prev) => ({
          ...prev,
          coins: prev.coins + (result.value as number),
        }));
        addTransaction("redeem", result.value, "coins", `Coupon: ${code}`);
      } else if (result.type === "theme" && typeof result.value === "string") {
        // Apply theme
        setUserStats((prev) => ({
          ...prev,
          activeTheme: result.value as AppTheme,
        }));
      }

      return { success: true, message: result.message };
    } catch (error: any) {
      console.error("Redeem error:", error);
      return { success: false, message: "Connection failed" };
    }
  }

  function updateUserStatsOnResult(wins: number) {
    setUserStats((prev) => ({
      ...prev,
      wins: prev.wins + wins,
      quests: prev.quests.map((q) => {
        if (q.type === "play") return { ...q, progress: q.progress + 1 };
        if (q.type === "win" && wins > 0)
          return { ...q, progress: q.progress + wins };
        return q;
      }),
    }));
  }

  function getCurrentGameMinute() {
    if (gameState === "BETTING") return 0;
    if (gameState === "RESULT") return 90;
    const progress = (MATCH_DURATION_SEC - timer) / MATCH_DURATION_SEC;
    return Math.max(0, Math.min(90, Math.floor(progress * 90)));
  }

  if (appView === "landing")
    return <LandingPage onEnter={() => setAppView("selection")} />;
  if (appView === "selection")
    return (
      <GameSelection
        onSelectFootball={() => {
          if (walletState.isConnected && walletState.isVerified) {
            setAppView("main");
          } else {
            setAppView("entryChoice");
          }
        }}
      />
    );
  if (appView === "entryChoice")
    return (
      <EntryChoice
        onNewUser={() => setAppView("onboarding")}
        onReturningUser={() => setAppView("connect")}
      />
    );
  if (appView === "onboarding")
    return <Onboarding onFinish={() => setAppView("alliance")} />;
  if (appView === "alliance")
    return (
      <AllianceSetup
        apiUrl={API_URL}
        onComplete={(data) => {
          setRegistrationData(data);
          setAppView("connect");
        }}
      />
    );
  if (appView === "connect")
    return <ConnectWallet onConnected={handleWalletConnected} />;
  if (appView === "sign")
    return (
      <SignMessage
        address={userStats.walletAddress}
        onSigned={handleMessageSigned}
        onCancel={handleLogout}
      />
    );
  if (appView === "welcome")
    return isNewUser ? (
      <WelcomeScreen
        username={userStats.username}
        onProceed={handleProceedFromWelcome}
      />
    ) : (
      <ReturningUserScreen
        username={userStats.username}
        onProceed={handleProceedFromWelcome}
        coins={userStats.coins}
        korBalance={userStats.korBalance}
      />
    );

  // DEBUG OVERLAY
  return (
    <div
      className={cn(
        "min-h-screen font-sans text-dark bg-light flex flex-col transition-all",
        themeTransition && "blur-sm",
        betSlipSelections.length > 0 && "pb-20 lg:pb-0",
      )}
    >
      <header className="bg-dark text-white sticky top-0 z-110 shadow-md">
        <div className="flex justify-between items-center p-3 h-16">
          <div className="font-sport font-black text-2xl italic tracking-tighter text-white">
            KICKOFF<span className="text-pitch">RIVALS</span>
          </div>
        </div>
        {/* Navigation Menu */}
        <nav className="border-t border-gray-700">
          <div className="flex justify-around items-center">
            {[
              {
                id: "home",
                label: "Matches",
                icon: <IconHome className="w-5 h-5" />,
              },
              {
                id: "league",
                label: "Tables",
                icon: <IconTable className="w-5 h-5" />,
              },
              {
                id: "bets",
                label: "My Bets",
                icon: <IconTicket className="w-5 h-5" />,
              },
              {
                id: "leaderboard",
                label: "Leaderboard",
                icon: <IconTrophy className="w-5 h-5" />,
              },
              {
                id: "profile",
                label: "Profile",
                icon: <IconUser className="w-5 h-5" />,
              },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex flex-col items-center flex-1 py-2 transition-all ${
                  activeTab === t.id
                    ? "text-pitch border-b-2 border-pitch"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t.icon}
                <span
                  className={`text-[9px] font-bold uppercase mt-1 ${
                    activeTab === t.id ? "opacity-100" : "opacity-70"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      {activeTab === "home" && (
        <div className="p-3 max-w-md mx-auto w-full">
          {/* League Selector */}
          {/* <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
            {LEAGUES.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLeagueId(l.id)}
                className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-sm ${selectedLeagueId === l.id ? "bg-dark text-white ring-1 ring-pitch" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
              >
                {l.name}
              </button>
            ))}
          </div> */}

          {/* Timer Banner */}
          <div className="bg-linear-to-r from-brand-dark to-dark rounded-xl p-4 text-center mb-6 shadow-card border-l-4 border-pitch relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 text-6xl font-sport font-black italic -rotate-12 translate-x-2 -translate-y-2">
              LIVE
            </div>
            <h2 className="font-mono text-[10px] uppercase text-brand-light tracking-widest mb-1">
              {gameState} PHASE
            </h2>
            <div className="font-mono text-4xl font-bold text-white tracking-wider tabular-nums">
              00:{timer < 10 ? `0${timer}` : timer}
            </div>
          </div>

          <div className="space-y-4">
            {matches
              .filter((m) => m.leagueId === selectedLeagueId)
              .map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  minute={getCurrentGameMinute()}
                  displayScore={
                    (m.status === "FINISHED" || m.status === "RESULT") &&
                    m.result
                      ? { home: m.result.homeScore, away: m.result.awayScore }
                      : m.currentScore
                  }
                  onBet={setBettingOn}
                  onWatch={(match) => setWatchingMatchId(match.id)}
                  onAddToBetSlip={handleAddToBetSlip}
                />
              ))}
          </div>
        </div>
      )}

      {activeTab === "league" && (
        <main className="p-3 max-w-md mx-auto w-full">
          <LeagueTable
            entries={leagueTables[selectedLeagueId] || []}
            currentLeagueId={selectedLeagueId}
            onLeagueChange={setSelectedLeagueId}
            userStats={userStats}
          />
        </main>
      )}
      {activeTab === "bets" && (
        <main className="p-3 max-w-md mx-auto w-full space-y-4">
          <div className="flex bg-gray-200 p-1 rounded-xl overflow-hidden shadow-inner">
            <button
              onClick={() => setBetTab("ongoing")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                betTab === "ongoing"
                  ? "bg-white text-brand shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setBetTab("ended")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                betTab === "ended"
                  ? "bg-white text-brand shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              History
            </button>
          </div>
          <div className="space-y-3">
            {activeBets
              .filter((b) =>
                betTab === "ongoing"
                  ? b.status === "pending"
                  : b.status !== "pending",
              )
              .map((b, i) => (
                <div
                  key={`${b.id}-${i}`}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 group hover:border-brand/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        {b.id}
                      </p>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {b.betType === "accumulator"
                          ? "Accumulator Selection"
                          : "Single Bet"}
                      </div>
                      <div className="font-bold text-dark text-sm">
                        {b.homeTeamName} vs {b.awayTeamName}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(b.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div
                      className={`text-[9px] font-bold uppercase px-2 py-1 rounded border shadow-sm ${
                        b.status === "won"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : b.status === "lost"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {b.status}
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-gray-50">
                    <div>
                      <div className="font-mono text-xs font-bold text-dark">
                        {b.selection.toUpperCase()}{" "}
                        <span className="text-gray-300 mx-1">@</span>{" "}
                        <span className="text-brand">{b.odds}</span>
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 mt-1">
                        Stake: {b.stake} KOR • Return: {b.potentialReturn} KOR
                      </div>
                    </div>
                    {b.homeScore !== null && b.awayScore !== null && (
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                          Score
                        </div>
                        <div className="font-mono font-bold text-dark bg-gray-50 px-2 py-1 rounded">
                          {b.homeScore} - {b.awayScore}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </main>
      )}
      {activeTab === "profile" && (
        <main className="p-3 max-w-md mx-auto w-full">
          <ProfileScreen
            stats={userStats}
            onLogout={handleLogout}
            onRedeem={handleRedeem}
            onQuestClaim={handleQuestClaim}
            onQuestAction={handleQuestAction}
            onReferral={handleReferral}
            onSystemSync={handleAdminSyncRequest}
            onOpenWallet={() => setShowWallet(true)}
            onClaimAllianceRewards={handleClaimAllianceRewards}
            onCheckIn={handleCheckIn}
            onClaimWinnings={onClaimWinnings}
            onSwapRequest={() => setShowSwapConfirm(true)}
            notify={notify}
          />
        </main>
      )}

      {activeTab === "leaderboard" && (
        <main className="p-3 w-full">
          <Leaderboard />
        </main>
      )}

      {showWallet && (
        <WalletModal
          onClose={() => setShowWallet(false)}
          onSwapRequest={() => {
            setShowWallet(false);
            setShowSwapConfirm(true);
          }}
          currentBalance={balance}
          userStats={userStats}
          onWalkReward={() => {}}
        />
      )}
      {showSwapConfirm && (
        <SwapConfirm
          coins={userStats.coins}
          onConfirm={async () => {
            const amount =
              Math.floor(userStats.coins / CONVERSION_RATE) * CONVERSION_RATE;

            // Call API
            try {
              const res = await fetch(`${API_URL}/api/user/convert-coins`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  walletAddress: userStats.walletAddress,
                  amount,
                }),
              });
              const data = await res.json();

              if (data.success) {
                setUserStats((s) => ({
                  ...s,
                  coins: data.coins,
                  korBalance: data.korBalance,
                }));
                setBalance(data.korBalance);
                addTransaction("convert", amount, "coins", "Swapped for KOR");
              } else {
                notify("Swap failed: " + data.error, "error");
              }
            } catch (e) {
              console.error(e);
            }
            setShowSwapConfirm(false);
          }}
          onCancel={() => setShowSwapConfirm(false)}
        />
      )}

      {/* Mystery box removed - no spinner UI */}

      {watchingMatchId && matches.find((m) => m.id === watchingMatchId) && (
        <SimulationScreen
          match={matches.find((m) => m.id === watchingMatchId)!}
          result={matches.find((m) => m.id === watchingMatchId)!.result!}
          currentMinute={getCurrentGameMinute()}
          onFinish={() => setWatchingMatchId(null)}
        />
      )}
      {bettingOn && (
        <BetModal
          match={bettingOn}
          balance={balance}
          onClose={() => setBettingOn(null)}
          onPlaceBet={handleBetPlacement}
        />
      )}
      {showAdminAuth && (
        <AdminAuth
          onAuthSuccess={handleAdminAuthSuccess}
          onCancel={() => setShowAdminAuth(false)}
        />
      )}
      {showAdmin && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-600 flex items-center justify-center">
              Loading admin...
            </div>
          }
        >
          <AdminPortal
            coupons={coupons}
            setCoupons={setCoupons}
            quests={userStats.quests}
            setQuests={(q: DailyQuest[]) =>
              setUserStats((p) => ({ ...p, quests: q }))
            }
            onClose={() => setShowAdmin(false)}
            sessionToken={adminSessionToken || ""}
            matches={matches}
            onRefreshMatches={fetchMatches}
          />
        </Suspense>
      )}

      {/* Bet Slip - Always visible at bottom */}
      {appView === "main" && (
        <BetSlip
          selections={betSlipSelections}
          balance={userStats.korBalance}
          onRemoveSelection={handleRemoveFromBetSlip}
          onClearAll={handleClearBetSlip}
          onPlaceBet={handlePlaceBetSlip}
        />
      )}

      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] max-w-[90%] w-full flex justify-center animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div
            className={cn(
              "px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md",
              notification.type === "success"
                ? "bg-green-500/90 border-green-400 text-white"
                : notification.type === "error"
                ? "bg-red-500/90 border-red-400 text-white"
                : "bg-blue-500/90 border-blue-400 text-white",
            )}
          >
            {notification.type === "success" ? (
              <IconCheck className="w-5 h-5" />
            ) : notification.type === "error" ? (
              <IconZap className="w-5 h-5" />
            ) : (
              <IconInfo className="w-4 h-4" />
            )}
            <span className="font-bold text-sm tracking-wide">
              {notification.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
