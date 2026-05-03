import * as schema from "./schema";

// Determine if we're on the server
const isServer = typeof window === "undefined";

// Initialize dbServer reference
let dbServer: any = null;

/**
 * Top-level await for server-side database initialization.
 * Vite will tree-shake this entire block on the client when building for production
 * because import.meta.env.SSR is replaced with a constant false.
 */
if (import.meta.env.SSR) {
  const mod = await import("./db.server");
  dbServer = mod.dbServer;
}

/**
 * Safe database proxy.
 * Can be imported everywhere (including client components).
 */
export const db: any = new Proxy({} as any, {
  get(_target, prop, receiver) {
    if (!isServer) {
      throw new Error(
        `❌ Database access attempted on the client! Property: "${String(prop)}". \n` +
        `The database client can only be used in server functions, loaders, or API handlers.`
      );
    }

    if (!dbServer) {
      // This should theoretically not happen on the server due to top-level await above
      throw new Error("❌ Database server client failed to initialize.");
    }

    const value = Reflect.get(dbServer, prop, receiver);
    return typeof value === "function" ? value.bind(dbServer) : value;
  },
});

// Re-export everything from schema for easy access
export * from "./schema";
