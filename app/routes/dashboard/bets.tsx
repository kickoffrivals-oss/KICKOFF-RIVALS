import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGame } from "../../contexts/GameContext";
import {
  SingleBetCard,
  AccumulatorBetCard,
  EmptyBetsState,
} from "../../components/dashboard/BetCards";
import type { Bet } from "../../types";
import { IconTicket, IconTrophy } from "../../components/Icons";
import { soundFx } from "../../lib/soundFx";

export const Route = createFileRoute("/dashboard/bets")({
  component: BetsTab,
});

type BetTicket =
  | { type: "single"; id: string; time: number; bet: Bet }
  | { type: "accumulator"; id: string; time: number; accId: string; legs: Bet[] };

function BetsTab() {
  const { activeBets } = useGame();
  const [betTab, setBetTab] = useState<"ongoing" | "ended">("ongoing");

  // 1. Group by Accumulator ID or Single
  const accMap = new Map<string, Bet[]>();
  const singles: Bet[] = [];

  for (const b of activeBets) {
    const isPending = b.status === "pending";
    if (betTab === "ongoing" && !isPending) continue;
    if (betTab === "ended" && isPending) continue;

    if (b.betType === "accumulator" && b.accumulatorId) {
      const list = accMap.get(b.accumulatorId) || [];
      list.push(b);
      accMap.set(b.accumulatorId, list);
    } else {
      singles.push(b);
    }
  }

  // 2. Build Unified Tickets
  const tickets: BetTicket[] = [];

  for (const b of singles) {
    const time =
      b.settledAt ||
      b.timestamp ||
      (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    tickets.push({
      type: "single",
      id: b.id,
      time,
      bet: b,
    });
  }

  for (const [accId, legs] of accMap.entries()) {
    const time = legs.reduce(
      (max, l) =>
        Math.max(
          max,
          l.settledAt ||
            l.timestamp ||
            (l.createdAt ? new Date(l.createdAt).getTime() : 0)
        ),
      0
    );
    tickets.push({
      type: "accumulator",
      id: accId,
      time,
      accId,
      legs,
    });
  }

  // 3. Sort strictly by timestamp descending (newest at the very top, oldest at the bottom)
  tickets.sort((a, b) => b.time - a.time);

  // 4. Calculate Total Won across ALL bets (singles & accumulators) regardless of active tab
  const allAccMap = new Map<string, Bet[]>();
  let totalWon = 0;

  for (const b of activeBets) {
    if (b.betType === "accumulator" && b.accumulatorId) {
      const list = allAccMap.get(b.accumulatorId) || [];
      list.push(b);
      allAccMap.set(b.accumulatorId, list);
    } else if (b.status === "won") {
      totalWon += b.potentialReturn || 0;
    }
  }

  for (const [, legs] of allAccMap.entries()) {
    if (legs.length > 0 && legs.every((l) => l.status === "won")) {
      totalWon += legs[0].potentialReturn || 0;
    }
  }

  return (
    <main className="p-4 max-w-xl mx-auto w-full space-y-4">
      {/* Broadcast Bets Header */}
      <div className="broadcast-card rounded-2xl p-5 border border-white/10 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-emerald-400">
              <IconTicket className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
              MATCHDAY PORTFOLIO
            </span>
            <h1 className="text-xl font-black text-white uppercase italic tracking-tight">
              MY BET SLIPS
            </h1>
          </div>
        </div>

        <div className="text-right bg-slate-950/70 border border-white/5 px-3.5 py-2 rounded-xl">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Won
          </span>
          <span className="text-sm font-black text-amber-400 flex items-center justify-end gap-1 led-number">
            <IconTrophy className="w-3.5 h-3.5 text-amber-400" />
            {totalWon.toLocaleString()} KOR
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <BetTabToggle active={betTab} onChange={(t) => {
        soundFx.playClick();
        setBetTab(t);
      }} />

      {/* Cards Stream in Exact Chronological Order */}
      <div className="space-y-2.5">
        {tickets.map((ticket) =>
          ticket.type === "single" ? (
            <SingleBetCard key={`ticket-${ticket.id}`} bet={ticket.bet} />
          ) : (
            <AccumulatorBetCard
              key={`ticket-acc-${ticket.id}`}
              accId={ticket.accId}
              legs={ticket.legs}
            />
          )
        )}

        {tickets.length === 0 && <EmptyBetsState tab={betTab} />}
      </div>
    </main>
  );
}

interface BetTabToggleProps {
  active: "ongoing" | "ended";
  onChange: (tab: "ongoing" | "ended") => void;
}

function BetTabToggle({ active, onChange }: BetTabToggleProps) {
  return (
    <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
      {(["ongoing", "ended"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            active === tab
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {tab === "ongoing" ? "Active Slips" : "Settled History"}
        </button>
      ))}
    </div>
  );
}
