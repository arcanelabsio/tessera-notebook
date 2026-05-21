import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { buildFeed } from "./build-feed";

// Vite plugin that emits dist/feed.xml at build time and serves
// /feed.xml from the dev server. Keeps RSS generation co-located with
// the build so it can never go stale relative to the bundled content.

export function feedPlugin(opts: { contentRoot: string }): Plugin {
  const contentRoot = opts.contentRoot;

  return {
    name: "tessera-feed",
    apply() {
      return true;
    },

    // Dev: serve a fresh feed on every request. Cheap — under a dozen
    // files to read — and means authors can hit /feed.xml locally
    // while editing to confirm the entry they just voice-passed shows up.
    configureServer(server) {
      server.middlewares.use("/feed.xml", (_req, res) => {
        try {
          const xml = buildFeed(contentRoot);
          res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
          res.end(xml);
        } catch (err) {
          res.statusCode = 500;
          res.end(`feed build failed: ${(err as Error).message}`);
        }
      });
    },

    // Prod: write feed.xml into the build output. `closeBundle` runs
    // after Vite has finished writing all assets, so dist/ exists.
    closeBundle: {
      sequential: true,
      handler() {
        const xml = buildFeed(contentRoot);
        const out = join(process.cwd(), "dist", "feed.xml");
        writeFileSync(out, xml, "utf-8");
        // Single short line to honour the silent-write convention.
        console.log(`[tessera-feed] wrote ${out}`);
      },
    },
  };
}
