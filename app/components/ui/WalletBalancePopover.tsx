import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../../contexts/GameContext";
import { useTheme } from "../../contexts/ThemeContext";
import { soundFx } from "../../lib/soundFx";
import toast from "react-hot-toast";

export interface WalletBalancePopoverProps {
  /** Optional custom class name on trigger container */
  className?: string;
  /** Optional balance override */
  balance?: number;
  /** Optional KOR balance override */
  korBalance?: number;
  /** Optional Coins override */
  coins?: number;
}

/**
 * WalletBalancePopover
 *
 * Compact wallet button for /play (Arena Selection) that opens an interactive
 * balances card showing both KOR (wagering) and Coins (rewards), with quick swap
 * functionality, styled for both Neo-Brutalist and Classic themes.
 * Supports both CLICK / TAP and HOVER / MOUSE ENTER!
 */
export function WalletBalancePopover({
  className = "",
  balance: propBalance,
  korBalance: propKorBalance,
  coins: propCoins,
}: WalletBalancePopoverProps) {
  const { isNeoBrutalist } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get data from GameContext
  let contextKor = 1000;
  let contextCoins = 5000;
  let walletAddress = "0x65bc...e740";
  let isConnected = true;
  let convertCoinsToKor: ((amount: number) => Promise<boolean>) | undefined;

  try {
    const game = useGame();
    contextKor = game.korBalance ?? game.balance ?? 1000;
    contextCoins = game.coins ?? 5000;
    if (game.walletState?.address) {
      walletAddress = `${game.walletState.address.slice(0, 6)}...${game.walletState.address.slice(-4)}`;
    }
    isConnected = game.walletState?.isConnected ?? true;
    convertCoinsToKor = game.convertCoinsToKor;
  } catch {
    contextKor = 1000;
    contextCoins = 5000;
  }

  const effectiveKor = propKorBalance ?? propBalance ?? contextKor;
  const effectiveCoins = propCoins ?? contextCoins;

  // Handle Mouse Enter (Hover to open on desktop)
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // Handle Mouse Leave (Closes after small delay)
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 280);
  };

  // Handle Click (Tap to toggle on mobile and desktop)
  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    try {
      soundFx.playClick();
    } catch {}
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleQuickSwap = async (coinsToSwap: number) => {
    if (effectiveCoins < coinsToSwap) {
      toast.error(`Not enough Coins! You need at least ${coinsToSwap.toLocaleString()} Coins.`);
      return;
    }

    if (!convertCoinsToKor) {
      toast.error("Conversion service currently unavailable");
      return;
    }

    setIsSwapping(true);
    try {
      soundFx.playBetPlaced();
      const success = await convertCoinsToKor(coinsToSwap);
      if (success) {
        soundFx.playWin();
      }
    } catch (err) {
      toast.error("Failed to convert Coins to KOR");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block ${className}`}
    >
      {/* =======================================================================
          TRIGGER BUTTON (Click / Tap or Hover)
      ======================================================================= */}
      {isNeoBrutalist ? (
        <button
          type="button"
          onClick={handleToggleClick}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          title="Click or hover to view Wallet & Balances"
          className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-[#ffe600] hover:bg-[#fed600] text-black border-[1.5px] sm:border-2 border-black rounded-[6px] sm:rounded-[8px] shadow-[1.5px_1.5px_0_#000] sm:shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer select-none font-mono font-black shrink-0"
        >
          <span className="text-xs sm:text-sm">👛</span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight">
            Wallet
          </span>
          <span
            className="text-[9px] sm:text-[10px] transition-transform duration-200 opacity-70"
            style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleToggleClick}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          title="Click or hover to view Wallet & Balances"
          className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-[#181F2C] hover:bg-[#222B3D] text-white border border-[#2E384D] hover:border-[#10B981] rounded-[6px] transition-all cursor-pointer select-none font-mono text-xs font-bold shadow-md shrink-0"
        >
          <span className="text-xs sm:text-sm text-emerald-400">👛</span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-200">
            Wallet
          </span>
          <span
            className="text-[9px] sm:text-[10px] text-slate-400 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </button>
      )}

      {/* =======================================================================
          POPOVER BALANCE CARD
      ======================================================================= */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Account Balances"
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-full mt-2 z-[1000] w-[295px] sm:w-[330px] max-w-[calc(100vw-20px)] transition-all animate-in fade-in zoom-in-95 duration-150 ${
            isNeoBrutalist
              ? "bg-[#fffef0] text-black border-[3px] border-black rounded-[12px] shadow-[5px_5px_0_#000] p-3 sm:p-4 font-sans"
              : "bg-[#13171F] text-white border border-[#2E384D] rounded-[10px] shadow-2xl p-3.5 sm:p-4 font-sans"
          }`}
        >
          {/* Top Bar: Title & Close */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-black/15 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm">👛</span>
              <span
                className={`font-mono font-black text-xs uppercase tracking-wider ${
                  isNeoBrutalist ? "text-black" : "text-white"
                }`}
              >
                Account Balances
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                isNeoBrutalist
                  ? "bg-white hover:bg-[#ff3366] hover:text-white border border-black shadow-[1px_1px_0_#000]"
                  : "bg-[#1B212D] text-slate-400 hover:text-white hover:bg-[#252C3D]"
              }`}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Connected Address Pill */}
          {isConnected && (
            <div
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] font-mono text-[10px] mb-3 ${
                isNeoBrutalist
                  ? "bg-white border-[1.5px] border-black text-black"
                  : "bg-[#0E1218] border border-[#222938] text-slate-400"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">Connected</span>
              </div>
              <span className="font-mono text-slate-600 dark:text-slate-300">
                {walletAddress}
              </span>
            </div>
          )}

          {/* Balances Stack */}
          <div className="space-y-2">
            {/* 1. KOR Balance (Wagering Capital) */}
            <div
              className={`p-2.5 rounded-[8px] transition-all ${
                isNeoBrutalist
                  ? "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
                  : "bg-[#181F2C] border border-[#2E384D]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-[3px] bg-[#ff3366] text-white text-[8px] font-black leading-none">
                    KOR
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold uppercase tracking-tight ${
                      isNeoBrutalist ? "text-black" : "text-slate-200"
                    }`}
                  >
                    Wagering Balance
                  </span>
                </div>
                <span className="text-[10px] text-[#ff3366] font-bold font-mono">
                  Betting Active
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span
                  className={`font-mono font-black text-lg sm:text-xl tracking-tight ${
                    isNeoBrutalist ? "text-black" : "text-emerald-400"
                  }`}
                >
                  {Math.floor(effectiveKor).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  KOR Tokens
                </span>
              </div>
              <p
                className={`text-[9.5px] mt-1 leading-snug ${
                  isNeoBrutalist ? "text-black/70" : "text-slate-400"
                }`}
              >
                Used exclusively for placing bets & winning payouts.
              </p>
            </div>

            {/* 2. Coins Balance (Engagement Points) */}
            <div
              className={`p-2.5 rounded-[8px] transition-all ${
                isNeoBrutalist
                  ? "bg-[#ffe600] border-2 border-black shadow-[2px_2px_0_#000]"
                  : "bg-[#181F2C] border border-[#2E384D]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🪙</span>
                  <span
                    className={`font-mono text-[11px] font-black uppercase tracking-tight ${
                      isNeoBrutalist ? "text-black" : "text-amber-300"
                    }`}
                  >
                    Coins Balance
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isNeoBrutalist ? "text-black/80" : "text-amber-400"
                  }`}
                >
                  Rewards
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span
                  className={`font-mono font-black text-lg sm:text-xl tracking-tight ${
                    isNeoBrutalist ? "text-black" : "text-amber-400"
                  }`}
                >
                  {Math.floor(effectiveCoins).toLocaleString()}
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    isNeoBrutalist ? "text-black/70" : "text-slate-500"
                  }`}
                >
                  Coins
                </span>
              </div>
              <p
                className={`text-[9.5px] mt-1 leading-snug ${
                  isNeoBrutalist ? "text-black/70" : "text-slate-400"
                }`}
              >
                Earned from daily tasks, missions & social check-ins.
              </p>
            </div>
          </div>

          {/* Quick Swap Section */}
          <div
            className={`mt-3 pt-2.5 border-t ${
              isNeoBrutalist
                ? "border-black/20"
                : "border-[#2E384D]"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wide ${
                  isNeoBrutalist ? "text-black/80" : "text-slate-300"
                }`}
              >
                Quick Swap (10 Coins = 1 KOR)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={isSwapping || effectiveCoins < 100}
                onClick={() => handleQuickSwap(100)}
                className={`py-1.5 px-2 rounded-[6px] font-mono text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isNeoBrutalist
                    ? "bg-white hover:bg-[#00f0ff] border-[1.5px] border-black text-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    : "bg-[#252C3D] hover:bg-[#323B50] text-emerald-400 border border-[#3E4A66]"
                }`}
              >
                <span>⇄</span>
                <span>100 Coins ➔ 10 KOR</span>
              </button>

              <button
                type="button"
                disabled={isSwapping || effectiveCoins < 500}
                onClick={() => handleQuickSwap(500)}
                className={`py-1.5 px-2 rounded-[6px] font-mono text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isNeoBrutalist
                    ? "bg-white hover:bg-[#00f0ff] border-[1.5px] border-black text-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    : "bg-[#252C3D] hover:bg-[#323B50] text-emerald-400 border border-[#3E4A66]"
                }`}
              >
                <span>⇄</span>
                <span>500 Coins ➔ 50 KOR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletBalancePopover;
