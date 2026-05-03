import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard } from "../../server/user";

export const Route = createFileRoute("/api/leaderboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const walletAddress = url.searchParams.get("walletAddress") || undefined;
          const result = await getLeaderboard({ data: { walletAddress } });
          return Response.json(result);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Leaderboard API error:", error);
          return Response.json(
            { success: false, error: errorMessage },
            { status: 500 },
          );
        }
      },
    },
  },
});
