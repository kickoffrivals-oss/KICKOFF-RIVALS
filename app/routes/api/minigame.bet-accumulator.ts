import { createFileRoute } from "@tanstack/react-router";
import { placeAccumulatorBet } from "../../server/matches";
import { placeLocalAccumulatorBet } from "../../lib/localStore";

export const Route = createFileRoute("/api/minigame/bet-accumulator")({
    server: {
        handlers: {
            POST: async ({ request }: { request: Request }) => {
                let body: any = {};
                try {
                    body = await request.json();
                    const { walletAddress, selections, stake, totalOdds, accumulatorId } =
                        body;

                    const missingFields = [];
                    if (!walletAddress) missingFields.push("walletAddress");
                    if (!selections || !selections.length) missingFields.push("selections");
                    if (!stake) missingFields.push("stake");
                    if (!totalOdds) missingFields.push("totalOdds");
                    if (!accumulatorId) missingFields.push("accumulatorId");

                    if (missingFields.length > 0) {
                        console.warn("Accumulator Bet validation failed:", { walletAddress, selections, stake, totalOdds, accumulatorId });
                        return Response.json(
                            { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
                            { status: 400 },
                        );
                    }

                    const result = await placeAccumulatorBet({
                        data: {
                            walletAddress,
                            selections,
                            stake: Number(stake),
                            totalOdds: Number(totalOdds),
                            accumulatorId,
                        },
                    });

                    if (result && result.success) {
                        return Response.json(result);
                    }
                    throw new Error("DB accumulator bet failed");
                } catch (error: unknown) {
                    console.warn("[Accumulator Bet API] Using local in-memory fallback");
                    const fallback = placeLocalAccumulatorBet({
                        walletAddress: body.walletAddress,
                        selections: body.selections || [],
                        stake: Number(body.stake),
                        totalOdds: Number(body.totalOdds),
                        accumulatorId: body.accumulatorId || `acc-${Date.now()}`,
                    });
                    return Response.json(fallback);
                }
            },
        },
    },
});
