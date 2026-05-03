import * as schema from "./schema";

const isNeonDatabase = (url: string): boolean => {
  return url.includes("neon.tech") || url.includes("neon-");
};

const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not defined in .env");
  }
  return url;
};

// Initialize the database client lazily or via top-level await on server
let dbServer: any = null;

const initializeDb = async () => {
  // Load environment variables only on the server
  const dotenv = await import("dotenv");
  dotenv.config();

  const databaseUrl = getDatabaseUrl();

  if (isNeonDatabase(databaseUrl)) {
    console.log("🌐 Using Neon serverless database driver");
    // Dynamic imports to keep these out of client bundles
    const { drizzle: drizzleNeon } = await import("drizzle-orm/neon-http");
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(databaseUrl);
    return drizzleNeon(sql, { schema });
  } else {
    console.log("🚂 Using Railway PostgreSQL database driver (rate-limited pool)");
    const { drizzle: drizzleNode } = await import("drizzle-orm/node-postgres");
    const pg = await import("pg");
    const { Pool } = pg.default || pg;
    
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on("error", (err: any) => {
      console.error("⚠️  Unexpected DB pool error:", err.message);
    });

    return drizzleNode(pool, { schema });
  }
};

// Top-level await is supported in modern ESM environments like TanStack Start (Nitro)
// This ensures dbServer is resolved before index.ts tries to use it.
if (typeof window === "undefined") {
  try {
    dbServer = await initializeDb();
  } catch (err) {
    console.error("❌ Failed to initialize database server:", err);
  }
}

export { dbServer };
export * from "./schema";
