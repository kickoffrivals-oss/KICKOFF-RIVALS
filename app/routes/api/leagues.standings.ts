import { createFileRoute } from "@tanstack/react-router";
import { getLeagueStandings } from "../../server/matches";
import { getLocalStandings } from "../../lib/localStore";

export const Route = createFileRoute("/api/leagues/standings")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const seasonIdParam = url.searchParams.get("seasonId");
        const seasonId = seasonIdParam
          ? parseInt(seasonIdParam, 10)
          : undefined;

        try {
          const result = await getLeagueStandings({
            data: {
              seasonId,
            },
          });

          if (result && result.success) {
            return Response.json(result);
          }
          throw new Error("DB standings failed");
        } catch (error: unknown) {
          console.warn("[Standings API] Using local in-memory fallback");
          const l1 = getLocalStandings("l1");
          const l2 = getLocalStandings("l2");
          const l3 = getLocalStandings("l3");
          return Response.json({
            success: true,
            standings: {
              l1: l1.standings,
              l2: l2.standings,
              l3: l3.standings,
            },
          });
        }
      },
    },
  },
});
