import { useState } from "react";
import toast from "react-hot-toast";
import { cn, formatNumber } from "../lib/utils";
import type { Match } from "../types";
import { X, Minus, Plus, Check } from "lucide-react";
import { TeamLogo } from "./TeamLogo";

interface BetModalProps {
  match: Match;
  balance: number;
  onClose: () => void;
  onPlaceBet: (
    match: Match,
    selection: "home" | "draw" | "away" | "gg" | "nogg",
    stake: number,
  ) => Promise<boolean>;
}

export function BetModal({
  match,
  balance,
  onClose,
  onPlaceBet,
}: BetModalProps) {
  const [selection, setSelection] = useState<
    "home" | "draw" | "away" | "gg" | "nogg" | null
  >(null);
  const [stake, setStake] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);

  const quickStakes = [50, 100, 250, 500];

  const selectedOdds = selection ? match.odds[selection] : 0;
  const potentialWin = Math.round(stake * selectedOdds);
  const canPlaceBet = selection && stake > 0 && stake <= balance;

  const handleStakeChange = (value: number) => {
    const newStake = Math.max(1, Math.min(value, balance));
    setStake(newStake);
  };

  const isBettingClosed = () => {
    if (match.status !== "LIVE") return false;
    if (!match.liveStartTime) return false;
    const elapsed = Date.now() - new Date(match.liveStartTime).getTime();
    return elapsed > 10000;
  };

  const bettingClosed = isBettingClosed();

  const handlePlaceBet = async () => {
    if (selection && canPlaceBet && !bettingClosed) {
      setIsLoading(true);
      try {
        const success = await onPlaceBet(match, selection, stake);
        if (success) {
          toast.success("Bet placed successfully!");
          onClose();
        } else {
          toast.error("Failed to place bet. Please try again.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSelectionLabel = (sel: string) => {
    switch (sel) {
      case "home":
        return `${match.homeTeam.name} Win (1)`;
      case "away":
        return `${match.awayTeam.name} Win (2)`;
      case "draw":
        return "Draw (X)";
      case "gg":
        return "Both Teams Score (GG)";
      case "nogg":
        return "Clean Sheet (NoGG)";
      default:
        return sel;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Place bet on ${match.homeTeam.name} vs ${match.awayTeam.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-page/80 backdrop-blur-xs"
    >
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-surface-panel border border-border-subtle rounded-md shadow-modal flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-raised">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
              PLACE BET
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-sm hover:bg-surface-panel text-text-muted hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Match Teams Banner */}
          <div className="flex items-center justify-around bg-surface-page p-3 rounded-sm border border-border-subtle">
            <div className="flex flex-col items-center gap-1 text-center">
              <TeamLogo
                name={match.homeTeam.name}
                color={match.homeTeam.color}
                logo={match.homeTeam.logo}
                className="w-10 h-10 rounded-full border border-border-subtle"
              />
              <span className="text-xs font-bold text-text-primary max-w-[100px] truncate">
                {match.homeTeam.name}
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-widest">
              VS
            </span>

            <div className="flex flex-col items-center gap-1 text-center">
              <TeamLogo
                name={match.awayTeam.name}
                color={match.awayTeam.color}
                logo={match.awayTeam.logo}
                className="w-10 h-10 rounded-full border border-border-subtle"
              />
              <span className="text-xs font-bold text-text-primary max-w-[100px] truncate">
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          {/* Selection Grid */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
              Select Market
            </span>

            {/* 1X2 */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <SelectionButton
                label="1"
                subLabel="Home"
                odds={match.odds.home}
                selected={selection === "home"}
                onClick={() => setSelection("home")}
              />
              <SelectionButton
                label="X"
                subLabel="Draw"
                odds={match.odds.draw}
                selected={selection === "draw"}
                onClick={() => setSelection("draw")}
              />
              <SelectionButton
                label="2"
                subLabel="Away"
                odds={match.odds.away}
                selected={selection === "away"}
                onClick={() => setSelection("away")}
              />
            </div>

            {/* GG/NoGG */}
            <div className="grid grid-cols-2 gap-1.5">
              <SelectionButton
                label="GG"
                subLabel="Both Score"
                odds={match.odds.gg}
                selected={selection === "gg"}
                onClick={() => setSelection("gg")}
              />
              <SelectionButton
                label="NG"
                subLabel="Clean Sheet"
                odds={match.odds.nogg}
                selected={selection === "nogg"}
                onClick={() => setSelection("nogg")}
              />
            </div>
          </div>

          {/* Stake Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="modal-stake-input" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Stake Amount
              </label>
              <span className="text-xs text-text-muted">
                Balance: <strong className="font-mono tabular-nums text-text-primary">{formatNumber(balance)} Coins</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStakeChange(stake - 50)}
                disabled={stake <= 50}
                aria-label="Decrease stake by 50"
                className="h-10 w-10 flex items-center justify-center rounded-sm bg-surface-raised border border-border-subtle hover:border-border-strong text-text-primary disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Minus size={16} />
              </button>

              <div className="flex-1 relative">
                <input
                  id="modal-stake-input"
                  type="number"
                  value={stake}
                  onChange={(e) => handleStakeChange(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-surface-page border border-border-subtle rounded-sm text-center font-mono font-bold text-sm text-text-primary tabular-nums focus:outline-none focus:border-accent"
                  min={1}
                  max={balance}
                />
              </div>

              <button
                onClick={() => handleStakeChange(stake + 50)}
                disabled={stake >= balance}
                aria-label="Increase stake by 50"
                className="h-10 w-10 flex items-center justify-center rounded-sm bg-surface-raised border border-border-subtle hover:border-border-strong text-text-primary disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick Stake Buttons */}
            <div className="flex gap-1.5">
              {quickStakes.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleStakeChange(amount)}
                  disabled={amount > balance}
                  className={cn(
                    "flex-1 py-1 text-xs font-mono font-bold rounded-sm border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                    stake === amount
                      ? "bg-surface-raised text-text-primary border-border-strong"
                      : "bg-surface-page text-text-muted border-border-subtle hover:text-text-primary hover:border-border-strong",
                    amount > balance && "opacity-40 cursor-not-allowed"
                  )}
                >
                  +{amount}
                </button>
              ))}
              <button
                onClick={() => handleStakeChange(balance)}
                className="flex-1 py-1 text-xs font-mono font-bold rounded-sm bg-surface-page text-semantic-reward border border-border-subtle hover:border-semantic-reward transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Bet Summary Box */}
          {selection && (
            <div className="bg-surface-page rounded-sm p-3 border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Selection</span>
                <span className="font-bold text-accent">
                  {getSelectionLabel(selection)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Odds</span>
                <span className="font-mono font-bold text-text-primary">
                  {selectedOdds.toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-2">
                <span className="text-text-muted font-semibold">Potential Return</span>
                <span className="font-mono font-bold text-sm text-semantic-reward tabular-nums">
                  {formatNumber(potentialWin)} KOR
                </span>
              </div>
            </div>
          )}

          {/* Place Bet Action Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!canPlaceBet || bettingClosed || isLoading}
            className={cn(
              "w-full py-3 rounded-sm font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-accent",
              canPlaceBet && !bettingClosed && !isLoading
                ? "bg-accent text-surface-page hover:bg-accent-hover active:bg-accent-active cursor-pointer"
                : "bg-surface-raised text-text-muted border border-border-subtle cursor-not-allowed"
            )}
          >
            {!selection ? (
              "Select an Outcome"
            ) : bettingClosed ? (
              "Betting Closed"
            ) : stake > balance ? (
              "Insufficient Coins"
            ) : isLoading ? (
              <span>Placing Bet...</span>
            ) : (
              <>
                <Check size={16} strokeWidth={2.5} />
                Confirm Bet ({formatNumber(stake)} Coins)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SelectionButtonProps {
  label: string;
  subLabel: string;
  odds: number;
  selected: boolean;
  onClick: () => void;
}

function SelectionButton({
  label,
  subLabel,
  odds,
  selected,
  onClick,
}: SelectionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-sm border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
        selected
          ? "bg-[#062E1E] border-accent text-accent font-bold"
          : "bg-surface-page border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary"
      )}
    >
      <span className="text-xs font-bold uppercase mb-0.5 text-text-muted">
        {label} ({subLabel})
      </span>
      <span className="text-sm font-mono font-bold tabular-nums">
        {odds.toFixed(2)}
      </span>
    </button>
  );
}

export default BetModal;

