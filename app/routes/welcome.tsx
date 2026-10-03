import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WelcomeScreen } from "../components/WelcomeScreen";
import { ReturningUserWelcome } from "../components/ReturningUserWelcome";
import { useGame } from "../contexts/GameContext";
import { useUserStore } from "../stores/userStore";
import { useProfile } from "../hooks/useProfile";

export const Route = createFileRoute("/welcome")({
  component: WelcomeRoute,
});

function WelcomeRoute() {
  const navigate = useNavigate();
  const { isNewUser: storeIsNewUser } = useUserStore();
  const { profile, isLoading } = useProfile();
  const { handleProceedFromWelcome } = useGame();

  const handleProceed = () => {
    handleProceedFromWelcome();
    navigate({ to: "/dashboard" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <span className="loading loading-spinner loading-lg text-pitch"></span>
      </div>
    );
  }

  if (!profile || profile.success === false) {
    return (
      <ReturningUserWelcome
        username={profile?.username || "Player"}
        totalBets={profile?.totalBets ?? 0}
        wins={profile?.wins ?? 0}
        korBalance={profile?.korBalance ?? 0}
        onProceed={handleProceed}
      />
    );
  }

  return (
    <ReturningUserWelcome
      username={profile.username || "Player"}
      totalBets={profile.totalBets ?? 0}
      wins={profile.wins ?? 0}
      korBalance={profile.korBalance ?? 0}
      onProceed={handleProceed}
    />
  );
}
