import { db } from "./app/lib/db";
import { sql } from "drizzle-orm";

async function removeAllQuests() {
  console.log("Removing ALL quests and USER quests...");
  try {
    await db.execute(sql`DELETE FROM user_quests;`);
    await db.execute(sql`DELETE FROM quests;`);
    console.log("Database quests cleared successfully!");
  } catch (error) {
    console.error("Failed to clear quests:", error);
  } finally {
    process.exit(0);
  }
}
removeAllQuests();
