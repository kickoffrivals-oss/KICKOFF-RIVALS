import { useState } from "react";
import type { Bet } from "../../types";
import { Check, X, Clock, Zap, Ticket, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { formatNumber } from "../../lib/utils";
import { soundFx } from "../../lib/soundFx";

// ─── Explicit Status Badge (Text + Icon + Semantic Color) ────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "won") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#062E1E] text-semantic-win border border-semantic-win/40 text-xs font-mono font-bold uppercase tracking-wider">
        <Check size={13} strokeWidth={2.5} />
        <span>WON</span>
      </span>
    );
  }
  if (status === "lost") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#381014] text-semantic-loss border border-semantic-loss/40 text-xs font-mono font-bold uppercase tracking-wider">
        <X size={13} strokeWidth={2.5} />
        <span>LOST</span>
      </span>
    );
  }
  return (
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
  const isWon = b.status === "won";
  const isLost = b.status === "lost";

  return (
    <div
      className={`bg-surface-panel rounded-sm p-3 sm:p-3.5 border transition-colors ${
        isWon
          ? "border-semantic-win/40 bg-surface-panel"
          : isLost
          ? "border-border-subtle opacity-80"
          : "border-border-subtle hover:border-border-strong"
      }`}
    >
      {/* Top Header: Title + Status Badge */}
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-sm bg-surface-raised border border-border-subtle flex items-center justify-center text-text-muted shrink-0">
            <Ticket size={13} strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-text-primary uppercase tracking-tight truncate">
            {b.homeTeamName && b.awayTeamName
              ? `${b.homeTeamName} vs ${b.awayTeamName}`
              : `Match #${b.matchId.slice(-4)}`}
          </span>
        </div>
        <StatusBadge status={b.status} />
      </div>

      {/* Bottom Row: Selection + Odds + Stake + Return */}
      <div className="flex items-center justify-between bg-surface-page border border-border-subtle rounded-sm px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted uppercase">Pick:</span>
          <span className="font-bold text-text-primary uppercase">
            {b.selection.toUpperCase()}
          </span>
          <span className="text-xs font-mono font-bold text-accent bg-surface-raised px-1.5 py-0.2 rounded-sm border border-border-subtle tabular-nums">
            @{Number(b.odds).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-text-muted text-xs">
            <span className="uppercase text-text-muted mr-1">Stake:</span>
            <span className="font-mono font-bold text-text-primary tabular-nums">{b.stake} Coins</span>
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
      className={`bg-surface-panel rounded-sm p-3.5 border transition-colors ${
        isWon
          ? "border-semantic-win/40 bg-surface-panel"
          : isLost
          ? "border-border-subtle opacity-80"
          : "border-border-subtle hover:border-border-strong"
      }`}
    >
      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-surface-raised border border-border-subtle flex items-center justify-center text-semantic-reward">
            <Zap size={15} strokeWidth={2} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2 font-mono">
              ACCUMULATOR COMBO
              <span className="text-text-muted font-normal">({legs.length} Legs)</span>
            </div>
            <div className="text-xs text-text-muted">
              Total Odds: <span className="text-text-primary font-mono font-bold tabular-nums">@{totalOdds.toFixed(2)}</span>
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
            className="p-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
      <div className="flex justify-between items-center text-xs border-t border-border-subtle pt-2">
        <div className="flex items-center gap-1 text-text-muted">
          <span className="uppercase text-text-muted">Stake:</span>
          <span className="font-mono font-bold text-text-primary tabular-nums">{stake} Coins</span>
        </div>
        <div>
          <AccReturn status={accStatus} potentialReturn={potentialReturn} />
        </div>
      </div>
    </div>
  );
}

function AccLeg({ leg }: { leg: Bet }) {
  const isWon = leg.status === "won";
  const isLost = leg.status === "lost";

  return (
    <div className="flex items-center justify-between bg-surface-page border border-border-subtle rounded-sm px-2.5 py-1.5">
      <div className="text-xs min-w-0 pr-2">
        <span className="text-text-primary font-semibold truncate block">
          {leg.homeTeamName && leg.awayTeamName
            ? `${leg.homeTeamName} vs ${leg.awayTeamName}`
            : `Match #${leg.matchId.slice(-4)}`}
        </span>
        <div className="text-xs font-bold text-accent uppercase">
          Pick: {leg.selection.toUpperCase()}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-text-primary font-mono font-bold tabular-nums">
          @{Number(leg.odds).toFixed(2)}
        </span>
        <StatusBadge status={leg.status} />
      </div>
    </div>
  );
}

function BetReturn({ bet: b }: { bet: Bet }) {
  if (b.status === "won") {
    return (
      <span className="text-semantic-win font-bold font-mono text-xs flex items-center gap-1 tabular-nums">
        <Trophy size={13} className="text-semantic-reward" />
        +{formatNumber(b.potentialReturn || 0)} KOR
      </span>
    );
  }
  if (b.status === "lost") {
    return <span className="text-semantic-loss font-mono text-xs tabular-nums">0 KOR</span>;
  }
  return (
    <span className="text-semantic-reward font-mono font-bold text-xs tabular-nums">
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
  if (status === "won") {
    return (
      <span className="text-semantic-win font-bold font-mono text-xs flex items-center gap-1 tabular-nums">
        <Trophy size={13} className="text-semantic-reward" />
        +{formatNumber(potentialReturn)} KOR
      </span>
    );
  }
  if (status === "lost") {
    return <span className="text-semantic-loss font-mono text-xs tabular-nums">0 KOR</span>;
  }
  return (
    <span className="text-semantic-reward font-mono font-bold text-xs tabular-nums">
      Win: {formatNumber(potentialReturn)} KOR
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyBetsState({ tab }: { tab: "ongoing" | "ended" }) {
  return (
    <div className="bg-surface-panel rounded-sm p-10 text-center border border-border-subtle my-4">
      <div className="w-12 h-12 mx-auto mb-3 rounded-sm bg-surface-raised border border-border-subtle flex items-center justify-center text-text-muted">
        <Ticket size={22} strokeWidth={1.5} />
      </div>
      <div className="font-bold text-sm text-text-primary uppercase tracking-wide">
        No {tab === "ongoing" ? "Active Slips" : "Settled Slips"}
      </div>
      <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
        {tab === "ongoing"
          ? "Lock in predictions during the betting window to track slips here."
          : "Your past settled predictions and payouts will appear here."}
      </p>
    </div>
  );
}

