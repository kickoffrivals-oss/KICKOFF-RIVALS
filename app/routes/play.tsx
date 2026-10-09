import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GameSelection } from "../components/GameSelection";
import { useGame } from "../contexts/GameContext";
import { useUserStore } from "../stores/userStore";

export const Route = createFileRoute("/play")({
  component: PlayRoute,
});

function PlayRoute() {
  const navigate = useNavigate();
  const { walletState, handleWalletConnected, handleMessageSigned } = useGame();
  const { setOnboardingComplete } = useUserStore();

  return (
    <GameSelection
      onSelectFootball={() => {
        if (!walletState.isConnected || !walletState.isVerified) {
          handleWalletConnected("0x65bc46df99bc2385128c8a67752d7cd3922de740");
          handleMessageSigned();
          setOnboardingComplete(true);
        }
        navigate({ to: "/dashboard" });
      }}
    />
  );
}
