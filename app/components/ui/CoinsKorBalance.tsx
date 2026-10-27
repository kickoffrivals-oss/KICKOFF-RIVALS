import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../../contexts/GameContext";
import { useTheme } from "../../contexts/ThemeContext";

export interface CoinsKorBalanceProps {
  /** Mode to display: "both" (default), "kor" only, or "coins" only */
  mode?: "both" | "kor" | "coins";
  /** Optional KOR balance override; defaults to korBalance from useGame() */
  balance?: number;
  /** Optional KOR balance override alias */
  korBalance?: number;
  /** Optional Coins balance override; defaults to coins from useGame() */
  coins?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional click handler for KOR */
  onKorClick?: () => void;
  /** Optional click handler for Coins */
  onCoinsClick?: () => void;
  /** Optional click handler for the whole container */
  onClick?: () => void;
  /** Optional additional CSS class names */
  className?: string;
  /** Whether to show a compact swap/convert quick button between them */
  showConvertButton?: boolean;
  /** Callback when user clicks convert/swap */
  onConvert?: () => void;
}

/**
 * CoinsKorBalance
 * Displays both KOR (wagering & wins currency) and Coins (social tasks & missions currency)
 * as two distinct, beautifully formatted badges matching both Neo-Brutalist and Classic themes.
 */
export function CoinsKorBalance({
  mode = "both",
  balance: propBalance,
  korBalance: propKorBalance,
  coins: propCoins,
  size = "md",
  onKorClick,
  onCoinsClick,
  onClick,
  className = "",
  showConvertButton = false,
  onConvert,
}: CoinsKorBalanceProps) {
  const { isNeoBrutalist } = useTheme();

  // Safely get balances from GameContext
  let contextKor = 1000;
  let contextCoins = 5000;
  try {
    const game = useGame();
    contextKor = game.korBalance ?? game.balance ?? 1000;
    contextCoins = game.coins ?? 5000;
  } catch {
    contextKor = 1000;
    contextCoins = 5000;
  }

  const effectiveKor = propKorBalance !== undefined ? propKorBalance : propBalance !== undefined ? propBalance : contextKor;
  const effectiveCoins = propCoins !== undefined ? propCoins : contextCoins;

  // Track animations
  const prevKorRef = useRef<number>(effectiveKor);
  const prevCoinsRef = useRef<number>(effectiveCoins);
  const [korPulse, setKorPulse] = useState<"win" | "deduct" | null>(null);
  const [coinsPulse, setCoinsPulse] = useState<boolean>(false);

  useEffect(() => {
    if (prevKorRef.current !== effectiveKor) {
      if (effectiveKor > prevKorRef.current) {
        setKorPulse("win");
      } else if (effectiveKor < prevKorRef.current) {
        setKorPulse("deduct");
      }
      prevKorRef.current = effectiveKor;
      const t = setTimeout(() => setKorPulse(null), 900);
      return () => clearTimeout(t);
    }
  }, [effectiveKor]);

  useEffect(() => {
    if (prevCoinsRef.current !== effectiveCoins) {
      if (effectiveCoins > prevCoinsRef.current) {
        setCoinsPulse(true);
      }
      prevCoinsRef.current = effectiveCoins;
      const t = setTimeout(() => setCoinsPulse(false), 900);
      return () => clearTimeout(t);
    }
  }, [effectiveCoins]);

  // Size tokens
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs gap-1.5",
    lg: "px-3 sm:px-4 py-1.5 sm:py-2 text-sm gap-2",
  }[size];

  const numberSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs sm:text-sm",
    lg: "text-sm sm:text-base",
  }[size];

  // KOR Pulse Class
  const korPulseClass =
    korPulse === "win"
      ? isNeoBrutalist
        ? "ring-2 ring-[#00ff66] bg-[#eaffea]"
        : "ring-1 ring-emerald-400 bg-emerald-950/40"
      : korPulse === "deduct"
      ? isNeoBrutalist
        ? "ring-2 ring-[#ff0055] bg-[#ffebee]"
        : "ring-1 ring-rose-400 bg-rose-950/40"
      : "";

  // Coins Pulse Class
  const coinsPulseClass = coinsPulse
    ? isNeoBrutalist
      ? "ring-2 ring-[#ffe600] bg-[#fffde6]"
      : "ring-1 ring-amber-400 bg-amber-950/40"
    : "";

  const renderCoinsBadge = () => (
    <div
      onClick={onCoinsClick}
      role={onCoinsClick ? "button" : undefined}
      tabIndex={onCoinsClick ? 0 : undefined}
      title="Coins: Earned from social tasks & in-game missions (Can be converted to KOR)"
      className={`flex items-center select-none rounded-[8px] font-mono transition-all duration-150 ${sizeClasses} ${
        isNeoBrutalist
          ? `bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0_#000] ${
              onCoinsClick
                ? "cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#fed600]"
                : ""
            }`
          : `bg-[#181F2C] text-white border border-[#2E384D] shadow-inner ${
              onCoinsClick ? "cursor-pointer hover:border-amber-400 active:scale-98" : ""
            }`
      } ${coinsPulseClass}`}
    >
      <span className="text-xs">🪙</span>
      <span
        className={`font-black uppercase tracking-wide leading-none ${
          isNeoBrutalist ? "text-black" : "text-amber-300"
        }`}
      >
        Coins
      </span>
      <span
        className={`font-black tabular-nums leading-none ${numberSizeClasses} ${
          isNeoBrutalist ? "text-black" : "text-amber-400 font-bold"
        }`}
      >
        {Math.floor(effectiveCoins).toLocaleString()}
      </span>
    </div>
  );

  const renderKorBadge = () => (
    <div
      onClick={onKorClick}
      role={onKorClick ? "button" : undefined}
      tabIndex={onKorClick ? 0 : undefined}
      title="KOR: Used for placing bets & credited on winning payouts"
      className={`flex items-center select-none rounded-[8px] font-mono transition-all duration-150 ${sizeClasses} ${
        isNeoBrutalist
          ? `bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] ${
              onKorClick
                ? "cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50"
                : ""
            }`
          : `bg-[#181F2C] text-white border border-[#2E384D] shadow-inner ${
              onKorClick ? "cursor-pointer hover:border-[#10B981] active:scale-98" : ""
            }`
      } ${korPulseClass}`}
    >
      <span
        className={`px-1.5 py-0.5 rounded-[4px] text-white text-[9px] sm:text-[10px] font-black leading-none shrink-0 ${
          isNeoBrutalist
            ? "bg-[#ff0055] border border-black shadow-[1px_1px_0_#000]"
            : "bg-[#ff3366] shadow"
        }`}
      >
        KOR
      </span>
      <span
        className={`font-black tabular-nums leading-none ${numberSizeClasses} ${
          isNeoBrutalist
            ? korPulse === "win"
              ? "text-[#00aa44]"
              : korPulse === "deduct"
              ? "text-[#dd0033]"
              : "text-black"
            : korPulse === "win"
            ? "text-emerald-400"
            : korPulse === "deduct"
            ? "text-rose-400"
            : "text-emerald-400 font-bold"
        }`}
      >
        {Math.floor(effectiveKor).toLocaleString()}
      </span>
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 sm:gap-2 shrink-0 ${className}`}
    >
      {(mode === "both" || mode === "coins") && renderCoinsBadge()}
      {(mode === "both" || mode === "kor") && renderKorBadge()}

      {showConvertButton && onConvert && (
        <button
          type="button"
          onClick={onConvert}
          title="Convert Coins to KOR"
          className={`px-1.5 py-1 rounded-[6px] text-[10px] font-mono font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
            isNeoBrutalist
              ? "bg-[#00f0ff] border-2 border-black text-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              : "bg-[#252C3D] hover:bg-[#323B50] border border-[#3E4A66] text-slate-200"
          }`}
        >
          <span>⇄</span>
          <span className="hidden sm:inline">Swap</span>
        </button>
      )}
    </div>
  );
}

export default CoinsKorBalance;
