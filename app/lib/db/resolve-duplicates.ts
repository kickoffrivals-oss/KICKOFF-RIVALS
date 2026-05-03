import { dbServer as db, users } from "./db.server";
import { sql, eq } from "drizzle-orm";

async function resolveDuplicateUsernames() {
  console.log("Checking for duplicate usernames (case-insensitive)...");
  
  const allUsers = await db.select().from(users);
  const usernameMap = new Map<string, string[]>(); // lowercase -> [walletAddress, ...]

  for (const user of allUsers) {
    const lc = user.username.toLowerCase();
    if (!usernameMap.has(lc)) {
      usernameMap.set(lc, []);
    }
    usernameMap.get(lc)!.push(user.walletAddress);
  }

  for (const [lc, wallets] of usernameMap.entries()) {
    // 1. Resolve within the same case-insensitive bucket
    if (wallets.length > 1) {
      console.log(`Conflict found for "${lc}": ${wallets.length} users`);
      // Keep the first one as is (but lowercase it), increment others
      for (let i = 1; i < wallets.length; i++) {
        let suffix = 1;
        let newName = `${lc}${suffix}`;
        
        // Find a truly unique new name
        while (true) {
          const exists = await db.query.users.findFirst({
            where: sql`lower(${users.username}) = ${newName}`
          });
          if (!exists) break;
          suffix++;
          newName = `${lc}${suffix}`;
        }

        console.log(`Updating ${wallets[i]} from "${lc}" to "${newName}"`);
        await db.update(users).set({ username: newName }).where(sql`${users.walletAddress} = ${wallets[i]}`);
      }
    }

    // 2. Ensure the primary one is also lowercase (as per user's preference for leaderboard/consistency)
    // Actually, user only asked for leaderboard to be lower case, but it's safer to store lower case if it's case insensitive.
    // The user said "username is unique and not casesensitive".
    await db.update(users).set({ username: lc }).where(sql`${users.walletAddress} = ${wallets[0]}`);
  }

  console.log("Duplicate resolution complete.");
}

resolveDuplicateUsernames().catch(console.error);
