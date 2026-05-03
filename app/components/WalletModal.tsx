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

  const canConvert = userStats.coins >= CONVERSION_RATE;
  const convertibleKOR =
    Math.floor(userStats.coins / CONVERSION_RATE) * CONVERSION_YIELD;

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-16 sm:pt-20 px-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-background rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-scale-in max-h-[min(720px,85vh)] flex flex-col overflow-hidden border border-border/50 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IconWallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight text-foreground uppercase italic leading-none">Wallet</h2>
              <p className="text-[10px] text-muted-foreground font-mono font-bold mt-0.5">
                {truncateAddress(userStats.walletAddress)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-all active:scale-90"
          >
            <IconX className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 mx-4 mt-4 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab("balance")}
            className={cn(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
              activeTab === "balance"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Balance
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
              activeTab === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "balance" && (
            <div className="space-y-3">
              {/* Balances Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* KOR Balance */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <IconZap className="w-4 h-4 text-primary" />
                    <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest leading-none">KOR</span>
                  </div>
                  <p className="text-2xl font-black text-foreground mb-0.5 tracking-tighter tabular-nums leading-none">
                    {formatNumber(userStats.korBalance)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold italic">
                    ≈ ${(userStats.korBalance * 0.01).toFixed(2)}
                  </p>
                </div>

                {/* Coins Balance */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <IconCoins className="w-4 h-4 text-yellow-500" />
                    <span className="text-[8px] font-black text-yellow-500/60 uppercase tracking-widest leading-none">COINS</span>
                  </div>
                  <p className="text-2xl font-black text-foreground mb-0.5 tracking-tighter tabular-nums leading-none">
                    {formatNumber(userStats.coins)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold italic">
                    {canConvert ? "SWAPPABLE" : "LOCKED"}
                  </p>
                </div>
              </div>

              {/* Conversion Card */}
              <div className="p-5 rounded-2xl border border-border/50 bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-wider italic">Convert Coins</h3>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">Swap to KOR Tokens</p>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-background border border-border">
                    <span className="text-[8px] font-black text-muted-foreground leading-none">
                      {CONVERSION_RATE}:{CONVERSION_YIELD}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-background border border-border/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-foreground leading-none mb-1">
                      {Math.floor(userStats.coins / CONVERSION_RATE) * CONVERSION_RATE}
                    </p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic">Coins</p>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center border border-border/50">
                    <IconChevronRight className="w-3 h-3 text-muted-foreground" />
                  </div>

                  <div className="flex-1 bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-primary leading-none mb-1">
                      {convertibleKOR}
                    </p>
                    <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest italic">KOR</p>
                  </div>
                </div>

                <button
                  onClick={onSwapRequest}
                  disabled={!canConvert}
                  className={cn(
                    "w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg",
                    canConvert ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-muted text-muted-foreground opacity-50 grayscale"
                  )}
                >
                  Confirm Swap
                </button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="bg-muted/30 rounded-2xl p-4 text-center border border-border/30">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Earnings</p>
                  <p className="text-xl font-black text-foreground tabular-nums tracking-tighter italic">
                    {formatNumber(userStats.referralEarnings)}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-2xl p-4 text-center border border-border/30">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Biggest Win</p>
                  <p className="text-xl font-black text-foreground tabular-nums tracking-tighter italic">
                    {formatNumber(userStats.biggestWin)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Transaction history will appear here
                </p>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border group hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          tx.type === "convert" || tx.type === "redeem" || tx.type === "bonus"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {tx.type === "convert" ? (
                          <IconRefresh className="w-4 h-4" />
                        ) : tx.type === "bet" ? (
                          <IconArrowUp className="w-4 h-4" />
                        ) : (
                          <IconArrowDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground capitalize">
                          {tx.type} {tx.currency.toUpperCase()}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          tx.type === "bet" ? "text-foreground" : "text-green-500",
                        )}
                      >
                        {tx.type === "bet" ? "-" : "+"}
                        {formatNumber(tx.amount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground italic truncate max-w-[100px]">
                        {tx.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 bg-background/80 backdrop-blur-md">
          <button 
            onClick={onClose} 
            className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Close Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;
