import { useState } from "react";
import type { Bet } from "../../types";
import { Check, X, Clock, Zap, Ticket, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { formatNumber, cn } from "../../lib/utils";
import { soundFx } from "../../lib/soundFx";
import { useTheme } from "../../contexts/ThemeContext";

// ─── Explicit Status Badge (Text + Icon + Semantic Color) ────────────────────

function StatusBadge({ status }: { status: string }) {
  const { isNeoBrutalist } = useTheme();

  if (status === "won") {
    return isNeoBrutalist ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#00ff66] text-black border-2 border-black shadow-[1px_1px_0_#000] text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider">
        <Check size={12} strokeWidth={3} />
        <span>WON</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#062E1E] text-semantic-win border border-semantic-win/40 text-xs font-mono font-bold uppercase tracking-wider">
        <Check size={13} strokeWidth={2.5} />
        <span>WON</span>
      </span>
    );
  }
  if (status === "lost") {
    return isNeoBrutalist ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#ff3366] text-white border-2 border-black shadow-[1px_1px_0_#000] text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider">
        <X size={12} strokeWidth={3} />
        <span>LOST</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#381014] text-semantic-loss border border-semantic-loss/40 text-xs font-mono font-bold uppercase tracking-wider">
        <X size={13} strokeWidth={2.5} />
        <span>LOST</span>
      </span>
    );
  }
  return isNeoBrutalist ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#ffe600] text-black border-2 border-black shadow-[1px_1px_0_#000] text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider">
      <Clock size={12} strokeWidth={2.5} />
      <span>IN PLAY</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#382305] text-[#F59E0B] border border-[#F59E0B]/40 text-xs font-mono font-bold uppercase tracking-wider">
      <Clock size={13} strokeWidth={2.5} />
      <span>IN PLAY</span>
    </span>
  );
}

// ─── Single Bet Card ─────────────────────────────────────────────────────────

interface SingleBetCardProps {
  bet: Bet;
}

export function SingleBetCard({ bet: b }: SingleBetCardProps) {
  const { isNeoBrutalist } = useTheme();
  const isWon = b.status === "won";
  const isLost = b.status === "lost";

  return (
    <div
      className={cn(
        "p-3 sm:p-3.5 transition-colors",
        isNeoBrutalist
          ? cn(
              "rounded-[8px] sm:rounded-[10px] border-2 border-black shadow-[3px_3px_0_#000] text-black",
              isWon ? "bg-[#f0fff4]" : isLost ? "bg-[#fff5f5] opacity-90" : "bg-white"
            )
          : cn(
              "bg-surface-panel rounded-sm border",
              isWon
                ? "border-semantic-win/40 bg-surface-panel"
                : isLost
                ? "border-border-subtle opacity-80"
                : "border-border-subtle hover:border-border-strong"
            )
      )}
    >
      {/* Top Header: Title + Status Badge */}
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "w-6 h-6 flex items-center justify-center shrink-0",
              isNeoBrutalist
                ? "bg-[#ffe600] border-2 border-black rounded-[4px] text-black shadow-[1px_1px_0_#000]"
                : "rounded-sm bg-surface-raised border border-border-subtle text-text-muted"
            )}
          >
            <Ticket size={13} strokeWidth={isNeoBrutalist ? 2.5 : 2} />
          </div>
          <span
            className={cn(
              "text-xs uppercase tracking-tight truncate",
              isNeoBrutalist ? "font-black text-black" : "font-bold text-text-primary"
            )}
          >
            {b.homeTeamName && b.awayTeamName
              ? `${b.homeTeamName} vs ${b.awayTeamName}`
              : `Match #${b.matchId.slice(-4)}`}
          </span>
        </div>
        <StatusBadge status={b.status} />
      </div>

      {/* Bottom Row: Selection + Odds + Stake + Return */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-1.5 text-xs",
          isNeoBrutalist
            ? "bg-[#fcfaf2] border-[1.5px] border-black rounded-[6px]"
            : "bg-surface-page border border-border-subtle rounded-sm"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={cn("text-xs uppercase", isNeoBrutalist ? "font-black text-black/70" : "font-semibold text-text-muted")}>
            Pick:
          </span>
          <span className={cn("uppercase", isNeoBrutalist ? "font-black text-black" : "font-bold text-text-primary")}>
            {b.selection.toUpperCase()}
          </span>
          <span
            className={cn(
              "text-xs font-mono font-bold px-1.5 py-0.5 rounded-sm tabular-nums",
              isNeoBrutalist
                ? "bg-white text-black border border-black shadow-[1px_1px_0_#000] font-black"
                : "text-accent bg-surface-raised border border-border-subtle"
            )}
          >
            @{Number(b.odds).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className={cn("uppercase mr-1", isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted")}>
              Stake:
            </span>
            <span className={cn("font-mono tabular-nums", isNeoBrutalist ? "font-black text-black" : "font-bold text-text-primary")}>
              {b.stake} Coins
            </span>
          </div>
          <div>
            <BetReturn bet={b} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Accumulator Bet Card ─────────────────────────────────────────────────────

interface AccumulatorBetCardProps {
  accId: string;
  legs: Bet[];
}

export function AccumulatorBetCard({ accId, legs }: AccumulatorBetCardProps) {
  const { isNeoBrutalist } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const firstLeg = legs[0];
  const accStatus = legs.every((l) => l.status === "won")
    ? "won"
    : legs.some((l) => l.status === "lost")
      ? "lost"
      : "pending";
  const totalOdds = legs.reduce((p, l) => p * l.odds, 1);
  const stake = firstLeg.stake;
  const potentialReturn = stake * totalOdds;

  const isWon = accStatus === "won";
  const isLost = accStatus === "lost";

  return (
    <div
      className={cn(
        "p-3.5 transition-colors",
        isNeoBrutalist
          ? cn(
              "rounded-[8px] sm:rounded-[10px] border-2 border-black shadow-[3px_3px_0_#000] text-black",
              isWon ? "bg-[#f0fff4]" : isLost ? "bg-[#fff5f5] opacity-90" : "bg-white"
            )
          : cn(
              "bg-surface-panel rounded-sm border",
              isWon
                ? "border-semantic-win/40 bg-surface-panel"
                : isLost
                ? "border-border-subtle opacity-80"
                : "border-border-subtle hover:border-border-strong"
            )
      )}
    >
      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 flex items-center justify-center shrink-0",
              isNeoBrutalist
                ? "bg-[#ffe600] border-2 border-black rounded-[4px] text-black shadow-[1px_1px_0_#000]"
                : "rounded-sm bg-surface-raised border border-border-subtle text-semantic-reward"
            )}
          >
            <Zap size={15} strokeWidth={isNeoBrutalist ? 2.5 : 2} />
          </div>
          <div>
            <div
              className={cn(
                "text-xs uppercase tracking-wider flex items-center gap-2 font-mono",
                isNeoBrutalist ? "text-black font-black" : "text-text-primary font-bold"
              )}
            >
              ACCUMULATOR COMBO
              <span className={isNeoBrutalist ? "text-black/60 font-black" : "text-text-muted font-normal"}>
                ({legs.length} Legs)
              </span>
            </div>
            <div className={cn("text-xs", isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted")}>
              Total Odds:{" "}
              <span className={cn("font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-text-primary font-bold")}>
                @{totalOdds.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={accStatus} />
          <button
            onClick={() => {
              soundFx.playClick();
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? "Collapse accumulator legs" : "Expand accumulator legs"}
            className={cn(
              "p-1 transition-colors cursor-pointer",
              isNeoBrutalist
                ? "border-2 border-black bg-white text-black hover:bg-[#ffe600] rounded-[4px] shadow-[1px_1px_0_#000]"
                : "rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent"
            )}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Collapsible Legs List */}
      {isExpanded && (
        <div className="space-y-1.5 mb-2.5 animate-slide-up">
          {legs.map((leg, li) => (
            <AccLeg key={`leg-${leg.id}-${li}`} leg={leg} />
          ))}
        </div>
      )}

      {/* Stake & Return Row */}
      <div
        className={cn(
          "flex justify-between items-center text-xs pt-2",
          isNeoBrutalist ? "border-t-[1.5px] border-black" : "border-t border-border-subtle"
        )}
      >
        <div className="flex items-center gap-1">
          <span className={cn("uppercase", isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted")}>
            Stake:
          </span>
          <span className={cn("font-mono tabular-nums", isNeoBrutalist ? "text-black font-black" : "text-text-primary font-bold")}>
            {stake} Coins
          </span>
        </div>
        <div>
          <AccReturn status={accStatus} potentialReturn={potentialReturn} />
        </div>
      </div>
    </div>
  );
}

function AccLeg({ leg }: { leg: Bet }) {
  const { isNeoBrutalist } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2.5 py-1.5",
        isNeoBrutalist
          ? "bg-[#fcfaf2] border-[1.5px] border-black rounded-[6px]"
          : "bg-surface-page border border-border-subtle rounded-sm"
      )}
    >
      <div className="text-xs min-w-0 pr-2">
        <span
          className={cn(
            "truncate block",
            isNeoBrutalist ? "text-black font-black" : "text-text-primary font-semibold"
          )}
        >
          {leg.homeTeamName && leg.awayTeamName
            ? `${leg.homeTeamName} vs ${leg.awayTeamName}`
            : `Match #${leg.matchId.slice(-4)}`}
        </span>
        <div
          className={cn(
            "text-xs uppercase",
            isNeoBrutalist ? "text-[#ff0055] font-black" : "text-accent font-bold"
          )}
        >
          Pick: {leg.selection.toUpperCase()}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            "text-xs font-mono font-bold tabular-nums",
            isNeoBrutalist
              ? "bg-white text-black border border-black px-1.5 py-0.5 rounded-[4px] shadow-[1px_1px_0_#000] font-black"
              : "text-text-primary"
          )}
        >
          @{Number(leg.odds).toFixed(2)}
        </span>
        <StatusBadge status={leg.status} />
      </div>
    </div>
  );
}

function BetReturn({ bet: b }: { bet: Bet }) {
  const { isNeoBrutalist } = useTheme();

  if (b.status === "won") {
    return (
      <span
        className={cn(
          "font-mono text-xs flex items-center gap-1 tabular-nums",
          isNeoBrutalist ? "text-[#008833] font-black" : "text-semantic-win font-bold"
        )}
      >
        <Trophy size={13} className={isNeoBrutalist ? "text-[#008833]" : "text-semantic-reward"} />
        +{formatNumber(b.potentialReturn || 0)} KOR
      </span>
    );
  }
  if (b.status === "lost") {
    return (
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          isNeoBrutalist ? "text-[#ff3366] font-black" : "text-semantic-loss"
        )}
      >
        0 KOR
      </span>
    );
  }
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        isNeoBrutalist ? "text-black font-black" : "text-semantic-reward font-bold"
      )}
    >
      Win: {formatNumber(b.potentialReturn || 0)} KOR
    </span>
  );
}

function AccReturn({
  status,
  potentialReturn,
}: {
  status: string;
  potentialReturn: number;
}) {
  const { isNeoBrutalist } = useTheme();

  if (status === "won") {
    return (
      <span
        className={cn(
          "font-mono text-xs flex items-center gap-1 tabular-nums",
          isNeoBrutalist ? "text-[#008833] font-black" : "text-semantic-win font-bold"
        )}
      >
        <Trophy size={13} className={isNeoBrutalist ? "text-[#008833]" : "text-semantic-reward"} />
        +{formatNumber(potentialReturn)} KOR
      </span>
    );
  }
  if (status === "lost") {
    return (
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          isNeoBrutalist ? "text-[#ff3366] font-black" : "text-semantic-loss"
        )}
      >
        0 KOR
      </span>
    );
  }
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        isNeoBrutalist ? "text-black font-black" : "text-semantic-reward font-bold"
      )}
    >
      Win: {formatNumber(potentialReturn)} KOR
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyBetsState({ tab }: { tab: "ongoing" | "ended" }) {
  const { isNeoBrutalist } = useTheme();

  return (
    <div
      className={cn(
        "p-10 text-center my-4 transition-all",
        isNeoBrutalist
          ? "bg-white border-2 border-black rounded-[10px] shadow-[3px_3px_0_#000] text-black"
          : "bg-surface-panel rounded-sm border border-border-subtle"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 mx-auto mb-3 flex items-center justify-center shrink-0",
          isNeoBrutalist
            ? "bg-[#ffe600] border-2 border-black rounded-[8px] text-black shadow-[2px_2px_0_#000]"
            : "rounded-sm bg-surface-raised border border-border-subtle text-text-muted"
        )}
      >
        <Ticket size={22} strokeWidth={isNeoBrutalist ? 2.5 : 1.5} />
      </div>
      <div
        className={cn(
          "text-sm uppercase tracking-wide",
          isNeoBrutalist ? "font-black text-black" : "font-bold text-text-primary"
        )}
      >
        No {tab === "ongoing" ? "Active Slips" : "Settled Slips"}
      </div>
      <p
        className={cn(
          "text-xs mt-1 max-w-xs mx-auto",
          isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted"
        )}
      >
        {tab === "ongoing"
          ? "Lock in predictions during the betting window to track slips here."
          : "Your past settled predictions and payouts will appear here."}
      </p>
    </div>
  );
}

