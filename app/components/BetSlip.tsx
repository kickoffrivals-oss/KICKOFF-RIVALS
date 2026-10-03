import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cn, formatNumber } from "../lib/utils";
import { BetSlipSelection } from "../types";
import {
  IconX,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconCheck,
  IconTicket,
  IconZap,
  IconCoins,
} from "./Icons";
import { soundFx } from "../lib/soundFx";

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
      toast.error("Betting is closed! Matches are currently in play.");
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
        toast.error("An error occurred.");
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
    <div
      className={cn(
        "fixed z-[100] broadcast-glass flex flex-col transition-all duration-300 backdrop-blur-2xl border-white/10 shadow-2xl",
        // Mobile bottom sheet
        "bottom-0 left-0 right-0 border-t rounded-t-3xl",
        isExpanded ? "max-h-[75vh] h-[75vh]" : "max-h-[80px] h-[80px]",
        // Desktop floating right sidebar
        "lg:top-16 lg:bottom-0 lg:left-auto lg:right-0 lg:w-[400px] lg:h-[calc(100vh-64px)] lg:max-h-none lg:border-l lg:border-t-0 lg:rounded-none"
      )}
    >
      {/* Mobile Draggable Pill Handle */}
      <div
        className="lg:hidden w-full flex justify-center py-2 cursor-pointer"
        onClick={() => {
          soundFx.playClick();
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
      </div>

      {/* Slip Header Banner */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <IconTicket className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              Bet Docket
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px]">
                {selections.length} {selections.length === 1 ? "Pick" : "Picks"}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onClearAll();
            }}
            className="text-[11px] font-bold text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all flex items-center gap-1"
            title="Clear All Picks"
          >
            <IconTrash className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Mode Selector (Single vs Accumulator) */}
      <div className="p-3 bg-slate-950/40 border-b border-white/5">
        <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              soundFx.playClick();
              setBetType("single");
            }}
            className={cn(
              "py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
              betType === "single"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow"
                : "text-slate-400 hover:text-white"
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
              "py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1",
              betType === "accumulator"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow"
                : "text-slate-400 hover:text-white",
              selections.length < 2 && "opacity-40 cursor-not-allowed"
            )}
          >
            <IconZap className="w-3.5 h-3.5" />
            Acca Multiplier
          </button>
        </div>
      </div>

      {/* Selections List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10">
        {selections.map((sel) => (
          <div
            key={sel.matchId}
            className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 mr-2">
              <span className="text-[10px] font-bold text-slate-400 truncate">
                {sel.match.homeTeam.name} vs {sel.match.awayTeam.name}
              </span>
              <span className="text-xs font-black text-emerald-300">
                {getSelectionLabel(sel)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-lg bg-slate-950 text-amber-400 text-xs font-black led-number border border-white/10">
                {sel.odds.toFixed(2)}x
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onRemoveSelection(sel.matchId);
                }}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary & Stake Controls */}
      <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-col gap-3">
        {/* Multiplier / Odds Gauge */}
        <div className="flex justify-between items-center bg-slate-900/90 p-3 rounded-xl border border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {betType === "accumulator" ? "Combo Multiplier" : "Total Odds"}
            </span>
            <span className="text-xl font-black text-amber-400 led-number">
              {totalOdds.toFixed(2)}x
            </span>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Est. Payout
            </span>
            <span className="text-xl font-black text-emerald-400 led-number">
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
                "flex-1 py-1 rounded-lg text-xs font-bold border transition-all",
                stake === amount
                  ? "bg-white text-slate-950 border-white shadow"
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
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
            className="flex-1 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
          >
            MAX
          </button>
        </div>

        {/* Stake Input */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-white/10">
          <IconCoins className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-400">Stake:</span>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
            className="flex-1 bg-transparent text-right font-black text-white text-sm focus:outline-none led-number"
            min={1}
            max={balance}
          />
          <span className="text-xs font-bold text-amber-400">Coins</span>
        </div>

        {/* Place Bet Action Button */}
        <button
          onClick={handlePlaceBet}
          disabled={!isBettingOpen || !canPlaceBet || isLoading}
          className={cn(
            "w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-sm text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2",
            isBettingOpen && canPlaceBet && !isLoading
              ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-110 active:scale-[0.99] shadow-emerald-500/25 cursor-pointer"
              : "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="animate-spin">⏳ Locking Bet...</span>
          ) : !isBettingOpen ? (
            "🔒 BETTING CLOSED • MATCH IN PLAY"
          ) : !canPlaceBet ? (
            "Insufficient Coins"
          ) : (
            <>
              <IconCheck className="w-4 h-4" />
              Lock In Bet ({formatNumber(stake)} Coins)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
