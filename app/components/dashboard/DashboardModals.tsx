import { lazy, Suspense } from "react";
import { useSignMessage } from "wagmi";
import { useGame } from "../../contexts/GameContext";
import { useProfile } from "../../hooks/useProfile";
import { CONVERSION_RATE } from "../../constants";
import { WalletModal } from "../WalletModal";
import { SwapConfirm } from "../SwapConfirm";
import { SimulationScreen } from "../SimulationScreen";
import { BetModal } from "../BetModal";
import { BetSlip } from "../BetSlip";
import { AdminAuth } from "../AdminAuth";

const AdminPortal = lazy(() =>
  import("../AdminPortal").then((mod) => ({
    default: mod.AdminPortal,
  })),
);

const API_URL = "";

/**
 * All the floating modals and the persistent BetSlip bar.
 * Rendered once in the dashboard layout so they survive tab navigation.
 */
export function DashboardModals() {
  const { profile, refresh: refreshProfile } = useProfile();
  const { signMessageAsync } = useSignMessage();
  const {
    showWallet,
    setShowWallet,
    showSwapConfirm,
    setShowSwapConfirm,
    showAdminAuth,
    setShowAdminAuth,
    showAdmin,
    setShowAdmin,
    watchingMatchId,
    setWatchingMatchId,
    bettingOn,
    setBettingOn,
    matches,
    gameState,
    setBalance,
    addTransaction,
    getCurrentGameMinute,
    handleBetPlacement,
    handleRemoveFromBetSlip,
    handleClearBetSlip,
    handlePlaceBetSlip,
    handleAdminAuthSuccess,
    handleAdminLogout,
    betSlipSelections,
    transactions,
    coupons,
    setCoupons,
    fetchMatches,
    adminSessionToken,
  } = useGame();

  if (!profile) return null;

  return (
    <>
      {showWallet && (
        <WalletModal
          onClose={() => setShowWallet(false)}
          onSwapRequest={() => {
            setShowWallet(false);
            setShowSwapConfirm(true);
          }}
          currentBalance={profile.korBalance}
          userStats={profile}
          transactions={transactions}
          onWalkReward={() => {}}
        />
      )}

      {showSwapConfirm && (
        <SwapConfirm
          korBalance={profile.korBalance}
          onConfirm={async (amount: number) => {
            try {
              // Sign wallet conversion message
              try {
                const message = `KickOff Rivals - Convert KOR to Coins

Account: ${profile.walletAddress}
Convert: ${amount.toLocaleString()} KOR
Receive: ${(amount * 10).toLocaleString()} Coins
Timestamp: ${Date.now()}

Authorize converting your KOR reward tokens into Game Coins.
This action does not cost gas.`;

                await signMessageAsync({ message });
              } catch (signErr: any) {
                if (signErr.message?.includes("User rejected") || signErr.message?.includes("User denied")) {
                  alert("Signature request was cancelled");
                  setShowSwapConfirm(false);
                  return;
                }
                console.warn("Wallet sign skipped or mock wallet active:", signErr);
              }

              const res = await fetch(`${API_URL}/api/user/convert-coins`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  walletAddress: profile.walletAddress,
                  amount,
                }),
              });
              const data = await res.json();
              if (data.success) {
                // Refresh profile to pick up new balances
                refreshProfile();
                setBalance(data.korBalance);
                addTransaction("convert", amount * 10, "coins", `Swapped ${amount} KOR for Coins`);
              } else {
                alert("Swap failed: " + data.error);
              }
            } catch (e) {
              console.error(e);
            }
            setShowSwapConfirm(false);
          }}
          onCancel={() => setShowSwapConfirm(false)}
        />
      )}

      {watchingMatchId && matches.find((m) => m.id === watchingMatchId) && (
        <SimulationScreen
          match={matches.find((m) => m.id === watchingMatchId)!}
          result={matches.find((m) => m.id === watchingMatchId)?.result}
          currentMinute={getCurrentGameMinute()}
          onFinish={() => setWatchingMatchId(null)}
        />
      )}

      {bettingOn && (
        <BetModal
          match={bettingOn}
          balance={profile.coins}
          onClose={() => setBettingOn(null)}
          onPlaceBet={handleBetPlacement}
        />
      )}

      {showAdminAuth && (
        <AdminAuth
          onAuthSuccess={handleAdminAuthSuccess}
          onCancel={() => setShowAdminAuth(false)}
        />
      )}

      {showAdmin && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[600] flex items-center justify-center">
              Loading admin...
            </div>
          }
        >
          <AdminPortal
            coupons={coupons}
            setCoupons={setCoupons}
            quests={profile.quests}
            setQuests={() => {}} // Handle separately if needed, but for now just disable
            onClose={() => setShowAdmin(false)}
            sessionToken={adminSessionToken || ""}
            matches={matches}
            onRefreshMatches={fetchMatches}
          />
        </Suspense>
      )}

      <BetSlip
        selections={betSlipSelections}
        balance={profile.coins}
        gameState={gameState}
        onRemoveSelection={handleRemoveFromBetSlip}
        onClearAll={handleClearBetSlip}
        onPlaceBet={handlePlaceBetSlip}
      />
    </>
  );
}
