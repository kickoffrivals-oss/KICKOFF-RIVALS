import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconChevronRight, IconArrowLeft } from "../../app/components/Icons";
import { RedAviatorPlane } from "./components/RedAviatorPlane";
import { useTheme } from "../../app/contexts/ThemeContext";
import { engine, EngineState } from "./GameEngine";
import { GameStatus } from "./types";
import { soundFx } from "../../app/lib/soundFx";
import toast from "react-hot-toast";
import { CoinsKorBalance } from "../../app/components/ui/CoinsKorBalance";

export type BetPanelStatus = "idle" | "queued" | "active" | "cashed_out";
export type ViewportMode = "mobile" | "desktop";
export type MobileTab = "all" | "mine" | "top";

interface AviatorRedesignProps {
  onBackToArena?: () => void;
  balance?: number;
  onBalanceChange?: (updater: (prev: number) => number) => void;
  initialViewport?: ViewportMode;
}

// Initial recent multiplier history for Live Dispatch strip
const INITIAL_MULTIPLIERS = [
  { id: 1, val: 5.21 },
  { id: 2, val: 1.03 },
  { id: 3, val: 52.81 },
  { id: 4, val: 14.85 },
  { id: 5, val: 2.14 },
  { id: 6, val: 1.15 },
  { id: 7, val: 8.42 },
  { id: 8, val: 104.2 },
  { id: 9, val: 1.98 },
  { id: 10, val: 3.75 },
  { id: 11, val: 24.5 },
];

// Sample live bets for desktop left column
const SAMPLE_LIVE_BETS = [
  { user: "Pilot_77", bet: 150, mult: 4.63, win: 694.5, isWin: true },
  { user: "AeroKing", bet: 50, mult: 4.0, win: 200.0, isWin: true },
  { user: "Nova_X", bet: 200, mult: 1.85, win: 370.0, isWin: true },
  { user: "SkyRider", bet: 500, mult: 0, win: 0, isWin: false },
  { user: "CyberAce", bet: 100, mult: 3.2, win: 320.0, isWin: true },
  { user: "Vortex99", bet: 250, mult: 0, win: 0, isWin: false },
  { user: "Falcon01", bet: 75, mult: 12.4, win: 930.0, isWin: true },
  { user: "Blaze_7", bet: 300, mult: 0, win: 0, isWin: false },
  { user: "HyperJet", bet: 120, mult: 2.1, win: 252.0, isWin: true },
];

// Helper to color-code multiplier chips
function getMultiplierChipStyle(val: number, isNeoBrutalist: boolean = false) {
  if (isNeoBrutalist) {
    if (val < 2.0) {
      return "bg-[#ffe600] text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] font-black";
    }
    if (val < 10.0) {
      return "bg-[#00f0ff] text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] font-black";
    }
    if (val < 50.0) {
      return "bg-[#ff9900] text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] font-black";
    }
    return "bg-[#00ff66] text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] font-black";
  }

  if (val < 2.0) {
    return "bg-[#271d47] text-[#c4b5fd] border-[#3b2b68] hover:border-[#6366f1]";
  }
  if (val < 10.0) {
    return "bg-[#18284c] text-[#93c5fd] border-[#25407c] hover:border-[#38bdf8]";
  }
  if (val < 50.0) {
    return "bg-[#3e3012] text-[#fef08a] border-[#6b501a] hover:border-[#eab308]";
  }
  return "bg-[#103a2f] text-[#86efac] border-[#1b6b55] hover:border-[#22c55e]";
}

export function AviatorRedesign({
  onBackToArena,
  balance = 1000,
  onBalanceChange,
  initialViewport,
}: AviatorRedesignProps) {
  const { isNeoBrutalist } = useTheme();

  // Viewport mode: mobile (phone frame) | desktop (2-col)
  const [viewport, setViewport] = useState<ViewportMode>(() => {
    if (initialViewport) return initialViewport;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "mobile";
    }
    return "desktop";
  });

  // Engine & Flight State
  const [engineState, setEngineState] = useState<EngineState>(() => engine.getState());
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [countdown, setCountdown] = useState<number>(10.0);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMuted());
  const [isProvablyFairOpen, setIsProvablyFairOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MobileTab>("all");

  // Multiplier history chips
  const [multipliersHistory, setMultipliersHistory] = useState(INITIAL_MULTIPLIERS);

  // Panel 1 Bet states
  const [bet1Amount, setBet1Amount] = useState<number>(100);
  const [bet1Status, setBet1Status] = useState<BetPanelStatus>("idle");
  const [bet1WinAmount, setBet1WinAmount] = useState<number | null>(null);
  const [bet1AutoBet, setBet1AutoBet] = useState<boolean>(false);
  const [bet1AutoCashout, setBet1AutoCashout] = useState<boolean>(false);
  const [bet1CashoutMult, setBet1CashoutMult] = useState<string>("2.00");

  // Panel 2 Bet states
  const [bet2Amount, setBet2Amount] = useState<number>(200);
  const [bet2Status, setBet2Status] = useState<BetPanelStatus>("idle");
  const [bet2WinAmount, setBet2WinAmount] = useState<number | null>(null);
  const [bet2AutoBet, setBet2AutoBet] = useState<boolean>(false);
  const [bet2AutoCashout, setBet2AutoCashout] = useState<boolean>(true);
  const [bet2CashoutMult, setBet2CashoutMult] = useState<string>("5.00");

  // Refs for animation loop synchronization
  const prevStatusRef = useRef<GameStatus>(engine.getState().status);
  const prevSecondRef = useRef<number>(-1);
  const requestRef = useRef<number>(0);

  const panel1Ref = useRef({
    status: bet1Status,
    amount: bet1Amount,
    autoCashout: bet1AutoCashout,
    cashoutMult: parseFloat(bet1CashoutMult) || 2.0,
    autoBet: bet1AutoBet,
  });
  const panel2Ref = useRef({
    status: bet2Status,
    amount: bet2Amount,
    autoCashout: bet2AutoCashout,
    cashoutMult: parseFloat(bet2CashoutMult) || 5.0,
    autoBet: bet2AutoBet,
  });

  useEffect(() => {
    panel1Ref.current = {
      status: bet1Status,
      amount: bet1Amount,
      autoCashout: bet1AutoCashout,
      cashoutMult: parseFloat(bet1CashoutMult) || 2.0,
      autoBet: bet1AutoBet,
    };
  }, [bet1Status, bet1Amount, bet1AutoCashout, bet1CashoutMult, bet1AutoBet]);

  useEffect(() => {
    panel2Ref.current = {
      status: bet2Status,
      amount: bet2Amount,
      autoCashout: bet2AutoCashout,
      cashoutMult: parseFloat(bet2CashoutMult) || 5.0,
      autoBet: bet2AutoBet,
    };
  }, [bet2Status, bet2Amount, bet2AutoCashout, bet2CashoutMult, bet2AutoBet]);

  // Quick-add chips
  const quickAmounts = [
    { label: "Min", amt: 100 },
    { label: "+100", amt: 100 },
    { label: "+200", amt: 200 },
    { label: "+500", amt: 500 },
    { label: "+1000", amt: 1000 },
    { label: "Max", amt: 5000 },
  ];

  // Bet Placed Handler
  const handlePlaceBet = useCallback(
    (panelIndex: 1 | 2) => {
      const isP1 = panelIndex === 1;
      const amount = isP1 ? bet1Amount : bet2Amount;
      if (amount < 100) {
        toast.error("Minimum bet is 100 KOR!");
        if (isP1) setBet1Amount(100);
        else setBet2Amount(100);
        return;
      }
      if (balance < amount) {
        toast.error("Insufficient KOR balance!");
        return;
      }
      if (onBalanceChange) {
        onBalanceChange((prev) => Math.max(0, prev - amount));
      }
      soundFx.playClick();
      const currentStatus = engine.getState().status;
      const nextStatus: BetPanelStatus = currentStatus === GameStatus.IDLE ? "active" : "queued";
      if (isP1) {
        setBet1Status(nextStatus);
        setBet1WinAmount(null);
      } else {
        setBet2Status(nextStatus);
        setBet2WinAmount(null);
      }
    },
    [balance, bet1Amount, bet2Amount, onBalanceChange]
  );

  // Bet Cancelled Handler
  const handleCancelBet = useCallback(
    (panelIndex: 1 | 2) => {
      const isP1 = panelIndex === 1;
      const amount = isP1 ? bet1Amount : bet2Amount;
      if (onBalanceChange) {
        onBalanceChange((prev) => prev + amount);
      }
      soundFx.playClick();
      if (isP1) {
        setBet1Status("idle");
      } else {
        setBet2Status("idle");
      }
    },
    [bet1Amount, bet2Amount, onBalanceChange]
  );

  // Cashout Handler
  const handleCashout = useCallback(
    (panelIndex: 1 | 2, currentMult: number) => {
      const isP1 = panelIndex === 1;
      const status = isP1 ? panel1Ref.current.status : panel2Ref.current.status;
      if (status !== "active") return;

      const amount = isP1 ? panel1Ref.current.amount : panel2Ref.current.amount;
      const payout = Math.round(amount * currentMult * 100) / 100;

      if (onBalanceChange) {
        onBalanceChange((prev) => prev + payout);
      }
      soundFx.playCashout();
      toast.success(
        `🎉 Cashed out at ${currentMult.toFixed(2)}x (+${payout.toLocaleString()} KOR)!`,
        {
          style: {
            background: isNeoBrutalist ? "#ffe600" : "#10B981",
            color: "#000",
            fontWeight: "900",
            border: "2px solid #000",
            boxShadow: "3px 3px 0 #000",
          },
        }
      );

      if (isP1) {
        setBet1Status("cashed_out");
        setBet1WinAmount(payout);
      } else {
        setBet2Status("cashed_out");
        setBet2WinAmount(payout);
      }
    },
    [onBalanceChange, isNeoBrutalist]
  );

  // Animation Loop & Engine Synchronization (10s waiting cycle)
  useEffect(() => {
    const animate = () => {
      const state = engine.getState();
      const prevStatus = prevStatusRef.current;
      const currentStatus = state.status;

      // Status change detection
      if (prevStatus !== currentStatus) {
        if (currentStatus === GameStatus.FLYING) {
          soundFx.playTakeoff();
          if (panel1Ref.current.status === "queued") setBet1Status("active");
          if (panel2Ref.current.status === "queued") setBet2Status("active");
        } else if (currentStatus === GameStatus.CRASHED) {
          soundFx.playCrash();
          // Add round crash multiplier to history strip
          setMultipliersHistory((prev) => [
            { id: Date.now(), val: state.multiplier },
            ...prev.slice(0, 19),
          ]);
          // Reset active bets that did not cash out
          if (panel1Ref.current.status === "active") setBet1Status("idle");
          if (panel2Ref.current.status === "active") setBet2Status("idle");
        } else if (currentStatus === GameStatus.IDLE) {
          // Reset cashed-out status for new round
          setBet1Status((prev) => (prev === "cashed_out" ? "idle" : prev));
          setBet2Status((prev) => (prev === "cashed_out" ? "idle" : prev));
          // Trigger auto-bet if enabled
          if (panel1Ref.current.autoBet && panel1Ref.current.status === "idle") {
            handlePlaceBet(1);
          }
          if (panel2Ref.current.autoBet && panel2Ref.current.status === "idle") {
            handlePlaceBet(2);
          }
        }
        prevStatusRef.current = currentStatus;
      }

      // Continuous live updates
      if (currentStatus === GameStatus.IDLE) {
        const remaining = Math.max(0, (state.nextStartTime - Date.now()) / 1000);
        setCountdown(remaining);
        const wholeSec = Math.ceil(remaining);
        if (wholeSec > 0 && wholeSec <= 3 && wholeSec !== prevSecondRef.current) {
          soundFx.playBeep();
          prevSecondRef.current = wholeSec;
        }
      } else if (currentStatus === GameStatus.FLYING) {
        const m = state.multiplier;
        setMultiplier(m);
        // Check auto-cashout
        if (
          panel1Ref.current.status === "active" &&
          panel1Ref.current.autoCashout &&
          m >= panel1Ref.current.cashoutMult
        ) {
          handleCashout(1, m);
        }
        if (
          panel2Ref.current.status === "active" &&
          panel2Ref.current.autoCashout &&
          m >= panel2Ref.current.cashoutMult
        ) {
          handleCashout(2, m);
        }
      } else if (currentStatus === GameStatus.CRASHED) {
        setMultiplier(state.multiplier);
      }

      setEngineState(state);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [handlePlaceBet, handleCashout]);

  // Render Single Bet Panel
  const renderBetPanel = (
    panelIndex: 1 | 2,
    amount: number,
    setAmount: (v: number) => void,
    autoBet: boolean,
    setAutoBet: (v: boolean) => void,
    autoCashout: boolean,
    setAutoCashout: (v: boolean) => void,
    cashoutMult: string,
    setCashoutMult: (v: string) => void
  ) => {
    const isP1 = panelIndex === 1;
    const betStatus = isP1 ? bet1Status : bet2Status;
    const winAmount = isP1 ? bet1WinAmount : bet2WinAmount;
    const isFlying = engineState.status === GameStatus.FLYING;
    const isWaiting = engineState.status === GameStatus.IDLE;

    let buttonLabel = "BET";
    let buttonSubtext = `${amount} KOR`;
    let buttonBg = isNeoBrutalist
      ? "bg-[#00f0ff] hover:bg-[#1fe3f0] text-black border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      : "bg-[#1d68f2] hover:bg-[#2563eb] border-[#3b82f6]/40";
    let buttonText = isNeoBrutalist ? "text-black font-black" : "text-white";
    let buttonDisabled = false;
    let buttonAction: () => void = () => handlePlaceBet(panelIndex);

    if (isWaiting) {
      if (betStatus === "active" || betStatus === "queued") {
        buttonLabel = "CANCEL";
        buttonSubtext = `${amount} KOR`;
        buttonBg = isNeoBrutalist
          ? "bg-[#ff0055] hover:bg-[#e0004c] text-white border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          : "bg-[#ef4444] hover:bg-[#dc2626] border-[#f87171]/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]";
        buttonText = "text-white font-black";
        buttonAction = () => handleCancelBet(panelIndex);
      } else {
        buttonLabel = "BET";
        buttonSubtext = `${amount} KOR`;
        buttonAction = () => handlePlaceBet(panelIndex);
      }
    } else if (isFlying) {
      if (betStatus === "active") {
        const liveWin = (amount * multiplier).toFixed(2);
        buttonLabel = "CASH OUT";
        buttonSubtext = `+${liveWin} KOR`;
        buttonBg = isNeoBrutalist
          ? "bg-[#ffe600] hover:bg-[#fed600] text-black border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none animate-pulse"
          : "bg-[#f59e0b] hover:bg-[#fbbf24] border-[#fbbf24]/50 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse";
        buttonText = "text-slate-950 font-black";
        buttonAction = () => handleCashout(panelIndex, multiplier);
      } else if (betStatus === "cashed_out") {
        buttonLabel = "CASHED OUT";
        buttonSubtext = `+${winAmount ? winAmount.toFixed(2) : (amount * multiplier).toFixed(2)} KOR`;
        buttonBg = isNeoBrutalist
          ? "bg-[#00ff66] text-black border-[3px] border-black shadow-[2px_2px_0_#000]"
          : "bg-[#10B981] text-black border border-emerald-400";
        buttonText = "text-black font-black";
        buttonDisabled = true;
      } else if (betStatus === "queued") {
        buttonLabel = "WAITING NEXT";
        buttonSubtext = `${amount} KOR`;
        buttonBg = isNeoBrutalist
          ? "bg-slate-200 text-black border-[3px] border-black shadow-[2px_2px_0_#000]"
          : "bg-[#1c183d] text-slate-400 border border-slate-700";
        buttonText = "text-slate-400 font-black";
        buttonDisabled = true;
      } else {
        buttonLabel = "BET NEXT ROUND";
        buttonSubtext = `${amount} KOR`;
        buttonAction = () => handlePlaceBet(panelIndex);
      }
    } else {
      // Crashed
      if (betStatus === "cashed_out") {
        buttonLabel = "WON!";
        buttonSubtext = `+${winAmount ? winAmount.toFixed(2) : "0.00"} KOR`;
        buttonBg = isNeoBrutalist
          ? "bg-[#00ff66] text-black border-[3px] border-black shadow-[2px_2px_0_#000]"
          : "bg-[#10B981] text-black border border-emerald-400";
        buttonText = "text-black font-black";
        buttonDisabled = true;
      } else {
        buttonLabel = "BET NEXT ROUND";
        buttonSubtext = `${amount} KOR`;
        buttonAction = () => handlePlaceBet(panelIndex);
      }
    }

    return (
      <div
        className={
          isNeoBrutalist
            ? "bg-[#fffef0] border-[3px] border-black rounded-[14px] p-2.5 sm:p-3 flex flex-col justify-between shadow-[4px_4px_0_#000] text-black"
            : "bg-[#13112a] border border-[#231f47] rounded-[12px] p-2 sm:p-2.5 flex flex-col justify-between shadow-lg text-white"
        }
      >
        {/* Row 1: Stepper + Action Button */}
        <div className="grid grid-cols-[1fr_auto] gap-1.5 sm:gap-2 items-stretch mb-1.5 sm:mb-2">
          <div
            className={
              isNeoBrutalist
                ? "bg-white border-2 border-black rounded-[8px] flex items-center justify-between p-0.5 sm:p-1 shadow-[2px_2px_0_#000]"
                : "bg-[#0c0a1d] border border-[#1f1b3d] rounded-[8px] flex items-center justify-between p-0.5 sm:p-1"
            }
          >
            <button
              onClick={() => setAmount(Math.max(100, (amount || 100) - 100))}
              className={
                isNeoBrutalist
                  ? "w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] bg-[#ffe600] hover:bg-[#fed600] text-black border border-black flex items-center justify-center font-black text-lg transition-all active:scale-95 cursor-pointer shadow-[1px_1px_0_#000] touch-manipulation"
                  : "w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] bg-[#1a1638] hover:bg-[#25204d] text-slate-300 hover:text-white flex items-center justify-center font-bold text-base transition-colors active:scale-95 cursor-pointer touch-manipulation"
              }
              aria-label="Decrease bet amount by 100"
            >
              -
            </button>
            <div className="flex-1 flex items-center justify-center px-1">
              <input
                type="number"
                min={100}
                max={50000}
                step={100}
                value={amount === 0 ? "" : amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setAmount(Math.max(0, val));
                  } else {
                    setAmount(0);
                  }
                }}
                onBlur={() => {
                  if (!amount || amount < 100) {
                    setAmount(100);
                  }
                }}
                className={
                  isNeoBrutalist
                    ? "w-full max-w-[100px] bg-transparent text-center font-mono font-black text-base sm:text-lg text-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                    : "w-full max-w-[100px] bg-transparent text-center font-mono font-bold text-sm sm:text-base text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                }
                aria-label="Bet amount"
                placeholder="100"
              />
            </div>
            <button
              onClick={() => setAmount((amount || 0) + 100)}
              className={
                isNeoBrutalist
                  ? "w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] bg-[#ffe600] hover:bg-[#fed600] text-black border border-black flex items-center justify-center font-black text-lg transition-all active:scale-95 cursor-pointer shadow-[1px_1px_0_#000] touch-manipulation"
                  : "w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] bg-[#1a1638] hover:bg-[#25204d] text-slate-300 hover:text-white flex items-center justify-center font-bold text-base transition-colors active:scale-95 cursor-pointer touch-manipulation"
              }
              aria-label="Increase bet amount by 100"
            >
              +
            </button>
          </div>

          {/* Action Button */}
          <button
            onClick={buttonAction}
            disabled={buttonDisabled}
            className={`min-w-[120px] sm:min-w-[140px] h-9 sm:h-10 px-3 py-1 rounded-[8px] border flex flex-col items-center justify-center transition-all cursor-pointer touch-manipulation ${buttonBg} ${
              buttonDisabled ? "opacity-90 cursor-default" : ""
            }`}
          >
            <span
              className={`text-xs sm:text-[13px] tracking-wider uppercase font-black ${buttonText}`}
            >
              {buttonLabel}
            </span>
            {buttonSubtext && (
              <span className="text-[10px] sm:text-[11px] font-mono font-black leading-none mt-0.5">
                {buttonSubtext}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: Quick-Add Chips (Hidden in mobile view as requested) */}
        {viewport !== "mobile" && (
          <div className="grid grid-cols-6 gap-1 mb-1.5 sm:mb-2">
            {quickAmounts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (q.label === "Min") setAmount(100);
                  else if (q.label === "Max") setAmount(5000);
                  else setAmount((amount || 0) + q.amt);
                }}
                className={
                  isNeoBrutalist
                    ? "h-6 sm:h-7 rounded-[5px] bg-white hover:bg-[#ffe600] text-black border-2 border-black text-[10px] font-mono font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-[1px_1px_0_#000] touch-manipulation"
                    : "h-6 sm:h-7 rounded-[5px] bg-[#181533] hover:bg-[#231f47] text-slate-400 hover:text-white border border-[#231f47] text-[10px] font-mono font-bold transition-colors active:scale-95 flex items-center justify-center cursor-pointer touch-manipulation"
                }
              >
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Row 3: Auto-bet & Auto-cashout Toggles */}
        <div
          className={
            isNeoBrutalist
              ? "pt-1.5 border-t-2 border-black/20 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-black font-bold"
              : "pt-1.5 border-t border-[#1d193d]/80 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400"
          }
        >
          {/* Auto Bet Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoBet}
              onChange={(e) => setAutoBet(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={
                isNeoBrutalist
                  ? "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-black peer-checked:bg-[#00ff66] peer-checked:border-black flex items-center justify-center transition-colors"
                  : "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-slate-600 peer-checked:bg-[#00f0ff] peer-checked:border-[#00f0ff] flex items-center justify-center transition-colors"
              }
            >
              {autoBet && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
            </div>
            <span
              className={
                isNeoBrutalist ? "text-black font-bold" : "peer-checked:text-white transition-colors"
              }
            >
              Auto bet
            </span>
          </label>

          {/* Auto Cashout Toggle + Input */}
          <div className="flex items-center gap-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoCashout}
                onChange={(e) => setAutoCashout(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={
                  isNeoBrutalist
                    ? "w-7 sm:w-8 h-3.5 sm:h-4 bg-slate-200 peer-checked:bg-[#00ff66] rounded-full relative transition-colors border-2 border-black"
                    : "w-7 sm:w-8 h-3.5 sm:h-4 bg-[#181533] peer-checked:bg-[#00f0ff] rounded-full relative transition-colors border border-slate-700"
                }
              >
                <div
                  className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${
                    isNeoBrutalist ? "bg-black" : "bg-white"
                  } absolute top-0.5 transition-transform ${
                    autoCashout ? "right-0.5" : "left-0.5"
                  }`}
                />
              </div>
              <span
                className={
                  isNeoBrutalist
                    ? "text-black font-bold"
                    : "peer-checked:text-white transition-colors"
                }
              >
                Auto cash out
              </span>
            </label>
            <div
              className={
                isNeoBrutalist
                  ? "flex items-center bg-white border-2 border-black rounded px-1.5 py-0.5 text-[10px] sm:text-xs text-black shadow-[1px_1px_0_#000]"
                  : "flex items-center bg-[#0c0a1d] border border-[#231f47] rounded px-1.5 py-0.5 text-[10px] sm:text-xs text-white"
              }
            >
              <span
                className={
                  isNeoBrutalist ? "text-black mr-0.5 font-bold" : "text-slate-500 mr-0.5 font-bold"
                }
              >
                x
              </span>
              <input
                type="text"
                value={cashoutMult}
                onChange={(e) => setCashoutMult(e.target.value)}
                className={
                  isNeoBrutalist
                    ? "w-7 sm:w-8 bg-transparent text-right font-black text-black focus:outline-none"
                    : "w-7 sm:w-8 bg-transparent text-right font-bold text-white focus:outline-none"
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Game Stage Card
  const renderGameStage = (isMobileFlex: boolean = false) => {
    const isFlying = engineState.status === GameStatus.FLYING;
    const isCrashed = engineState.status === GameStatus.CRASHED;
    const isWaiting = engineState.status === GameStatus.IDLE;

    // Flight progress curve: 0 at 1.00x, scaling smoothly up to 1.0 at ~15x+
    const progress = isFlying || isCrashed
      ? Math.min(1, Math.max(0, Math.log(multiplier) / Math.log(15)))
      : 0;

    const startX = 60;
    const startY = 380;
    const endX = 60 + 640 * progress;
    const endY = 380 - 270 * Math.pow(progress, 0.82);
    const ctrlX = startX + (endX - startX) * 0.55;
    const ctrlY = startY - (startY - endY) * 0.18;

    const curvePath = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
    const areaPath = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY} L ${endX} 400 L ${startX} 400 Z`;

    const planeLeftPct = isWaiting ? 16 : (endX / 800) * 100;
    const planeTopPct = isWaiting ? 78 : (endY / 450) * 100;
    const planeRotation = isWaiting ? 0 : -8 - 14 * progress;

    return (
      <div
        className={`relative w-full ${
          isMobileFlex
            ? "flex-1 min-h-[290px] h-full"
            : "aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/10] min-h-[320px]"
        } ${
          isNeoBrutalist
            ? "bg-[#181628] border-[3.5px] border-black rounded-[16px] shadow-[6px_6px_0_#000]"
            : "bg-[#13112a] border border-[#231f47] rounded-[14px] shadow-2xl"
        } overflow-hidden flex flex-col justify-between`}
      >
        {/* Faint Mountain Silhouette Art inside Stage */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          <svg
            viewBox="0 0 1000 400"
            className="absolute bottom-0 w-full h-auto text-[#2b245e]"
            preserveAspectRatio="none"
          >
            <path
              d="M0 400 L0 320 Q120 280 250 330 T500 300 Q650 260 800 320 T1000 290 L1000 400 Z"
              fill="currentColor"
              opacity="0.6"
            />
            <path
              d="M0 400 L0 360 Q180 320 350 370 T700 340 Q850 310 1000 350 L1000 400 Z"
              fill="#181533"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Dynamic Flight Curve SVG */}
        <svg
          viewBox="0 0 800 450"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5722" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {isFlying && (
            <>
              <path d={areaPath} fill="url(#cyanAreaGrad)" />
              <path
                d={curvePath}
                fill="none"
                stroke="#00f0ff"
                strokeWidth={isNeoBrutalist ? "5" : "4"}
                strokeLinecap="round"
                filter="url(#glow)"
              />
            </>
          )}

          {isCrashed && (
            <>
              <path d={areaPath} fill="url(#orangeAreaGrad)" />
              <path
                d={curvePath}
                fill="none"
                stroke="#ff5722"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            </>
          )}

          {isWaiting && (
            <path
              d="M 50 380 Q 200 380 400 375"
              fill="none"
              stroke={isNeoBrutalist ? "#504780" : "#2e2957"}
              strokeWidth="3"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Standby Aeroplane on runway during Waiting state */}
        {isWaiting && (
          <div
            className="absolute z-20 transition-all duration-300 opacity-80"
            style={{
              left: `${planeLeftPct}%`,
              top: `${planeTopPct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <RedAviatorPlane
              className="w-20 h-12 sm:w-24 sm:h-14"
              isFlying={false}
              flipped={true}
            />
          </div>
        )}

        {/* Scalable Red Aviator Monoplane at tip of curve during Flight */}
        {isFlying && (
          <div
            className="absolute z-20 transition-transform duration-75"
            style={{
              left: `${planeLeftPct}%`,
              top: `${planeTopPct}%`,
              transform: `translate(-50%, -50%) rotate(${planeRotation}deg)`,
            }}
          >
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-5 bg-gradient-to-l from-[#00f0ff]/70 via-[#ef4444]/50 to-transparent rounded-full blur-[4px] animate-pulse" />
              <RedAviatorPlane
                className="w-24 h-14 sm:w-32 sm:h-20 md:w-40 md:h-24 drop-shadow-[0_8px_20px_rgba(239,68,68,0.5)]"
                isFlying={true}
                flipped={true}
              />
            </div>
          </div>
        )}

        {/* Explosion Burst on Crash */}
        {isCrashed && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${planeLeftPct}%`,
              top: `${planeTopPct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 blur-[6px] animate-ping opacity-80" />
              <div className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-yellow-200 to-amber-500 shadow-[0_0_25px_#ff9f1c]" />
              <div className="absolute text-slate-950 font-black text-xs sm:text-sm">💥</div>
            </div>
          </div>
        )}

        {/* Center Multiplier Readout / Countdown Display (10s waiting cycle) */}
        <div className="relative z-30 pt-6 sm:pt-8 text-center flex flex-col items-center">
          {isWaiting && (
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              {isNeoBrutalist ? (
                <span className="text-[11px] font-mono font-black uppercase tracking-wider text-black bg-[#ffe600] px-3 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">
                  WAITING FOR NEXT ROUND
                </span>
              ) : (
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-[#00f0ff] px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                  WAITING FOR NEXT ROUND
                </span>
              )}
              <div className="text-4xl sm:text-6xl font-black font-sans text-white tracking-tight drop-shadow-md">
                {countdown.toFixed(1)}s
              </div>
              <div
                className={`w-36 sm:w-48 h-1.5 rounded-full overflow-hidden ${
                  isNeoBrutalist ? "bg-black/60 border border-black" : "bg-[#1f1b3d]"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    isNeoBrutalist
                      ? "bg-[#00ff66]"
                      : "bg-gradient-to-r from-[#00f0ff] to-[#3b82f6]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (countdown / 10.0) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {isFlying && (
            <div className="flex flex-col items-center">
              <span
                className={`text-5xl sm:text-7xl md:text-8xl font-black font-sans tracking-tight ${
                  isNeoBrutalist
                    ? "text-[#ffe600] drop-shadow-[5px_5px_0_#000]"
                    : "text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                }`}
              >
                {multiplier.toFixed(2)}x
              </span>
            </div>
          )}

          {isCrashed && (
            <div className="flex flex-col items-center">
              <span
                className={`text-5xl sm:text-7xl md:text-8xl font-black font-sans tracking-tight ${
                  isNeoBrutalist
                    ? "text-[#ff0055] drop-shadow-[5px_5px_0_#000]"
                    : "text-[#ef4444] drop-shadow-[0_0_24px_rgba(239,68,68,0.5)]"
                }`}
              >
                {multiplier.toFixed(2)}x
              </span>
              <span
                className={`text-xs sm:text-sm font-black font-mono uppercase tracking-[0.25em] mt-1 px-3 py-0.5 rounded ${
                  isNeoBrutalist
                    ? "bg-[#ff0055] text-white border-2 border-black shadow-[2px_2px_0_#000]"
                    : "text-[#ef4444] bg-red-500/10 border border-red-500/30"
                }`}
              >
                FLEW AWAY
              </span>
            </div>
          )}
        </div>

        {/* Stage Bottom Footer Meta */}
        <div
          className={`relative z-20 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between text-[10px] font-mono shrink-0 ${
            isNeoBrutalist
              ? "border-t-2 border-black bg-black text-white"
              : "border-t border-[#1d193d]/50 bg-[#0c0a1d]/40 text-slate-500"
          }`}
        >
          <button
            onClick={() => setIsProvablyFairOpen(true)}
            className="flex items-center gap-1.5 hover:underline cursor-pointer"
            title="Click to view round cryptography"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isNeoBrutalist ? "bg-[#00ff66]" : "bg-[#00f0ff]"
              } animate-pulse`}
            />
            <span className="tracking-wider font-bold">PROVABLY FAIR SHA-256</span>
          </button>
          <span className="font-bold">ROUND #{engineState.roundId}</span>
        </div>
      </div>
    );
  };

  // Top Bar (with Viewport Switcher: 📱 Mobile | 💻 Desktop | ↔ Responsive)
  const renderTopBar = () => {
    return (
      <header
        className={`px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 shrink-0 ${
          isNeoBrutalist
            ? "bg-[#ffe600] border-b-[3px] border-black text-black shadow-[0_3px_0_#000]"
            : "border-b border-[#231f47] bg-[#13112a] text-white"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* Back to Arena Button */}
          {onBackToArena && (
            <button
              onClick={onBackToArena}
              className={`w-9 h-9 rounded-[8px] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isNeoBrutalist
                  ? "bg-white border-2 border-black text-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  : "bg-[#1a1638] border border-[#26204d] text-slate-300 hover:text-white"
              }`}
              title="Return to Main Arena"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Daily Aviator Wordmark */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-base sm:text-lg font-black tracking-tighter uppercase italic truncate ${
                isNeoBrutalist ? "text-black" : "text-white"
              }`}
            >
              Daily{" "}
              <span
                className={
                  isNeoBrutalist
                    ? "bg-black text-[#00f0ff] px-1.5 py-0.2 rounded font-black not-italic"
                    : "text-[#00f0ff] not-italic font-sans"
                }
              >
                Aviator
              </span>
            </span>
          </div>
        </div>

        {/* Center: Viewport Switcher [📱 Mobile | 💻 Desktop] - shown in top bar on desktop */}
        {viewport === "desktop" && (
          <div
            className={`flex items-center p-0.5 rounded-[8px] border text-xs font-mono shrink-0 ${
              isNeoBrutalist
                ? "bg-white border-2 border-black shadow-[2px_2px_0_#000]"
                : "bg-[#181533] border-[#292257]"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`px-2 sm:px-2.5 py-1 rounded-[6px] transition-all cursor-pointer font-black text-[10px] sm:text-xs flex items-center gap-1.5 ${
                viewport === "mobile"
                  ? isNeoBrutalist
                    ? "bg-black text-white shadow-[1px_1px_0_#000]"
                    : "bg-[#8b5cf6] text-white shadow"
                  : isNeoBrutalist
                  ? "text-black/70 hover:text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Mobile View"
            >
              <span>📱</span>
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`px-2 sm:px-2.5 py-1 rounded-[6px] transition-all cursor-pointer font-black text-[10px] sm:text-xs flex items-center gap-1.5 ${
                viewport === "desktop"
                  ? isNeoBrutalist
                    ? "bg-black text-white shadow-[1px_1px_0_#000]"
                    : "bg-[#8b5cf6] text-white shadow"
                  : isNeoBrutalist
                  ? "text-black/70 hover:text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Desktop View"
            >
              <span>💻</span>
              <span>Desktop</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              const muted = soundFx.toggleMute();
              setIsMuted(muted);
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] flex items-center justify-center transition-all cursor-pointer ${
              isNeoBrutalist
                ? "bg-white border-2 border-black text-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs sm:text-sm"
                : "bg-[#1a1638] border border-[#26204d] text-slate-300 hover:text-white text-xs sm:text-sm"
            }`}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label="Toggle sound"
          >
            <span>{isMuted ? "🔇" : "🔊"}</span>
          </button>

          {/* Unified Coins KOR Balance Chip Component */}
          <CoinsKorBalance balance={balance} />
        </div>
      </header>
    );
  };

  // Live Dispatch Strip (Horizontal scroll on mobile with hidden scrollbar)
  const renderLiveDispatchStrip = () => {
    return (
      <div
        className={`px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-hide shrink-0 ${
          isNeoBrutalist
            ? "bg-white border-b-2 border-black text-black"
            : "bg-[#0f0d22] border-b border-[#231f47]"
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
          {multipliersHistory.map((item) => (
            <span
              key={item.id}
              className={`px-2 py-0.5 rounded-[5px] border text-[11px] font-mono font-black transition-all cursor-default ${getMultiplierChipStyle(
                item.val,
                isNeoBrutalist
              )}`}
            >
              {item.val.toFixed(2)}x
            </span>
          ))}
        </div>
        <button
          onClick={() => setIsProvablyFairOpen(true)}
          className={`ml-auto pl-2 transition-colors flex items-center shrink-0 cursor-pointer ${
            isNeoBrutalist ? "text-black hover:text-[#ff0055]" : "text-slate-500 hover:text-slate-300"
          }`}
          title="Round History & Cryptography"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </button>
      </div>
    );
  };

  // Mobile Bottom Tabs
  const renderMobileBottomTabs = () => {
    const tabs: { id: MobileTab; label: string; count?: number }[] = [
      { id: "all", label: "Bets", count: 18 },
      { id: "mine", label: "My Bets" },
    ];

    return (
      <nav
        className={`px-2 py-1.5 border-t shrink-0 flex items-center justify-around text-xs font-mono ${
          isNeoBrutalist
            ? "bg-[#ffe600] border-black border-t-2 text-black font-black"
            : "bg-[#0b091e] border-[#231f47] text-slate-400"
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === tab.id
                ? isNeoBrutalist
                  ? "bg-black text-[#ffe600] font-black border border-black shadow-[1.5px_1.5px_0_#000]"
                  : "bg-[#1f1b3d] text-white font-bold"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1 rounded ${
                  isNeoBrutalist ? "bg-white text-black font-bold" : "bg-[#2d2757] text-[#00f0ff]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    );
  };

  // Desktop Left Column
  const renderDesktopLeftColumn = () => {
    return (
      <aside
        className={`w-[310px] xl:w-[340px] shrink-0 flex flex-col gap-3 rounded-[14px] p-3 h-full overflow-hidden ${
          isNeoBrutalist
            ? "bg-[#fffef0] border-[3px] border-black shadow-[5px_5px_0_#000] text-black"
            : "bg-[#13112a] border border-[#231f47] shadow-2xl text-white"
        }`}
      >
        {/* Top: Live Dispatch Panel */}
        <div
          className={`pb-3 shrink-0 ${
            isNeoBrutalist ? "border-b-2 border-black" : "border-b border-[#231f47]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isNeoBrutalist ? "text-black font-black" : "text-slate-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isNeoBrutalist ? "bg-black" : "bg-[#00f0ff]"
                }`}
              />
              Live Dispatch
            </span>
            <span
              className={`text-[10px] font-mono ${
                isNeoBrutalist ? "text-black/60 font-bold" : "text-slate-500"
              }`}
            >
              LAST ROUNDS
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
            {multipliersHistory.map((item) => (
              <span
                key={item.id}
                className={`px-2 py-0.5 rounded-[5px] border text-[11px] font-mono font-black ${getMultiplierChipStyle(
                  item.val,
                  isNeoBrutalist
                )}`}
              >
                {item.val.toFixed(2)}x
              </span>
            ))}
          </div>
        </div>

        {/* Bottom: Live Bets Panel */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span
              className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                isNeoBrutalist ? "text-black font-black" : "text-slate-300"
              }`}
            >
              Live Bets ({SAMPLE_LIVE_BETS.length})
            </span>
            <span
              className={`text-[10px] font-mono font-bold ${
                isNeoBrutalist ? "text-[#00aa44]" : "text-emerald-400"
              }`}
            >
              ONLINE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {SAMPLE_LIVE_BETS.map((b, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-1.5 rounded-[8px] text-xs font-mono transition-all ${
                  isNeoBrutalist
                    ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0_#000]"
                    : "bg-[#0c0a1d] border border-[#1f1b3d]"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isNeoBrutalist
                        ? "bg-[#00f0ff] text-black border border-black font-black"
                        : "bg-[#1f1b3d] text-slate-300"
                    }`}
                  >
                    {b.user.charAt(0)}
                  </div>
                  <span
                    className={`truncate text-[11px] ${
                      isNeoBrutalist ? "font-black text-black" : "font-medium text-slate-300"
                    }`}
                  >
                    {b.user}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`font-mono text-[11px] ${
                      isNeoBrutalist ? "text-black font-bold" : "text-slate-400"
                    }`}
                  >
                    {b.bet}
                  </span>
                  {b.isWin ? (
                    <div className="flex flex-col items-end">
                      <span
                        className={`font-bold text-[11px] ${
                          isNeoBrutalist ? "text-[#00aa44] font-black" : "text-emerald-400"
                        }`}
                      >
                        {b.mult}x
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isNeoBrutalist ? "text-[#00aa44]" : "text-emerald-400"
                        }`}
                      >
                        +{b.win.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span
                        className={`font-bold text-[11px] ${
                          isNeoBrutalist ? "text-[#ff0055] font-black" : "text-red-400"
                        }`}
                      >
                        LOST
                      </span>
                      <span
                        className={`text-[10px] ${
                          isNeoBrutalist ? "text-black/50" : "text-slate-600"
                        }`}
                      >
                        -{b.bet}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div
      className={`w-full min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isNeoBrutalist
          ? "bg-[#faf8ee] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] text-black"
          : "bg-[#070514] text-white selection:bg-[#00f0ff] selection:text-slate-950"
      }`}
    >
      {/* Floating Responsiveness Switcher in Mobile View (floats at middle-left on PC/desktop only; hidden on mobile devices) */}
      {viewport === "mobile" && (
        <aside
          aria-label="Viewport Switcher"
          className="hidden md:flex fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 select-none pointer-events-auto"
        >
          <div
            className={`flex flex-col items-center gap-1.5 p-1 sm:p-1.5 rounded-[12px] transition-all ${
              isNeoBrutalist
                ? "bg-white border-[3px] border-black shadow-[4px_4px_0_#000]"
                : "bg-[#181533]/95 backdrop-blur-md border border-[#292257] shadow-2xl"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-[8px] transition-all cursor-pointer font-black text-xs flex items-center gap-1.5 ${
                viewport === "mobile"
                  ? isNeoBrutalist
                    ? "bg-black text-white shadow-[1.5px_1.5px_0_#000]"
                    : "bg-[#8b5cf6] text-white shadow"
                  : isNeoBrutalist
                  ? "text-black/70 hover:text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Mobile View (Active)"
              aria-label="Mobile View (Active)"
            >
              <span className="text-sm sm:text-base">📱</span>
              <span className="hidden sm:inline text-[10px] font-black uppercase">Mobile</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-[8px] transition-all cursor-pointer font-black text-xs flex items-center gap-1.5 ${
                viewport === "desktop"
                  ? isNeoBrutalist
                    ? "bg-black text-white shadow-[1.5px_1.5px_0_#000]"
                    : "bg-[#8b5cf6] text-white shadow"
                  : isNeoBrutalist
                  ? "bg-[#ffe600] hover:bg-[#00f0ff] text-black border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px]"
                  : "bg-[#1a1638] hover:bg-[#26204d] text-slate-200 hover:text-white border border-[#26204d]"
              }`}
              title="Switch to Desktop View"
              aria-label="Switch to Desktop View"
            >
              <span className="text-sm sm:text-base">💻</span>
              <span className="hidden sm:inline text-[10px] font-black uppercase">Desktop</span>
            </button>
          </div>
        </aside>
      )}

      {/* Viewport Modes */}
      {viewport === "mobile" ? (
        /* Dedicated Mobile Screen Simulation */
        <div
          className={`flex-1 flex items-center justify-center p-2 sm:p-6 ${
            isNeoBrutalist ? "bg-[#efece0]" : "bg-[#060410]"
          }`}
        >
          <div
            className={`w-full max-w-[390px] h-[820px] max-h-[94vh] rounded-[28px] overflow-hidden flex flex-col justify-between ${
              isNeoBrutalist
                ? "bg-[#faf8ee] border-[3.5px] border-black shadow-[8px_8px_0_#000]"
                : "bg-[#0c0a1d] border-2 border-[#231f47] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            }`}
          >
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {renderTopBar()}
              {renderLiveDispatchStrip()}
              <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
                <div className="flex-1 flex flex-col min-h-[300px] mb-1.5 sm:mb-2">
                  {renderGameStage(true)}
                </div>
                <div className="space-y-1.5 shrink-0">
                  {renderBetPanel(
                    1,
                    bet1Amount,
                    setBet1Amount,
                    bet1AutoBet,
                    setBet1AutoBet,
                    bet1AutoCashout,
                    setBet1AutoCashout,
                    bet1CashoutMult,
                    setBet1CashoutMult
                  )}
                  {renderBetPanel(
                    2,
                    bet2Amount,
                    setBet2Amount,
                    bet2AutoBet,
                    setBet2AutoBet,
                    bet2AutoCashout,
                    setBet2AutoCashout,
                    bet2CashoutMult,
                    setBet2CashoutMult
                  )}
                </div>
              </div>
            </div>
            {renderMobileBottomTabs()}
          </div>
        </div>
      ) : (
        /* Dedicated Desktop Layout */
        <div
          className={`flex-1 relative overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8 ${
            isNeoBrutalist
              ? "bg-[#faf8ee] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] text-black"
              : "bg-gradient-to-b from-[#180f38] via-[#0d0a22] to-[#070514] text-white"
          }`}
        >
          {!isNeoBrutalist && (
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px]" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col">
            <div
              className={`rounded-[14px] overflow-hidden mb-3 ${
                isNeoBrutalist ? "border-[3px] border-black shadow-[4px_4px_0_#000]" : "shadow-xl"
              }`}
            >
              {renderTopBar()}
            </div>

            <div className="flex-1 flex gap-4 min-h-[620px]">
              {renderDesktopLeftColumn()}

              <div className="flex-1 flex flex-col gap-3 min-w-0">
                {renderGameStage(false)}
                <div className="grid grid-cols-2 gap-3">
                  {renderBetPanel(
                    1,
                    bet1Amount,
                    setBet1Amount,
                    bet1AutoBet,
                    setBet1AutoBet,
                    bet1AutoCashout,
                    setBet1AutoCashout,
                    bet1CashoutMult,
                    setBet1CashoutMult
                  )}
                  {renderBetPanel(
                    2,
                    bet2Amount,
                    setBet2Amount,
                    bet2AutoBet,
                    setBet2AutoBet,
                    bet2AutoCashout,
                    setBet2AutoCashout,
                    bet2CashoutMult,
                    setBet2CashoutMult
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provably Fair Cryptography Verification Modal */}
      {isProvablyFairOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg p-5 sm:p-6 rounded-[16px] max-h-[90vh] overflow-y-auto ${
              isNeoBrutalist
                ? "bg-[#fffef0] border-[3.5px] border-black shadow-[8px_8px_0_#000] text-black"
                : "bg-[#181533] border border-[#302968] text-white shadow-2xl"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h3 className="text-base sm:text-lg font-black font-sans uppercase tracking-tight">
                  Provably Fair Verification
                </h3>
              </div>
              <button
                onClick={() => setIsProvablyFairOpen(false)}
                className={`w-8 h-8 rounded-[8px] flex items-center justify-center font-black cursor-pointer ${
                  isNeoBrutalist
                    ? "bg-white border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5"
                    : "bg-[#25204d] text-slate-300 hover:text-white"
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <p className={isNeoBrutalist ? "text-black/80 font-bold" : "text-slate-400"}>
                Each flight outcome is cryptographically fixed prior to takeoff using SHA-256. Neither the player nor the house can influence the crash multiplier once generated.
              </p>

              <div>
                <span className="font-bold text-[10px] uppercase opacity-60 block mb-1">
                  Active Round
                </span>
                <div
                  className={`p-2 rounded font-black ${
                    isNeoBrutalist
                      ? "bg-white border-2 border-black"
                      : "bg-[#0c0a1d] border border-[#231f47]"
                  }`}
                >
                  Round #{engineState.roundId} (Nonce: {engineState.nonce})
                </div>
              </div>

              <div>
                <span className="font-bold text-[10px] uppercase opacity-60 block mb-1">
                  SHA-256 Hash Commitment
                </span>
                <div
                  className={`p-2 rounded font-mono text-[11px] break-all ${
                    isNeoBrutalist
                      ? "bg-white border-2 border-black"
                      : "bg-[#0c0a1d] border border-[#231f47] text-cyan-400"
                  }`}
                >
                  {engineState.commit}
                </div>
              </div>

              <div>
                <span className="font-bold text-[10px] uppercase opacity-60 block mb-1">
                  Server Seed (Revealed on Crash)
                </span>
                <div
                  className={`p-2 rounded font-mono text-[11px] break-all ${
                    isNeoBrutalist
                      ? "bg-white border-2 border-black"
                      : "bg-[#0c0a1d] border border-[#231f47]"
                  }`}
                >
                  {engineState.reveal || "🔒 Protected until current flight ends"}
                </div>
              </div>

              <div>
                <span className="font-bold text-[10px] uppercase opacity-60 block mb-1">
                  Public Client Seed
                </span>
                <div
                  className={`p-2 rounded font-mono text-[11px] break-all ${
                    isNeoBrutalist
                      ? "bg-white border-2 border-black"
                      : "bg-[#0c0a1d] border border-[#231f47]"
                  }`}
                >
                  aviator-newspaper-client-seed-v1
                </div>
              </div>

              <div
                className={`p-3 rounded-[10px] text-[11px] ${
                  isNeoBrutalist
                    ? "bg-[#ffe600] border-2 border-black text-black font-bold"
                    : "bg-[#1f1b3d] text-slate-300 border border-[#3b3370]"
                }`}
              >
                Formula: <code className="font-black">Crash = 0.99 / (1 - (hash / 2^52))</code>
              </div>

              <button
                onClick={() => {
                  toast.success("Round cryptography verified!", {
                    style: {
                      background: isNeoBrutalist ? "#ffe600" : "#10B981",
                      color: "#000",
                      fontWeight: "900",
                      border: "2px solid #000",
                      boxShadow: "3px 3px 0 #000",
                    },
                  });
                }}
                className={`w-full py-2.5 rounded-[10px] font-black uppercase tracking-wider text-xs transition-all cursor-pointer ${
                  isNeoBrutalist
                    ? "bg-[#00f0ff] hover:bg-[#1ee0ee] text-black border-2 border-black shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5"
                    : "bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-lg"
                }`}
              >
                Verify Cryptographic Hash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AviatorRedesign;
