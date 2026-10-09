import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGame } from "../contexts/GameContext";

export const Route = createFileRoute("/welcome")({
  component: WelcomeRoute,
});

function WelcomeRoute() {
  const navigate = useNavigate();
  const { handleProceedFromWelcome } = useGame();

  useEffect(() => {
    handleProceedFromWelcome();
    navigate({ to: "/dashboard" });
  }, [handleProceedFromWelcome, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0D12] text-xs font-mono text-slate-400">
      ENTERING MATCHDAY...
    </div>
  );
}
