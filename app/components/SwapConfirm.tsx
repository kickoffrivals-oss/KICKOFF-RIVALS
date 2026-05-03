import { cn } from "../lib/utils";
import { CONVERSION_RATE, CONVERSION_YIELD } from "../constants";
import {
  IconX,
  IconCoins,
  IconZap,
  IconChevronRight,
  IconCheck,
  IconAlert,
} from "./Icons";

interface SwapConfirmProps {
  coins: number;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

import { useState, useEffect } from "react";

export function SwapConfirm({ coins, onConfirm, onCancel }: SwapConfirmProps) {
  const MIN_SWAP = 2000;
  const MAX_SWAP = 10000;
  const STEP = 1000;

  const [selectedAmount, setSelectedAmount] = useState(() => {
    if (coins < MIN_SWAP) return MIN_SWAP;
    return MIN_SWAP;
  });

  const resultingKOR = Math.floor(selectedAmount / CONVERSION_RATE) * CONVERSION_YIELD;
  const remainingCoins = coins - selectedAmount;

  const canConvert = coins >= MIN_SWAP && selectedAmount <= coins;

  const handleIncrement = () => {
    setSelectedAmount(prev => Math.min(prev + STEP, MAX_SWAP, Math.floor(coins / STEP) * STEP));
  };

  const handleDecrement = () => {
    setSelectedAmount(prev => Math.max(prev - STEP, MIN_SWAP));
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-background border border-border rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/10 blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 relative px-6">
          <div>
            <h2 className="font-black text-xl tracking-tight text-foreground uppercase italic">Swap Assets</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Coin to KOR Token</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-muted transition-all active:scale-90"
          >
            <IconX className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Amount Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select Amount</span>
              <span className="text-xs font-bold text-primary italic">Balance: {coins.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-2xl border border-border/50">
              <button
                onClick={handleDecrement}
                disabled={selectedAmount <= MIN_SWAP}
                className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-2xl font-bold hover:bg-muted active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                -
              </button>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <IconCoins className="w-4 h-4 text-yellow-500" />
                  <span className="text-2xl font-black text-foreground tabular-nums">
                    {selectedAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Coins to Swap</p>
              </div>

              <button
                onClick={handleIncrement}
                disabled={selectedAmount >= MAX_SWAP || selectedAmount + STEP > coins}
                className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold hover:opacity-90 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-primary/20"
              >
                +
              </button>
            </div>
          </div>

          {/* Conversion Result */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center z-10">
                <IconChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/50">
              <div className="bg-background/50 p-4 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">You Pay</p>
                <div className="flex items-center justify-center gap-1.5">
                  <IconCoins className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="font-extrabold text-foreground">{selectedAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-background/50 p-4 text-center">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">You Receive</p>
                <div className="flex items-center justify-center gap-1.5">
                  <IconZap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-extrabold text-primary tabular-nums">{resultingKOR.toLocaleString()} KOR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info & Warning */}
          <div className="space-y-3">
            {coins < MIN_SWAP ? (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                <p className="text-[10px] font-bold text-destructive uppercase">Insufficient Balance</p>
                <p className="text-[9px] text-destructive/80 font-medium">You need at least {MIN_SWAP.toLocaleString()} coins to swap.</p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center flex items-center gap-2 justify-center">
                <IconAlert className="w-3 h-3 text-yellow-500" />
                <p className="text-[9px] text-yellow-700 dark:text-yellow-400 font-bold uppercase tracking-tighter italic">Warning: This action is irreversible</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 h-12 rounded-2xl border border-border font-bold text-xs hover:bg-muted transition-all active:scale-95 uppercase"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selectedAmount)}
              disabled={!canConvert}
              className={cn(
                "flex-[1.5] h-12 rounded-2xl font-black text-xs transition-all active:scale-95 uppercase tracking-widest shadow-xl shadow-primary/20",
                canConvert ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              Confirm Swap
            </button>
          </div>

          <div className="text-center pt-2 opacity-50">
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">
              {CONVERSION_RATE} COINS = {CONVERSION_YIELD} KOR TOKENS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwapConfirm;
