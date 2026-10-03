import { useState } from "react";
import { cn } from "../lib/utils";
import { UserStats, Transaction } from "../types";
import { CONVERSION_RATE, CONVERSION_YIELD } from "../constants";
import {
  IconX,
  IconWallet,
  IconCoins,
  IconZap,
  IconArrowUp,
  IconArrowDown,
  IconRefresh,
  IconChevronRight,
} from "./Icons";
import { formatNumber, formatDate, truncateAddress } from "../lib/utils";
import { soundFx } from "../lib/soundFx";

interface WalletModalProps {
  onClose: () => void;
  onSwapRequest: () => void;
  currentBalance: number;
  userStats: UserStats;
  transactions: Transaction[];
  onWalkReward: () => void;
}

export function WalletModal({
  onClose,
  onSwapRequest,
  currentBalance,
  userStats,
  transactions,
  onWalkReward,
}: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<"balance" | "history">("balance");

  const [selectedKor, setSelectedKor] = useState<number>(() => {
    const bal = userStats?.korBalance || 0;
    if (bal >= 100) return 100;
    if (bal >= 50) return 50;
    return Math.max(10, Math.min(bal, 50));
  });

  const canConvert = (userStats?.korBalance || 0) >= 10 && selectedKor > 0 && selectedKor <= (userStats?.korBalance || 0);
  const resultingCoins = selectedKor * 10;

  const handleClose = () => {
    soundFx.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md broadcast-card rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px]">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-emerald-400">
                <IconWallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="font-black text-base text-white uppercase italic tracking-tight">
                MATCHDAY VAULT
              </h2>
              <p className="text-[10px] text-emerald-400 font-mono font-bold">
                {truncateAddress(userStats?.walletAddress || "")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 my-4">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("balance");
            }}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "balance"
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white",
            )}
          >
            Balances & Swap
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("history");
            }}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "history"
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white",
            )}
          >
            Ledger History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === "balance" && (
            <div className="space-y-4">
              {/* Balances Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* KOR Balance */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-slate-950/80 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">KOR TOKENS</span>
                    <IconZap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-white led-number">
                    {formatNumber(userStats?.korBalance || 0)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Earned Winnings
                  </p>
                </div>

                {/* Coins Balance */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-slate-950/80 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">PLAY COINS</span>
                    <IconCoins className="w-4 h-4 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-400 led-number">
                    {formatNumber(userStats?.coins || 0)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Betting Stake Fuel
                  </p>
                </div>
              </div>

              {/* Conversion Card with Custom Amount Selector */}
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Swap KOR to Coins
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    1 KOR = 10 Coins
                  </span>
                </div>

                {/* Amount Input with Steppers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                      Enter KOR Amount
                    </span>
                    <span className="text-amber-400 led-number text-[11px]">
                      Yield: +{resultingCoins.toLocaleString()} Coins
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-white/10">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedKor((prev) => Math.max(10, prev - 50));
                      }}
                      disabled={selectedKor <= 10}
                      className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center text-base font-black hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      -
                    </button>

                    <div className="flex-1 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={selectedKor || ""}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setSelectedKor(Math.min(val, userStats?.korBalance || 0));
                        }}
                        min={1}
                        max={userStats?.korBalance || 0}
                        placeholder="0"
                        className="w-full bg-transparent text-center font-black text-emerald-400 text-xl focus:outline-none led-number"
                      />
                      <span className="text-xs font-black text-emerald-400/80 mr-2">KOR</span>
                    </div>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedKor((prev) => Math.min(prev + 50, userStats?.korBalance || 0));
                      }}
                      disabled={selectedKor + 10 > (userStats?.korBalance || 0)}
                      className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center text-base font-black hover:bg-emerald-400 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-emerald-500/20"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex gap-1.5">
                    {[50, 100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedKor(Math.min(amt, userStats?.korBalance || 0));
                        }}
                        disabled={amt > (userStats?.korBalance || 0)}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-xs font-bold border transition-all",
                          selectedKor === amt
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm"
                            : "bg-white/5 text-slate-400 border-white/10 hover:text-white",
                          amt > (userStats?.korBalance || 0) && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        {amt}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedKor(userStats?.korBalance || 0);
                      }}
                      disabled={(userStats?.korBalance || 0) <= 0}
                      className="flex-1 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 disabled:opacity-40"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Conversion Summary Row */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Paying</span>
                    <span className="text-xs font-black text-emerald-400 led-number">
                      {selectedKor.toLocaleString()} KOR
                    </span>
                  </div>
                  <div className="text-center border-l border-white/5">
                    <span className="text-[9px] font-bold text-amber-400 uppercase block">Receiving</span>
                    <span className="text-xs font-black text-amber-400 led-number">
                      +{resultingCoins.toLocaleString()} Coins
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playCashout();
                    onSwapRequest();
                  }}
                  disabled={!canConvert}
                  className={cn(
                    "w-full h-11 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
                    canConvert
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed",
                  )}
                >
                  {canConvert ? `Confirm Swap (${selectedKor.toLocaleString()} KOR)` : "Minimum 10 KOR Required"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No recorded transactions yet.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
                        {tx.type === "bet" ? <IconArrowUp className="w-4 h-4 text-red-400" /> : <IconArrowDown className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white capitalize">{tx.description || tx.type}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-xs font-black led-number", tx.type === "bet" ? "text-red-400" : "text-emerald-400")}>
                        {tx.type === "bet" ? "-" : "+"}{formatNumber(tx.amount)} {tx.currency.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletModal;
