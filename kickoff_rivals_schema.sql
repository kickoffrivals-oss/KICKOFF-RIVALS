-- =========================================================================
-- KICKOFF RIVALS - COMPLETE DATABASE SCHEMA & SEED DATA (POSTGRESQL)
-- =========================================================================

-- 1. DROP EXISTING TABLES (IF ANY) IN PROPER ORDER
DROP TABLE IF EXISTS "coupon_redemptions" CASCADE;
DROP TABLE IF EXISTS "coupons" CASCADE;
DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "user_quests" CASCADE;
DROP TABLE IF EXISTS "quests" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "bets" CASCADE;
DROP TABLE IF EXISTS "matches" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "seasons" CASCADE;
DROP TABLE IF EXISTS "leagues" CASCADE;

-- 2. CREATE CORE TABLES
CREATE TABLE "leagues" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "teams" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"league_id" varchar(10) NOT NULL REFERENCES "leagues"("id"),
	"strength" integer DEFAULT 70 NOT NULL,
	"color" varchar(20) DEFAULT '#000000' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"current_round" integer DEFAULT 1 NOT NULL,
	"vrf_request_id" varchar(100),
	"vrf_seed" varchar(100)
);

CREATE TABLE "users" (
	"wallet_address" varchar(42) PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL UNIQUE,
	"coins" integer DEFAULT 5000 NOT NULL,
	"doodl_balance" integer DEFAULT 1000 NOT NULL,
	"unclaimed_balance" integer DEFAULT 0 NOT NULL,
	"alliance_league_id" varchar(10) REFERENCES "leagues"("id"),
	"alliance_team_id" varchar(10) REFERENCES "teams"("id"),
	"referral_code" varchar(10) UNIQUE,
	"referred_by" varchar(42),
	"referral_count" integer DEFAULT 0 NOT NULL,
	"referral_earnings" integer DEFAULT 0 NOT NULL,
	"game_plays" integer DEFAULT 0 NOT NULL,
	"total_bets" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"biggest_win" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"best_odds_won" real DEFAULT 0 NOT NULL,
	"daily_walk_points" integer DEFAULT 0 NOT NULL,
	"last_walk_date" varchar(20),
	"login_streak" integer DEFAULT 0 NOT NULL,
	"last_login_date" varchar(20),
	"last_welcome_gift_date" timestamp,
	"last_check_in_date" timestamp,
	"unclaimed_alliance_rewards" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"active_theme" varchar(20) DEFAULT 'default',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "matches" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"league_id" varchar(10) NOT NULL REFERENCES "leagues"("id"),
	"season_id" integer NOT NULL REFERENCES "seasons"("id"),
	"round" integer NOT NULL,
	"home_team_id" varchar(10) NOT NULL REFERENCES "teams"("id"),
	"away_team_id" varchar(10) NOT NULL REFERENCES "teams"("id"),
	"home_score" integer,
	"away_score" integer,
	"status" varchar(20) DEFAULT 'SCHEDULED' NOT NULL,
	"start_time" timestamp NOT NULL,
	"live_start_time" timestamp,
	"odds_home" real DEFAULT 2 NOT NULL,
	"odds_draw" real DEFAULT 3 NOT NULL,
	"odds_away" real DEFAULT 2.5 NOT NULL,
	"odds_gg" real DEFAULT 1.8 NOT NULL,
	"odds_nogg" real DEFAULT 1.9 NOT NULL,
	"round_hash" varchar(100),
	"commit_hash" varchar(100),
	"block_hash" varchar(100),
	"vrf_request_id" varchar(100),
	"vrf_seed" varchar(100),
	"is_verifiable" boolean DEFAULT false NOT NULL,
	"events" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "bets" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"wallet_address" varchar(42) NOT NULL REFERENCES "users"("wallet_address"),
	"match_id" varchar(50) NOT NULL REFERENCES "matches"("id"),
	"selection" varchar(10) NOT NULL,
	"odds" real NOT NULL,
	"stake" integer NOT NULL,
	"potential_return" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"bet_type" varchar(20) DEFAULT 'single' NOT NULL,
	"accumulator_id" varchar(50),
	"tx_hash" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"settled_at" timestamp
);

CREATE TABLE "coupons" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"type" varchar(20) NOT NULL,
	"value" varchar(50) NOT NULL,
	"usage_limit" integer DEFAULT 1 NOT NULL,
	"current_usage" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "coupon_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" varchar(42) NOT NULL REFERENCES "users"("wallet_address"),
	"coupon_code" varchar(20) NOT NULL REFERENCES "coupons"("code"),
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "redemption_wallet_coupon_unique" UNIQUE ("wallet_address", "coupon_code")
);

CREATE TABLE "quests" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"reward" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"target" integer NOT NULL,
	"external_url" text,
	"status" varchar(20) DEFAULT 'LIVE' NOT NULL,
	"category" varchar(50),
	"requires_verification" boolean DEFAULT false,
	"verification_placeholder" varchar(255),
	"verification_type" varchar(50),
	"verification_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "user_quests" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" varchar(42) NOT NULL REFERENCES "users"("wallet_address"),
	"quest_id" varchar(20) NOT NULL,
	"title" varchar(100) NOT NULL,
	"reward" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"target" integer NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'LIVE' NOT NULL,
	"verified_at" timestamp,
	"reset_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "transactions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"wallet_address" varchar(42) NOT NULL REFERENCES "users"("wallet_address"),
	"type" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'kor' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(50) NOT NULL,
	"actor" varchar(42),
	"details" text,
	"ip" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS "teams_league_idx" ON "teams" ("league_id");
CREATE INDEX IF NOT EXISTS "matches_season_idx" ON "matches" ("season_id");
CREATE INDEX IF NOT EXISTS "matches_league_idx" ON "matches" ("league_id");
CREATE INDEX IF NOT EXISTS "matches_status_idx" ON "matches" ("status");
CREATE INDEX IF NOT EXISTS "matches_round_idx" ON "matches" ("round");
CREATE INDEX IF NOT EXISTS "bets_wallet_idx" ON "bets" ("wallet_address");
CREATE INDEX IF NOT EXISTS "bets_match_idx" ON "bets" ("match_id");
CREATE INDEX IF NOT EXISTS "bets_status_idx" ON "bets" ("status");
CREATE INDEX IF NOT EXISTS "user_quests_wallet_idx" ON "user_quests" ("wallet_address");
CREATE INDEX IF NOT EXISTS "transactions_wallet_idx" ON "transactions" ("wallet_address");

-- =========================================================================
-- 4. INITIAL SEED DATA
-- =========================================================================

-- SEED LEAGUES
INSERT INTO "leagues" ("id", "name", "color") VALUES
('l1', 'Rivals Premier', 'bg-purple-100 border-purple-300'),
('l2', 'Elite LaLiga', 'bg-yellow-100 border-yellow-300'),
('l3', 'Prime Serie A', 'bg-green-100 border-green-300')
ON CONFLICT ("id") DO NOTHING;

-- SEED TEAMS (Rivals Premier)
INSERT INTO "teams" ("id", "name", "league_id", "strength", "color") VALUES
('t1', 'Rivals Utd', 'l1', 88, '#ef4444'),
('t2', 'KOR City', 'l1', 90, '#0ea5e9'),
('t3', 'Elite FC', 'l1', 75, '#111827'),
('t4', 'Striker Athletic', 'l1', 78, '#f97316'),
('t5', 'Goal Rovers', 'l1', 70, '#22c55e'),
('t6', 'Pitch Hotspur', 'l1', 82, '#1e3a8a'),
('t19', 'Vector Chelsea', 'l1', 84, '#2563eb'),
('t20', 'Villa Vibe', 'l1', 79, '#7f1d1d'),
('t21', 'Newcastle Net', 'l1', 81, '#000000'),
('t22', 'Brighton Ballers', 'l1', 76, '#2dd4bf'),
('t23', 'West Ham Win', 'l1', 74, '#9f1239'),
('t24', 'Everton Edge', 'l1', 72, '#1d4ed8')
ON CONFLICT ("id") DO NOTHING;

-- SEED TEAMS (Elite LaLiga)
INSERT INTO "teams" ("id", "name", "league_id", "strength", "color") VALUES
('t7', 'Real Rivals', 'l2', 92, '#eab308'),
('t8', 'Barca Bold', 'l2', 89, '#be185d'),
('t9', 'Atletico Ace', 'l2', 80, '#ef4444'),
('t10', 'Sevilla Striker', 'l2', 76, '#dc2626'),
('t11', 'Valencia Victory', 'l2', 74, '#f97316'),
('t12', 'Villarreal Vision', 'l2', 72, '#facc15'),
('t25', 'Betis Brave', 'l2', 77, '#16a34a'),
('t26', 'Sociedad Sharp', 'l2', 78, '#3b82f6'),
('t27', 'Bilbao Blast', 'l2', 75, '#dc2626'),
('t28', 'Getafe Glory', 'l2', 70, '#2563eb'),
('t29', 'Celta Champion', 'l2', 71, '#60a5fa'),
('t30', 'Mallorca Master', 'l2', 69, '#b91c1c')
ON CONFLICT ("id") DO NOTHING;

-- SEED TEAMS (Prime Serie A)
INSERT INTO "teams" ("id", "name", "league_id", "strength", "color") VALUES
('t13', 'Juve Jet', 'l3', 85, '#000000'),
('t14', 'Milan Master', 'l3', 84, '#b91c1c'),
('t15', 'Inter Icon', 'l3', 86, '#1e3a8a'),
('t16', 'Roma Royal', 'l3', 77, '#9f1239'),
('t17', 'Napoli Noble', 'l3', 81, '#0ea5e9'),
('t18', 'Lazio Legend', 'l3', 73, '#06b6d4'),
('t31', 'Atalanta Ace', 'l3', 79, '#1e40af'),
('t32', 'Fiorentina Flash', 'l3', 76, '#7e22ce'),
('t33', 'Torino Titan', 'l3', 72, '#991b1b'),
('t34', 'Bologna Bold', 'l3', 74, '#be123c'),
('t35', 'Monza Major', 'l3', 70, '#dc2626'),
('t36', 'Sassuolo Star', 'l3', 71, '#15803d')
ON CONFLICT ("id") DO NOTHING;

-- SEED INITIAL SEASON
INSERT INTO "seasons" ("id", "current_round", "is_active", "started_at") 
VALUES (1, 1, true, NOW())
ON CONFLICT ("id") DO NOTHING;

-- SEED INITIAL PROMO COUPONS
INSERT INTO "coupons" ("code", "type", "value", "usage_limit", "current_usage", "is_active") VALUES
('KICKOFF1000', 'COINS', '1000', 1000, 0, true),
('RIVALS5000', 'COINS', '5000', 500, 0, true),
('WELCOME2026', 'DOODL', '500', 1000, 0, true)
ON CONFLICT ("code") DO NOTHING;
