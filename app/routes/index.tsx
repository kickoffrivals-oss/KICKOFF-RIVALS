import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LandingPage } from "../components/LandingPage";

export const Route = createFileRoute("/")({
  component: LandingRoute,
});

function LandingRoute() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate({ to: "/play" });
  };

  return <LandingPage onEnter={handleEnter} />;
}
