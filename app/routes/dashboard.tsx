import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { useProfile } from "../hooks/useProfile";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardModals } from "../components/dashboard/DashboardModals";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

import { useTheme } from "../contexts/ThemeContext";

export function DashboardLayout() {
  const navigate = useNavigate();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { isInitializing, setDashboardMounted, betSlipSelections } = useGame();
  const { isNeoBrutalist } = useTheme();

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
      <div className="min-h-screen flex items-center justify-center bg-[#0c0a1d] text-white font-mono text-base animate-pulse">
        INITIALIZING MATCHDAY...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors ${
        isNeoBrutalist
          ? "bg-[#faf8ee] text-black bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px]"
          : "bg-surface-page text-text-primary"
      } ${betSlipSelections.length > 0 ? "lg:pr-[380px]" : ""}`}
    >
      <DashboardHeader />
      {/* Tab content rendered here via nested routes */}
      <Outlet />
      {/* Floating modals + persistent bet slip — always mounted */}
      <DashboardModals />
    </div>
  );
}

