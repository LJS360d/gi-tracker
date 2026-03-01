// @ts-check
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import db from "@astrojs/db";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";
import bun from "@wyattjoh/astro-bun-adapter";
import vercel from "@astrojs/vercel/serverless";
import basicSsl from "@vitejs/plugin-basic-ssl";
import Icons from "unplugin-icons/vite";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const isBehindProxy = !!process.env.BEHIND_PROXY;
const site = isVercel && process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const adapter = () => {
  if (isVercel) {
    return vercel({});
  }
  return bun();
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: adapter(),
  site,
  security: {
    checkOrigin: !isVercel && !isBehindProxy,
  },
  integrations: [
    solidJs(),
    db(),
    AstroPWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Gi-Track",
        short_name: "Gi-Track",
        description: "",
        theme_color: "#1a1a1a",
        background_color: "#0d0d0d",
        display: "standalone",
        start_url: "/",
        lang: "it",
        scope: "/",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/([a-d])\.basemaps\.cartocdn\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "carto-tiles",
              expiration: {
                maxEntries: 400,
                maxAgeSeconds: 365 * 24 * 60 * 60 /* 1 year */,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/echarts")) return "echarts";
            if (id.includes("node_modules/leaflet")) return "leaflet";
          },
        },
      },
    },
    server: {
      // @ts-ignore
      https: true,
      proxy: {},
    },
    plugins: [
      tailwindcss(),
      basicSsl({
        certDir: path.join(import.meta.dirname, ".certs"),
      }),
      Icons({
        compiler: "solid",
        autoInstall: true,
        jsx: "preact",
      }),
    ],
  },
});
