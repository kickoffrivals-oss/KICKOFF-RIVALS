import { createFileRoute } from "@tanstack/react-router";
import { getUserProfile } from "../../server/user";

import { getLocalUserProfile } from "../../lib/localStore";

export const Route = createFileRoute("/api/user/profile")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const walletAddress = url.searchParams.get("walletAddress");
        const username = url.searchParams.get("username") || undefined;
        const leagueId = url.searchParams.get("leagueId") || undefined;
        const teamId = url.searchParams.get("teamId") || undefined;

        if (!walletAddress) {
          return Response.json(
            { success: false, error: "Missing walletAddress" },
            { status: 400 },
          );
        }

        try {
          const result = await getUserProfile({
            data: {
              walletAddress,
              username,
              leagueId,
              teamId,
            },
          });

          if (result && result.success) {
            return Response.json(result);
          }
          throw new Error("DB query failed");
        } catch (error: any) {
          console.warn("[Profile API] Using local in-memory fallback:", error.message);
          const fallback = getLocalUserProfile(walletAddress, username, leagueId, teamId);
          return Response.json(fallback);
        }
      },
    },
  },
});
