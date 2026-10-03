import { createFileRoute } from "@tanstack/react-router";
import { resetLocalDatabase } from "../../lib/localStore";

export const Route = createFileRoute("/api/game/reset")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const res = resetLocalDatabase();
          return Response.json(res);
        } catch (error: any) {
          return Response.json({ success: false, error: error.message }, { status: 500 });
        }
      },
      GET: async () => {
        try {
          const res = resetLocalDatabase();
          return Response.json(res);
        } catch (error: any) {
          return Response.json({ success: false, error: error.message }, { status: 500 });
        }
      },
    },
  },
});
