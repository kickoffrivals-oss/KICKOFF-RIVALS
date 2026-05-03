import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  real,
  json,
  serial,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// LEAGUES TABLE
// ==========================================
export const leagues = pgTable("leagues", {
  id: varchar("id", { length: 10 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// TEAMS TABLE
// ==========================================
export const teams = pgTable(
  "teams",
  {
    id: varchar("id", { length: 10 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    leagueId: varchar("league_id", { length: 10 })
      .notNull()
      .references(() => leagues.id),
    strength: integer("strength").default(70).notNull(),
    color: varchar("color", { length: 20 }).default("#000000").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    leagueIdx: index("teams_league_idx").on(table.leagueId),
  })
);

// ==========================================
// SEASONS TABLE
// ==========================================
export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  isActive: boolean("is_active").default(true).notNull(),
  currentRound: integer("current_round").default(1).notNull(),
  vrfRequestId: varchar("vrf_request_id", { length: 100 }),
  vrfSeed: varchar("vrf_seed", { length: 100 }),
});

// ==========================================
// USERS TABLE
// ==========================================
export const users = pgTable(
  "users",
  {
    walletAddress: varchar("wallet_address", { length: 42 }).primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    coins: integer("coins").default(5000).notNull(),
    doodlBalance: integer("doodl_balance").default(1000).notNull(),
    unclaimedBalance: integer("unclaimed_balance").default(0).notNull(),
    allianceLeagueId: varchar("alliance_league_id", { length: 10 }).references(
      () => leagues.id
    ),
    allianceTeamId: varchar("alliance_team_id", { length: 10 }).references(
      () => teams.id
    ),
    referralCode: varchar("referral_code", { length: 10 }).unique(),
    referredBy: varchar("referred_by", { length: 42 }),
    referralCount: integer("referral_count").default(0).notNull(),
    referralEarnings: integer("referral_earnings").default(0).notNull(),
    gamePlays: integer("game_plays").default(0).notNull(),
    totalBets: integer("total_bets").default(0).notNull(),
    wins: integer("wins").default(0).notNull(),
    biggestWin: integer("biggest_win").default(0).notNull(),
    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    bestOddsWon: real("best_odds_won").default(0).notNull(),
    dailyWalkPoints: integer("daily_walk_points").default(0).notNull(),
    lastWalkDate: varchar("last_walk_date", { length: 20 }),
    loginStreak: integer("login_streak").default(0).notNull(),
    lastLoginDate: varchar("last_login_date", { length: 20 }),
    lastWelcomeGiftDate: timestamp("last_welcome_gift_date"),
    lastCheckInDate: timestamp("last_check_in_date"),
    unclaimedAllianceRewards: integer("unclaimed_alliance_rewards")
      .default(0)
      .notNull(),
    level: integer("level").default(1).notNull(),
    xp: integer("xp").default(0).notNull(),
    activeTheme: varchar("active_theme", { length: 20 }).default("default"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(table.username),
    referralCodeIdx: index("users_referral_code_idx").on(table.referralCode),
  })
);

// ==========================================
// MATCHES TABLE
// ==========================================
export const matches = pgTable(
  "matches",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    leagueId: varchar("league_id", { length: 10 })
      .notNull()
      .references(() => leagues.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id),
    round: integer("round").notNull(),
    homeTeamId: varchar("home_team_id", { length: 10 })
      .notNull()
      .references(() => teams.id),
    awayTeamId: varchar("away_team_id", { length: 10 })
      .notNull()
      .references(() => teams.id),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    status: varchar("status", { length: 20 }).default("SCHEDULED").notNull(),
    startTime: timestamp("start_time").notNull(),
    liveStartTime: timestamp("live_start_time"),
    oddsHome: real("odds_home").default(2.0).notNull(),
    oddsDraw: real("odds_draw").default(3.0).notNull(),
    oddsAway: real("odds_away").default(2.5).notNull(),
    oddsGg: real("odds_gg").default(1.8).notNull(),
    oddsNogg: real("odds_nogg").default(1.9).notNull(),
    roundHash: varchar("round_hash", { length: 100 }),
    commitHash: varchar("commit_hash", { length: 100 }),
    blockHash: varchar("block_hash", { length: 100 }),
    vrfRequestId: varchar("vrf_request_id", { length: 100 }),
    vrfSeed: varchar("vrf_seed", { length: 100 }),
    isVerifiable: boolean("is_verifiable").default(false).notNull(),
    events: json("events").$type<MatchEvent[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    seasonIdx: index("matches_season_idx").on(table.seasonId),
    leagueIdx: index("matches_league_idx").on(table.leagueId),
    statusIdx: index("matches_status_idx").on(table.status),
    roundIdx: index("matches_round_idx").on(table.round),
  })
);

// ==========================================
// BETS TABLE
// ==========================================
export const bets = pgTable(
  "bets",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    walletAddress: varchar("wallet_address", { length: 42 })
      .notNull()
      .references(() => users.walletAddress),
    matchId: varchar("match_id", { length: 50 })
      .notNull()
      .references(() => matches.id),
    selection: varchar("selection", { length: 10 }).notNull(), // 'home', 'draw', 'away', 'gg', 'nogg'
    odds: real("odds").notNull(),
    stake: integer("stake").notNull(),
    potentialReturn: integer("potential_return").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'won', 'lost'
    betType: varchar("bet_type", { length: 20 }).default("single").notNull(), // 'single', 'accumulator'
    accumulatorId: varchar("accumulator_id", { length: 50 }),
    txHash: varchar("tx_hash", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    settledAt: timestamp("settled_at"),
  },
  (table) => ({
    walletIdx: index("bets_wallet_idx").on(table.walletAddress),
    matchIdx: index("bets_match_idx").on(table.matchId),
    statusIdx: index("bets_status_idx").on(table.status),
  })
);

// ==========================================
// TRANSACTIONS TABLE
// ==========================================
export const transactions = pgTable(
  "transactions",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    walletAddress: varchar("wallet_address", { length: 42 })
      .notNull()
      .references(() => users.walletAddress),
    type: varchar("type", { length: 20 }).notNull(), // 'deposit', 'bet', 'win', 'withdrawal', 'bonus', 'refund', 'convert', 'redeem', 'referral'
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 10 }).default("kor").notNull(), // 'kor', 'coins'
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    walletIdx: index("transactions_wallet_idx").on(table.walletAddress),
    typeIdx: index("transactions_type_idx").on(table.type),
  })
);

// ==========================================
// COUPONS TABLE
// ==========================================
export const coupons = pgTable("coupons", {
  code: varchar("code", { length: 20 }).primaryKey(),
  type: varchar("type", { length: 20 }).notNull(), // 'theme', 'coins'
  value: varchar("value", { length: 50 }).notNull(), // Theme name or coin amount
  usageLimit: integer("usage_limit").default(1).notNull(),
  currentUsage: integer("current_usage").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// COUPON REDEMPTIONS TABLE
// ==========================================
export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: serial("id").primaryKey(),
    walletAddress: varchar("wallet_address", { length: 42 })
      .notNull()
      .references(() => users.walletAddress),
    couponCode: varchar("coupon_code", { length: 20 })
      .notNull()
      .references(() => coupons.code),
    redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
  },
  (table) => ({
    walletCouponIdx: uniqueIndex("redemption_wallet_coupon_idx").on(
      table.walletAddress,
      table.couponCode
    ),
  })
);

// ==========================================
// USER QUESTS TABLE
// ==========================================
export const userQuests = pgTable(
  "user_quests",
  {
    id: serial("id").primaryKey(),
    walletAddress: varchar("wallet_address", { length: 42 })
      .notNull()
      .references(() => users.walletAddress),
    questId: varchar("quest_id", { length: 20 }).notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    reward: integer("reward").notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    frequency: varchar("frequency", { length: 20 }).notNull(),
    target: integer("target").notNull(),
    progress: integer("progress").default(0).notNull(),
    completed: boolean("completed").default(false).notNull(),
    status: varchar("status", { length: 20 }).default("LIVE").notNull(),
    verifiedAt: timestamp("verified_at"),
    resetAt: timestamp("reset_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    walletIdx: index("user_quests_wallet_idx").on(table.walletAddress),
    questIdx: index("user_quests_quest_idx").on(table.questId),
    walletQuestUnique: uniqueIndex("user_quests_wallet_quest_idx").on(
      table.walletAddress,
      table.questId
    ),
  })
);

// ==========================================
// AUDIT LOGS TABLE
// ==========================================
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    action: varchar("action", { length: 50 }).notNull(),
    actor: varchar("actor", { length: 42 }),
    details: text("details"),
    ip: varchar("ip", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    actionIdx: index("audit_logs_action_idx").on(table.action),
    actorIdx: index("audit_logs_actor_idx").on(table.actor),
  })
);

// ==========================================
// RELATIONS
// ==========================================
export const leaguesRelations = relations(leagues, ({ many }) => ({
  teams: many(teams),
  matches: many(matches),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  league: one(leagues, {
    fields: [teams.leagueId],
    references: [leagues.id],
  }),
  homeMatches: many(matches, { relationName: "homeTeam" }),
  awayMatches: many(matches, { relationName: "awayTeam" }),
}));

export const seasonsRelations = relations(seasons, ({ many }) => ({
  matches: many(matches),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  allianceLeague: one(leagues, {
    fields: [users.allianceLeagueId],
    references: [leagues.id],
  }),
  allianceTeam: one(teams, {
    fields: [users.allianceTeamId],
    references: [teams.id],
  }),
  bets: many(bets),
  transactions: many(transactions),
  quests: many(userQuests),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  league: one(leagues, {
    fields: [matches.leagueId],
    references: [leagues.id],
  }),
  season: one(seasons, {
    fields: [matches.seasonId],
    references: [seasons.id],
  }),
  homeTeam: one(teams, {
    fields: [matches.homeTeamId],
    references: [teams.id],
    relationName: "homeTeam",
  }),
  awayTeam: one(teams, {
    fields: [matches.awayTeamId],
    references: [teams.id],
    relationName: "awayTeam",
  }),
  bets: many(bets),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.walletAddress],
    references: [users.walletAddress],
  }),
  match: one(matches, {
    fields: [bets.matchId],
    references: [matches.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.walletAddress],
    references: [users.walletAddress],
  }),
}));

export const userQuestsRelations = relations(userQuests, ({ one }) => ({
  user: one(users, {
    fields: [userQuests.walletAddress],
    references: [users.walletAddress],
  }),
}));

export const quests = pgTable("quests", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  reward: integer("reward").notNull(),
  type: varchar("type", { length: 20 }).notNull(), 
  frequency: varchar("frequency", { length: 20 }).notNull(),
  target: integer("target").notNull(),
  externalUrl: text("external_url"),
  status: varchar("status", { length: 20 }).default("LIVE").notNull(),
  category: varchar("category", { length: 50 }),
  requiresVerification: boolean("requires_verification").default(false),
  verificationPlaceholder: varchar("verification_placeholder", { length: 255 }),
  verificationType: varchar("verification_type", { length: 50 }),
  verificationTime: integer("verification_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ==========================================
// TYPES
// ==========================================
export type MatchEvent = {
  minute: number;
  description: string;
  type:
  | "goal"
  | "card"
  | "yellow_card"
  | "red_card"
  | "foul"
  | "substitution"
  | "chance"
  | "whistle"
  | "injury"
  | "penalty_shout"
  | "near_miss";
  teamId?: string;
};

// Infer types from schema
export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;

export type Bet = typeof bets.$inferSelect;
export type NewBet = typeof bets.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

export type CouponRedemption = typeof couponRedemptions.$inferSelect;
export type NewCouponRedemption = typeof couponRedemptions.$inferInsert;

export type UserQuest = typeof userQuests.$inferSelect;
export type NewUserQuest = typeof userQuests.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
