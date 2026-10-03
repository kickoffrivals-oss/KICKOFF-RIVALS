import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";
import { Match } from "../types";
import { IconX, IconCoins, IconCheck, IconMinus, IconPlus } from "./Icons";

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
  const [stake, setStake] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);

  const quickStakes = [10, 25, 50, 100, 250];

  const selectedOdds = selection ? match.odds[selection] : 0;
  const potentialWin = stake * selectedOdds;
  const canPlaceBet = selection && stake > 0 && stake <= balance;

  const handleStakeChange = (value: number) => {
    const newStake = Math.max(1, Math.min(value, balance));
    setStake(newStake);
  };

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
        toast.error("An error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSelectionLabel = (sel: string) => {
    switch (sel) {
      case "home":
        return match.homeTeam.name;
      case "away":
        return match.awayTeam.name;
      case "draw":
        return "Draw";
      case "gg":
        return "Both Teams Score";
      case "nogg":
        return "No GG";
      default:
        return sel;
    }
  };

  const isBettingClosed = () => {
    if (match.status !== "LIVE") return false;
    if (!match.liveStartTime) return false;
    const elapsed = Date.now() - new Date(match.liveStartTime).getTime();
    return elapsed > 10000; // 10 seconds
  };

  const bettingClosed = isBettingClosed();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background flex items-center justify-between p-4 border-b border-border z-10">
          <div>
            <h2 className="font-bold text-foreground">Place Bet</h2>
            <p className="text-xs text-muted-foreground">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <IconX className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Match Info */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{ backgroundColor: match.homeTeam.color }}
              >
                {match.homeTeam.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-foreground mt-2 text-center max-w-[80px] truncate">
                {match.homeTeam.name}
              </span>
            </div>

            <span className="text-2xl font-bold text-muted-foreground">VS</span>

            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{ backgroundColor: match.awayTeam.color }}
              >
                {match.awayTeam.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-foreground mt-2 text-center max-w-[80px] truncate">
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          {/* Selection Options */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Select Outcome
            </label>

            {/* Main Outcomes */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <SelectionButton
                label="1"
                subLabel={match.homeTeam.name}
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
                subLabel={match.awayTeam.name}
                odds={match.odds.away}
                selected={selection === "away"}
                onClick={() => setSelection("away")}
              />
            </div>

            {/* Additional Markets */}
            <div className="grid grid-cols-2 gap-2">
              <SelectionButton
                label="GG"
                subLabel="Both Score"
                odds={match.odds.gg}
                selected={selection === "gg"}
                onClick={() => setSelection("gg")}
              />
              <SelectionButton
                label="NG"
                subLabel="No GG"
                odds={match.odds.nogg}
                selected={selection === "nogg"}
                onClick={() => setSelection("nogg")}
              />
            </div>
          </div>

          {/* Stake Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-muted-foreground">
                Stake Amount
              </label>
              <span className="text-xs text-muted-foreground">
                Balance: {balance.toLocaleString()} Coins
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => handleStakeChange(stake - 10)}
                disabled={stake <= 10}
                className="btn btn-outline h-12 w-12 p-0 disabled:opacity-50"
              >
                <IconMinus className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => handleStakeChange(Number(e.target.value))}
                  className="input w-full h-12 text-center text-xl font-bold pr-14"
                  min={1}
                  max={balance}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                  Coins
                </span>
              </div>

              <button
                onClick={() => handleStakeChange(stake + 10)}
                disabled={stake >= balance}
                className="btn btn-outline h-12 w-12 p-0 disabled:opacity-50"
              >
                <IconPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stakes */}
            <div className="flex gap-2">
              {quickStakes.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleStakeChange(amount)}
                  disabled={amount > balance}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    stake === amount
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                    amount > balance && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {amount}
                </button>
              ))}
              <button
                onClick={() => handleStakeChange(balance)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                  stake === balance
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Bet Summary */}
          {selection && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Selection</span>
                <span className="text-sm font-medium text-foreground">
                  {getSelectionLabel(selection)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Odds</span>
                <span className="text-sm font-bold text-primary">
                  {selectedOdds.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stake</span>
                <span className="text-sm font-medium text-amber-400">
                  {stake.toLocaleString()} Coins
                </span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Potential Win
                </span>
                <span className="text-lg font-bold text-primary">
                  {potentialWin.toFixed(2)} KOR
                </span>
              </div>
            </div>
          )}

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!canPlaceBet}
            className={cn(
              "btn w-full h-14 text-lg font-semibold",
              canPlaceBet && !bettingClosed
                ? "btn-primary"
                : "btn-secondary opacity-50",
            )}
          >
            {!selection ? (
              "Select an Outcome"
            ) : bettingClosed ? (
              "Betting Closed"
            ) : stake > balance ? (
              "Insufficient Balance"
            ) : isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Placing Bet...</span>
              </div>
            ) : (
              <>
                <IconCheck className="w-5 h-5 mr-2" />
                Place Bet
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
        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
        selected
          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
      )}
    >
      <span
        className={cn(
          "text-xs font-bold uppercase mb-1",
          selected ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-lg font-bold font-mono",
          selected ? "text-primary" : "text-foreground",
        )}
      >
        {odds.toFixed(2)}
      </span>
      <span className="text-[10px] text-muted-foreground truncate max-w-full">
        {subLabel}
      </span>
    </button>
  );
}

export default BetModal;
