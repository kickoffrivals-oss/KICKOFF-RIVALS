import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async () => {
        return Response.json({ success: true });
      },
    },
  },
});
