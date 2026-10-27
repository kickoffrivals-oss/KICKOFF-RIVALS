import { createFileRoute, useNavigate } from "@tanstack/react-router";
import AviatorRedesign from "../../../games/aviator/AviatorRedesign";
import { useEffect, useState } from "react";
import { useGame } from "../../contexts/GameContext";

export const Route = createFileRoute("/games/aviator")({
  ssr: false,
  component: AviatorRoute,
});

function AviatorRoute() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const { balance, setBalance } = useGame();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#070514] text-white flex items-center justify-center">
        <div className="text-center space-y-3 font-mono">
          <div className="w-10 h-10 border-3 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
            LOADING DAILY AVIATOR UI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AviatorRedesign
      balance={balance}
      onBalanceChange={setBalance}
      onBackToArena={() => navigate({ to: "/play" })}
    />
  );
}
