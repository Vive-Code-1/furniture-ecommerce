import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split heavy vendor libs into long-lived cacheable chunks so the
        // homepage initial payload only loads what it needs.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "framer-motion";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("pdf")) return "pdf";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("react-router")) return "router";
          if (id.includes("react-dom") || id.includes("scheduler") || /[\\/]react[\\/]/.test(id)) return "react";
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("lucide-react")) return "icons";
        },
      },
    },
  },
}));
