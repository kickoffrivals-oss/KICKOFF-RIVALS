import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/validate-session")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const authHeader = request.headers.get("Authorization") || "";
          const token = authHeader.replace("Bearer ", "").trim();

          if (!token) {
            return Response.json({ valid: false, error: "No token provided" }, { status: 401 });
          }

          return Response.json({
            valid: true,
            loginTime: Date.now(),
          });
        } catch (error: any) {
          return Response.json({ valid: false, error: error.message }, { status: 500 });
        }
      },
    },
  },
});
