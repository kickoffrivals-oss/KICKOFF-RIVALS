import { useState } from "react";
import toast from "react-hot-toast";
import { cn, formatNumber } from "../lib/utils";
import type { Match } from "../types";
import { X, Minus, Plus, Check } from "lucide-react";
import { TeamLogo } from "./TeamLogo";
import { useTheme } from "../contexts/ThemeContext";

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
  const { isNeoBrutalist } = useTheme();
  const [selection, setSelection] = useState<
    "home" | "draw" | "away" | "gg" | "nogg" | null
  >(null);
  const [stake, setStake] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const quickStakes = [50, 100, 500, 1000];

  const selectedOdds = selection ? match.odds[selection] : 0;
  const potentialWin = Math.round(stake * selectedOdds);
  const canPlaceBet = selection && stake > 0 && stake <= balance;

  const handleStakeChange = (value: number) => {
    const newStake = Math.max(0, Math.min(value, balance));
    setStake(newStake);
  };

  const isBettingClosed = () => {
    if (match.status === "RESULT" || match.status === "FINISHED") return true;
    if (match.status !== "LIVE") return false;
    if (!match.liveStartTime) return false;
    const elapsed = Date.now() - new Date(match.liveStartTime).getTime();
    return elapsed > 3000;
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
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
        isNeoBrutalist ? "bg-black/60" : "bg-surface-page/80"
      )}
    >
      {/* Modal Box */}
      <div
        className={cn(
          "relative w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden transition-colors",
          isNeoBrutalist
            ? "bg-white border-[3px] border-black rounded-[12px] shadow-[6px_6px_0_#000] text-black"
            : "bg-surface-panel border border-border-subtle rounded-md shadow-modal text-text-primary"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4 transition-colors",
            isNeoBrutalist
              ? "border-b-2 border-black bg-[#ffe600] text-black"
              : "border-b border-border-subtle bg-surface-raised"
          )}
        >
          <div>
            <h2
              className={cn(
                "text-sm uppercase tracking-wider font-mono",
                isNeoBrutalist ? "text-black font-black" : "text-text-primary font-bold"
              )}
            >
              PLACE BET
            </h2>
            <p
              className={cn(
                "text-xs mt-0.5",
                isNeoBrutalist ? "text-black/80 font-bold" : "text-text-muted"
              )}
            >
              {match.homeTeam.name} vs {match.awayTeam.name}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={cn(
              "p-1.5 transition-all focus-visible:outline-2",
              isNeoBrutalist
                ? "bg-white border-2 border-black rounded-[6px] text-black shadow-[1.5px_1.5px_0_#000] hover:bg-black hover:text-white"
                : "rounded-sm hover:bg-surface-panel text-text-muted hover:text-text-primary focus-visible:outline-accent"
            )}
          >
            <X size={18} strokeWidth={isNeoBrutalist ? 2.5 : 2} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Match Teams Banner */}
          <div
            className={cn(
              "flex items-center justify-around p-3 transition-colors",
              isNeoBrutalist
                ? "bg-[#faf8ee] border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000]"
                : "bg-surface-page p-3 rounded-sm border border-border-subtle"
            )}
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <TeamLogo
                name={match.homeTeam.name}
                color={match.homeTeam.color}
                logo={match.homeTeam.logo}
                className={cn(
                  "w-10 h-10 rounded-full",
                  isNeoBrutalist ? "border-2 border-black" : "border border-border-subtle"
                )}
              />
              <span
                className={cn(
                  "text-xs max-w-[100px] truncate",
                  isNeoBrutalist ? "text-black font-black" : "text-text-primary font-bold"
                )}
              >
                {match.homeTeam.name}
              </span>
            </div>

            <span
              className={cn(
                "text-xs font-mono uppercase tracking-widest",
                isNeoBrutalist ? "text-black font-black" : "text-text-muted font-bold"
              )}
            >
              VS
            </span>

            <div className="flex flex-col items-center gap-1 text-center">
              <TeamLogo
                name={match.awayTeam.name}
                color={match.awayTeam.color}
                logo={match.awayTeam.logo}
                className={cn(
                  "w-10 h-10 rounded-full",
                  isNeoBrutalist ? "border-2 border-black" : "border border-border-subtle"
                )}
              />
              <span
                className={cn(
                  "text-xs max-w-[100px] truncate",
                  isNeoBrutalist ? "text-black font-black" : "text-text-primary font-bold"
                )}
              >
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          {/* Selection Grid */}
          <div>
            <span
              className={cn(
                "text-xs uppercase tracking-wider block mb-2",
                isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted font-bold"
              )}
            >
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
              <label
                htmlFor="modal-stake-input"
                className={cn(
                  "text-xs uppercase tracking-wider",
                  isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted font-bold"
                )}
              >
                Stake Amount
              </label>
              <span className={cn("text-xs", isNeoBrutalist ? "text-black/80 font-bold" : "text-text-muted")}>
                Balance:{" "}
                <strong className={cn("font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-text-primary")}>
                  {formatNumber(balance)} KOR
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStakeChange(stake - 50)}
                disabled={stake <= 50}
                aria-label="Decrease stake by 50"
                className={cn(
                  "h-10 w-10 flex items-center justify-center transition-all disabled:opacity-40 focus-visible:outline-2",
                  isNeoBrutalist
                    ? "bg-white border-2 border-black rounded-[6px] text-black font-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600] active:translate-x-[1px] active:translate-y-[1px]"
                    : "rounded-sm bg-surface-raised border border-border-subtle hover:border-border-strong text-text-primary focus-visible:outline-accent"
                )}
              >
                <Minus size={16} />
              </button>

              <div className="flex-1 relative">
                <input
                  id="modal-stake-input"
                  type="number"
                  value={stake === 0 ? "" : stake}
                  placeholder="0"
                  onChange={(e) => handleStakeChange(Number(e.target.value))}
                  className={cn(
                    "w-full h-10 px-3 text-center font-mono font-bold text-sm tabular-nums focus:outline-none transition-colors",
                    isNeoBrutalist
                      ? "bg-[#fcfaf2] border-2 border-black rounded-[6px] text-black font-black focus:bg-white"
                      : "bg-surface-page border border-border-subtle rounded-sm text-text-primary focus:border-accent"
                  )}
                  min={1}
                  max={balance}
                />
              </div>

              <button
                onClick={() => handleStakeChange(stake + 50)}
                disabled={stake >= balance}
                aria-label="Increase stake by 50"
                className={cn(
                  "h-10 w-10 flex items-center justify-center transition-all disabled:opacity-40 focus-visible:outline-2",
                  isNeoBrutalist
                    ? "bg-white border-2 border-black rounded-[6px] text-black font-black shadow-[2px_2px_0_#000] hover:bg-[#ffe600] active:translate-x-[1px] active:translate-y-[1px]"
                    : "rounded-sm bg-surface-raised border border-border-subtle hover:border-border-strong text-text-primary focus-visible:outline-accent"
                )}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick Stake Buttons */}
            <div className="flex gap-1.5">
              {quickStakes.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleStakeChange((stake || 0) + amount)}
                  disabled={(stake || 0) + amount > balance}
                  className={cn(
                    "flex-1 py-1 text-xs font-mono font-bold transition-all focus-visible:outline-2 cursor-pointer",
                    isNeoBrutalist
                      ? "bg-white text-black border-2 border-black rounded-[6px] hover:bg-[#ffe600] active:translate-x-[1px] active:translate-y-[1px] font-black shadow-[1.5px_1.5px_0_#000]"
                      : "bg-surface-page text-text-muted border-border-subtle hover:text-text-primary hover:border-border-strong rounded-sm border",
                    (stake || 0) + amount > balance && "opacity-40 cursor-not-allowed"
                  )}
                >
                  +{amount}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleStakeChange(balance)}
                className={cn(
                  "flex-1 py-1 text-xs font-mono font-bold transition-all focus-visible:outline-2 cursor-pointer",
                  isNeoBrutalist
                    ? "bg-[#00ff66] text-black border-2 border-black rounded-[6px] font-black shadow-[1.5px_1.5px_0_#000] hover:bg-[#00dd55] active:translate-x-[1px] active:translate-y-[1px]"
                    : "rounded-sm bg-surface-page text-semantic-reward border border-border-subtle hover:border-semantic-reward font-bold"
                )}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Bet Summary Box */}
          {selection && (
            <div
              className={cn(
                "p-3 space-y-2 transition-colors",
                isNeoBrutalist
                  ? "bg-[#faf8ee] border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000]"
                  : "bg-surface-page rounded-sm border border-border-subtle"
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted"}>Selection</span>
                <span className={cn("font-bold", isNeoBrutalist ? "text-black font-black" : "text-accent")}>
                  {getSelectionLabel(selection)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted"}>Odds</span>
                <span className={cn("font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-text-primary font-bold")}>
                  {selectedOdds.toFixed(2)}x
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center justify-between text-xs pt-2",
                  isNeoBrutalist ? "border-t-2 border-black" : "border-t border-border-subtle"
                )}
              >
                <span className={cn(isNeoBrutalist ? "text-black font-black" : "text-text-muted font-semibold")}>
                  Potential Return
                </span>
                <span
                  className={cn(
                    "font-mono text-sm tabular-nums",
                    isNeoBrutalist ? "text-black font-black" : "text-semantic-reward font-bold"
                  )}
                >
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
              "w-full py-3 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 focus-visible:outline-2",
              canPlaceBet && !bettingClosed && !isLoading
                ? isNeoBrutalist
                  ? "bg-[#00ff66] text-black border-2 border-black rounded-[8px] font-black shadow-[3px_3px_0_#000] hover:bg-[#00dd55] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                  : "bg-accent text-surface-page hover:bg-accent-hover active:bg-accent-active cursor-pointer rounded-sm"
                : isNeoBrutalist
                ? "bg-slate-200 text-black/40 border-2 border-black/40 rounded-[8px] cursor-not-allowed font-black"
                : "bg-surface-raised text-text-muted border border-border-subtle cursor-not-allowed rounded-sm"
            )}
          >
            {!selection ? (
              "Select an Outcome"
            ) : bettingClosed ? (
              "Betting Closed"
            ) : stake <= 0 ? (
              "Enter Stake Amount"
            ) : stake > balance ? (
              "Insufficient KOR Balance"
            ) : isLoading ? (
              <span>Placing Bet...</span>
            ) : (
              <>
                <Check size={16} strokeWidth={2.5} />
                Confirm Bet ({formatNumber(stake)} KOR)
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
  const { isNeoBrutalist } = useTheme();
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-2 transition-all focus-visible:outline-2",
        isNeoBrutalist
          ? selected
            ? "bg-[#00ff66] border-2 border-black rounded-[6px] text-black font-black shadow-[2px_2px_0_#000]"
            : "bg-white border-2 border-black rounded-[6px] text-black shadow-[1.5px_1.5px_0_#000] hover:bg-[#ffe600]"
          : selected
          ? "bg-[#062E1E] border-accent text-accent font-bold rounded-sm border"
          : "bg-surface-page border-border-subtle hover:bg-surface-panel hover:border-border-strong text-text-primary rounded-sm border"
      )}
    >
      <span
        className={cn(
          "text-xs uppercase mb-0.5",
          isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted font-bold"
        )}
      >
        {label} ({subLabel})
      </span>
      <span className="text-sm font-mono font-bold tabular-nums">
        {odds.toFixed(2)}
      </span>
    </button>
  );
}

export default BetModal;

