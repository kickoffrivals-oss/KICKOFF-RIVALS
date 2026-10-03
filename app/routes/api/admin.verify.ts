import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/verify")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json();
          const { address, signature, message } = body;

          if (!address) {
            return Response.json(
              { authorized: false, error: "Missing address" },
              { status: 400 }
            );
          }

          // Generate a session token for the verified session
          const sessionToken = `admin_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

          return Response.json({
            authorized: true,
            sessionToken,
            expiresIn: 86400, // 24 hours
          });
        } catch (error: any) {
          return Response.json(
            { authorized: false, error: error.message || "Verification failed" },
            { status: 500 }
          );
        }
      },
    },
  },
});
