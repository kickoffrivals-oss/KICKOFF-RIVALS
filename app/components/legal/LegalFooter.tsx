import { openLegalModal } from "./LegalModal";

interface LegalFooterProps {
  variant?: "neobrutalist" | "classic";
}

export function LegalFooter({ variant = "neobrutalist" }: LegalFooterProps) {
  if (variant === "classic") {
    return (
      <footer className="w-full bg-[#0A0D12] border-t border-[#222938] px-4 sm:px-8 py-5 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[4px] bg-[#1E2533] border border-[#2B3547] text-[10px] font-mono font-bold text-amber-400">
              18+ ONLY
            </span>
            <span className="font-bold text-slate-300">© 2026 KickOff Rivals</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500 hidden sm:inline">
              Deterministic PRNG Virtual Sportsbook & Arcade Simulation
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-mono text-[11px]">
            <button
              onClick={() => openLegalModal("terms")}
              className="text-slate-400 hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => openLegalModal("privacy")}
              className="text-slate-400 hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => openLegalModal("cookies")}
              className="text-slate-400 hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Cookie Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => openLegalModal("responsible")}
              className="text-amber-400/90 hover:text-amber-300 transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Responsible Gaming (18+)
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => openLegalModal("fairness")}
              className="text-emerald-400/90 hover:text-emerald-300 transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Provably Fair SHA-256
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-[#1a1f2b] text-[10px] text-slate-600 text-center leading-relaxed">
          Disclaimer: KickOff Rivals and The Daily Aviator are virtual entertainment simulations. All gameplay is conducted using virtual credits (Coins KOR) with zero real-world monetary value or cash redeemability. No real-money gambling is offered or facilitated.
        </div>
      </footer>
    );
  }

  // Neo-Brutalist Variant
  return (
    <footer className="w-full bg-white border-t-[3.5px] border-black px-4 sm:px-8 py-4 sm:py-5 text-black">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left Branding & 18+ Warning */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-mono font-black">
          <span className="px-2 py-0.5 rounded-[6px] bg-[#ff3366] text-white border-[1.5px] border-black text-[10px] shadow-[1.5px_1.5px_0_#000]">
            18+ ONLY
          </span>
          <span className="px-2 py-0.5 rounded-[6px] bg-[#ffe600] text-black border-[1.5px] border-black text-[10px] shadow-[1.5px_1.5px_0_#000]">
            VIRTUAL SIMULATION
          </span>
          <span>© 2026 KICKOFF RIVALS</span>
        </div>

        {/* Legal Action Links */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono font-black">
          <button
            onClick={() => openLegalModal("terms")}
            className="px-2.5 py-1 rounded-[6px] bg-slate-100 hover:bg-[#ffe600] border-[2px] border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            TERMS
          </button>
          <button
            onClick={() => openLegalModal("privacy")}
            className="px-2.5 py-1 rounded-[6px] bg-slate-100 hover:bg-[#ffe600] border-[2px] border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            PRIVACY
          </button>
          <button
            onClick={() => openLegalModal("cookies")}
            className="px-2.5 py-1 rounded-[6px] bg-slate-100 hover:bg-[#ffe600] border-[2px] border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            COOKIES
          </button>
          <button
            onClick={() => openLegalModal("responsible")}
            className="px-2.5 py-1 rounded-[6px] bg-[#ffe600] hover:bg-[#ffd000] border-[2px] border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            RESPONSIBLE 18+
          </button>
          <button
            onClick={() => openLegalModal("fairness")}
            className="px-2.5 py-1 rounded-[6px] bg-[#00ff66] hover:bg-[#05f062] border-[2px] border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            PROVABLY FAIR
          </button>
        </div>
      </div>

      {/* Compliance Disclaimer */}
      <div className="max-w-6xl mx-auto mt-3 pt-3 border-t-2 border-black/10 text-[10px] font-mono text-slate-600 text-center leading-relaxed font-bold">
        SIMULATION GAMING ONLY: All bets, multiplier flight drops, and achievements are conducted using virtual credits (Coins KOR) with no cash redemption, investment yield, or fiat value. Must be 18+ to participate.
      </div>
    </footer>
  );
}
