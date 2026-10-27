import { useState } from "react";
import { soundFx } from "../lib/soundFx";
import { LegalFooter } from "./legal/LegalFooter";

interface LandingPageNeoBrutalistProps {
  onEnter: () => void;
  onSwitchTheme?: () => void;
}

export function LandingPageNeoBrutalist({
  onEnter,
  onSwitchTheme,
}: LandingPageNeoBrutalistProps) {
  const [demoPick, setDemoPick] = useState<string>("1");

  const handleLaunch = () => {
    soundFx.playWhistle();
    onEnter();
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-slate-900 flex flex-col justify-between font-sans selection:bg-[#ffe600] selection:text-black">
      {/* Background Halftone Dots Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        {/* =========================================================================
            TOP NAVIGATION
        ========================================================================= */}
        <nav className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white border-b-[3.5px] border-black shadow-[0_4px_0_#000]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-[#ffe600] border-[3px] border-black px-3.5 py-1.5 rounded-[10px] shadow-[3px_3px_0_#000] font-black italic tracking-tight text-lg sm:text-xl text-black flex items-center gap-1.5">
              <span>KICKOFF RIVALS</span>
              <span className="text-[#ff3366]">⚡</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Revert Theme Toggle */}
            {onSwitchTheme && (
              <button
                onClick={onSwitchTheme}
                className="px-3 py-1.5 rounded-[8px] bg-white hover:bg-slate-100 border-[2.5px] border-black text-xs font-mono font-black text-black shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                title="Switch back to Classic UI"
              >
                <span>🏛️ Classic UI</span>
              </button>
            )}

            {/* Launch CTA */}
            <button
              onClick={handleLaunch}
              className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-[#00ff66] hover:bg-[#05f062] border-[3px] border-black text-black text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <span>ENTER ARENA ➔</span>
            </button>
          </div>
        </nav>

        {/* =========================================================================
            HAZARD CAUTION STRIPE
        ========================================================================= */}
        <div
          className="bg-[#ffe600] border-b-[3.5px] border-black px-4 py-2 overflow-x-auto no-scrollbar scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex items-center gap-6 whitespace-nowrap min-w-max text-xs sm:text-sm font-black font-mono tracking-wider text-black uppercase">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366] animate-pulse" />
              ★ 35S ROUND CYCLE LIVE
            </span>
            <span>•</span>
            <span>★ VIRTUAL FOOTBALL PRO ★</span>
            <span>•</span>
            <span>★ THE DAILY AVIATOR 100X ★</span>
            <span>•</span>
            <span>★ INSTANT COINS KOR SETTLEMENTS ★</span>
          </div>
        </div>

        {/* =========================================================================
            HERO SECTION
        ========================================================================= */}
        <section className="px-4 sm:px-8 py-8 sm:py-14 max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Bold Typography & Action */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-black text-[#ffe600] border-[2px] border-black shadow-[2.5px_2.5px_0_#000] text-xs font-mono font-black uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
                <span>MULTIVERSE ARCADE ARENA • LIVE 24/7</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase italic tracking-tight text-black leading-[0.95]">
                PREDICT. <br />
                <span className="bg-[#ffe600] px-2 py-0.5 border-[3.5px] border-black shadow-[4px_4px_0_#000] inline-block mt-1">
                  PLAY. WIN.
                </span>
              </h1>

              <p className="text-sm sm:text-base font-bold text-slate-700 max-w-lg leading-relaxed">
                Step into the high-stakes arena. Experience continuous 35-second virtual football matchdays with 2D tactical radar and rocket-speed multipliers in Daily Aviator.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={handleLaunch}
                  className="h-12 px-6 rounded-[12px] bg-[#00ff66] hover:bg-[#05f062] border-[3px] border-black text-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>LAUNCH GAME HUB ➔</span>
                </button>

                <button
                  onClick={handleLaunch}
                  className="h-12 px-5 rounded-[12px] bg-white hover:bg-slate-100 border-[3px] border-black text-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>EXPLORE ALL 9 GAMES</span>
                </button>
              </div>

              {/* Fast Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                <div className="bg-white border-[2.5px] border-black rounded-[10px] p-2.5 shadow-[3px_3px_0_#000]">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Round Time</span>
                  <span className="text-base font-black font-mono text-black">35s Fast</span>
                </div>
                <div className="bg-white border-[2.5px] border-black rounded-[10px] p-2.5 shadow-[3px_3px_0_#000]">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Active Drops</span>
                  <span className="text-base font-black font-mono text-[#ff3366]">Football + Aviator</span>
                </div>
                <div className="bg-white border-[2.5px] border-black rounded-[10px] p-2.5 shadow-[3px_3px_0_#000]">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Starter Grant</span>
                  <span className="text-base font-black font-mono text-black">5,000 Coins KOR</span>
                </div>
                <div className="bg-white border-[2.5px] border-black rounded-[10px] p-2.5 shadow-[3px_3px_0_#000]">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Fairness</span>
                  <span className="text-base font-black font-mono text-[#00a854]">SHA-256</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Simulator Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border-[3.5px] border-black rounded-[20px] p-5 shadow-[6px_6px_0_#000] space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b-[2.5px] border-black">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[6px] bg-[#ff3366] text-white font-mono text-xs font-black">
                      LIVE R#1042
                    </span>
                    <span className="text-xs font-black uppercase text-black">Premier Division</span>
                  </div>
                  <span className="font-mono text-xs font-black text-black">00:24</span>
                </div>

                {/* Match Preview */}
                <div className="bg-[#f4f4f0] border-[2.5px] border-black rounded-[12px] p-3 text-center">
                  <div className="flex items-center justify-between font-black text-sm text-black">
                    <span className="truncate max-w-[100px]">Arsenal</span>
                    <span className="text-lg font-mono bg-white px-2 py-0.5 rounded border border-black">2 - 1</span>
                    <span className="truncate max-w-[100px]">Chelsea</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1 block font-mono">
                    2D PITCH ATTACK IN PROGRESS
                  </span>
                </div>

                {/* Interactive Demo Odds Buttons */}
                <div>
                  <span className="text-[11px] font-black uppercase text-black block mb-2 font-mono">
                    Test 1X2 Prediction:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setDemoPick("1");
                      }}
                      className={`py-2 rounded-[8px] border-[2px] border-black font-mono font-black text-xs transition-all cursor-pointer ${
                        demoPick === "1"
                          ? "bg-[#ffe600] text-black shadow-[2px_2px_0_#000]"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      1 • 2.10
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setDemoPick("X");
                      }}
                      className={`py-2 rounded-[8px] border-[2px] border-black font-mono font-black text-xs transition-all cursor-pointer ${
                        demoPick === "X"
                          ? "bg-[#ffe600] text-black shadow-[2px_2px_0_#000]"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      X • 3.20
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setDemoPick("2");
                      }}
                      className={`py-2 rounded-[8px] border-[2px] border-black font-mono font-black text-xs transition-all cursor-pointer ${
                        demoPick === "2"
                          ? "bg-[#ffe600] text-black shadow-[2px_2px_0_#000]"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      2 • 2.85
                    </button>
                  </div>
                </div>

                {/* Instant Launch CTA */}
                <button
                  onClick={handleLaunch}
                  className="w-full py-3 rounded-[12px] bg-[#00ff66] hover:bg-[#05f062] border-[3px] border-black text-black font-black uppercase text-xs sm:text-sm tracking-wider shadow-[3px_3px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  ENTER ARENA WITH 5,000 COINS KOR ➔
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BOTTOM LEGAL & COMPLIANCE FOOTER
        ========================================================================= */}
        <LegalFooter variant="neobrutalist" />
      </div>
    </div>
  );
}

export default LandingPageNeoBrutalist;
