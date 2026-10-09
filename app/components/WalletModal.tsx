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
  transactions?: Transaction[];
  onWalkReward: () => void;
}

export function WalletModal({
  onClose,
  onSwapRequest,
  currentBalance,
  userStats,
  transactions = [],
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
        className="absolute inset-0 bg-[#0A0D12]/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#13171F] rounded-[6px] p-5 border border-[#222938] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222938]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-emerald-400">
              <IconWallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white uppercase tracking-wider">
                Matchday Vault
              </h2>
              <p className="text-xs text-slate-400 font-mono tabular-nums">
                {truncateAddress(userStats?.walletAddress || "")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-[4px] bg-[#1B212D] border border-[#222938] text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0A0D12] p-1 rounded-[4px] border border-[#222938] my-3">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("balance");
            }}
            className={cn(
              "flex-1 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors",
              activeTab === "balance"
                ? "bg-[#1B212D] text-emerald-400 border border-[#323C50]"
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
              "flex-1 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors",
              activeTab === "history"
                ? "bg-[#1B212D] text-emerald-400 border border-[#323C50]"
                : "text-slate-400 hover:text-white",
            )}
          >
            Ledger History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {activeTab === "balance" && (
            <div className="space-y-3">
              {/* Balances Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* KOR Balance */}
                <div className="p-3 rounded-[4px] bg-[#0A0D12] border border-[#222938]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KOR Tokens</span>
                    <IconZap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold font-mono text-white tabular-nums">
                    {formatNumber(userStats?.korBalance || 0)}
                  </p>
                  <p className="text-xs text-slate-500 uppercase mt-0.5">
                    Earned Winnings
                  </p>
                </div>

                {/* Coins Balance */}
                <div className="p-3 rounded-[4px] bg-[#0A0D12] border border-[#222938]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Play Coins</span>
                    <IconCoins className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                    {formatNumber(userStats?.coins || 0)}
                  </p>
                  <p className="text-xs text-slate-500 uppercase mt-0.5">
                    Matchday Stakes
                  </p>
                </div>
              </div>

              {/* Conversion Card with Custom Amount Selector */}
              <div className="p-3 rounded-[4px] border border-[#222938] bg-[#0A0D12] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Swap KOR to Coins
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-[#1B212D] px-2 py-0.5 rounded-[4px] border border-[#222938] tabular-nums">
                    1 KOR = 10 Coins
                  </span>
                </div>

                {/* Amount Input with Steppers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 uppercase font-bold text-xs">
                      Enter KOR Amount
                    </span>
                    <span className="text-amber-400 font-mono font-bold tabular-nums text-xs">
                      Yield: +{resultingCoins.toLocaleString()} Coins
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#13171F] p-1 rounded-[4px] border border-[#222938]">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedKor((prev) => Math.max(10, prev - 50));
                      }}
                      disabled={selectedKor <= 10}
                      className="w-8 h-8 rounded-[4px] bg-[#1B212D] border border-[#222938] text-white flex items-center justify-center text-sm font-bold hover:bg-[#222938] disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Decrease KOR amount"
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
                        className="w-full bg-transparent text-center font-bold font-mono text-emerald-400 text-base focus:outline-none tabular-nums"
                      />
                      <span className="text-xs font-bold text-slate-400 mr-2">KOR</span>
                    </div>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedKor((prev) => Math.min(prev + 50, userStats?.korBalance || 0));
                      }}
                      disabled={selectedKor + 10 > (userStats?.korBalance || 0)}
                      className="w-8 h-8 rounded-[4px] bg-emerald-500 text-slate-950 flex items-center justify-center text-sm font-bold hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Increase KOR amount"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex gap-1">
                    {[50, 100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedKor(Math.min(amt, userStats?.korBalance || 0));
                        }}
                        disabled={amt > (userStats?.korBalance || 0)}
                        className={cn(
                          "flex-1 py-1 rounded-[4px] text-xs font-mono font-bold border transition-colors tabular-nums",
                          selectedKor === amt
                            ? "bg-emerald-500 text-slate-950 border-emerald-500"
                            : "bg-[#1B212D] text-slate-400 border-[#222938] hover:text-white",
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
                      className="flex-1 py-1 rounded-[4px] text-xs font-bold bg-[#1B212D] text-amber-400 border border-amber-500/40 hover:bg-[#222938] disabled:opacity-40"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Conversion Summary Row */}
                <div className="grid grid-cols-2 gap-2 bg-[#13171F] p-2.5 rounded-[4px] border border-[#222938] text-xs">
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase block">Paying</span>
                    <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                      {selectedKor.toLocaleString()} KOR
                    </span>
                  </div>
                  <div className="text-center border-l border-[#222938]">
                    <span className="text-xs font-bold text-slate-400 uppercase block">Receiving</span>
                    <span className="text-xs font-bold font-mono text-amber-400 tabular-nums">
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
                    "w-full h-10 rounded-[4px] font-bold text-xs uppercase tracking-wider transition-colors",
                    canConvert
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-[#1B212D] text-slate-500 cursor-not-allowed border border-[#222938]",
                  )}
                >
                  {canConvert ? `Confirm Swap (${selectedKor.toLocaleString()} KOR)` : "Minimum 10 KOR Required"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-1.5">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-bold uppercase">
                  No recorded transactions yet.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#0A0D12] border border-[#222938]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-slate-300">
                        {tx.type === "bet" ? <IconArrowUp className="w-3.5 h-3.5 text-red-400" /> : <IconArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white capitalize">{tx.description || tx.type}</p>
                        <p className="text-xs text-slate-500 font-mono tabular-nums">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-xs font-bold font-mono tabular-nums", tx.type === "bet" ? "text-red-400" : "text-emerald-400")}>
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
