import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cn, formatNumber } from "../lib/utils";
import type { BetSlipSelection } from "../types";
import { soundFx } from "../lib/soundFx";
import { useTheme } from "../contexts/ThemeContext";
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
  const { isNeoBrutalist } = useTheme();
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
      ? `${(sel.match.homeTeam as any).shortName || sel.match.homeTeam.name} vs ${(sel.match.awayTeam as any).shortName || sel.match.awayTeam.name}`
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
          className={cn(
            "lg:hidden fixed inset-0 z-[95] backdrop-blur-[2px] transition-opacity",
            isNeoBrutalist ? "bg-black/60" : "bg-black/60"
          )}
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Betting Slip"
        className={cn(
          "fixed z-[100] flex flex-col transition-all duration-300",
          isNeoBrutalist
            ? "bg-[#fffef0] text-black shadow-[-4px_0_0_#000]"
            : "bg-surface-panel border-border-subtle text-text-primary shadow-modal",
          // Mobile bottom sheet
          "bottom-0 left-0 right-0 overflow-hidden",
          isNeoBrutalist
            ? "border-t-[3.5px] border-black rounded-t-xl"
            : "border-t rounded-t-xl",
          isExpanded ? "max-h-[85vh] h-[85vh]" : "max-h-[70px] h-[70px]",
          // Desktop fixed right sidebar
          "lg:top-16 lg:bottom-0 lg:left-auto lg:right-0 lg:w-[380px] lg:h-[calc(100vh-64px)] lg:max-h-none lg:rounded-none",
          isNeoBrutalist
            ? "lg:border-l-[3.5px] lg:border-black lg:border-t-0"
            : "lg:border-l lg:border-t-0"
        )}
      >
        {/* Mobile Top Header (Tappable bar to expand / collapse) */}
        <div
          onClick={toggleExpand}
          className={cn(
            "lg:cursor-default cursor-pointer select-none flex flex-col transition-colors",
            isNeoBrutalist
              ? "bg-[#ffe600] border-b-[2.5px] border-black text-black"
              : "border-b border-border-subtle bg-surface-raised hover:bg-surface-page/50"
          )}
        >
          {/* Mobile Pull Arrow Key Indicator */}
          <div className="lg:hidden w-full flex justify-center pt-1.5 pb-0.5">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-4 rounded-full transition-transform hover:scale-110",
                isNeoBrutalist
                  ? "bg-white border-2 border-black text-black shadow-[1px_1px_0_#000]"
                  : "bg-surface-panel border border-border-strong text-accent"
              )}
            >
              {isExpanded ? (
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  className={isNeoBrutalist ? "text-black" : "text-text-muted"}
                />
              ) : (
                <ChevronUp
                  size={14}
                  strokeWidth={2.5}
                  className={isNeoBrutalist ? "text-black animate-pulse" : "text-accent animate-pulse"}
                />
              )}
            </div>
          </div>

          {/* Header Content Row */}
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1 lg:py-3">
            <div className="flex items-center gap-2">
              <h2
                className={cn(
                  "text-xs font-black uppercase tracking-wider flex items-center gap-2 font-mono",
                  isNeoBrutalist ? "text-black" : "text-text-primary"
                )}
              >
                BET SLIP
                {isNeoBrutalist ? (
                  <span className="px-2 py-0.5 rounded-[4px] bg-black text-[#ffe600] text-[11px] font-black font-mono border border-black shadow-[1px_1px_0_#000]">
                    {selections.length} {selections.length === 1 ? "Pick" : "Picks"}
                  </span>
                ) : (
                  <Chip variant="accent">
                    {selections.length} {selections.length === 1 ? "Pick" : "Picks"}
                  </Chip>
                )}
              </h2>

              {/* Same-Match Warning Tag in header if conflict exists */}
              {hasDuplicateMatches && betType === "accumulator" && (
                <span
                  className={cn(
                    "hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs",
                    isNeoBrutalist
                      ? "bg-[#ff0055] text-white border border-black shadow-[1px_1px_0_#000]"
                      : "bg-semantic-loss/20 text-semantic-loss border border-semantic-loss/30"
                  )}
                >
                  <AlertTriangle size={11} />
                  Conflict
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Quick summary preview when collapsed on mobile */}
              {!isExpanded && (
                <div
                  className={cn(
                    "lg:hidden flex items-center gap-1.5 text-xs font-mono font-black mr-1",
                    isNeoBrutalist ? "text-black" : "text-text-muted"
                  )}
                >
                  <span>{totalOdds.toFixed(2)}x</span>
                  <span className={isNeoBrutalist ? "text-black font-black" : "text-semantic-reward"}>
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
                className={cn(
                  "lg:hidden flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-all cursor-pointer",
                  isNeoBrutalist
                    ? "bg-white border-2 border-black text-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    : "bg-surface-panel border border-border-subtle text-text-primary hover:border-border-strong"
                )}
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
                className={cn(
                  "text-xs font-bold p-1.5 rounded transition-all flex items-center gap-1 cursor-pointer",
                  isNeoBrutalist
                    ? "text-black hover:bg-black hover:text-white border border-transparent hover:border-black"
                    : "text-text-muted hover:text-semantic-loss hover:bg-surface-panel focus-visible:outline-2 focus-visible:outline-accent"
                )}
              >
                <Trash2 size={14} strokeWidth={2.5} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Single vs Accumulator Segmented Controls */}
        <div
          className={cn(
            "p-3 shrink-0",
            isNeoBrutalist
              ? "bg-[#fffef0] border-b-2 border-black"
              : "bg-surface-panel border-b border-border-subtle"
          )}
        >
          <div
            className={cn(
              "grid grid-cols-2 gap-1.5 p-1 rounded",
              isNeoBrutalist
                ? "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
                : "bg-surface-page border border-border-subtle"
            )}
          >
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setBetType("single");
              }}
              className={cn(
                "py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer",
                isNeoBrutalist
                  ? betType === "single"
                    ? "bg-[#ffe600] text-black border-2 border-black font-black shadow-[1px_1px_0_#000]"
                    : "text-black/70 hover:text-black font-bold"
                  : betType === "single"
                  ? "bg-surface-raised text-text-primary border border-border-strong"
                  : "text-text-muted hover:text-text-primary"
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
                "py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                isNeoBrutalist
                  ? betType === "accumulator"
                    ? hasDuplicateMatches
                      ? "bg-[#ff0055] text-white border-2 border-black font-black"
                      : "bg-[#00f0ff] text-black border-2 border-black font-black shadow-[1px_1px_0_#000]"
                    : "text-black/70 hover:text-black font-bold"
                  : betType === "accumulator"
                  ? hasDuplicateMatches
                    ? "bg-semantic-loss/20 text-semantic-loss border border-semantic-loss/40 font-extrabold"
                    : "bg-accent text-surface-page font-extrabold"
                  : "text-text-muted hover:text-text-primary",
                selections.length < 2 && "opacity-40 cursor-not-allowed"
              )}
            >
              <Zap size={13} strokeWidth={2.5} />
              <span>Acca Combo</span>
              {hasDuplicateMatches && (
                <span
                  className="w-2 h-2 rounded-full bg-red-600 shrink-0"
                  title="Conflict: 2+ picks from same match"
                />
              )}
            </button>
          </div>

          {/* Accumulator Conflict Warning Banner */}
          {isAccumulatorInvalid && (
            <div
              className={cn(
                "mt-2.5 p-2.5 rounded flex items-start gap-2",
                isNeoBrutalist
                  ? "bg-[#ffebee] border-2 border-[#ff0055] text-black shadow-[2px_2px_0_#ff0055]"
                  : "bg-semantic-loss/10 border border-semantic-loss/30"
              )}
            >
              <AlertTriangle
                size={16}
                className={isNeoBrutalist ? "text-[#ff0055] shrink-0 mt-0.5" : "text-semantic-loss shrink-0 mt-0.5"}
              />
              <div className="flex flex-col gap-1 text-xs flex-1">
                <span
                  className={cn(
                    "font-black uppercase tracking-wide",
                    isNeoBrutalist ? "text-[#ff0055]" : "text-semantic-loss"
                  )}
                >
                  Cannot Place Accumulator
                </span>
                <p className={isNeoBrutalist ? "text-black/80 leading-tight text-[11px]" : "text-text-muted leading-tight text-[11px]"}>
                  You selected multiple outcomes from the same match (
                  <span className="font-bold underline">
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
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-bold transition-all",
                      isNeoBrutalist
                        ? "bg-white text-black border-2 border-black shadow-[1px_1px_0_#000] hover:bg-[#ffe600]"
                        : "bg-surface-raised text-text-primary border border-border-strong hover:bg-surface-page"
                    )}
                  >
                    Switch to Singles
                  </button>
                  <span className={cn("text-[10px]", isNeoBrutalist ? "text-black/60" : "text-text-muted")}>
                    or remove duplicate picks below
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selections List */}
        <div
          className={cn(
            "flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar",
            isNeoBrutalist ? "bg-[#faf8ee]" : "bg-transparent"
          )}
        >
          {selections.map((sel) => {
            const isConflicting =
              betType === "accumulator" &&
              (matchPicksMap[sel.matchId] || 0) > 1;

            return (
              <div
                key={`${sel.matchId}-${sel.selection}`}
                className={cn(
                  "p-2.5 rounded transition-all flex items-center justify-between",
                  isNeoBrutalist
                    ? isConflicting
                      ? "bg-[#fff0f2] border-2 border-[#ff0055] shadow-[2px_2px_0_#ff0055]"
                      : "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
                    : isConflicting
                    ? "border-semantic-loss/50 bg-semantic-loss/5 hover:border-semantic-loss border"
                    : "bg-surface-page border border-border-subtle hover:border-border-strong"
                )}
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0 mr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "text-xs truncate",
                        isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted font-medium"
                      )}
                    >
                      {sel.match.homeTeam.name} vs {sel.match.awayTeam.name}
                    </span>
                    {isConflicting && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-xs text-[10px] font-bold uppercase tracking-wider",
                          isNeoBrutalist
                            ? "bg-[#ff0055] text-white border border-black"
                            : "bg-semantic-loss/20 text-semantic-loss border border-semantic-loss/30"
                        )}
                      >
                        Same Match Conflict
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-black",
                      isNeoBrutalist
                        ? isConflicting
                          ? "text-[#ff0055]"
                          : "text-black"
                        : isConflicting
                        ? "text-semantic-loss"
                        : "text-accent"
                    )}
                  >
                    {getSelectionLabel(sel)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-mono font-black tabular-nums border",
                      isNeoBrutalist
                        ? "bg-[#ffe600] text-black border-black shadow-[1px_1px_0_#000]"
                        : "bg-surface-raised text-text-primary border-border-subtle"
                    )}
                  >
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
                    className={cn(
                      "p-1 rounded transition-colors cursor-pointer",
                      isNeoBrutalist
                        ? "text-black hover:text-[#ff0055] hover:bg-black/10"
                        : "text-text-muted hover:text-semantic-loss hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent"
                    )}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Summary & Stake Controls */}
        <div
          className={cn(
            "p-3.5 flex flex-col gap-2.5 shrink-0",
            isNeoBrutalist
              ? "bg-[#fffef0] border-t-2 border-black"
              : "bg-surface-panel border-t border-border-subtle"
          )}
        >
          {/* Total Odds & Estimated Payout */}
          <div
            className={cn(
              "flex justify-between items-center p-2.5 rounded border",
              isNeoBrutalist
                ? "bg-white border-2 border-black shadow-[3px_3px_0_#000]"
                : "bg-surface-page border-border-subtle"
            )}
          >
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isNeoBrutalist ? "text-black/60 font-black" : "text-text-muted"
                )}
              >
                {betType === "accumulator" ? "Combo Multiplier" : "Total Odds"}
              </span>
              <span
                className={cn(
                  "text-lg font-black font-mono tabular-nums",
                  isAccumulatorInvalid
                    ? isNeoBrutalist
                      ? "text-[#ff0055] text-sm uppercase font-black"
                      : "text-semantic-loss text-sm uppercase font-bold"
                    : isNeoBrutalist
                    ? "text-black"
                    : "text-text-primary"
                )}
              >
                {isAccumulatorInvalid ? "Invalid" : `${totalOdds.toFixed(2)}x`}
              </span>
            </div>

            <div className="flex flex-col items-end text-right">
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isNeoBrutalist ? "text-black/60 font-black" : "text-text-muted"
                )}
              >
                Potential Return
              </span>
              <span
                className={cn(
                  "text-lg font-black font-mono tabular-nums",
                  isNeoBrutalist ? "text-[#00aa44]" : "text-semantic-reward"
                )}
              >
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
                  "flex-1 py-1 rounded text-xs font-mono font-bold border transition-all cursor-pointer",
                  isNeoBrutalist
                    ? stake === amount
                      ? "bg-[#ffe600] text-black border-2 border-black font-black shadow-[1.5px_1.5px_0_#000]"
                      : "bg-white text-black border-2 border-black hover:bg-[#fff7b3] font-black shadow-[1px_1px_0_#000]"
                    : stake === amount
                    ? "bg-surface-raised text-text-primary border-border-strong"
                    : "bg-surface-page text-text-muted border-border-subtle hover:text-text-primary hover:border-border-strong"
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
              className={cn(
                "flex-1 py-1 rounded text-xs font-mono font-black border transition-all cursor-pointer",
                isNeoBrutalist
                  ? "bg-[#00ff66] text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] hover:bg-[#12e069]"
                  : "bg-surface-page text-semantic-reward border-border-subtle hover:border-semantic-reward"
              )}
            >
              MAX
            </button>
          </div>

          {/* Stake Input with Real Label */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded border transition-all",
              isNeoBrutalist
                ? "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
                : "bg-surface-page border-border-subtle focus-within:border-accent"
            )}
          >
            <Coins
              size={16}
              className={isNeoBrutalist ? "text-amber-500 shrink-0" : "text-semantic-reward shrink-0"}
            />
            <label
              htmlFor="betslip-stake-input"
              className={cn(
                "text-xs font-semibold",
                isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted"
              )}
            >
              Stake:
            </label>
            <input
              id="betslip-stake-input"
              type="number"
              value={stake}
              onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
              className={cn(
                "flex-1 bg-transparent text-right font-mono font-bold text-sm focus:outline-none tabular-nums",
                isNeoBrutalist ? "text-black font-black" : "text-text-primary"
              )}
              min={1}
              max={balance}
            />
            <span
              className={cn(
                "text-xs font-bold",
                isNeoBrutalist ? "text-black font-black" : "text-text-muted"
              )}
            >
              KOR
            </span>
          </div>

          {/* Balance Reminder */}
          <div
            className={cn(
              "flex justify-between items-center text-xs px-1",
              isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted"
            )}
          >
            <span>Available:</span>
            <span
              className={cn(
                "font-mono tabular-nums font-bold",
                isNeoBrutalist ? "text-black font-black" : "text-text-primary"
              )}
            >
              {formatNumber(balance)} KOR
            </span>
          </div>

          {/* Place Bet Action Button */}
          <button
            type="button"
            onClick={handlePlaceBet}
            disabled={!isBettingOpen || !canPlaceBet || isLoading}
            className={cn(
              "w-full py-3 rounded font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2",
              isNeoBrutalist
                ? isBettingOpen && canPlaceBet && !isLoading
                  ? "bg-[#00ff66] hover:bg-[#14eb6c] text-black font-black border-[3px] border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                  : isAccumulatorInvalid
                  ? "bg-[#ff0055] text-white border-2 border-black cursor-not-allowed font-black"
                  : "bg-slate-200 text-slate-500 border-2 border-black/40 cursor-not-allowed font-bold"
                : isBettingOpen && canPlaceBet && !isLoading
                ? "bg-accent text-surface-page hover:bg-accent-hover active:bg-accent-active cursor-pointer"
                : isAccumulatorInvalid
                ? "bg-semantic-loss/20 text-semantic-loss border border-semantic-loss/40 cursor-not-allowed"
                : "bg-surface-raised text-text-muted border border-border-subtle cursor-not-allowed"
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
              "Insufficient KOR"
            ) : (
              <>
                <Check size={16} strokeWidth={2.5} />
                Lock In Bet ({formatNumber(stake)} KOR)
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
