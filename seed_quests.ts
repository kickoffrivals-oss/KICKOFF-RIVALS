import { db } from "./app/lib/db";
import { sql } from "drizzle-orm";

const ALL_QUESTS = [
  // Social Quests
  {
    id: "q_social_like",
    title: "Like, Comment & Retweet Post",
    reward: 2500,
    type: "social",
    category: "social",
    frequency: "once",
    target: 1,
    status: "LIVE",
    externalUrl: "https://x.com/Kickoffrivals/status/2034928785825431674",
    requiresVerification: true,
    verificationPlaceholder: "Paste status URL",
    verificationType: "link"
  },
  {
    id: "q_social_follow",
    title: "Follow @kickoffrivals",
    reward: 2500,
    type: "social",
    category: "social",
    frequency: "once",
    target: 1,
    status: "LIVE",
    externalUrl: "https://x.com/KICKOFFRIVALS",
    requiresVerification: true,
    verificationPlaceholder: "@username",
    verificationType: "username"
  },

  // Daily Quests
  { id: "dq_refer_1", title: "Refer 1 Friend", reward: 5000, type: "referral", frequency: "daily", target: 1, status: "LIVE" },
  { id: "dq_win_15", title: "Win 15 games", reward: 12000, type: "win", frequency: "daily", target: 15, status: "LIVE" },
  { id: "dq_win_10", title: "Win 10 games", reward: 8000, type: "win", frequency: "daily", target: 10, status: "LIVE" },
  { id: "dq_win_5_acc", title: "Win 5 accumulated games", reward: 6000, type: "win", frequency: "daily", target: 5, status: "LIVE" },
  { id: "dq_win_15_acc", title: "Win 15 accumulated games", reward: 15000, type: "win", frequency: "daily", target: 15, status: "LIVE" },
  { id: "dq_win_10_acc", title: "Win 10 accumulated games", reward: 10000, type: "win", frequency: "daily", target: 10, status: "LIVE" },
  { id: "dq_win_5", title: "Win 5 games", reward: 4000, type: "win", frequency: "daily", target: 5, status: "LIVE" },
  { id: "dq_play_20", title: "Play 20 Games", reward: 5000, type: "play", frequency: "daily", target: 20, status: "LIVE" },
  { id: "dq_play_50", title: "Play 50 games", reward: 10000, type: "play", frequency: "daily", target: 50, status: "LIVE" },

  // Weekly Quests
  { id: "wq_win_30", title: "Win 30 games", reward: 20000, type: "win", frequency: "weekly", target: 30, status: "LIVE" },
  { id: "wq_win_15_acc", title: "Win 15 accumulated games", reward: 18000, type: "win", frequency: "weekly", target: 15, status: "LIVE" },
  { id: "wq_win_10_acc", title: "Win 10 accumulated games", reward: 12000, type: "win", frequency: "weekly", target: 10, status: "LIVE" },
  { id: "wq_play_50", title: "Play 50 games", reward: 15000, type: "play", frequency: "weekly", target: 50, status: "LIVE" },
  { id: "wq_play_70", title: "Play 70 games", reward: 25000, type: "play", frequency: "weekly", target: 70, status: "LIVE" },

  // Partner Quests
  { id: "p_1", title: "Visit Partner #1", reward: 1000, type: "click", frequency: "daily", target: 1, status: "LIVE", category: "partners", externalUrl: "https://google.com" },
  { id: "p_2", title: "Visit Partner #2", reward: 1000, type: "click", frequency: "daily", target: 1, status: "LIVE", category: "partners", externalUrl: "https://google.com" },
  { id: "p_3", title: "Visit Partner #3", reward: 1000, type: "click", frequency: "daily", target: 1, status: "LIVE", category: "partners", externalUrl: "https://google.com" },
];

async function seedQuests() {
  console.log("Starting to seed quests...");
  
  try {
    // 1. Create table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quests (
        "id" varchar(50) PRIMARY KEY,
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
    `);
    
    // Add columns if they missed the previous run (for safety)
    try { await db.execute(sql`ALTER TABLE quests ADD COLUMN category varchar(50)`); } catch(e){}
    try { await db.execute(sql`ALTER TABLE quests ADD COLUMN requires_verification boolean DEFAULT false`); } catch(e){}
    try { await db.execute(sql`ALTER TABLE quests ADD COLUMN verification_placeholder varchar(255)`); } catch(e){}
    try { await db.execute(sql`ALTER TABLE quests ADD COLUMN verification_type varchar(50)`); } catch(e){}
    try { await db.execute(sql`ALTER TABLE quests ADD COLUMN verification_time integer`); } catch(e){}
    
    console.log("Quests table ready. Inserting quests...");

    // 2. Insert quests
    for (const quest of ALL_QUESTS) {
      console.log(`Inserting quest: ${quest.id} - ${quest.title}`);
      
      const query = sql`
        INSERT INTO quests (id, title, reward, type, frequency, target, external_url, status, category, requires_verification, verification_placeholder, verification_type)
        VALUES (${quest.id}, ${quest.title}, ${quest.reward}, ${quest.type}, ${quest.frequency}, ${quest.target}, ${quest.externalUrl || null}, ${quest.status || 'LIVE'}, ${quest.category || null}, ${quest.requiresVerification || false}, ${quest.verificationPlaceholder || null}, ${quest.verificationType || null})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          reward = EXCLUDED.reward,
          type = EXCLUDED.type,
          frequency = EXCLUDED.frequency,
          target = EXCLUDED.target,
          external_url = EXCLUDED.external_url,
          status = EXCLUDED.status,
          category = EXCLUDED.category,
          requires_verification = EXCLUDED.requires_verification,
          verification_placeholder = EXCLUDED.verification_placeholder,
          verification_type = EXCLUDED.verification_type;
      `;
      
      await db.execute(query);
    }
    console.log("Quests seeded successfully!");
  } catch (error) {
    console.error("Error seeding quests:", error);
  } finally {
    process.exit(0);
  }
}

seedQuests();
