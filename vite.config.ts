import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { feedPlugin } from "./scripts/vite-plugin-feed";

const here = dirname(fileURLToPath(import.meta.url));

// Vite config for the tessera.arcanelabs.info SPA.
//
// Build target is GitHub Pages with a custom subdomain (CNAME), so the
// site is served from the root path "/". base stays default ("/").
//
// Content lives at /content/{episodes,architecture}/*.md and gets bundled
// at build time via `import.meta.glob` in src/content/loader.ts. The
// feed plugin emits dist/feed.xml at build time from the same source.
export default defineConfig({
  plugins: [
    react(),
    feedPlugin({ contentRoot: resolve(here, "content") }),
  ],
  build: {
    target: "es2022",
    sourcemap: true,
    // Manual chunks group dependencies by churn rate so subsequent
    // visits hit cached vendor bundles even when content changes.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("/scheduler/")
          ) {
            return "vendor-react";
          }
          if (id.includes("/yaml/")) {
            return "vendor-yaml";
          }
          // p5 lands in its own chunk so episode routes are the only
          // surface that pays the sketch-runtime cost. Home / Archive
          // / Saved / Concepts never trigger the dynamic import that
          // pulls this chunk in.
          if (id.includes("/p5/")) {
            return "vendor-sketches";
          }
          if (
            id.includes("/react-markdown/") ||
            id.includes("/remark-") ||
            id.includes("/rehype-") ||
            id.includes("/unified/") ||
            id.includes("/mdast-") ||
            id.includes("/hast-") ||
            id.includes("/micromark") ||
            id.includes("/bail/") ||
            id.includes("/is-plain-obj/") ||
            id.includes("/trough/") ||
            id.includes("/vfile") ||
            id.includes("/property-information/") ||
            id.includes("/space-separated-tokens/") ||
            id.includes("/comma-separated-tokens/")
          ) {
            return "vendor-markdown";
          }
        },
      },
    },
  },
});
