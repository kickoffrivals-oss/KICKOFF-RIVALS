import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cn, formatNumber } from "../lib/utils";
import type { BetSlipSelection } from "../types";
import { soundFx } from "../lib/soundFx";
import { X, Trash2, Zap, Coins, Check } from "lucide-react";
import { Chip } from "./ui/Chip";

interface BetSlipProps {
  selections: BetSlipSelection[];
  balance: number;
  gameState?: string;
  onRemoveSelection: (matchId: string) => void;
  onClearAll: () => void;
  onPlaceBet: (
    stake: number,
    betType: "single" | "accumulator",
  ) => Promise<boolean>;
}

export function BetSlip({
  selections,
  balance,
  gameState,
  onRemoveSelection,
  onClearAll,
  onPlaceBet,
}: BetSlipProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stake, setStake] = useState(100);
  const [betType, setBetType] = useState<"single" | "accumulator">("single");
  const [prevCount, setPrevCount] = useState(selections.length);

  const isBettingOpen = !gameState || gameState === "BETTING";

  useEffect(() => {
    if (prevCount === 1 && selections.length === 2) {
      setBetType("accumulator");
    } else if (selections.length <= 1 && betType === "accumulator") {
      setBetType("single");
    }
    setPrevCount(selections.length);
  }, [selections.length, betType, prevCount]);

  if (selections.length === 0) {
    return null;
  }

  const totalOdds = Number(selections.reduce((acc, sel) => acc * sel.odds, 1).toFixed(2));
  const potentialWin =
    betType === "accumulator"
      ? Math.round(stake * totalOdds)
      : Math.round(selections.reduce((acc, sel) => acc + stake * sel.odds, 0));

  const canPlaceBet = stake > 0 && stake <= balance;

  const handlePlaceBet = async () => {
    if (!isBettingOpen) {
      toast.error("Betting is closed. Matches are currently in play.");
      return;
    }

    if (canPlaceBet) {
      setIsLoading(true);
      soundFx.playClick();
      try {
        const success = await onPlaceBet(stake, betType);
        if (success) {
          soundFx.playWin();
          toast.success("Bets confirmed & locked in!");
        } else {
          toast.error("Betting round is closed or failed.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred placing your bet.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSelectionLabel = (sel: BetSlipSelection) => {
    switch (sel.selection) {
      case "home":
        return `${sel.match.homeTeam.name} Win (1)`;
      case "away":
        return `${sel.match.awayTeam.name} Win (2)`;
      case "draw":
        return "Draw (X)";
      case "gg":
        return "Both Teams Score (GG)";
      case "nogg":
        return "Clean Sheet (NoGG)";
      default:
        return sel.selectionLabel;
    }
  };

  return (
    <aside
      aria-label="Betting Slip"
      className={cn(
        "fixed z-[100] bg-surface-panel border-border-subtle flex flex-col transition-all shadow-modal",
        // Mobile bottom sheet
        "bottom-0 left-0 right-0 border-t rounded-t-md",
        isExpanded ? "max-h-[80vh] h-[80vh]" : "max-h-[76px] h-[76px]",
        // Desktop fixed right sidebar
        "lg:top-16 lg:bottom-0 lg:left-auto lg:right-0 lg:w-[380px] lg:h-[calc(100vh-64px)] lg:max-h-none lg:border-l lg:border-t-0 lg:rounded-none"
      )}
    >
      {/* Mobile Handle */}
      <div
        className="lg:hidden w-full flex justify-center py-2 cursor-pointer select-none"
        onClick={() => {
          soundFx.playClick();
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="w-10 h-1 bg-border-strong rounded-full" />
      </div>

      {/* Slip Header Banner */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-raised">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2 font-mono">
            BET SLIP
            <Chip variant="accent">
              {selections.length} {selections.length === 1 ? "Pick" : "Picks"}
            </Chip>
          </h2>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onClearAll();
          }}
          aria-label="Clear all selections"
          className="text-xs font-semibold text-text-muted hover:text-semantic-loss p-1.5 rounded-sm hover:bg-surface-panel transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Trash2 size={14} strokeWidth={2} />
          <span>Clear</span>
        </button>
      </div>

      {/* Single vs Accumulator Segmented Controls */}
      <div className="p-3 bg-surface-panel border-b border-border-subtle">
        <div className="grid grid-cols-2 gap-1 bg-surface-page p-1 rounded-sm border border-border-subtle">
          <button
            onClick={() => {
              soundFx.playClick();
              setBetType("single");
            }}
            className={cn(
              "py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              betType === "single"
                ? "bg-surface-raised text-text-primary border border-border-strong"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Singles ({selections.length})
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setBetType("accumulator");
            }}
            disabled={selections.length < 2}
            className={cn(
              "py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1 focus-visible:outline-2 focus-visible:outline-accent",
              betType === "accumulator"
                ? "bg-accent text-surface-page font-extrabold"
                : "text-text-muted hover:text-text-primary",
              selections.length < 2 && "opacity-40 cursor-not-allowed"
            )}
          >
            <Zap size={13} strokeWidth={2.5} />
            Acca Combo
          </button>
        </div>
      </div>

      {/* Selections List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {selections.map((sel) => (
          <div
            key={sel.matchId}
            className="p-2.5 rounded-sm bg-surface-page border border-border-subtle flex items-center justify-between hover:border-border-strong transition-colors"
          >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 mr-2">
              <span className="text-xs font-medium text-text-muted truncate">
                {sel.match.homeTeam.name} vs {sel.match.awayTeam.name}
              </span>
              <span className="text-xs font-bold text-accent">
                {getSelectionLabel(sel)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm bg-surface-raised text-text-primary text-xs font-mono font-bold tabular-nums border border-border-subtle">
                {sel.odds.toFixed(2)}x
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onRemoveSelection(sel.matchId);
                }}
                aria-label={`Remove pick for ${sel.match.homeTeam.name} vs ${sel.match.awayTeam.name}`}
                className="p-1 rounded-sm text-text-muted hover:text-semantic-loss hover:bg-surface-raised transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary & Stake Controls */}
      <div className="p-3.5 bg-surface-panel border-t border-border-subtle flex flex-col gap-2.5">
        {/* Total Odds & Estimated Payout */}
        <div className="flex justify-between items-center bg-surface-page p-2.5 rounded-sm border border-border-subtle">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {betType === "accumulator" ? "Combo Multiplier" : "Total Odds"}
            </span>
            <span className="text-lg font-black font-mono tabular-nums text-text-primary">
              {totalOdds.toFixed(2)}x
            </span>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Potential Return
            </span>
            <span className="text-lg font-black font-mono tabular-nums text-semantic-reward">
              {formatNumber(potentialWin)} KOR
            </span>
          </div>
        </div>

        {/* Quick Stake Chips */}
        <div className="flex gap-1.5">
          {[50, 100, 500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => {
                soundFx.playClick();
                setStake(amount);
              }}
              className={cn(
                "flex-1 py-1 rounded-sm text-xs font-mono font-bold border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                stake === amount
                  ? "bg-surface-raised text-text-primary border-border-strong"
                  : "bg-surface-page text-text-muted border-border-subtle hover:text-text-primary hover:border-border-strong"
              )}
            >
              +{amount}
            </button>
          ))}
          <button
            onClick={() => {
              soundFx.playClick();
              setStake(balance);
            }}
            className="flex-1 py-1 rounded-sm text-xs font-mono font-bold bg-surface-page text-semantic-reward border border-border-subtle hover:border-semantic-reward transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          >
            MAX
          </button>
        </div>

        {/* Stake Input with Real Label */}
        <div className="flex items-center gap-2 bg-surface-page px-3 py-1.5 rounded-sm border border-border-subtle focus-within:border-accent">
          <Coins size={16} className="text-semantic-reward shrink-0" />
          <label htmlFor="betslip-stake-input" className="text-xs font-semibold text-text-muted">
            Stake:
          </label>
          <input
            id="betslip-stake-input"
            type="number"
            value={stake}
            onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
            className="flex-1 bg-transparent text-right font-mono font-bold text-text-primary text-sm focus:outline-none tabular-nums"
            min={1}
            max={balance}
          />
          <span className="text-xs font-bold text-text-muted">Coins</span>
        </div>

        {/* Balance Reminder */}
        <div className="flex justify-between items-center text-xs text-text-muted px-1">
          <span>Available:</span>
          <span className="font-mono tabular-nums text-text-primary font-bold">
            {formatNumber(balance)} Coins
          </span>
        </div>

        {/* Place Bet Action Button */}
        <button
          onClick={handlePlaceBet}
          disabled={!isBettingOpen || !canPlaceBet || isLoading}
          className={cn(
            "w-full py-3 rounded-sm font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-accent",
            isBettingOpen && canPlaceBet && !isLoading
              ? "bg-accent text-surface-page hover:bg-accent-hover active:bg-accent-active cursor-pointer"
              : "bg-surface-raised text-text-muted border border-border-subtle cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span>Locking Bet...</span>
          ) : !isBettingOpen ? (
            "BETTING CLOSED • MATCH IN PLAY"
          ) : !canPlaceBet ? (
            "Insufficient Coins"
          ) : (
            <>
              <Check size={16} strokeWidth={2.5} />
              Lock In Bet ({formatNumber(stake)} Coins)
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

