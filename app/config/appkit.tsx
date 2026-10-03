import { createAppKit } from "@reown/appkit/react";
import { celo } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";

// 1. Get projectId from environment variable
const projectId =
  typeof window !== "undefined"
    ? (import.meta as any).env?.VITE_REOWN_PROJECT_ID || ""
    : process.env.VITE_REOWN_PROJECT_ID || "";

// 2. Create a metadata object
const metadata = {
  name: "KickOff Rivals",
  description: "The ultimate virtual football betting league.",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://kickoffrivals.com",
  icons: [
    typeof window !== "undefined"
      ? `${window.location.origin}/logo.png`
      : "https://kickoffrivals.com/logo.png",
  ],
};

// 3. Set the networks
const networks = [celo] as any;

// 4. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  enableCoinbase: false,
  enableInjected: true,
  enableWalletConnect: true,
});

// 5. Create modal - only on client
if (typeof window !== "undefined") {
  const appKit = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    enableCoinbase: false,
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#1d4ed8",
      "--w3m-border-radius-master": "1px",
    },
  });

  // Expose appKit for global access
  (window as any).appKit = appKit;
  console.log("AppKit initialized and attached to window");
}

// 6. Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export { queryClient };

// 7. Export provider wrapper with SSR support
export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
