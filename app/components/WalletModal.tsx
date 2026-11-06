import { useState } from "react";
import { ArrowDownToLine, Send } from "lucide-react";
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
import { useTheme } from "../contexts/ThemeContext";

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
  const { isNeoBrutalist } = useTheme();
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
        className={cn(
          "absolute inset-0 backdrop-blur-sm",
          isNeoBrutalist ? "bg-black/60" : "bg-[#0A0D12]/80"
        )}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md p-5 flex flex-col overflow-hidden max-h-[85vh] transition-colors",
          isNeoBrutalist
            ? "bg-white border-[3px] border-black rounded-[12px] shadow-[6px_6px_0_#000] text-black"
            : "bg-[#13171F] rounded-[6px] border border-[#222938] shadow-2xl text-white"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between pb-3",
            isNeoBrutalist ? "border-b-2 border-black" : "border-b border-[#222938]"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 flex items-center justify-center shrink-0",
                isNeoBrutalist
                  ? "bg-[#ffe600] border-2 border-black rounded-[6px] text-black shadow-[1.5px_1.5px_0_#000]"
                  : "rounded-[4px] bg-[#1B212D] border border-[#222938] text-emerald-400"
              )}
            >
              <IconWallet className="w-4 h-4" />
            </div>
            <div>
              <h2
                className={cn(
                  "text-sm uppercase tracking-wider",
                  isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
                )}
              >
                Matchday Vault
              </h2>
              <p
                className={cn(
                  "text-xs font-mono tabular-nums",
                  isNeoBrutalist ? "text-black/70 font-bold" : "text-slate-400"
                )}
              >
                {truncateAddress(userStats?.walletAddress || "")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              "p-1.5 transition-all",
              isNeoBrutalist
                ? "bg-white border-2 border-black rounded-[6px] text-black shadow-[1.5px_1.5px_0_#000] hover:bg-[#ffe600]"
                : "rounded-[4px] bg-[#1B212D] border border-[#222938] text-slate-400 hover:text-white"
            )}
            aria-label="Close modal"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={cn(
            "flex p-1 my-3 transition-all",
            isNeoBrutalist
              ? "bg-[#faf8ee] border-2 border-black rounded-[8px] gap-1"
              : "bg-[#0A0D12] rounded-[4px] border border-[#222938]"
          )}
        >
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("balance");
            }}
            className={cn(
              "flex-1 py-1.5 text-xs uppercase tracking-wider transition-all",
              isNeoBrutalist
                ? activeTab === "balance"
                  ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[1.5px_1.5px_0_#000]"
                  : "text-black/70 font-black hover:text-black hover:bg-white rounded-[6px]"
                : activeTab === "balance"
                ? "bg-[#1B212D] text-emerald-400 border border-[#323C50] rounded-[4px] font-bold"
                : "text-slate-400 hover:text-white rounded-[4px] font-bold"
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
              "flex-1 py-1.5 text-xs uppercase tracking-wider transition-all",
              isNeoBrutalist
                ? activeTab === "history"
                  ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[1.5px_1.5px_0_#000]"
                  : "text-black/70 font-black hover:text-black hover:bg-white rounded-[6px]"
                : activeTab === "history"
                ? "bg-[#1B212D] text-emerald-400 border border-[#323C50] rounded-[4px] font-bold"
                : "text-slate-400 hover:text-white rounded-[4px] font-bold"
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
                <div
                  className={cn(
                    "p-3.5 text-center space-y-1 transition-colors",
                    isNeoBrutalist
                      ? "bg-[#faf8ee] border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000]"
                      : "rounded-[8px] bg-[#0A0D12] border border-[#222938]"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center gap-1.5 text-xs font-bold",
                      isNeoBrutalist ? "text-black font-black" : "text-amber-400"
                    )}
                  >
                    <span>🪙</span>
                    <span>COINS</span>
                  </div>
                  <p
                    className={cn(
                      "text-xl sm:text-2xl font-black font-mono tabular-nums",
                      isNeoBrutalist ? "text-black" : "text-white"
                    )}
                  >
                    {formatNumber(userStats?.coins ?? 5000)}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-wide",
                      isNeoBrutalist ? "text-black/70 font-bold" : "text-slate-400"
                    )}
                  >
                    Social Tasks & Quests
                  </p>
                </div>

                {/* KOR Card */}
                <div
                  className={cn(
                    "p-3.5 text-center space-y-1 transition-colors",
                    isNeoBrutalist
                      ? "bg-[#ffe600] border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000]"
                      : "rounded-[8px] bg-[#0A0D12] border border-[#222938]"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center gap-1.5 text-xs font-bold",
                      isNeoBrutalist ? "text-black font-black" : "text-emerald-400"
                    )}
                  >
                    <span
                      className={cn(
                        "px-1.5 py-0.2 text-[9px] font-black",
                        isNeoBrutalist
                          ? "bg-black text-[#ffe600] rounded-[3px]"
                          : "rounded bg-[#ff3366] text-white"
                      )}
                    >
                      KOR
                    </span>
                    <span>WAGER FUEL</span>
                  </div>
                  <p
                    className={cn(
                      "text-xl sm:text-2xl font-black font-mono tabular-nums",
                      isNeoBrutalist ? "text-black" : "text-emerald-400"
                    )}
                  >
                    {formatNumber(currentBalance ?? userStats?.korBalance ?? 1000)}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-wide",
                      isNeoBrutalist ? "text-black/70 font-bold" : "text-slate-400"
                    )}
                  >
                    Bets & Winning Payouts
                  </p>
                </div>
              </div>

              {/* Quick Convert Button */}
              <button
                type="button"
                onClick={onSwapRequest}
                className={cn(
                  "w-full py-2.5 px-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  isNeoBrutalist
                    ? "bg-[#00ff66] text-black border-2 border-black rounded-[8px] font-black shadow-[3px_3px_0_#000] hover:bg-[#00dd55] active:translate-x-[1px] active:translate-y-[1px]"
                    : "rounded-[6px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow"
                )}
              >
                <span>⇄ Convert Coins to KOR</span>
              </button>

              {/* Inactive Secondary Actions: Withdraw & Send KOR */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled
                  title="Withdrawals are currently inactive"
                  className={cn(
                    "w-full py-2 px-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-not-allowed select-none",
                    isNeoBrutalist
                      ? "bg-[#f2efe4] text-black/45 border-2 border-dashed border-black/30 rounded-[8px] font-black shadow-[1.5px_1.5px_0_#00000015]"
                      : "rounded-[6px] bg-[#141820] border border-dashed border-[#222938] text-slate-500 font-bold"
                  )}
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span>Withdraw</span>
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase",
                      isNeoBrutalist
                        ? "bg-black/10 text-black/60"
                        : "bg-white/10 text-slate-400"
                    )}
                  >
                    Soon
                  </span>
                </button>

                <button
                  type="button"
                  disabled
                  title="Send KOR is currently inactive"
                  className={cn(
                    "w-full py-2 px-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-not-allowed select-none",
                    isNeoBrutalist
                      ? "bg-[#f2efe4] text-black/45 border-2 border-dashed border-black/30 rounded-[8px] font-black shadow-[1.5px_1.5px_0_#00000015]"
                      : "rounded-[6px] bg-[#141820] border border-dashed border-[#222938] text-slate-500 font-bold"
                  )}
                >
                  <Send className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span>Send KOR</span>
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase",
                      isNeoBrutalist
                        ? "bg-black/10 text-black/60"
                        : "bg-white/10 text-slate-400"
                    )}
                  >
                    Soon
                  </span>
                </button>
              </div>

              {/* Game Stats Snapshot */}
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={cn(
                    "p-2.5 text-center transition-colors",
                    isNeoBrutalist
                      ? "bg-[#faf8ee] border-2 border-black rounded-[6px] shadow-[1.5px_1.5px_0_#000]"
                      : "rounded-[4px] bg-[#0A0D12] border border-[#222938]"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] uppercase block",
                      isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400 font-bold"
                    )}
                  >
                    Total Bets
                  </span>
                  <span
                    className={cn(
                      "text-base font-mono tabular-nums",
                      isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
                    )}
                  >
                    {userStats?.totalBets || 0}
                  </span>
                </div>
                <div
                  className={cn(
                    "p-2.5 text-center transition-colors",
                    isNeoBrutalist
                      ? "bg-[#faf8ee] border-2 border-black rounded-[6px] shadow-[1.5px_1.5px_0_#000]"
                      : "rounded-[4px] bg-[#0A0D12] border border-[#222938]"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] uppercase block",
                      isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400 font-bold"
                    )}
                  >
                    Wins
                  </span>
                  <span
                    className={cn(
                      "text-base font-mono tabular-nums",
                      isNeoBrutalist ? "text-black font-black" : "text-emerald-400 font-bold"
                    )}
                  >
                    {userStats?.wins || 0}
                  </span>
                </div>
                <div
                  className={cn(
                    "p-2.5 text-center transition-colors",
                    isNeoBrutalist
                      ? "bg-[#faf8ee] border-2 border-black rounded-[6px] shadow-[1.5px_1.5px_0_#000]"
                      : "rounded-[4px] bg-[#0A0D12] border border-[#222938]"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] uppercase block",
                      isNeoBrutalist ? "text-black/70 font-black" : "text-slate-400 font-bold"
                    )}
                  >
                    Best Win
                  </span>
                  <span
                    className={cn(
                      "text-base font-mono tabular-nums",
                      isNeoBrutalist ? "text-black font-black" : "text-amber-400 font-bold"
                    )}
                  >
                    {formatNumber(userStats?.biggestWin || 0)} KOR
                  </span>
                </div>
              </div>

              {/* Currency Explanation Banner */}
              <div
                className={cn(
                  "p-3 space-y-1 text-xs transition-colors",
                  isNeoBrutalist
                    ? "bg-white border-2 border-black rounded-[8px] text-black shadow-[2px_2px_0_#000]"
                    : "rounded-[6px] border border-[#222938] bg-[#13171F]"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5 font-bold",
                    isNeoBrutalist ? "text-black font-black" : "text-slate-200"
                  )}
                >
                  <span className={isNeoBrutalist ? "text-black font-black" : "text-emerald-400"}>✓</span>
                  <span>Currency Guidelines</span>
                </div>
                <p
                  className={cn(
                    "text-[11px] leading-relaxed",
                    isNeoBrutalist ? "text-black/80 font-medium" : "text-slate-400"
                  )}
                >
                  <strong>KOR</strong> is earned by placing bets and winning matches or cashing out, or by converting Coins into KOR.
                  <strong> Coins</strong> are earned by completing daily tasks, missions, and social challenges.
                </p>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-1.5">
              {transactions.length === 0 ? (
                <div
                  className={cn(
                    "text-center py-8 text-xs uppercase",
                    isNeoBrutalist ? "text-black/60 font-black" : "text-slate-500 font-bold"
                  )}
                >
                  No recorded transactions yet.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center justify-between p-2.5 transition-colors",
                      isNeoBrutalist
                        ? "bg-[#faf8ee] border-2 border-black rounded-[6px] shadow-[1.5px_1.5px_0_#000]"
                        : "rounded-[4px] bg-[#0A0D12] border border-[#222938]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 flex items-center justify-center shrink-0",
                          isNeoBrutalist
                            ? "bg-white border-2 border-black rounded-[4px]"
                            : "rounded-[4px] bg-[#1B212D] border border-[#222938] text-slate-300"
                        )}
                      >
                        {tx.type === "bet" ? (
                          <IconArrowUp className={cn("w-3.5 h-3.5", isNeoBrutalist ? "text-[#ff0055]" : "text-red-400")} />
                        ) : (
                          <IconArrowDown className={cn("w-3.5 h-3.5", isNeoBrutalist ? "text-[#00aa44]" : "text-emerald-400")} />
                        )}
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-xs capitalize",
                            isNeoBrutalist ? "text-black font-black" : "text-white font-bold"
                          )}
                        >
                          {tx.description || tx.type}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-mono tabular-nums",
                            isNeoBrutalist ? "text-black/60 font-bold" : "text-slate-500"
                          )}
                        >
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-xs font-mono tabular-nums",
                          tx.type === "bet"
                            ? isNeoBrutalist ? "text-[#ff0055] font-black" : "text-red-400 font-bold"
                            : isNeoBrutalist ? "text-[#00aa44] font-black" : "text-emerald-400 font-bold"
                        )}
                      >
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
