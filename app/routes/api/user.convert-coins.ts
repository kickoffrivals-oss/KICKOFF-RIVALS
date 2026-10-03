import { createFileRoute } from "@tanstack/react-router";
import { convertCoins } from "../../server/user";
import { convertLocalKorToCoins } from "../../lib/localStore";

export const Route = createFileRoute("/api/user/convert-coins")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: any = {};
        try {
          body = await request.json();
          const { walletAddress, amount } = body;

          if (!walletAddress || !amount) {
            return Response.json(
              { success: false, error: "Missing required fields" },
              { status: 400 },
            );
          }

          const result = await convertCoins({
            data: {
              walletAddress,
              amount: Number(amount),
            },
          });

          if (!result.success) {
            return Response.json(result, { status: 400 });
          }

          return Response.json(result);
        } catch (error: unknown) {
          console.warn("[Convert API] Using local in-memory fallback");
          const fallback = convertLocalKorToCoins(
            body.walletAddress,
            Number(body.amount),
          );
          return Response.json(fallback);
        }
      },
    },
  },
});
