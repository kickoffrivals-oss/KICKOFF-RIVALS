import { useState } from "react";
import { IconX } from "./Icons";
import { useGame } from "../contexts/GameContext";
import { useTheme } from "../contexts/ThemeContext";
import { soundFx } from "../lib/soundFx";

interface SwapConfirmProps {
  korBalance?: number;
  coins?: number;
  onConfirm?: (korAmount: number) => void | Promise<void>;
  onCancel: () => void;
}

export function SwapConfirm({
  korBalance: propKor,
  coins: propCoins,
  onCancel,
}: SwapConfirmProps) {
  const { isNeoBrutalist } = useTheme();
  const { coins: gameCoins, korBalance: gameKor, convertCoinsToKor } = useGame();

  const currentCoins = propCoins !== undefined ? propCoins : gameCoins;
  const currentKor = propKor !== undefined ? propKor : gameKor;

  const [coinsToSwap, setCoinsToSwap] = useState<number>(() => {
    if (currentCoins >= 1000) return 1000;
    if (currentCoins >= 100) return 100;
    return Math.max(10, currentCoins);
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Conversion rate: 10 Coins = 1 KOR (e.g. 1,000 Coins -> 100 KOR)
  const korToReceive = Math.floor(coinsToSwap / 10);
  const isValid = coinsToSwap >= 10 && coinsToSwap <= currentCoins;

  const handleConvert = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    soundFx.playClick();
    try {
      const ok = await convertCoinsToKor(coinsToSwap);
      if (ok) {
        soundFx.playCashout();
        onCancel();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetAmounts = [100, 500, 1000, 2500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0D12]/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md rounded-[16px] p-5 sm:p-6 overflow-hidden ${
          isNeoBrutalist
            ? "bg-[#fffef0] border-[3.5px] border-black shadow-[8px_8px_0_#000] text-black"
            : "bg-[#13171F] border border-[#222938] shadow-2xl text-white"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
          <div>
            <h2
              className={`font-black text-base sm:text-lg uppercase tracking-tight flex items-center gap-2 ${
                isNeoBrutalist ? "text-black" : "text-white"
              }`}
            >
              <span>⇄</span>
              <span>Convert Coins to KOR</span>
            </h2>
            <p
              className={`text-xs ${
                isNeoBrutalist ? "text-slate-600 font-bold" : "text-slate-400"
              }`}
            >
              Exchange rate: 10 Coins = 1 KOR
            </p>
          </div>
          <button
            onClick={onCancel}
            className={`p-1.5 rounded-[8px] transition-all cursor-pointer ${
              isNeoBrutalist
                ? "bg-white border-2 border-black text-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px]"
                : "bg-[#1B212D] border border-[#222938] text-slate-400 hover:text-white"
            }`}
            aria-label="Close modal"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Currency Rules Clarification */}
        <div
          className={`my-3 p-3 rounded-[10px] text-xs font-mono ${
            isNeoBrutalist
              ? "bg-[#ffe600] border-2 border-black text-black shadow-[2px_2px_0_#000]"
              : "bg-[#0A0D12] border border-[#222938] text-slate-300"
          }`}
        >
          <div className="font-black flex items-center gap-1.5 mb-1">
            <span>💡</span>
            <span>TOKENOMICS GUIDE</span>
          </div>
          <ul className="space-y-1 text-[11px] list-disc list-inside">
            <li>
              <strong>Coins (🪙):</strong> Earned from social tasks & in-game missions.
            </li>
            <li>
              <strong>KOR (⚡):</strong> The betting currency used to place wagers & claim winning payouts.
            </li>
          </ul>
        </div>

        {/* Balance Status Row */}
        <div className="grid grid-cols-2 gap-2.5 my-3 text-center font-mono">
          <div
            className={`p-2.5 rounded-[10px] border ${
              isNeoBrutalist
                ? "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
                : "bg-[#0A0D12] border-[#222938]"
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Coins Available
            </span>
            <span
              className={`text-base font-black ${
                isNeoBrutalist ? "text-black" : "text-amber-400"
              }`}
            >
              🪙 {Math.floor(currentCoins).toLocaleString()}
            </span>
          </div>
          <div
            className={`p-2.5 rounded-[10px] border ${
              isNeoBrutalist
                ? "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
                : "bg-[#0A0D12] border-[#222938]"
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Current KOR Fuel
            </span>
            <span
              className={`text-base font-black ${
                isNeoBrutalist ? "text-black" : "text-emerald-400"
              }`}
            >
              ⚡ {Math.floor(currentKor).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Swap Input & Presets */}
        <div className="space-y-2.5 my-3">
          <label className="text-xs font-mono font-bold block uppercase tracking-wider text-slate-500">
            Coins to Convert
          </label>
          <div
            className={`flex items-center rounded-[10px] px-3 py-2 ${
              isNeoBrutalist
                ? "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
                : "bg-[#0A0D12] border border-[#222938]"
            }`}
          >
            <span className="text-base mr-2">🪙</span>
            <input
              type="number"
              min={10}
              max={currentCoins}
              step={10}
              value={coinsToSwap || ""}
              onChange={(e) => setCoinsToSwap(Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-full bg-transparent font-mono font-black text-lg focus:outline-none ${
                isNeoBrutalist ? "text-black" : "text-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setCoinsToSwap(currentCoins)}
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono cursor-pointer ${
                isNeoBrutalist
                  ? "bg-black text-[#ffe600] border border-black"
                  : "bg-emerald-500 text-black font-bold"
              }`}
            >
              MAX
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex gap-1.5 flex-wrap">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCoinsToSwap(amt)}
                disabled={amt > currentCoins}
                className={`px-2 py-1 rounded-[6px] text-[10px] font-mono font-black transition-all cursor-pointer ${
                  amt > currentCoins
                    ? "opacity-40 cursor-not-allowed bg-slate-200 text-slate-500"
                    : isNeoBrutalist
                    ? "bg-white hover:bg-[#ffe600] border-2 border-black text-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    : "bg-[#1B212D] hover:bg-[#252C3D] border border-[#2E384D] text-slate-300"
                }`}
              >
                {amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* You Will Receive Preview */}
        <div
          className={`p-3 rounded-[10px] my-3 flex items-center justify-between font-mono ${
            isNeoBrutalist
              ? "bg-[#e6f9ff] border-2 border-black text-black shadow-[2px_2px_0_#000]"
              : "bg-[#0e1c26] border border-[#1b3d4f] text-[#38bdf8]"
          }`}
        >
          <span className="text-xs font-bold uppercase">You Will Receive:</span>
          <span className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            +{korToReceive.toLocaleString()} KOR
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 h-10 rounded-[8px] font-black text-xs uppercase transition-all cursor-pointer ${
              isNeoBrutalist
                ? "bg-white border-2 border-black text-black shadow-[2px_2px_0_#000] hover:bg-slate-100"
                : "bg-[#1B212D] border border-[#2E384D] text-slate-300 hover:text-white"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConvert}
            disabled={!isValid || isSubmitting}
            className={`flex-1 h-10 rounded-[8px] font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              !isValid || isSubmitting
                ? "opacity-50 cursor-not-allowed bg-slate-300 text-slate-600 border-2 border-slate-400"
                : isNeoBrutalist
                ? "bg-[#00ff66] hover:bg-[#00e65c] text-black border-2 border-black shadow-[3px_3px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
            }`}
          >
            {isSubmitting ? "Converting..." : `Convert to ${korToReceive} KOR ➔`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SwapConfirm;
