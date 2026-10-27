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
              {/* Dual Balance Cards: Coins vs KOR */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Coins Card */}
                <div className="p-3.5 rounded-[8px] bg-[#0A0D12] border border-[#222938] text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
                    <span>🪙</span>
                    <span>COINS</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums">
                    {formatNumber(userStats?.coins ?? 5000)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Social Tasks & Quests
                  </p>
                </div>

                {/* KOR Card */}
                <div className="p-3.5 rounded-[8px] bg-[#0A0D12] border border-[#222938] text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
                    <span className="px-1.5 py-0.2 rounded bg-[#ff3366] text-white text-[9px] font-black">
                      KOR
                    </span>
                    <span>WAGER FUEL</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums">
                    {formatNumber(userStats?.korBalance ?? currentBalance ?? 1000)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Bets & Winning Payouts
                  </p>
                </div>
              </div>

              {/* Quick Convert Button */}
              <button
                type="button"
                onClick={onSwapRequest}
                className="w-full py-2.5 px-3 rounded-[6px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <span>⇄ Convert Coins to KOR</span>
              </button>

              {/* Game Stats Snapshot */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-[4px] bg-[#0A0D12] border border-[#222938] text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Bets</span>
                  <span className="text-base font-bold font-mono text-white tabular-nums">
                    {userStats?.totalBets || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#0A0D12] border border-[#222938] text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Wins</span>
                  <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                    {userStats?.wins || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#0A0D12] border border-[#222938] text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Best Win</span>
                  <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
                    {formatNumber(userStats?.biggestWin || 0)} KOR
                  </span>
                </div>
              </div>

              {/* Currency Explanation Banner */}
              <div className="p-3 rounded-[6px] border border-[#222938] bg-[#13171F] space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span>Currency Guidelines</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>KOR</strong> is earned by placing bets and winning matches or cashing out, or by converting Coins into KOR.
                  <strong> Coins</strong> are earned by completing daily tasks, missions, and social challenges.
                </p>
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
