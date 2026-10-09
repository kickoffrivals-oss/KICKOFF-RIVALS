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
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>STEP 2 OF 4: SESSION CONFIRMATION</span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onCancel();
            }}
            className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-[4px] border border-[#222938] bg-[#1B212D] hover:bg-[#222938] transition-colors"
          >
            Cancel
          </button>
        </div>
      </header>

      {/* Center Modal */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-[#13171F] rounded-[6px] p-6 sm:p-7 border border-[#222938] shadow-2xl space-y-5">
            {/* Header Icon */}
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-amber-400 mx-auto mb-2">
                <IconShield className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Session Initialization
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
                Confirm Account Session
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Authorize your matchday test account session to initialize starting coin balances.
              </p>
            </div>

            {/* Account Address Strip */}
            <div className="bg-[#0A0D12] border border-[#222938] rounded-[4px] p-3 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">
                Active Account
              </span>
              <span className="text-emerald-400 font-mono font-bold bg-[#1B212D] px-2 py-0.5 rounded-[4px] border border-[#222938] tabular-nums">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>

            {/* Verification Details */}
            <div className="bg-[#0A0D12] border border-[#222938] rounded-[4px] p-3.5 space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <IconZap className="w-3.5 h-3.5 text-amber-400" />
                <span>Session Privileges</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>5,000 Coins + 1,000 KOR starting allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Real-time 1X2 & combo slip betting enabled</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-slate-300">Off-chain test authentication (no gas fees)</span>
                </li>
              </ul>
            </div>

            {/* Submit Signature Button */}
            <button
              onClick={handleInstantSign}
              disabled={isSigning || isProfileLoading}
              className={cn(
                "w-full h-11 rounded-[4px] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2",
                isSigning || isProfileLoading
                  ? "bg-[#1B212D] text-slate-500 cursor-not-allowed border border-[#222938]"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              )}
            >
              {isSigning ? (
                <>
                  <IconLoader className="w-4 h-4 animate-spin" />
                  <span>Authorizing Session...</span>
                </>
              ) : isProfileLoading ? (
                <>
                  <IconLoader className="w-4 h-4 animate-spin" />
                  <span>Loading Profile...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Continue</span>
                  <IconChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3.5 text-center text-slate-500 text-xs border-t border-[#222938] bg-[#0A0D12]">
        KickOff Rivals • Cryptographic Session Authorization
      </footer>
    </div>
  );
}

export default SignMessage;
