import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { useUserStore } from "../stores/userStore";

export const Route = createFileRoute("/sign")({
  component: SignRoute,
});

function SignRoute() {
  const navigate = useNavigate();
  const { handleWalletConnected, handleMessageSigned } = useGame();
  const { setOnboardingComplete } = useUserStore();

  useEffect(() => {
    handleWalletConnected("0x65bc46df99bc2385128c8a67752d7cd3922de740");
    handleMessageSigned();
    setOnboardingComplete(true);
    navigate({ to: "/dashboard" });
  }, [handleWalletConnected, handleMessageSigned, setOnboardingComplete, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center text-xs font-mono text-slate-400">
      VERIFYING CREDENTIALS...
    </div>
  );
}
