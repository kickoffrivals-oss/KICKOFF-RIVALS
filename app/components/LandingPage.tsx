import { useTheme } from "../contexts/ThemeContext";
import { LandingPageNeoBrutalist } from "./LandingPageNeoBrutalist";
import { LandingPageClassic } from "./LandingPageClassic";

export type UITheme = "neobrutalist" | "classic";

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();

  if (theme === "classic") {
    return <LandingPageClassic onEnter={onEnter} onSwitchTheme={toggleTheme} />;
  }

  return (
    <LandingPageNeoBrutalist onEnter={onEnter} onSwitchTheme={toggleTheme} />
  );
}

export default LandingPage;
