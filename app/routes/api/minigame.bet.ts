import { createFileRoute } from "@tanstack/react-router";
import { placeBet } from "../../server/matches";
import { placeLocalBet } from "../../lib/localStore";

export const Route = createFileRoute("/api/minigame/bet")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: any = {};
        try {
          body = await request.json();
          const { walletAddress, matchId, selection, stake, odds, betType } =
            body;

          const missingFields = [];
          if (!walletAddress) missingFields.push("walletAddress");
          if (!matchId) missingFields.push("matchId");
          if (!selection) missingFields.push("selection");
          if (!stake) missingFields.push("stake");
          if (!odds) missingFields.push("odds");

          if (missingFields.length > 0) {
            console.warn("Bet validation failed. Received:", body);
            console.warn("Missing fields:", missingFields);
            return Response.json(
              { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
              { status: 400 },
            );
          }

          const result = await placeBet({
            data: {
              walletAddress,
              matchId,
              selection,
              stake: Number(stake),
              odds: Number(odds),
              betType: betType || "single",
            },
          });

          if (result && result.success) {
            return Response.json(result);
          }
          throw new Error("DB place bet failed");
        } catch (error: unknown) {
          console.warn("[Bet API] Using local in-memory fallback");
          const fallback = placeLocalBet({
            walletAddress: body.walletAddress,
            matchId: body.matchId,
            selection: body.selection,
            stake: Number(body.stake),
            odds: Number(body.odds),
            betType: body.betType || "single",
          });
          return Response.json(fallback);
        }
      },
    },
  },
});
