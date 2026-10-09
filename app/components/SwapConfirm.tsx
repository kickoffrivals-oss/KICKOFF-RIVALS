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
  korBalance?: number;
  coins?: number;
  onConfirm: (korAmount: number) => void | Promise<void>;
  onCancel: () => void;
}

export function SwapConfirm({ korBalance: propKorBalance, coins, onConfirm, onCancel }: SwapConfirmProps) {
  const korBalance = propKorBalance ?? (coins ? Math.floor(coins / 10) : 0);
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
        className="absolute inset-0 bg-[#0A0D12]/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#13171F] rounded-[6px] p-5 border border-[#222938] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222938] relative">
          <div>
            <h2 className="font-bold text-sm text-white uppercase tracking-wider">
              Swap KOR to Coins
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Convert KOR Tokens → Game Coins
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-[4px] bg-[#1B212D] border border-[#222938] text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {/* Amount Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 uppercase font-bold text-xs">Select KOR Amount</span>
              <span className="text-emerald-400 font-mono font-bold tabular-nums text-xs">Balance: {korBalance.toLocaleString()} KOR</span>
            </div>

            <div className="flex items-center gap-2 bg-[#0A0D12] p-1 rounded-[4px] border border-[#222938]">
              <button
                onClick={handleDecrement}
                disabled={selectedAmount <= MIN_SWAP}
                className="w-9 h-9 rounded-[4px] bg-[#1B212D] border border-[#222938] text-white flex items-center justify-center text-base font-bold hover:bg-[#222938] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Decrease swap amount"
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
                  className="w-full bg-transparent text-center font-bold font-mono text-emerald-400 text-lg focus:outline-none tabular-nums"
                />
                <span className="text-xs font-bold text-slate-400 mr-2">KOR</span>
              </div>

              <button
                onClick={handleIncrement}
                disabled={selectedAmount >= MAX_SWAP || selectedAmount + STEP > korBalance}
                className="w-9 h-9 rounded-[4px] bg-emerald-500 text-slate-950 flex items-center justify-center text-base font-bold hover:bg-emerald-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Increase swap amount"
              >
                +
              </button>
            </div>

            {/* Quick Selection Chips */}
            <div className="flex gap-1">
              {[50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAmount(Math.min(amt, korBalance));
                  }}
                  disabled={amt > korBalance}
                  className={cn(
                    "flex-1 py-1 rounded-[4px] text-xs font-mono font-bold border transition-colors tabular-nums",
                    selectedAmount === amt
                      ? "bg-emerald-500 text-slate-950 border-emerald-500"
                      : "bg-[#1B212D] text-slate-400 border-[#222938] hover:text-white",
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
                className="flex-1 py-1 rounded-[4px] text-xs font-bold bg-[#1B212D] text-amber-400 border border-amber-500/40 hover:bg-[#222938] disabled:opacity-40"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Conversion Breakdown */}
          <div className="grid grid-cols-2 gap-2 bg-[#0A0D12] p-2.5 rounded-[4px] border border-[#222938]">
            <div className="text-center p-1">
              <span className="text-xs font-bold text-slate-400 uppercase block mb-0.5">Paying</span>
              <div className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                {selectedAmount.toLocaleString()} KOR
              </div>
            </div>
            <div className="text-center p-1 border-l border-[#222938]">
              <span className="text-xs font-bold text-slate-400 uppercase block mb-0.5">Receiving</span>
              <div className="text-xs font-bold font-mono text-amber-400 tabular-nums">
                +{resultingCoins.toLocaleString()} Coins
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 h-10 rounded-[4px] border border-[#222938] bg-[#1B212D] text-slate-300 font-bold text-xs uppercase hover:bg-[#222938] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConvert}
              className={cn(
                "flex-1 h-10 rounded-[4px] font-bold text-xs uppercase tracking-wider transition-colors",
                canConvert
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  : "bg-[#1B212D] text-slate-500 cursor-not-allowed border border-[#222938]"
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
