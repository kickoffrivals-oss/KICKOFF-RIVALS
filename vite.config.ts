import { defineConfig } from "vite";
import path from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 4000,
  },
  resolve: {
    alias: {
      axios: path.resolve(process.cwd(), "node_modules/axios/dist/esm/axios.js"),
      "@solana/web3.js": path.resolve(process.cwd(), "mocks/empty.js"),
    },
  },
  optimizeDeps: {
    include: ["axios", "buffer"],
    exclude: [
      // Prevent server-only/native packages from being pre-bundled for client
      "pg",
      "pg-native",
      "bufferutil",
      "utf-8-validate",
      "node-gyp-build",
    ],
  },
  ssr: {
    // Treat these server-only/native modules as external during SSR/client builds
    // so they are not bundled into the client output.
    external: [
      "pg",
      "pg-pool",
      "pg-protocol",
      "pg-types",
      "pg-native",
      "bufferutil",
      "utf-8-validate",
      "node-gyp-build",
    ],
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: "app",
      router: {
        routesDirectory: "routes",
      },
    }),
    nitro({
      preset: process.env.VERCEL ? "vercel" : undefined,
    }),
    viteReact(),
  ],
});
