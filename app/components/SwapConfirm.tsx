import { useState } from "react";
import { cn } from "../lib/utils";
import {
  IconX,
  IconCoins,
  IconZap,
  IconChevronRight,
} from "./Icons";
import { soundFx } from "../lib/soundFx";

interface SwapConfirmProps {
  korBalance: number;
  onConfirm: (korAmount: number) => void;
  onCancel: () => void;
}

export function SwapConfirm({ korBalance, onConfirm, onCancel }: SwapConfirmProps) {
  const MIN_SWAP = 50; // 50 KOR = 500 Coins
  const MAX_SWAP = 10000;
  const STEP = 50;

  const [selectedAmount, setSelectedAmount] = useState(() => {
    if (korBalance < MIN_SWAP) return MIN_SWAP;
    return Math.min(korBalance, 200);
  });

  const resultingCoins = selectedAmount * 10;
  const canConvert = korBalance >= MIN_SWAP && selectedAmount <= korBalance;

  const handleIncrement = () => {
    soundFx.playClick();
    setSelectedAmount((prev) =>
      Math.min(prev + STEP, MAX_SWAP, Math.floor(korBalance / STEP) * STEP)
    );
  };

  const handleDecrement = () => {
    soundFx.playClick();
    setSelectedAmount((prev) => Math.max(prev - STEP, MIN_SWAP));
  };

  const handleConfirm = () => {
    soundFx.playCashout();
    onConfirm(selectedAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm broadcast-card rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
        {/* Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative">
          <div>
            <h2 className="font-black text-lg text-white uppercase italic tracking-tight">
              SWAP KOR TO COINS
            </h2>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
              Convert KOR Tokens → Game Coins
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 space-y-6">
        {/* Amount Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Select KOR Amount</span>
            <span className="text-emerald-400 led-number">Balance: {korBalance.toLocaleString()} KOR</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-white/10">
            <button
              onClick={handleDecrement}
              disabled={selectedAmount <= MIN_SWAP}
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center text-xl font-black hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              -
            </button>

            <div className="flex-1 flex items-center justify-center gap-1.5">
              <input
                type="number"
                value={selectedAmount || ""}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setSelectedAmount(Math.min(val, korBalance));
                }}
                min={1}
                max={korBalance}
                placeholder="0"
                className="w-full bg-transparent text-center font-black text-emerald-400 text-2xl focus:outline-none led-number"
              />
              <span className="text-xs font-black text-emerald-400/80 mr-2">KOR</span>
            </div>

            <button
              onClick={handleIncrement}
              disabled={selectedAmount >= MAX_SWAP || selectedAmount + STEP > korBalance}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-xl font-black hover:scale-105 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-emerald-500/20"
            >
              +
            </button>
          </div>

          {/* Quick Selection Chips */}
          <div className="flex gap-1.5">
            {[50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedAmount(Math.min(amt, korBalance));
                }}
                disabled={amt > korBalance}
                className={cn(
                  "flex-1 py-1 rounded-lg text-xs font-bold border transition-all",
                  selectedAmount === amt
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white",
                  amt > korBalance && "opacity-40 cursor-not-allowed"
                )}
              >
                {amt}
              </button>
            ))}
            <button
              onClick={() => {
                soundFx.playClick();
                setSelectedAmount(korBalance);
              }}
              disabled={korBalance <= 0}
              className="flex-1 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 disabled:opacity-40"
            >
              MAX
            </button>
          </div>
        </div>

          {/* Conversion Breakdown */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-white/5">
            <div className="text-center p-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Paying</span>
              <div className="text-sm font-black text-emerald-400 led-number">
                {selectedAmount.toLocaleString()} KOR
              </div>
            </div>
            <div className="text-center p-2 border-l border-white/5">
              <span className="text-[9px] font-bold text-amber-400 uppercase block mb-1">Receiving</span>
              <div className="text-sm font-black text-amber-400 led-number">
                +{resultingCoins.toLocaleString()} Coins
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 h-12 rounded-xl border border-white/10 text-slate-300 font-bold text-xs uppercase hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConvert}
              className={cn(
                "flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
                canConvert
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
            >
              Confirm Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwapConfirm;
