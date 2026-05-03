import { createServerFn } from "@tanstack/react-start";
import { db, users, transactions, userQuests, quests, bets } from "../lib/db";
import { eq, and, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { INITIAL_QUESTS } from "../constants";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ==========================================
// GET OR CREATE USER
// ==========================================

// ==========================================
// INTERNAL LOGIC (Decoupled from createServerFn)
// ==========================================

async function findUniqueUsername(baseUsername: string): Promise<string> {
  const { sql } = await import("drizzle-orm");
  let username = baseUsername.toLowerCase().trim();
  let attempts = 0;
  
  while (true) {
    const candidate = attempts === 0 ? username : `${username}${attempts}`;
    const existing = await db.query.users.findFirst({
      where: sql`lower(${users.username}) = ${candidate}`
    });
    
    if (!existing) return candidate;
    attempts++;
  }
}

const getOrCreateUserSchema = z.object({
  walletAddress: z.string().min(1),
  username: z.string().optional(),
  leagueId: z.string().optional(),
  teamId: z.string().optional(),
  checkOnly: z.boolean().optional(),
});

type GetOrCreateUserInput = z.infer<typeof getOrCreateUserSchema>;

// Internal function to be used by other server functions
export async function getOrCreateUserInternal(data: GetOrCreateUserInput) {
  const normalized = data.walletAddress.toLowerCase();

  // Try to find existing user
  const existingUser = await db.query.users.findFirst({
    where: eq(users.walletAddress, normalized),
    with: { quests: true },
  });

  if (existingUser) {
    // If we have existing user BUT we are passing NEW registration data (username/league),
    // we should update the existing record. This fixed the "not reflecting" issue.
    if (
      (data.username && existingUser.username.toLowerCase() !== data.username.toLowerCase()) ||
      (data.leagueId && !existingUser.allianceLeagueId) ||
      (data.teamId && !existingUser.allianceTeamId)
    ) {
      const updateData: any = {};
      
      if (data.username) {
        // Ensure new username is also unique/lowercased
        updateData.username = await findUniqueUsername(data.username);
      }
      
      if (data.leagueId) updateData.allianceLeagueId = data.leagueId;
      if (data.teamId) updateData.allianceTeamId = data.teamId;

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.walletAddress, normalized))
        .returning();

      return {
        success: true,
        user: updatedUser,
        isNew: false,
      };
    }

    // Check if user has quests, if not, initialize them
    // This helps migrating old users who were created before quests existed
    const userHasQuests = await db.query.userQuests.findFirst({
      where: eq(userQuests.walletAddress, normalized),
    });

    if (!userHasQuests && INITIAL_QUESTS.length > 0) {
      console.log(`[QUESTS] Initializing quests for existing user ${normalized}`);
      const questValues = INITIAL_QUESTS.map((q) => ({
        walletAddress: normalized,
        questId: q.id,
        title: q.title,
        reward: q.reward,
        type: q.type,
        frequency: q.frequency,
        target: q.target,
        status: q.status || "LIVE",
        category: q.category || null,
      }));
      await db.insert(userQuests).values(questValues).onConflictDoNothing();
      
      // Re-fetch existingUser to include quests if it was from 'with: { quests: true }'
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.walletAddress, normalized),
        with: { quests: true },
      });
      if (updatedUser) {
        return { success: true, user: updatedUser, isNew: false };
      }
    }

    return {
      success: true,
      user: existingUser,
      isNew: false,
    };
  }

  if (data.checkOnly) {
    return {
      success: false,
      error: "User not found",
      isNew: true,
    };
  }

  // Find a unique username (case-insensitive)
  const baseName = data.username || `user_${normalized.slice(2, 8)}`;
  const finalUsername = await findUniqueUsername(baseName);
  const referralCode = generateReferralCode();

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        walletAddress: normalized,
        username: finalUsername,
        allianceLeagueId: data.leagueId || null,
        allianceTeamId: data.teamId || null,
        referralCode,
        coins: 5000,
        doodlBalance: 1000,
      })
      .returning();

    // Initialize quests for new user
    if (INITIAL_QUESTS.length > 0) {
      await db.insert(userQuests).values(
        INITIAL_QUESTS.map((q) => ({
          walletAddress: normalized,
          questId: q.id,
          title: q.title,
          reward: q.reward,
          type: q.type,
          frequency: q.frequency,
          target: q.target,
          status: q.status || "LIVE",
          category: q.category || null,
        }))
      );
    }

    // Re-fetch user with quests to ensure we have database-level objects (with integer IDs)
    const newUserWithQuests = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
      with: { quests: true },
    });

    if (!newUserWithQuests) {
      throw new Error("Failed to re-fetch new user");
    }

    return {
      success: true,
      user: newUserWithQuests,
      isNew: true,
    };
  } catch (error: any) {
    // If somehow we still hit a race condition conflict, let findUniqueUsername handle the retry logic by being called again
    // But realistically, findUniqueUsername should result in success on first try now.
    throw error;
  }
}

// ==========================================
// GET OR CREATE USER (Server Function)
// ==========================================

export const getOrCreateUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => getOrCreateUserSchema.parse(data))
  .handler(async ({ data }) => {
    return await getOrCreateUserInternal(data);
  });

// ==========================================
// GET USER PROFILE
// ==========================================

const getUserProfileSchema = z.object({
  walletAddress: z.string().min(1),
  username: z.string().optional(),
  leagueId: z.string().optional(),
  teamId: z.string().optional(),
  checkOnly: z.boolean().optional(),
});

export const getUserProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => getUserProfileSchema.parse(data))
  .handler(async ({ data }) => {
    // Call internal function directly to avoid nested Server Function issues
    const result = await getOrCreateUserInternal({
      walletAddress: data.walletAddress,
      username: data.username,
      leagueId: data.leagueId,
      teamId: data.teamId,
      checkOnly: data.checkOnly,
    });

    if (!result.success || !result.user) {
      return { success: false, error: "Failed to get user" };
    }

    const user = result.user;

    // Check welcome gift status
    let canClaimWelcomeGift = true;
    let nextGiftClaimIn = 0;

    if (user.lastWelcomeGiftDate) {
      const lastGift = new Date(user.lastWelcomeGiftDate);
      const now = new Date();
      const hoursSince =
        (now.getTime() - lastGift.getTime()) / (1000 * 60 * 60);
      canClaimWelcomeGift = hoursSince >= 24;
      nextGiftClaimIn = canClaimWelcomeGift ? 0 : Math.ceil(24 - hoursSince);
    }

    const profileReturn = {
      success: true,
      walletAddress: user.walletAddress,
      username: user.username,
      coins: user.coins,
      korBalance: user.doodlBalance,
      unclaimedBalance: user.unclaimedBalance,
      allianceLeagueId: user.allianceLeagueId,
      allianceTeamId: user.allianceTeamId,
      unclaimedAllianceRewards: user.unclaimedAllianceRewards,
      gamePlays: user.gamePlays,
      canClaimWelcomeGift,
      nextGiftClaimIn,
      referralCode: user.referralCode,
      hasReferred: !!user.referredBy,
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings,
      totalBets: user.totalBets,
      wins: user.wins,
      level: user.level || 1,
      xp: user.xp || 0,
      biggestWin: user.biggestWin || 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      bestOddsWon: user.bestOddsWon || 0,
      lastCheckInDate: user.lastCheckInDate,
      canCheckIn: true,
      nextCheckInIn: 0,
      quests: await (async () => {
        const now = new Date();
        const lastDailyReset = new Date(now);
        lastDailyReset.setUTCHours(4, 0, 0, 0);
        if (now < lastDailyReset) lastDailyReset.setUTCDate(lastDailyReset.getUTCDate() - 1);

        const lastWeeklyReset = new Date(now);
        lastWeeklyReset.setUTCHours(4, 0, 0, 0);
        lastWeeklyReset.setUTCDate(lastWeeklyReset.getUTCDate() - lastWeeklyReset.getUTCDay()); // Sunday is 0
        if (now < lastWeeklyReset) lastWeeklyReset.setUTCDate(lastWeeklyReset.getUTCDate() - 7);

        const userQuestsList = (user as any).quests || [];
        const updatedQuests = [];

        for (const q of userQuestsList) {
          let needsReset = false;
          const resetAt = q.resetAt ? new Date(q.resetAt) : new Date(0);

          if (q.frequency === "daily" && resetAt < lastDailyReset) {
            needsReset = true;
          } else if (q.frequency === "weekly" && resetAt < lastWeeklyReset) {
            needsReset = true;
          }

          if (needsReset) {
            console.log(`[QUESTS] Resetting ${q.id} for user ${user.walletAddress}`);
            // Use both id and walletAddress/questId for maximum safety during update
            await db.update(userQuests)
              .set({ progress: 0, completed: false, status: "LIVE", resetAt: new Date() })
              .where(
                q.id && typeof q.id === 'number' 
                  ? eq(userQuests.id, q.id) 
                  : and(eq(userQuests.walletAddress, user.walletAddress), eq(userQuests.questId, q.questId || q.id))
              );
            updatedQuests.push({ ...q, progress: 0, completed: false, status: "LIVE", resetAt: new Date() });
          } else {
            // Check if progress reached target while in-game (fallback check)
            let completed = q.completed;
            let status = q.status;
            if (!completed && q.progress >= q.target) {
              if (q.type === 'win' || q.type === 'play' || q.type === 'referral') {
                completed = true;
                status = "CLAIMABLE";
              }
            }
            updatedQuests.push({ ...q, completed, status });
          }
        }
        return updatedQuests;
      })(),
      masterQuests: await db.select().from(quests),
      isNew: result.isNew,
    };

    // Calculate check-in status
    if (user.lastCheckInDate) {
      const lastCheckIn = new Date(user.lastCheckInDate);
      const now = new Date();
      const hoursSince = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
      return {
        ...profileReturn,
        canCheckIn: hoursSince >= 4,
        nextCheckInIn: hoursSince >= 4 ? 0 : Math.ceil(4 - hoursSince),
      };
    }

    return profileReturn;
  });

// ==========================================
// REGISTER REFERRAL
// ==========================================

const registerReferralSchema = z.object({
  walletAddress: z.string().min(1),
  referralCode: z.string().min(1),
});

export const registerReferral = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registerReferralSchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.walletAddress.toLowerCase();

    // Get the user
    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.referredBy) {
      return { success: false, error: "Already referred" };
    }

    // Find referrer
    const referrer = await db.query.users.findFirst({
      where: eq(users.referralCode, data.referralCode.toUpperCase()),
    });

    if (!referrer) {
      return { success: false, error: "Referral code not found" };
    }

    if (referrer.walletAddress === user.walletAddress) {
      return { success: false, error: "Cannot refer self" };
    }

    if (user.referredBy) {
      return { success: false, error: "Referral already applied" };
    }

    const REWARD_AMOUNT = 5000;

    // Update user with referrer and reward
    await db
      .update(users)
      .set({
        referredBy: referrer.walletAddress,
        coins: (user.coins || 0) + REWARD_AMOUNT,
      })
      .where(eq(users.walletAddress, user.walletAddress));

    // Log transaction for referred user
    await db.insert(transactions).values({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}-1`,
      walletAddress: user.walletAddress,
      type: "referral",
      amount: REWARD_AMOUNT,
      currency: "coins",
      description: `Welcome Bonus (Referred by ${referrer.username})`,
    });

    // Update referrer's stats
    await db
      .update(users)
      .set({
        referralCount: (referrer.referralCount || 0) + 1,
        referralEarnings: (referrer.referralEarnings || 0) + REWARD_AMOUNT,
        coins: (referrer.coins || 0) + REWARD_AMOUNT,
      })
      .where(eq(users.walletAddress, referrer.walletAddress));

    // Log transaction for referrer
    await db.insert(transactions).values({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}-2`,
      walletAddress: referrer.walletAddress,
      type: "referral",
      amount: REWARD_AMOUNT,
      currency: "coins",
      description: `Referral Bonus: ${user.username}`,
    });

    // Update Referrer Quest Progress
    const refQuest = await db.query.userQuests.findFirst({
      where: and(
        eq(userQuests.walletAddress, referrer.walletAddress),
        eq(userQuests.questId, "dq_refer_1")
      ),
    });

    if (refQuest && !refQuest.completed) {
      const newProgress = refQuest.progress + 1;
      const isCompleted = newProgress >= refQuest.target;
      
      await db
        .update(userQuests)
        .set({
          progress: newProgress,
          completed: isCompleted,
          status: isCompleted ? "CLAIMABLE" : "LIVE"
        })
        .where(eq(userQuests.id, refQuest.id));
      
      console.log(`[QUESTS] Updated referral quest for ${referrer.walletAddress}. Progress: ${newProgress}/${refQuest.target}`);
    }

    return {
      success: true,
      message: "Referral applied! You both earned 5000 coins.",
    };
  });

// ==========================================
// CLAIM WELCOME GIFT
// ==========================================

const claimWelcomeGiftSchema = z.object({
  walletAddress: z.string().min(1),
});

export const claimWelcomeGift = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => claimWelcomeGiftSchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.walletAddress.toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if can claim
    let isFirstTime = !user.lastWelcomeGiftDate;
    let canClaim = true;
    let nextClaimIn = 0;

    if (user.lastWelcomeGiftDate) {
      const lastGift = new Date(user.lastWelcomeGiftDate);
      const now = new Date();
      const hoursSince =
        (now.getTime() - lastGift.getTime()) / (1000 * 60 * 60);
      canClaim = hoursSince >= 24;
      nextClaimIn = Math.ceil(24 - hoursSince);
    }

    if (!canClaim) {
      return {
        success: false,
        error: `Wait ${nextClaimIn} hours`,
      };
    }

    const reward = isFirstTime ? 500 : 100;

    await db
      .update(users)
      .set({
        coins: (user.coins || 0) + reward,
        lastWelcomeGiftDate: new Date(),
      })
      .where(eq(users.walletAddress, normalized));

    return {
      success: true,
      reward,
      message: `Claimed ${reward} coins!`,
    };
  });

// ==========================================
// CONVERT COINS TO KOR
// ==========================================

const convertCoinsSchema = z.object({
  walletAddress: z.string().min(1),
  amount: z.number().min(1000),
});

const CONVERSION_RATE = 1000; // 1000 coins = 100 KOR
const CONVERSION_YIELD = 100;

export const convertCoins = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => convertCoinsSchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.walletAddress.toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const coinsToConvert =
      Math.floor(data.amount / CONVERSION_RATE) * CONVERSION_RATE;

    if (coinsToConvert > (user.coins || 0)) {
      return { success: false, error: "Insufficient coins" };
    }

    const korToAdd = (coinsToConvert / CONVERSION_RATE) * CONVERSION_YIELD;

    const newCoins = (user.coins || 0) - coinsToConvert;
    const newKor = (user.doodlBalance || 0) + korToAdd;

    await db
      .update(users)
      .set({
        coins: newCoins,
        doodlBalance: newKor,
      })
      .where(eq(users.walletAddress, normalized));

    // Log transaction
    await db.insert(transactions).values({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      walletAddress: normalized,
      type: "convert",
      amount: korToAdd,
      currency: "kor",
      description: `Converted ${coinsToConvert} coins to ${korToAdd} KOR`,
    });

    return {
      success: true,
      coins: newCoins,
      korBalance: newKor,
    };
  });

// ==========================================
// CLAIM ALLIANCE REWARDS
// ==========================================

const claimAllianceRewardsSchema = z.object({
  walletAddress: z.string().min(1),
});

export const claimAllianceRewards = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => claimAllianceRewardsSchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.walletAddress.toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const unclaimed = user.unclaimedAllianceRewards || 0;

    if (unclaimed <= 0) {
      return { success: false, error: "No rewards to claim" };
    }

    await db
      .update(users)
      .set({
        coins: (user.coins || 0) + unclaimed,
        unclaimedAllianceRewards: 0,
      })
      .where(eq(users.walletAddress, normalized));

    // Log transaction
    await db.insert(transactions).values({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      walletAddress: normalized,
      type: "bonus",
      amount: unclaimed,
      currency: "coins",
      description: "Alliance Rewards",
    });

    return {
      success: true,
      claimed: unclaimed,
    };
  });

// ==========================================
// CHECK USERNAME AVAILABILITY
// ==========================================

const checkUsernameSchema = z.object({
  username: z.string().min(1),
});

export const checkUsernameAvailability = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => checkUsernameSchema.parse(data))
  .handler(async ({ data }) => {
    const { sql } = await import("drizzle-orm");
    const existingUser = await db.query.users.findFirst({
      where: sql`lower(${users.username}) = ${data.username.toLowerCase().trim()}`,
    });

    return {
      available: !existingUser,
    };
  });


// ==========================================
// 4-HOURLY CHECK-IN
// ==========================================

const checkInSchema = z.object({
  walletAddress: z.string().min(1),
});

export const checkIn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkInSchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.walletAddress.toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const CHECK_IN_INTERVAL = 4; // hours
    const REWARD = 5000; // 5000 coins

    if (user.lastCheckInDate) {
      const lastCheckIn = new Date(user.lastCheckInDate);
      const now = new Date();
      const hoursSince = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < CHECK_IN_INTERVAL) {
        const remaining = Math.ceil(CHECK_IN_INTERVAL - hoursSince);
        return { success: false, error: `Available in ${remaining} hours` };
      }
    }

    // Add reward to coins balance
    await db.update(users).set({
      coins: (user.coins || 0) + REWARD,
      lastCheckInDate: new Date(),
    }).where(eq(users.walletAddress, normalized));

    // Log transaction
    await db.insert(transactions).values({
      id: `tx-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      walletAddress: normalized,
      type: "bonus",
      amount: REWARD,
      currency: "coins",
      description: "4-Hourly Check-in Bonus"
    });

    return { 
      success: true, 
      reward: REWARD, 
      message: `Check-in successful! +${REWARD} coins` 
    };
  });
export const claimSocialReward = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => 
    z.object({
      walletAddress: z.string().min(1),
      questId: z.union([z.string(), z.number()]).transform(v => String(v)),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    console.log(`[SOCIAL_CLAIM] Starting claim for:`, data);
    const normalized = data.walletAddress.toLowerCase();
    
    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
    });

    if (!user) {
      console.warn(`[SOCIAL_CLAIM] User not found for ${normalized}`);
      return { success: false, error: "User not found" };
    }
    console.log(`[SOCIAL_CLAIM] Found user:`, user.username);

    // CHECK IF ALREADY CLAIMED IN DB
    const existing = await db.query.userQuests.findFirst({
      where: (uq, { and, eq }) => and(
        eq(uq.walletAddress, normalized),
        eq(uq.questId, data.questId),
        eq(uq.completed, true)
      )
    });

    if (existing) {
      return { success: false, error: "Quest already claimed!" };
    }

    const questData = INITIAL_QUESTS.find(iq => iq.id === data.questId);
    if (!questData) {
      return { success: false, error: "Generic quest data not found" };
    }
    const REWARD = questData.reward || 2500;

    // 1. Update userQuests table to CLAIMED
    await db.insert(userQuests).values({
      walletAddress: normalized,
      questId: data.questId,
      title: questData?.title || "Social Quest",
      reward: REWARD,
      type: questData?.type || "social",
      frequency: questData?.frequency || "once",
      target: 1,
      progress: 1,
      completed: true,
      status: "CLAIMED",
      createdAt: new Date(),
    }).onConflictDoUpdate({
      target: [userQuests.walletAddress, userQuests.questId],
      set: { 
        completed: true, 
        progress: 1, 
        status: "CLAIMED" 
      }
    });

    // 2. Add reward to COINS balance in DB
    await db.update(users).set({
      coins: (user.coins || 0) + REWARD,
    }).where(eq(users.walletAddress, normalized));

    // 3. Log transaction in DB
    await db.insert(transactions).values({
      id: `tx-social-${Date.now()}-${data.questId}`,
      walletAddress: normalized,
      type: "redeem",
      amount: REWARD,
      currency: "coins",
      description: `Social Quest Reward: ${questData?.title || data.questId}`
    });

    return { 
      success: true, 
      reward: REWARD, 
      message: `Social reward claimed! +${REWARD} coins` 
    };
  });

// ==========================================
// SUBMIT QUEST VERIFICATION
// ==========================================

const submitQuestVerificationSchema = z.object({
  walletAddress: z.string().min(1),
  questId: z.union([z.string(), z.number()]).transform(v => String(v)),
  verificationCode: z.string().nullable().optional(),
});

export const submitQuestVerification = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitQuestVerificationSchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.walletAddress.toLowerCase();
    
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const questData = INITIAL_QUESTS.find((iq) => iq.id === data.questId);
    if (!questData) {
      return { success: false, error: "Generic quest data not found" };
    }

    // Server-side Stat Check for count-based quests
    if (questData.type === "play") {
      if ((user.gamePlays || 0) < questData.target) {
        return {
          success: false,
          error: `Requirement not met: You have played ${user.gamePlays || 0}/${questData.target} games.`,
        };
      }
    } else if (questData.type === "win") {
      if ((user.wins || 0) < questData.target) {
        return {
          success: false,
          error: `Requirement not met: You have won ${user.wins || 0}/${questData.target} games.`,
        };
      }
    }

    const isSocial = questData.type === "social";
    const status = isSocial ? "VERIFYING" : "CLAIMABLE";
    const verifiedTime = isSocial ? new Date(Date.now() + 45 * 60 * 1000) : new Date();

    // Upsert user quest progress
    await db
      .insert(userQuests)
      .values({
        walletAddress: normalized,
        questId: data.questId,
        title: questData.title,
        reward: questData.reward,
        type: questData.type as any,
        frequency: questData.frequency as any,
        target: questData.target,
        progress: questData.target, 
        verifiedAt: verifiedTime,
        status: status,
        completed: false, // Ensure not completed yet!
      })
      .onConflictDoUpdate({
        target: [userQuests.walletAddress, userQuests.questId],
        set: {
          progress: questData.target,
          verifiedAt: verifiedTime,
          status: status,
        },
      });

    if (isSocial) {
      console.log(`[QUEST_VERIFY] Social Quest ${data.questId} set to PENDING (45m delay) for ${normalized}`);
    }

    return { 
      success: true, 
      message: "Quest verification recorded in database" 
    };
  });

// ==========================================
// RECORD GAME PLAY
// ==========================================

const recordGamePlaySchema = z.object({
  walletAddress: z.string().min(1),
});

export const recordGamePlay = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => recordGamePlaySchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.walletAddress.toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalized),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await db
      .update(users)
      .set({
        gamePlays: (user.gamePlays || 0) + 1,
      })
      .where(eq(users.walletAddress, normalized));

    // Update active PLAY quests
    await db.update(userQuests)
      .set({ progress: sql`${userQuests.progress} + 1` })
      .where(and(
        eq(userQuests.walletAddress, normalized),
        eq(userQuests.type, "play"),
        eq(userQuests.completed, false)
      ));

    return {
      success: true,
      gamePlays: (user.gamePlays || 0) + 1,
    };
  });

// ==========================================
// GET LEADERBOARD
// ==========================================

const getLeaderboardSchema = z.object({
  walletAddress: z.string().optional(),
});

export const getLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => getLeaderboardSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { walletAddress } = data;
      const { desc, gt, sql, eq } = await import("drizzle-orm");

      const topUsersKor = await db
        .select({
          walletAddress: users.walletAddress,
          username: users.username,
          doodlBalance: users.doodlBalance,
          totalBets: users.totalBets,
          wins: users.wins,
          referralCount: users.referralCount,
          coins: users.coins,
        })
        .from(users)
        .orderBy(desc(users.doodlBalance))
        .limit(50);

      const topUsersReferrals = await db
        .select({
          walletAddress: users.walletAddress,
          username: users.username,
          doodlBalance: users.doodlBalance,
          totalBets: users.totalBets,
          wins: users.wins,
          referralCount: users.referralCount,
          coins: users.coins,
        })
        .from(users)
        .orderBy(desc(users.referralCount))
        .limit(50);

      let userRankKor = null;
      let userRankReferrals = null;
      let currentUserStats = null;

      if (walletAddress) {
        const normalized = walletAddress.toLowerCase();
        const user = await db.query.users.findFirst({
          where: eq(users.walletAddress, normalized),
        });

        if (user) {
          const higherKor = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(gt(users.doodlBalance, user.doodlBalance || 0));
          userRankKor = Number(higherKor[0].count) + 1;

          const higherRefs = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(gt(users.referralCount, user.referralCount || 0));
          userRankReferrals = Number(higherRefs[0].count) + 1;

          currentUserStats = {
            walletAddress: user.walletAddress,
            username: user.username,
            doodlBalance: user.doodlBalance,
            totalBets: user.totalBets,
            wins: user.wins,
            referralCount: user.referralCount,
            coins: user.coins,
          };
        }
      }

      return {
        success: true,
        leaderboardKor: topUsersKor,
        leaderboardReferrals: topUsersReferrals,
        userRankKor,
        userRankReferrals,
        currentUserStats,
      };
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
      return {
        success: false,
        error: "Failed to fetch leaderboard",
      };
    }
  });

// ==========================================
// SYNC QUESTS (Manual Catch-up)
// ==========================================

const syncQuestsSchema = z.object({
  walletAddress: z.string().min(1),
});

export const syncQuests = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => syncQuestsSchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.walletAddress.toLowerCase();
    const now = new Date();

    // 1. Calculate Daily Reset (4 AM UTC)
    const lastDailyReset = new Date(now);
    lastDailyReset.setUTCHours(4, 0, 0, 0);
    if (now < lastDailyReset) lastDailyReset.setUTCDate(lastDailyReset.getUTCDate() - 1);

    // 2. Calculate Weekly Reset (Monday 4 AM UTC)
    const lastWeeklyReset = new Date(now);
    lastWeeklyReset.setUTCHours(4, 0, 0, 0);
    lastWeeklyReset.setUTCDate(lastWeeklyReset.getUTCDate() - lastWeeklyReset.getUTCDay());
    if (now < lastWeeklyReset) lastWeeklyReset.setUTCDate(lastWeeklyReset.getUTCDate() - 7);

    // 3. Fetch all settled bets since resets
    const dailyBets = await db.select().from(bets).where(and(
      eq(bets.walletAddress, normalized),
      gt(bets.settledAt, lastDailyReset)
    ));

    const weeklyBets = await db.select().from(bets).where(and(
      eq(bets.walletAddress, normalized),
      gt(bets.settledAt, lastWeeklyReset)
    ));

    // 4. Update Function
    const reconcile = async (betsList: any[], freq: string) => {
      const plays = betsList.length;
      const singleWins = betsList.filter(b => b.status === "won" && b.betType === "single").length;
      const accWins = new Set(
        betsList
          .filter(b => b.status === "won" && b.betType === "accumulator" && b.accumulatorId)
          .map(b => b.accumulatorId)
      ).size;

      // Update Play Quests
      await db.update(userQuests)
        .set({ progress: plays })
        .where(and(
          eq(userQuests.walletAddress, normalized),
          eq(userQuests.frequency, freq as any),
          eq(userQuests.type, "play"),
          eq(userQuests.completed, false)
        ));

      // Update Single Win Quests
      await db.update(userQuests)
        .set({ progress: singleWins })
        .where(and(
          eq(userQuests.walletAddress, normalized),
          eq(userQuests.frequency, freq as any),
          eq(userQuests.type, "win"),
          eq(userQuests.completed, false),
          sql`NOT (title LIKE '%accumulated%')`
        ));

      // Update Acc Win Quests
      await db.update(userQuests)
        .set({ progress: accWins })
        .where(and(
          eq(userQuests.walletAddress, normalized),
          eq(userQuests.frequency, freq as any),
          eq(userQuests.type, "win"),
          eq(userQuests.completed, false),
          sql`title LIKE '%accumulated%'`
        ));
    };

    await reconcile(dailyBets, "daily");
    await reconcile(weeklyBets, "weekly");

    return { success: true };
  });
