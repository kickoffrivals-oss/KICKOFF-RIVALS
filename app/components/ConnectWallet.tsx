import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import {
  IconWallet,
  IconChevronRight,
  IconCheck,
  IconLoader,
  IconX,
  IconShield,
} from "./Icons";

interface ConnectWalletProps {
  onConnected: (address: string) => void;
}

export function ConnectWallet({ onConnected }: ConnectWalletProps) {
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // When connected, notify parent
  if (isConnected && address) {
    // Use setTimeout to avoid updating state during render
    setTimeout(() => onConnected(address), 0);
  }

  const handleConnect = async (connector: any) => {
    setError(null);
    try {
      connect({ connector });
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    }
  };

  const handleOpenAppKit = async () => {
    // Try to open the AppKit modal if available
    const appKit = (window as any).appKit;

    console.log("Opening AppKit:", { appKitAvailable: !!appKit });

    if (appKit?.open) {
      await appKit.open();
    } else {
      // Fallback: use w3m-button click
      console.warn("AppKit instance not found on window, attempting fallback click");
      const button = document.querySelector("w3m-button");
      if (button) {
        // Ensure we're targeting the shadow root button if possible, but usually the custom element handles click
        (button as HTMLElement).click();
      } else {
        setError("Wallet connection module not fully initialized. Please refresh.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <RivalsLogo size="md" variant="full" className="text-white" />
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-full bg-primary/20 text-primary">
              <IconWallet className="w-16 h-16" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Connect your wallet to start playing and earning rewards
          </p>

          {/* Connection Status */}
          {isConnecting || isPending ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <IconLoader className="w-12 h-12 text-primary animate-spin" />
              <p className="text-slate-400">Connecting...</p>
            </div>
          ) : isConnected && address ? (
            <div className="bg-slate-800/50 border border-primary/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <IconCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-white font-semibold">Connected</p>
                  <p className="text-slate-400 text-sm font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => disconnect()}
                className="btn btn-ghost w-full h-10 text-slate-400 hover:text-white"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <>
              {/* Wallet Options */}
              <div className="space-y-3 mb-6">
                {/* AppKit Button (Recommended) */}
                <button
                  onClick={handleOpenAppKit}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-all",
                    "flex items-center justify-between",
                    "border-primary bg-primary/10 hover:bg-primary/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <IconWallet className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">
                        Connect Wallet
                      </div>
                      <div className="text-slate-400 text-sm">
                        Reown AppKit
                      </div>
                    </div>
                  </div>
                  <IconChevronRight className="w-5 h-5 text-primary" />
                </button>

                {/* Individual connectors */}
                {connectors
                  .filter(
                    (c) =>
                      ![
                        "WalletConnect",
                        "Injected",
                        "Rabby Wallet",
                        "Trust Wallet",
                        "Phantom",
                        "Ronin Wallet",
                        "Magic Eden",
                      ].includes(c.name)
                  )
                  .slice(0, 3)
                  .map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => handleConnect(connector)}
                      disabled={!connector.ready}
                      className={cn(
                        "w-full p-4 rounded-xl border transition-all",
                        "flex items-center justify-between",
                        "border-slate-700 bg-slate-800/50 hover:border-slate-600",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <IconWallet className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white">
                            {connector.name}
                          </div>
                          <div className="text-slate-500 text-sm">
                            {connector.ready ? "Available" : "Not installed"}
                          </div>
                        </div>
                      </div>
                      <IconChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                  ))}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/50 mb-6">
                  <IconX className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </>
          )}

          {/* Security note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
            <IconShield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium">
                Your wallet is safe
              </p>
              <p className="text-slate-400 text-xs">
                We never have access to your private keys. You'll sign a message
                to verify ownership - this is free and doesn't cost gas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AppKit Modal Trigger (hidden) */}
      <div className="hidden">
        <w3m-button />
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-slate-500 text-sm">
        <p>New to crypto wallets?</p>
        <a
          href="https://ethereum.org/en/wallets/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Learn about wallets →
        </a>
      </footer>
    </div>
  );
}

// Declare w3m-button for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3m-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default ConnectWallet;
