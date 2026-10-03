import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard } from "../../server/user";
import { getLocalLeaderboard } from "../../lib/localStore";

export const Route = createFileRoute("/api/leaderboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const walletAddress = url.searchParams.get("walletAddress") || undefined;
          const result = await getLeaderboard({ data: { walletAddress } });
          if (result && result.success) {
            return Response.json(result);
          }
          throw new Error("DB leaderboard failed");
        } catch (error: unknown) {
          console.warn("[Leaderboard API] Using local in-memory fallback");
          const fallback = getLocalLeaderboard();
          return Response.json(fallback);
        }
      },
    },
  },
});
