import { createFileRoute } from "@tanstack/react-router";
import { getCurrentMatchesInternal } from "../../server/matches";
import { getLocalMatches } from "../../lib/localStore";

export const Route = createFileRoute("/api/matches/current")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const leagueId = url.searchParams.get("leagueId") || undefined;

        try {
          const result = await getCurrentMatchesInternal({
            leagueId,
          });

          if (result && result.success) {
            return Response.json(result);
          }
          throw new Error("DB matches failed");
        } catch (error: unknown) {
          console.warn("[Matches API] Using local in-memory fallback");
          const fallback = getLocalMatches(leagueId);
          return Response.json(fallback);
        }
      },
    },
  },
});
