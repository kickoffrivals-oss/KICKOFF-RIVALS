import { useState } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import {
  IconShield,
  IconCheck,
  IconLoader,
  IconChevronRight,
  IconZap,
} from "./Icons";
import { soundFx } from "../lib/soundFx";

interface SignMessageProps {
  address: string;
  onSigned: (signature: string, timestamp: number) => void;
  onCancel: () => void;
  isProfileLoading?: boolean;
}

export function SignMessage({
  address,
  onSigned,
  onCancel,
  isProfileLoading = false,
}: SignMessageProps) {
  const [isSigning, setIsSigning] = useState(false);

  const handleInstantSign = () => {
    soundFx.playClick();
    setIsSigning(true);
    const timestamp = Date.now();
    const mockSignature = `0x_mock_sig_${timestamp}_${address.slice(2, 10)}`;

    setTimeout(() => {
      soundFx.playCashout();
      onSigned(mockSignature, timestamp);
    }, 400);
  };

  return (
    <div className="min-h-screen stadium-bg text-white flex flex-col justify-between relative overflow-hidden">
      {/* Floodlight reflections */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <RivalsLogo size="md" variant="full" className="text-white" />
        <button
          onClick={() => {
            soundFx.playClick();
            onCancel();
          }}
          className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
      </header>

      {/* Center Modal */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="broadcast-card rounded-3xl p-8 border border-white/10 relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-black/80">
            {/* Shield Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[2px] shadow-2xl shadow-amber-500/30 animate-float">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-amber-400">
                  <IconShield className="w-9 h-9" />
                </div>
              </div>
            </div>

            {/* Broadcast Title */}
            <div className="text-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
                INSTANT AUTHENTICATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mt-1">
                CONFIRM IDENTITY
              </h1>
              <p className="text-xs text-slate-400 mt-2">
                Click below to authorize your test account session and initialize matchday balances.
              </p>
            </div>

            {/* Wallet Address Chip */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Test Account
              </span>
              <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>

            {/* Verification Details */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 mb-6">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <IconZap className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulation Ready</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>5,000 Coins + 1,000 KOR allocated</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>All leagues, simulation & bet slips active</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-emerald-300">Instant 1-click authorization</span>
                </li>
              </ul>
            </div>

            {/* Submit Signature Button */}
            <button
              onClick={handleInstantSign}
              disabled={isSigning || isProfileLoading}
              className={cn(
                "w-full h-14 rounded-2xl font-black text-base uppercase tracking-wider italic",
                "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950",
                "hover:from-emerald-400 hover:to-teal-300 transition-all duration-300 hover:scale-[1.02] active:scale-98",
                "shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {isProfileLoading ? (
                <>
                  <IconLoader className="w-5 h-5 animate-spin" />
                  <span>SYNCHRONIZING PROFILE...</span>
                </>
              ) : isSigning ? (
                <>
                  <IconLoader className="w-5 h-5 animate-spin" />
                  <span>AUTHORIZING TEST SESSION...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM & ENTER ARENA</span>
                  <IconChevronRight className="w-5 h-5 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-slate-500 text-xs border-t border-white/5 bg-slate-950/60 backdrop-blur-md">
        KickOff Rivals Demo Session • Zero Gas Required
      </footer>
    </div>
  );
}

export default SignMessage;
