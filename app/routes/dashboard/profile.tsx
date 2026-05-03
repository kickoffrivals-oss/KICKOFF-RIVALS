import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useGame } from "../../contexts/GameContext";
import { ProfileScreen } from "../../components/ProfileScreen";
import { useUserStore } from "../../stores/userStore";
import { useProfile } from "../../hooks/useProfile";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfileTab,
});

function ProfileTab() {
  const navigate = useNavigate();
  const { logout: storeLogout } = useUserStore();
  const { profile, isLoading } = useProfile();
  const {
    setShowWallet,
    handleLogout: contextLogout,
    handleRedeem,
    handleQuestClaim,
    handleQuestAction,
    handleReferral,
    handleAdminSyncRequest,
    handleClaimAllianceRewards,
    handleCheckIn,
    onClaimWinnings,
    setShowSwapConfirm,
  } = useGame();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <span className="loading loading-spinner loading-lg text-pitch"></span>
      </div>
    );
  }

  if (!profile || profile.success === false) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <p className="text-muted-foreground">Failed to load profile or no wallet connected.</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-outline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="p-3 max-w-md mx-auto w-full">
      <ProfileScreen
        stats={profile}
        onLogout={() => {
          storeLogout();
          contextLogout();
          navigate({ to: "/" });
        }}
        onRedeem={handleRedeem}
        onQuestClaim={handleQuestClaim}
        onQuestAction={handleQuestAction}
        onReferral={handleReferral}
        onSystemSync={handleAdminSyncRequest}
        onOpenWallet={() => setShowWallet(true)}
        onClaimAllianceRewards={handleClaimAllianceRewards}
        onCheckIn={handleCheckIn}
        onClaimWinnings={onClaimWinnings}
        onSwapRequest={() => setShowSwapConfirm(true)}
      />
    </main>
  );
}
