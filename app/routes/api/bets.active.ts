import { createFileRoute } from "@tanstack/react-router";
import { getActiveBets } from "../../server/matches";
import { getLocalActiveBets } from "../../lib/localStore";

export const Route = createFileRoute("/api/bets/active")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const walletAddress = url.searchParams.get("walletAddress");

        if (!walletAddress) {
          return Response.json(
            { success: false, error: "Missing walletAddress", bets: [] },
            { status: 400 },
          );
        }

        try {
          const result = await getActiveBets({
            data: {
              walletAddress,
            },
          });

          if (result && result.success) {
            return Response.json(result);
          }
          throw new Error("DB active bets failed");
        } catch (error: unknown) {
          console.warn("[Active bets API] Using local in-memory fallback");
          const fallback = getLocalActiveBets(walletAddress);
          return Response.json(fallback);
        }
      },
    },
  },
});
