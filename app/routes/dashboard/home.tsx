import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGame } from "../../contexts/GameContext";
import { LEAGUES } from "../../constants";
import { ResultsOverlay } from "../../components/dashboard/ResultsOverlay";
import { TimerBanner } from "../../components/dashboard/TimerBanner";
import { LeagueFilterBar } from "../../components/dashboard/ResultsOverlay";
import { MatchGrid } from "../../components/dashboard/MatchGrid";

export const Route = createFileRoute("/dashboard/home")({
  component: HomeTab,
});

function HomeTab() {
  const {
    gameState,
    timer,
    matches,
    getCurrentGameMinute,
    setBettingOn,
    setWatchingMatchId,
    handleAddToBetSlip,
    roundNumber,
  } = useGame();

  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState("all");

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full relative min-h-[70vh]">
      {/* Results Overlay — only shown when game is FINISHED */}
      {gameState === "FINISHED" && (
        <ResultsOverlay timer={timer} matches={matches} />
      )}

      {/* Timer & Round Status Banner */}
      <TimerBanner
        timer={timer}
        gameState={gameState}
        roundNumber={roundNumber}
        getCurrentGameMinute={getCurrentGameMinute}
      />

      {/* League Filter Chips */}
      <LeagueFilterBar
        selected={selectedLeagueFilter}
        onSelect={setSelectedLeagueFilter}
      />

      {/* Match Cards Arena Grid */}
      <MatchGrid
        matches={matches}
        gameState={gameState}
        selectedLeagueFilter={selectedLeagueFilter}
        getCurrentGameMinute={getCurrentGameMinute}
        onBet={setBettingOn}
        onWatch={(match) => setWatchingMatchId(match.id)}
        onAddToBetSlip={handleAddToBetSlip}
      />
    </div>
  );
}
