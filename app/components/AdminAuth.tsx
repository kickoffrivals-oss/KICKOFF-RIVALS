import { useState } from "react";
import { useSignMessage } from "wagmi";
import { cn } from "../lib/utils";
import {
  IconShield,
  IconLoader,
  IconX,
  IconCheck,
  IconAlert,
} from "./Icons";
import {
  verifyAdminWithBackend,
  createAuthMessage,
  storeSessionToken,
} from "../services/adminAuthService";

interface AdminAuthProps {
  onAuthSuccess: (sessionToken: string) => void;
  onCancel: () => void;
}

export function AdminAuth({ onAuthSuccess, onCancel }: AdminAuthProps) {
  const [status, setStatus] = useState<
    "idle" | "signing" | "verifying" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const { signMessageAsync } = useSignMessage();

  const handleAuthenticate = async () => {
    setStatus("signing");
    setError(null);

    try {
      // Create auth message with nonce
      const { message, nonce, timestamp } = createAuthMessage();

      // Request signature from wallet
      const signature = await signMessageAsync({ message });

      setStatus("verifying");

      // Get wallet address from wagmi
      const address = (window as any).ethereum?.selectedAddress;

      if (!address) {
        throw new Error("No wallet address found");
      }

      // Verify with backend
      const result = await verifyAdminWithBackend(address, signature, message);

      if (result.authorized && result.sessionToken) {
        // Store session token
        storeSessionToken(result.sessionToken, result.expiresIn || 3600);

        setStatus("success");

        // Notify parent after brief delay
        setTimeout(() => {
          onAuthSuccess(result.sessionToken!);
        }, 1000);
      } else {
        throw new Error(result.error || "Authorization denied");
      }
    } catch (err: any) {
      console.error("Admin auth error:", err);
      setStatus("error");

      if (err.message?.includes("User rejected")) {
        setError("Signature request was cancelled");
      } else if (err.message?.includes("not authorized")) {
        setError("This wallet is not authorized for admin access");
      } else {
        setError(err.message || "Authentication failed");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0D12]/80 backdrop-blur-sm"
        onClick={status !== "signing" && status !== "verifying" ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#13171F] rounded-[6px] border border-[#222938] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222938]">
          <div className="flex items-center gap-2">
            <IconShield className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-sm text-white uppercase tracking-wider">Admin Verification</h2>
          </div>
          {status !== "signing" && status !== "verifying" && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-[4px] bg-[#1B212D] border border-[#222938] text-slate-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <IconX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Idle State */}
          {status === "idle" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center mx-auto mb-3">
                <IconShield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Verification Required
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Sign a cryptographic message with your wallet to verify your admin credentials. No gas fees required.
              </p>
              <button
                onClick={handleAuthenticate}
                className="w-full h-10 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Sign & Authorize
              </button>
            </div>
          )}

          {/* Signing State */}
          {status === "signing" && (
            <div className="text-center py-6">
              <IconLoader className="w-8 h-8 text-emerald-400 mx-auto mb-3 animate-spin" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Waiting for Signature
              </h3>
              <p className="text-xs text-slate-400">
                Please check your connected wallet to confirm the authentication message.
              </p>
            </div>
          )}

          {/* Verifying State */}
          {status === "verifying" && (
            <div className="text-center py-6">
              <IconLoader className="w-8 h-8 text-emerald-400 mx-auto mb-3 animate-spin" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Verifying Authorization
              </h3>
              <p className="text-xs text-slate-400">
                Validating cryptographic signature with backend authority...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-[4px] bg-[#1B212D] border border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
                <IconCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Authentication Confirmed
              </h3>
              <p className="text-xs text-slate-400">
                Opening administrative session...
              </p>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-[4px] bg-[#1B212D] border border-red-500/40 flex items-center justify-center mx-auto mb-3">
                <IconAlert className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Access Denied
              </h3>
              <p className="text-xs text-red-400 mb-5">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={onCancel}
                  className="flex-1 h-10 rounded-[4px] border border-[#222938] bg-[#1B212D] text-slate-300 font-bold text-xs uppercase hover:bg-[#222938] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAuthenticate}
                  className="flex-1 h-10 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        {(status === "idle" || status === "error") && (
          <div className="px-5 pb-5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-[4px] bg-[#0A0D12] border border-[#222938]">
              <IconShield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Signatures use standard EIP-191 off-chain verification and do not submit transactions to the blockchain.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAuth;
