import { createFileRoute } from "@tanstack/react-router";
import { db, users, transactions } from "../../lib/db";
import { eq, sql, and } from "drizzle-orm";

export const Route = createFileRoute("/api/user/claim-winnings")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { walletAddress, txHash } = await request.json();
        
        if (!walletAddress) {
          return Response.json({ success: false, error: "Missing wallet address" }, { status: 400 });
        }

        const normalized = walletAddress.toLowerCase();

        try {
          // 1. Get user and their unclaimed balance
          const user = await db.query.users.findFirst({
            where: eq(users.walletAddress, normalized),
          });

          if (!user) {
            return Response.json({ success: false, error: "User not found" }, { status: 404 });
          }

          const amountToClaim = user.unclaimedBalance || 0;

          if (amountToClaim <= 0) {
            return Response.json({ success: false, error: "No winnings to claim" }, { status: 400 });
          }

          // 2. Perform the atomic transfer
          await db.transaction(async (tx) => {
            // Update user balances
            await tx.update(users)
              .set({
                doodlBalance: sql`${users.doodlBalance} + ${amountToClaim}`,
                unclaimedBalance: 0,
                updatedAt: new Date()
              })
              .where(eq(users.walletAddress, normalized));

            // Record the transaction
            await tx.insert(transactions).values({
              id: `claim-${Date.now()}-${normalized.slice(-4)}`,
              walletAddress: normalized,
              type: "claim",
              amount: amountToClaim,
              currency: "kor",
              description: `Claimed winnings (On-chain tx: ${txHash || "verified"})`
            });
          });

          return Response.json({ 
            success: true, 
            amount: amountToClaim,
            newBalance: (user.doodlBalance || 0) + amountToClaim
          });

        } catch (error: any) {
          console.error("Claim API error:", error);
          return Response.json({ success: false, error: error.message }, { status: 500 });
        }
      },
    },
  },
});
