import type { Bet } from "../../types";
import { IconTicket, IconTrophy, IconZap, IconCheck, IconX } from "../Icons";

// ─── Status badge style ──────────────────────────────────────────────────────

function statusBadge(status: string) {
  if (status === "won") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
        <IconCheck className="w-3 h-3" />
        WON
      </span>
    );
  }
  if (status === "lost") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/20">
        <IconX className="w-3 h-3" />
        LOST
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      IN PLAY
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
      className={`broadcast-card rounded-xl px-4 py-3 border transition-all duration-300 relative overflow-hidden ${
        isWon
          ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-slate-900/90 shadow-sm shadow-emerald-500/10"
          : isLost
          ? "border-red-500/20 bg-slate-900/60 opacity-80"
          : "border-white/10 bg-slate-900/80 hover:border-emerald-500/30"
      }`}
    >
      {/* Top Header: Title + Status Badge */}
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <IconTicket className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="text-xs font-black text-white uppercase italic tracking-tight truncate block">
              {b.homeTeamName && b.awayTeamName
                ? `${b.homeTeamName} vs ${b.awayTeamName}`
                : `Match #${b.matchId.slice(-4)}`}
            </span>
          </div>
        </div>
        <div className="shrink-0">{statusBadge(b.status)}</div>
      </div>

      {/* Bottom Bar: Selection Tag + Odds + Stake + Result Return */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-white/5 rounded-lg px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pick:</span>
          <span className="font-black text-amber-400 uppercase text-xs">
            {b.selection.toUpperCase()}
          </span>
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 led-number">
            @{Number(b.odds).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-slate-400 text-[11px]">
            <span className="text-[9px] uppercase font-bold text-slate-500 mr-1">Stake:</span>
            <span className="font-extrabold text-white led-number">{b.stake} Coins</span>
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
    <div className={`broadcast-card rounded-2xl p-4.5 border transition-all duration-300 relative overflow-hidden ${
      isWon ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/90" :
      isLost ? "border-red-500/20 bg-slate-900/60 opacity-80" :
      "border-white/10 bg-slate-900/80 hover:border-emerald-500/30"
    }`}>
      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <IconZap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">
              ACCUMULATOR COMBO • {legs.length} LEGS
            </div>
            <div className="text-xs text-slate-300 font-bold">
              Combo Multiplier: <span className="text-emerald-400 font-black led-number">@{totalOdds.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {statusBadge(accStatus)}
      </div>

      {/* Legs List */}
      <div className="space-y-1.5 mb-3">
        {legs.map((leg, li) => (
          <AccLeg key={`leg-${leg.id}-${li}`} leg={leg} />
        ))}
      </div>

      {/* Stake & Potential Return Row */}
      <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2.5">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[10px] uppercase tracking-wider font-bold">Total Stake:</span>
          <span className="font-extrabold text-white led-number">{stake} Coins</span>
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
    <div className="flex items-center justify-between bg-slate-950/60 border border-white/5 rounded-xl px-3 py-2">
      <div className="text-xs">
        <span className="text-slate-300 font-semibold">
          {leg.homeTeamName && leg.awayTeamName
            ? `${leg.homeTeamName} vs ${leg.awayTeamName}`
            : `Match #${leg.matchId.slice(-4)}`}
        </span>
        <div className="text-[11px] font-black text-amber-400 uppercase">
          Pick: {leg.selection.toUpperCase()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-emerald-400 font-bold font-mono">
          @{Number(leg.odds).toFixed(2)}
        </span>
        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
          isWon ? "bg-emerald-500/20 text-emerald-400" :
          isLost ? "bg-red-500/20 text-red-400" :
          "bg-slate-800 text-slate-400"
        }`}>
          {leg.status}
        </span>
      </div>
    </div>
  );
}

function BetReturn({ bet: b }: { bet: Bet }) {
  if (b.status === "won") {
    return (
      <span className="text-emerald-400 font-black text-xs flex items-center gap-1 led-number">
        <IconTrophy className="w-3.5 h-3.5 text-amber-400" />
        +{b.potentialReturn.toFixed(0)} KOR WON
      </span>
    );
  }
  if (b.status === "lost") {
    return <span className="text-red-400 font-bold text-xs">0 KOR (Settled)</span>;
  }
  return (
    <span className="text-amber-400 font-black text-xs led-number">
      Win: {b.potentialReturn.toFixed(0)} KOR
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
      <span className="text-emerald-400 font-black text-xs flex items-center gap-1 led-number">
        <IconTrophy className="w-3.5 h-3.5 text-amber-400" />
        +{potentialReturn.toFixed(0)} KOR WON
      </span>
    );
  }
  if (status === "lost") {
    return (
      <span className="text-red-400 font-bold text-xs">0 KOR (Settled)</span>
    );
  }
  return (
    <span className="text-amber-400 font-black text-xs led-number">
      Win: {potentialReturn.toFixed(0)} KOR
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyBetsState({ tab }: { tab: "ongoing" | "ended" }) {
  return (
    <div className="broadcast-card rounded-2xl p-12 text-center border border-white/10 my-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-2xl">
        🎫
      </div>
      <div className="font-black text-lg text-white uppercase italic tracking-tight">
        No {tab === "ongoing" ? "Active Slips" : "Settled Slips"}
      </div>
      <div className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
        {tab === "ongoing"
          ? "Place predictions from the Live Arena tab during the betting window to track slips."
          : "Your past settled predictions and payouts will be archived here."}
      </div>
    </div>
  );
}
