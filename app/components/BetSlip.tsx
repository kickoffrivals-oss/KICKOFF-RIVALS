import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cn, formatNumber } from "../lib/utils";
import type { BetSlipSelection } from "../types";
import { soundFx } from "../lib/soundFx";
import {
  X,
  Trash2,
  Zap,
  Coins,
  Check,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Chip } from "./ui/Chip";

interface BetSlipProps {
  selections: BetSlipSelection[];
  balance: number;
  gameState?: string;
  onRemoveSelection: (matchId: string, selection?: string) => void;
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

  // Group selections by matchId to identify any same-match duplicates
  const matchPicksMap = selections.reduce<Record<string, number>>((acc, sel) => {
    acc[sel.matchId] = (acc[sel.matchId] || 0) + 1;
    return acc;
  }, {});

  const conflictingMatchIds = Object.keys(matchPicksMap).filter(
    (id) => matchPicksMap[id] > 1,
  );
  const hasDuplicateMatches = conflictingMatchIds.length > 0;
  const isAccumulatorInvalid = betType === "accumulator" && hasDuplicateMatches;

  const conflictingMatchNames = conflictingMatchIds.map((id) => {
    const sel = selections.find((s) => s.matchId === id);
    return sel
      ? `${sel.match.homeTeam.shortName || sel.match.homeTeam.name} vs ${sel.match.awayTeam.shortName || sel.match.awayTeam.name}`
      : id;
  });

  useEffect(() => {
    if (prevCount === 1 && selections.length >= 2) {
      // Auto-switch to accumulator only if there are no same-match conflicts
      const matchIds = selections.map((s) => s.matchId);
      const hasDup = new Set(matchIds).size !== matchIds.length;
      if (!hasDup) {
        setBetType("accumulator");
      }
    } else if (selections.length <= 1 && betType === "accumulator") {
      setBetType("single");
    }
    setPrevCount(selections.length);
  }, [selections.length, betType, prevCount]);

  if (selections.length === 0) {
    return null;
  }

  const totalOdds = Number(
    selections.reduce((acc, sel) => acc * sel.odds, 1).toFixed(2),
  );
  const potentialWin =
    betType === "accumulator"
      ? Math.round(stake * totalOdds)
      : Math.round(selections.reduce((acc, sel) => acc + stake * sel.odds, 0));

  const canPlaceBet = stake > 0 && stake <= balance && !isAccumulatorInvalid;

  const handlePlaceBet = async () => {
    if (!isBettingOpen) {
      toast.error("Betting is closed. Matches are currently in play.");
      return;
    }

    if (isAccumulatorInvalid) {
      toast.error(
        `Cannot place accumulator: You selected multiple outcomes for the same match (${conflictingMatchNames.join(
          ", ",
        )}). Please remove duplicate picks or switch to Singles.`,
      );
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
          setIsExpanded(false);
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

  const toggleExpand = () => {
    soundFx.playClick();
    setIsExpanded((prev) => !prev);
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
    <>
      {/* Mobile Backdrop Overlay when sheet is expanded */}
      {isExpanded && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[95] backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Betting Slip"
        className={cn(
          "fixed z-[100] bg-surface-panel border-border-subtle flex flex-col transition-all duration-300 shadow-modal",
          // Mobile bottom sheet
          "bottom-0 left-0 right-0 border-t rounded-t-xl overflow-hidden",
          isExpanded ? "max-h-[85vh] h-[85vh]" : "max-h-[70px] h-[70px]",
          // Desktop fixed right sidebar
          "lg:top-16 lg:bottom-0 lg:left-auto lg:right-0 lg:w-[380px] lg:h-[calc(100vh-64px)] lg:max-h-none lg:border-l lg:border-t-0 lg:rounded-none",
        )}
      >
        {/* Mobile Top Header (Tappable bar to expand / collapse) */}
        <div
          onClick={toggleExpand}
          className="lg:cursor-default cursor-pointer select-none border-b border-border-subtle bg-surface-raised flex flex-col transition-colors hover:bg-surface-page/50"
        >
          {/* Mobile Pull Arrow Key Indicator (replaces dash with arrow key) */}
          <div className="lg:hidden w-full flex justify-center pt-1.5 pb-0.5">
            <div className="flex items-center justify-center w-8 h-4 rounded-full bg-surface-panel border border-border-strong text-accent transition-transform hover:scale-110">
              {isExpanded ? (
                <ChevronDown size={14} strokeWidth={2.5} className="text-text-muted" />
              ) : (
                <ChevronUp size={14} strokeWidth={2.5} className="text-accent animate-pulse" />
              )}
            </div>
          </div>

          {/* Header Content Row */}
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1 lg:py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2 font-mono">
                BET SLIP
                <Chip variant="accent">
                  {selections.length} {selections.length === 1 ? "Pick" : "Picks"}
                </Chip>
              </h2>

              {/* Same-Match Warning Tag in header if conflict exists */}
              {hasDuplicateMatches && betType === "accumulator" && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-semantic-loss/20 text-semantic-loss border border-semantic-loss/30">
                  <AlertTriangle size={11} />
                  Conflict
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Quick summary preview when collapsed on mobile */}
              {!isExpanded && (
                <div className="lg:hidden flex items-center gap-1.5 text-xs font-mono font-bold text-text-muted mr-1">
                  <span>{totalOdds.toFixed(2)}x</span>
                  <span className="text-semantic-reward">
                    • {formatNumber(potentialWin)}
                  </span>
                </div>
              )}

              {/* Mobile Expand / Collapse Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                className="lg:hidden flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-sm bg-surface-panel border border-border-subtle text-text-primary hover:border-border-strong transition-colors"
                aria-label={
                  isExpanded
                    ? "Collapse bet slip"
                    : "Expand bet slip to view selected games"
                }
              >
                {isExpanded ? (
                  <>
                    <span>Hide</span>
                    <ChevronDown size={14} />
                  </>
                ) : (
                  <>
                    <span>View</span>
                    <ChevronUp size={14} />
                  </>
                )}
              </button>

              {/* Clear All Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  onClearAll();
                }}
                aria-label="Clear all selections"
                className="text-xs font-semibold text-text-muted hover:text-semantic-loss p-1.5 rounded-sm hover:bg-surface-panel transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Trash2 size={14} strokeWidth={2} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Single vs Accumulator Segmented Controls */}
        <div className="p-3 bg-surface-panel border-b border-border-subtle shrink-0">
          <div className="grid grid-cols-2 gap-1 bg-surface-page p-1 rounded-sm border border-border-subtle">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setBetType("single");
              }}
              className={cn(
                "py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                betType === "single"
                  ? "bg-surface-raised text-text-primary border border-border-strong"
                  : "text-text-muted hover:text-text-primary",
              )}
            >
              Singles ({selections.length})
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setBetType("accumulator");
              }}
              disabled={selections.length < 2}
              className={cn(
                "py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-accent",
                betType === "accumulator"
                  ? hasDuplicateMatches
                    ? "bg-semantic-loss/20 text-semantic-loss border border-semantic-loss/40 font-extrabold"
                    : "bg-accent text-surface-page font-extrabold"
                  : "text-text-muted hover:text-text-primary",
                selections.length < 2 && "opacity-40 cursor-not-allowed",
              )}
            >
              <Zap size={13} strokeWidth={2.5} />
              <span>Acca Combo</span>
              {hasDuplicateMatches && (
                <span
                  className="w-2 h-2 rounded-full bg-semantic-loss shrink-0"
                  title="Conflict: 2+ picks from same match"
                />
              )}
            </button>
          </div>

          {/* Accumulator Conflict Warning Banner */}
          {isAccumulatorInvalid && (
            <div className="mt-2.5 p-2.5 rounded-sm bg-semantic-loss/10 border border-semantic-loss/30 flex items-start gap-2 animate-in fade-in duration-200">
              <AlertTriangle
                size={16}
                className="text-semantic-loss shrink-0 mt-0.5"
              />
              <div className="flex flex-col gap-1 text-xs flex-1">
                <span className="font-bold text-semantic-loss uppercase tracking-wide">
                  Cannot Place Accumulator
                </span>
                <p className="text-text-muted leading-tight text-[11px]">
                  You selected multiple outcomes from the same match (
                  <span className="text-text-primary font-semibold">
                    {conflictingMatchNames.join(", ")}
                  </span>
                  ). Accumulators require picks from separate matches.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setBetType("single");
                    }}
                    className="px-2 py-0.5 rounded-xs bg-surface-raised text-text-primary font-bold text-[11px] border border-border-strong hover:bg-surface-page transition-colors"
                  >
                    Switch to Singles
                  </button>
                  <span className="text-[10px] text-text-muted">
                    or remove duplicate picks below
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selections List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {selections.map((sel) => {
            const isConflicting =
              betType === "accumulator" &&
              (matchPicksMap[sel.matchId] || 0) > 1;

            return (
              <div
                key={`${sel.matchId}-${sel.selection}`}
                className={cn(
                  "p-2.5 rounded-sm bg-surface-page border transition-colors flex items-center justify-between",
                  isConflicting
                    ? "border-semantic-loss/50 bg-semantic-loss/5 hover:border-semantic-loss"
                    : "border-border-subtle hover:border-border-strong",
                )}
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0 mr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-text-muted truncate">
                      {sel.match.homeTeam.name} vs {sel.match.awayTeam.name}
                    </span>
                    {isConflicting && (
                      <span className="px-1.5 py-0.2 rounded-xs bg-semantic-loss/20 text-semantic-loss text-[10px] font-bold uppercase tracking-wider border border-semantic-loss/30">
                        Same Match Conflict
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isConflicting ? "text-semantic-loss" : "text-accent",
                    )}
                  >
                    {getSelectionLabel(sel)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-sm bg-surface-raised text-text-primary text-xs font-mono font-bold tabular-nums border border-border-subtle">
                    {sel.odds.toFixed(2)}x
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playClick();
                      onRemoveSelection(sel.matchId, sel.selection);
                    }}
                    aria-label={`Remove pick for ${sel.match.homeTeam.name} vs ${sel.match.awayTeam.name}`}
                    className="p-1 rounded-sm text-text-muted hover:text-semantic-loss hover:bg-surface-raised transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Summary & Stake Controls */}
        <div className="p-3.5 bg-surface-panel border-t border-border-subtle flex flex-col gap-2.5 shrink-0">
          {/* Total Odds & Estimated Payout */}
          <div className="flex justify-between items-center bg-surface-page p-2.5 rounded-sm border border-border-subtle">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {betType === "accumulator" ? "Combo Multiplier" : "Total Odds"}
              </span>
              <span
                className={cn(
                  "text-lg font-black font-mono tabular-nums",
                  isAccumulatorInvalid
                    ? "text-semantic-loss text-sm uppercase font-bold"
                    : "text-text-primary",
                )}
              >
                {isAccumulatorInvalid ? "Invalid" : `${totalOdds.toFixed(2)}x`}
              </span>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Potential Return
              </span>
              <span className="text-lg font-black font-mono tabular-nums text-semantic-reward">
                {isAccumulatorInvalid
                  ? "—"
                  : `${formatNumber(potentialWin)} KOR`}
              </span>
            </div>
          </div>

          {/* Quick Stake Chips */}
          <div className="flex gap-1.5">
            {[50, 100, 500, 1000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setStake(amount);
                }}
                className={cn(
                  "flex-1 py-1 rounded-sm text-xs font-mono font-bold border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                  stake === amount
                    ? "bg-surface-raised text-text-primary border-border-strong"
                    : "bg-surface-page text-text-muted border-border-subtle hover:text-text-primary hover:border-border-strong",
                )}
              >
                +{amount}
              </button>
            ))}
            <button
              type="button"
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
            <label
              htmlFor="betslip-stake-input"
              className="text-xs font-semibold text-text-muted"
            >
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
            type="button"
            onClick={handlePlaceBet}
            disabled={!isBettingOpen || !canPlaceBet || isLoading}
            className={cn(
              "w-full py-3 rounded-sm font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-accent",
              isBettingOpen && canPlaceBet && !isLoading
                ? "bg-accent text-surface-page hover:bg-accent-hover active:bg-accent-active cursor-pointer"
                : isAccumulatorInvalid
                ? "bg-semantic-loss/20 text-semantic-loss border border-semantic-loss/40 cursor-not-allowed"
                : "bg-surface-raised text-text-muted border border-border-subtle cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <span>Locking Bet...</span>
            ) : !isBettingOpen ? (
              "BETTING CLOSED • MATCH IN PLAY"
            ) : isAccumulatorInvalid ? (
              <>
                <AlertTriangle size={15} />
                <span>Conflict: 2+ Picks From Same Match</span>
              </>
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
    </>
  );
}
