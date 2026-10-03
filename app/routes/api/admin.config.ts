import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/config")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: "ready",
          version: "1.0.0",
          serverTime: Date.now(),
        });
      },
    },
  },
});
