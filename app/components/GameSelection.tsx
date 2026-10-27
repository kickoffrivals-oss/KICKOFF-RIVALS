import { useTheme } from "../contexts/ThemeContext";
import { GameSelectionNeoBrutalist } from "./GameSelectionNeoBrutalist";
import { GameSelectionClassic } from "./GameSelectionClassic";

export type UITheme = "neobrutalist" | "classic";

interface GameSelectionProps {
  onSelectFootball: () => void;
  onSelectAviator?: () => void;
  balance?: number;
}

export function GameSelection({
  onSelectFootball,
  onSelectAviator = () => {},
  balance = 1000,
}: GameSelectionProps) {
  const { theme, toggleTheme } = useTheme();

  if (theme === "classic") {
    return (
      <GameSelectionClassic
        balance={balance}
        onSelectFootball={onSelectFootball}
        onSelectAviator={onSelectAviator}
        onSwitchTheme={toggleTheme}
      />
    );
  }

  return (
    <GameSelectionNeoBrutalist
      balance={balance}
      onSelectFootball={onSelectFootball}
      onSelectAviator={onSelectAviator}
      onSwitchTheme={toggleTheme}
    />
  );
}

export default GameSelection;
