import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGame } from "../../contexts/GameContext";
import {
  SingleBetCard,
  AccumulatorBetCard,
  EmptyBetsState,
} from "../../components/dashboard/BetCards";
import type { Bet } from "../../types";
import { soundFx } from "../../lib/soundFx";
import { Ticket, Trophy } from "lucide-react";
import { formatNumber } from "../../lib/utils";

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
    <main className="p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-4">
      {/* Bets Header */}
      <div className="bg-surface-panel border border-border-subtle rounded-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-surface-raised border border-border-subtle flex items-center justify-center text-accent">
            <Ticket size={20} strokeWidth={2} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
              MATCHDAY PORTFOLIO
            </span>
            <h1 className="text-base sm:text-lg font-black text-text-primary font-display tracking-tight uppercase">
              MY BET SLIPS
            </h1>
          </div>
        </div>

        <div className="text-right bg-surface-raised border border-border-subtle px-3 py-1.5 rounded-sm">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            Total Won
          </span>
          <span className="text-sm font-black text-semantic-reward font-mono tabular-nums flex items-center justify-end gap-1">
            <Trophy size={13} className="text-semantic-reward" />
            {formatNumber(totalWon)} KOR
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <BetTabToggle
        active={betTab}
        onChange={(t) => {
          soundFx.playClick();
          setBetTab(t);
        }}
      />

      {/* Cards Stream */}
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
    <div className="flex bg-surface-page p-1 rounded-sm border border-border-subtle">
      {(["ongoing", "ended"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
            active === tab
              ? "bg-surface-raised text-text-primary border border-border-strong font-bold"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {tab === "ongoing" ? "Active Slips" : "Settled History"}
        </button>
      ))}
    </div>
  );
}

