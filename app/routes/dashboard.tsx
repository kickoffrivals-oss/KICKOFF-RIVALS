import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { useProfile } from "../hooks/useProfile";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardModals } from "../components/dashboard/DashboardModals";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { isInitializing, setDashboardMounted, betSlipSelections } = useGame();

  // Tell the context that the dashboard is mounted (starts game loop)
  useEffect(() => {
    setDashboardMounted(true);
    return () => setDashboardMounted(false);
  }, [setDashboardMounted]);

  // Route Guard: Redirect if no user logged in
  useEffect(() => {
    if (isInitializing || isProfileLoading) return;
    if (!profile?.username) {
      navigate({ to: "/" });
    }
  }, [profile?.username, isInitializing, isProfileLoading, navigate]);

  if (isInitializing || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center stadium-bg text-white font-sport italic text-2xl animate-pulse">
        LOADING MATCHDAY...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans text-white stadium-bg flex flex-col transition-all ${
        betSlipSelections.length > 0 ? "lg:pr-[400px]" : ""
      }`}
    >
      <DashboardHeader />
      {/* Tab content rendered here via nested routes */}
      <Outlet />
      {/* Floating modals + persistent bet slip — always mounted */}
      <DashboardModals />
    </div>
  );
}
