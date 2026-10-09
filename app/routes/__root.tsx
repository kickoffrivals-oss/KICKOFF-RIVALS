import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles/globals.css?url";
import { GameProvider } from "../contexts/GameContext";
import { Toaster } from "react-hot-toast";
import { AppKitProvider } from "../config/appkit";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content: "The ultimate virtual football betting league.",
      },
      {
        name: "talentapp:project_verification",
        content:
          "edaef554e272eeecec7b0a7e6b1c3fd06b1ff7a5c62c45e898443d17f78335b621d88dc1e158c62310dffdc1e119da6331a3d336bf05c75cfa8b4452732c8480",
      },
      { title: "KickOff Rivals" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

import { FloatingSupport } from "../components/FloatingSupport";

function RootComponent() {
  return (
    <RootDocument>
      <AppKitProvider>
        <GameProvider>
          <Outlet />
          <FloatingSupport />
          <Toaster position="top-center" />
        </GameProvider>
      </AppKitProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="stadium-bg text-white min-h-screen">
        <div id="root">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
