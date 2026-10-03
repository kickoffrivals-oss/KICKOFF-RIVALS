import fs from "node:fs";
import path from "node:path";
import seedrandom from "seedrandom";
import {
  LEAGUES,
  TEAMS,
  INITIAL_QUESTS,
  ROUND_DURATION_SEC,
  MATCH_DURATION_SEC,
  RESULT_DURATION_SEC,
} from "../constants";
import type { Team, Match, Bet, DailyQuest, UserStats, LeagueEntry } from "../types";

const STORE_FILE = path.resolve(process.cwd(), ".local_db.json");

interface LocalDatabase {
  users: Record<string, any>;
  matches: Match[];
  bets: Bet[];
  coupons: Record<string, any>;
  currentRound: number;
  seasonId: number;
  roundStartTime: number; // ms timestamp
}

function getInitialData(): LocalDatabase {
  return {
    users: {},
    matches: [],
    bets: [],
    coupons: {
      KICKOFF1000: { code: "KICKOFF1000", type: "COINS", value: 1000, usageLimit: 1000, currentUsage: 0, isActive: true },
      RIVALS5000: { code: "RIVALS5000", type: "COINS", value: 5000, usageLimit: 500, currentUsage: 0, isActive: true },
      WELCOME2026: { code: "WELCOME2026", type: "DOODL", value: 500, usageLimit: 1000, currentUsage: 0, isActive: true },
    },
    currentRound: 1,
    seasonId: 1,
    roundStartTime: Date.now(),
  };
}

let store: LocalDatabase = loadStore();

function loadStore(): LocalDatabase {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("⚠️ Could not load .local_db.json, using fresh memory store");
  }
  const init = getInitialData();
  saveStore(init);
  return init;
}

function saveStore(data?: LocalDatabase) {
  try {
    const toSave = data || store;
    fs.writeFileSync(STORE_FILE, JSON.stringify(toSave, null, 2), "utf-8");
  } catch (err) {
    console.error("⚠️ Failed to write .local_db.json", err);
  }
}

export function resetLocalDatabase() {
  const init = getInitialData();
  init.matches = generateRoundMatches(init.seasonId, init.currentRound, init.roundStartTime);
  store = init;
  saveStore(init);
  return { success: true, message: "Local database successfully reset to Round 1." };
}

// =========================================================================
// MATCH & ROUND ENGINE (LOCAL FALLBACK)
// =========================================================================

function generateRoundMatches(seasonId: number, roundNumber: number, startTime: number): Match[] {
  const generated: Match[] = [];
  const leaguesList = ["l1", "l2", "l3"];

  for (const leagueId of leaguesList) {
    const leagueTeams = TEAMS[leagueId] || [];
    if (leagueTeams.length < 2) continue;

    const shuffled = [...leagueTeams].sort(() => 0.5 - Math.random());
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 >= shuffled.length) break;

      const home = shuffled[i];
      const away = shuffled[i + 1];
      const matchId = `m-${seasonId}-${roundNumber}-${leagueId}-${i / 2}`;

      const oddsHome = Number((1.5 + Math.random() * 1.5).toFixed(2));
      const oddsDraw = Number((2.8 + Math.random() * 1.2).toFixed(2));
      const oddsAway = Number((1.8 + Math.random() * 1.8).toFixed(2));
      const oddsGg = Number((1.6 + Math.random() * 0.6).toFixed(2));
      const oddsNogg = Number((1.7 + Math.random() * 0.6).toFixed(2));

      generated.push({
        id: matchId,
        leagueId,
        seasonId,
        round: roundNumber,
        homeTeam: home,
        awayTeam: away,
        startTime,
        odds: {
          home: oddsHome,
          draw: oddsDraw,
          away: oddsAway,
          gg: oddsGg,
          nogg: oddsNogg,
        },
        status: "SCHEDULED",
        roundHash: `hash-${roundNumber}-${matchId}`,
        commitHash: `commit-${roundNumber}-${matchId}`,
      });
    }
  }

  return generated;
}

function simulateMatchEvents(homeTeamId: string, awayTeamId: string, homeScore: number, awayScore: number, rng: seedrandom.PRNG) {
  const events = [];
  for (let i = 0; i < homeScore; i++) {
    events.push({
      minute: Math.floor(rng() * 90) + 1,
      type: "goal" as const,
      teamId: homeTeamId,
      description: "Goal scored!",
    });
  }
  for (let i = 0; i < awayScore; i++) {
    events.push({
      minute: Math.floor(rng() * 90) + 1,
      type: "goal" as const,
      teamId: awayTeamId,
      description: "Goal scored!",
    });
  }
  return events.sort((a, b) => a.minute - b.minute);
}

export function updateLocalGameState() {
  const totalCycleMs = (ROUND_DURATION_SEC + MATCH_DURATION_SEC + RESULT_DURATION_SEC) * 1000;
  const bettingMs = ROUND_DURATION_SEC * 1000;
  const liveMs = MATCH_DURATION_SEC * 1000;

  const now = Date.now();
  const elapsed = now - store.roundStartTime;

  // Check if round needs to advance
  if (elapsed >= totalCycleMs || store.matches.length === 0) {
    // Settle pending bets of previous round before advancing
    settleLocalBets();

    store.currentRound += 1;
    store.roundStartTime = now;
    store.matches = generateRoundMatches(store.seasonId, store.currentRound, now);
    saveStore();
    return;
  }

  // Update statuses of current matches
  if (elapsed < bettingMs) {
    // BETTING PHASE
    for (const m of store.matches) {
      m.status = "SCHEDULED";
    }
  } else if (elapsed < bettingMs + liveMs) {
    // LIVE SIMULATION PHASE
    for (const m of store.matches) {
      if (m.status === "SCHEDULED") {
        m.status = "LIVE";
        m.liveStartTime = store.roundStartTime + bettingMs;
        const seed = `sim-seed-${m.id}-${store.currentRound}`;
        const rng = seedrandom(seed);
        m.homeScore = Math.floor(rng() * 4);
        m.awayScore = Math.floor(rng() * 4);
        m.events = simulateMatchEvents(m.homeTeam.id, m.awayTeam.id, m.homeScore, m.awayScore, rng);
        m.vrfSeed = seed;
        m.isVerifiable = true;
      }
    }
  } else {
    // RESULT PHASE
    for (const m of store.matches) {
      if (m.status === "LIVE") {
        m.status = "RESULT";
      }
    }
    settleLocalBets();
  }
  saveStore();
}

function settleLocalBets() {
  const matchMap = new Map(store.matches.map((m) => [m.id, m]));

  // 1. Settle Single Bets
  for (const bet of store.bets) {
    if (bet.status !== "pending" || bet.betType === "accumulator") continue;

    const match = matchMap.get(bet.matchId);
    if (!match || (match.status !== "RESULT" && match.status !== "FINISHED")) continue;

    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;

    let won = false;
    if (bet.selection === "home" && homeScore > awayScore) won = true;
    else if (bet.selection === "away" && awayScore > homeScore) won = true;
    else if (bet.selection === "draw" && homeScore === awayScore) won = true;
    else if (bet.selection === "gg" && homeScore > 0 && awayScore > 0) won = true;
    else if (bet.selection === "nogg" && (homeScore === 0 || awayScore === 0)) won = true;

    bet.status = won ? "won" : "lost";
    bet.settledAt = Date.now();
    bet.homeScore = homeScore;
    bet.awayScore = awayScore;

    // Credit winnings and update stats for user
    const addr = bet.walletAddress?.toLowerCase();
    const user = addr ? store.users[addr] : null;
    if (user) {
      user.totalBets = (user.totalBets || 0) + 1;
      if (won) {
        user.wins = (user.wins || 0) + 1;
        user.doodlBalance = (user.doodlBalance || 0) + bet.potentialReturn;
        user.currentStreak = (user.currentStreak || 0) + 1;
        if (user.currentStreak > (user.longestStreak || 0)) {
          user.longestStreak = user.currentStreak;
        }
        if (bet.potentialReturn > (user.biggestWin || 0)) {
          user.biggestWin = bet.potentialReturn;
        }
        if (bet.odds > (user.bestOddsWon || 0)) {
          user.bestOddsWon = bet.odds;
        }
        user.xp = (user.xp || 0) + Math.floor(bet.stake * 0.5) + 50;
      } else {
        user.currentStreak = 0;
        user.xp = (user.xp || 0) + Math.floor(bet.stake * 0.1);
      }
      user.level = Math.floor(user.xp / 500) + 1;
    }
  }

  // 2. Settle Accumulator Bets (Grouped by accumulatorId)
  const accGroups = new Map<string, Bet[]>();
  for (const bet of store.bets) {
    if (bet.betType === "accumulator" && bet.accumulatorId && bet.status === "pending") {
      const list = accGroups.get(bet.accumulatorId) || [];
      list.push(bet);
      accGroups.set(bet.accumulatorId, list);
    }
  }

  for (const [accId, legs] of accGroups.entries()) {
    const allMatchesFinished = legs.every((leg) => {
      const match = matchMap.get(leg.matchId);
      return match && (match.status === "RESULT" || match.status === "FINISHED");
    });

    if (!allMatchesFinished) continue;

    let allLegsWon = true;
    for (const leg of legs) {
      const match = matchMap.get(leg.matchId)!;
      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;
      let won = false;
      if (leg.selection === "home" && homeScore > awayScore) won = true;
      else if (leg.selection === "away" && awayScore > homeScore) won = true;
      else if (leg.selection === "draw" && homeScore === awayScore) won = true;
      else if (leg.selection === "gg" && homeScore > 0 && awayScore > 0) won = true;
      else if (leg.selection === "nogg" && (homeScore === 0 || awayScore === 0)) won = true;

      leg.status = won ? "won" : "lost";
      leg.settledAt = Date.now();
      leg.homeScore = homeScore;
      leg.awayScore = awayScore;

      if (!won) allLegsWon = false;
    }

    const firstLeg = legs[0];
    const accUserAddr = firstLeg?.walletAddress?.toLowerCase();
    const user = accUserAddr ? store.users[accUserAddr] : null;
    if (user) {
      user.totalBets = (user.totalBets || 0) + 1;
      if (allLegsWon) {
        user.wins = (user.wins || 0) + 1;
        user.doodlBalance = (user.doodlBalance || 0) + firstLeg.potentialReturn;
        user.currentStreak = (user.currentStreak || 0) + 1;
        if (user.currentStreak > (user.longestStreak || 0)) {
          user.longestStreak = user.currentStreak;
        }
        if (firstLeg.potentialReturn > (user.biggestWin || 0)) {
          user.biggestWin = firstLeg.potentialReturn;
        }
        user.xp = (user.xp || 0) + Math.floor(firstLeg.stake * 0.8) + 100;
      } else {
        user.currentStreak = 0;
        user.xp = (user.xp || 0) + Math.floor(firstLeg.stake * 0.1);
      }
      user.level = Math.floor(user.xp / 500) + 1;
    }
  }

  saveStore();
}

// =========================================================================
// USER OPERATIONS (LOCAL FALLBACK)
// =========================================================================

export function getOrCreateLocalUser(params: {
  walletAddress: string;
  username?: string;
  leagueId?: string;
  teamId?: string;
}) {
  const normalized = params.walletAddress.toLowerCase();
  updateLocalGameState();

  if (!store.users[normalized]) {
    const defaultUsername = params.username || `Player_${normalized.slice(2, 6).toUpperCase()}`;
    store.users[normalized] = {
      walletAddress: normalized,
      username: defaultUsername,
      coins: 5000,
      doodlBalance: 1000,
      unclaimedBalance: 0,
      allianceLeagueId: params.leagueId || "l1",
      allianceTeamId: params.teamId || "t1",
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referredBy: null,
      referralCount: 0,
      referralEarnings: 0,
      gamePlays: 0,
      totalBets: 0,
      wins: 0,
      biggestWin: 0,
      currentStreak: 0,
      longestStreak: 0,
      bestOddsWon: 0,
      dailyWalkPoints: 0,
      lastWalkDate: null,
      loginStreak: 1,
      lastLoginDate: new Date().toISOString().split("T")[0],
      lastWelcomeGiftDate: null,
      lastCheckInDate: null,
      unclaimedAllianceRewards: 0,
      level: 1,
      xp: 0,
      activeTheme: "default",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quests: INITIAL_QUESTS.map((q) => ({
        ...q,
        progress: 0,
        completed: false,
        status: "LIVE",
      })),
    };
    saveStore();
    return { user: store.users[normalized], isNew: true };
  }

  const existing = store.users[normalized];
  if (params.username && params.username !== existing.username) {
    existing.username = params.username;
  }
  if (params.leagueId) existing.allianceLeagueId = params.leagueId;
  if (params.teamId) existing.allianceTeamId = params.teamId;
  saveStore();

  return { user: existing, isNew: false };
}

export function getLocalUserProfile(walletAddress: string, username?: string, leagueId?: string, teamId?: string) {
  const { user, isNew } = getOrCreateLocalUser({ walletAddress, username, leagueId, teamId });

  let canClaimWelcomeGift = true;
  let nextGiftClaimIn = 0;
  if (user.lastWelcomeGiftDate) {
    const lastGift = new Date(user.lastWelcomeGiftDate).getTime();
    const hoursSince = (Date.now() - lastGift) / (1000 * 60 * 60);
    canClaimWelcomeGift = hoursSince >= 24;
    nextGiftClaimIn = canClaimWelcomeGift ? 0 : Math.ceil(24 - hoursSince);
  }

  return {
    success: true,
    isNew,
    walletAddress: user.walletAddress,
    username: user.username,
    coins: user.coins ?? 5000,
    korBalance: user.doodlBalance ?? 1000,
    unclaimedBalance: user.unclaimedBalance ?? 0,
    allianceLeagueId: user.allianceLeagueId,
    allianceTeamId: user.allianceTeamId,
    unclaimedAllianceRewards: user.unclaimedAllianceRewards ?? 0,
    gamePlays: user.gamePlays ?? 0,
    canClaimWelcomeGift,
    nextGiftClaimIn,
    referralCode: user.referralCode,
    hasReferred: !!user.referredBy,
    referralCount: user.referralCount ?? 0,
    referralEarnings: user.referralEarnings ?? 0,
    totalBets: user.totalBets ?? 0,
    wins: user.wins ?? 0,
    level: user.level ?? 1,
    xp: user.xp ?? 0,
    biggestWin: user.biggestWin ?? 0,
    currentStreak: user.currentStreak ?? 0,
    longestStreak: user.longestStreak ?? 0,
    bestOddsWon: user.bestOddsWon ?? 0,
    lastCheckInDate: user.lastCheckInDate,
    canCheckIn: true,
    nextCheckInIn: 0,
    quests: user.quests || INITIAL_QUESTS,
  };
}

export function placeLocalBet(params: {
  walletAddress: string;
  matchId: string;
  selection: "home" | "draw" | "away" | "gg" | "nogg";
  odds: number;
  stake: number;
  betType?: "single" | "accumulator";
  accumulatorId?: string;
}) {
  updateLocalGameState();
  const bettingMs = (ROUND_DURATION_SEC + 5) * 1000; // Allow 5s in-flight grace period
  const elapsed = Date.now() - store.roundStartTime;
  if (elapsed >= bettingMs) {
    return { success: false, error: "Betting round is closed! Matches are currently live." };
  }

  const user = store.users[params.walletAddress.toLowerCase()];
  if (!user) return { success: false, error: "User not found" };
  if ((user.coins ?? 5000) < params.stake) return { success: false, error: "Insufficient Coins balance" };

  // Deduct coins immediately when bet is placed
  user.coins = (user.coins ?? 5000) - params.stake;

  const match = store.matches.find((m) => m.id === params.matchId);
  if (match && (match.status === "RESULT" || match.status === "FINISHED")) {
    return { success: false, error: "Betting is closed for this match." };
  }
  const potentialReturn = Math.round(params.stake * params.odds);

  const bet: Bet = {
    id: `bet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    matchId: params.matchId,
    walletAddress: params.walletAddress,
    selection: params.selection,
    odds: params.odds,
    stake: params.stake,
    potentialReturn,
    status: "pending",
    timestamp: Date.now(),
    txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
    betType: params.betType || "single",
    accumulatorId: params.accumulatorId,
    homeTeamName: match?.homeTeam?.name,
    awayTeamName: match?.awayTeam?.name,
  };

  store.bets.push(bet);
  saveStore();

  return {
    success: true,
    bet,
    newBalance: user.coins,
  };
}

export function placeLocalAccumulatorBet(params: {
  walletAddress: string;
  selections: Array<{
    matchId: string;
    selection: "home" | "draw" | "away" | "gg" | "nogg";
    odds: number;
  }>;
  stake: number;
  totalOdds: number;
  accumulatorId: string;
}) {
  updateLocalGameState();
  const bettingMs = (ROUND_DURATION_SEC + 5) * 1000; // Allow 5s in-flight grace period
  const elapsed = Date.now() - store.roundStartTime;
  if (elapsed >= bettingMs) {
    return { success: false, error: "Betting round is closed! Matches are currently live." };
  }

  const user = store.users[params.walletAddress?.toLowerCase()];
  if (!user) return { success: false, error: "User not found" };
  if ((user.coins ?? 5000) < params.stake) return { success: false, error: "Insufficient Coins balance" };

  // Deduct coins immediately when accumulator bet is placed
  user.coins = (user.coins ?? 5000) - params.stake;

  const matchMap = new Map(store.matches.map((m) => [m.id, m]));
  const potentialReturn = Math.round(params.stake * params.totalOdds);

  const bets: Bet[] = params.selections.map((sel) => {
    const match = matchMap.get(sel.matchId);
    return {
      id: `${params.accumulatorId}-${sel.matchId}`,
      matchId: sel.matchId,
      walletAddress: params.walletAddress,
      selection: sel.selection,
      odds: sel.odds,
      stake: params.stake,
      potentialReturn,
      status: "pending",
      timestamp: Date.now(),
      txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      betType: "accumulator",
      accumulatorId: params.accumulatorId,
      homeTeamName: match?.homeTeam?.name,
      awayTeamName: match?.awayTeam?.name,
    };
  });

  store.bets.push(...bets);
  saveStore();

  return {
    success: true,
    bets,
    newBalance: user.coins,
  };
}

export function convertLocalKorToCoins(walletAddress: string, korAmount: number) {
  const user = store.users[walletAddress.toLowerCase()];
  if (!user) return { success: false, error: "User not found" };
  const currentKor = user.doodlBalance ?? 1000;
  if (currentKor < korAmount) {
    return { success: false, error: "Insufficient KOR balance" };
  }
  const coinsGained = korAmount * 10;
  user.doodlBalance = currentKor - korAmount;
  user.coins = (user.coins ?? 5000) + coinsGained;
  saveStore();
  return {
    success: true,
    coins: user.coins,
    korBalance: user.doodlBalance,
    message: `Converted ${korAmount} KOR to ${coinsGained.toLocaleString()} Coins!`,
  };
}

export function getLocalMatches(leagueId?: string) {
  updateLocalGameState();

  const bettingMs = ROUND_DURATION_SEC * 1000;
  const elapsed = Date.now() - store.roundStartTime;
  const timeLeft = Math.max(0, Math.floor((bettingMs - elapsed) / 1000));

  let filtered = store.matches;
  if (leagueId && leagueId !== "all") {
    filtered = filtered.filter((m) => m.leagueId === leagueId);
  }

  return {
    success: true,
    matches: filtered,
    round: store.currentRound,
    seasonId: store.seasonId,
    timeLeft,
    serverTime: new Date().toISOString(),
    gameState: elapsed < bettingMs ? "BETTING" : elapsed < bettingMs + MATCH_DURATION_SEC * 1000 ? "LIVE" : "RESULT",
  };
}

export function getLocalActiveBets(walletAddress: string) {
  const normalized = walletAddress.toLowerCase();
  const userBets = store.bets
    .filter((b) => b.walletAddress?.toLowerCase() === normalized)
    .sort((a, b) => (b.settledAt || b.timestamp || 0) - (a.settledAt || a.timestamp || 0));
  return { success: true, bets: userBets };
}

export function getLocalStandings(leagueId: string): { success: boolean; standings: LeagueEntry[] } {
  const leagueTeams = TEAMS[leagueId] || [];
  const standings: LeagueEntry[] = leagueTeams.map((t, idx) => ({
    teamId: t.id,
    teamName: t.name,
    color: t.color,
    played: 5 + idx,
    won: Math.max(0, 4 - Math.floor(idx / 2)),
    drawn: 1,
    lost: Math.floor(idx / 3),
    goalsFor: 12 - idx,
    goalsAgainst: 5 + idx,
    points: Math.max(3, (4 - Math.floor(idx / 2)) * 3 + 1),
  }));

  standings.sort((a, b) => b.points - a.points);
  return { success: true, standings };
}

export function getLocalLeaderboard() {
  const allUsers = Object.values(store.users);
  allUsers.sort((a, b) => (b.coins || 0) - (a.coins || 0));

  return {
    success: true,
    leaderboard: allUsers.slice(0, 20).map((u, i) => ({
      rank: i + 1,
      walletAddress: u.walletAddress,
      username: u.username,
      coins: u.coins || 0,
      level: u.level || 1,
      wins: u.wins || 0,
      currentStreak: u.currentStreak || 0,
    })),
  };
}

export function verifyLocalCoupon(walletAddress: string, code: string) {
  const coupon = store.coupons[code.toUpperCase()];
  if (!coupon || !coupon.isActive) {
    return { success: false, error: "Invalid coupon code" };
  }

  const user = store.users[walletAddress.toLowerCase()];
  if (!user) return { success: false, error: "User not found" };

  if (coupon.type === "COINS") {
    user.coins = (user.coins || 0) + Number(coupon.value);
  } else if (coupon.type === "DOODL") {
    user.doodlBalance = (user.doodlBalance || 0) + Number(coupon.value);
  }

  coupon.currentUsage += 1;
  saveStore();

  return {
    success: true,
    message: `Redeemed ${coupon.value} ${coupon.type}!`,
    newBalance: user.coins,
  };
}
