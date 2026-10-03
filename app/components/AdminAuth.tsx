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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={status !== "signing" && status !== "verifying" ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-background rounded-2xl shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <IconShield className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Wallet Verification</h2>
          </div>
          {status !== "signing" && status !== "verifying" && (
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <IconX className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Idle State */}
          {status === "idle" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <IconShield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Verification Required
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Sign a message to verify your wallet session. This action is
                free and doesn't cost gas.
              </p>
              <button
                onClick={handleAuthenticate}
                className="btn btn-primary w-full h-12 font-semibold"
              >
                Sign & Authorize
              </button>
            </div>
          )}

          {/* Signing State */}
          {status === "signing" && (
            <div className="text-center py-8">
              <IconLoader className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Waiting for Signature
              </h3>
              <p className="text-sm text-muted-foreground">
                Please check your wallet to sign the authentication message.
              </p>
            </div>
          )}

          {/* Verifying State */}
          {status === "verifying" && (
            <div className="text-center py-8">
              <IconLoader className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Verifying Credentials
              </h3>
              <p className="text-sm text-muted-foreground">
                Checking your admin authorization...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <IconCheck className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Authentication Successful
              </h3>
              <p className="text-sm text-muted-foreground">
                Redirecting to admin portal...
              </p>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <IconAlert className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Authentication Failed
              </h3>
              <p className="text-sm text-destructive mb-6">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="btn btn-outline flex-1 h-11"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAuthenticate}
                  className="btn btn-primary flex-1 h-11"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        {(status === "idle" || status === "error") && (
          <div className="px-6 pb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <IconShield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Signing is instant, free, and secure without gas fees.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAuth;
