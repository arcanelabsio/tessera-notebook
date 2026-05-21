import { useMemo } from "react";
import type p5Type from "p5";
import type { Episode, SceneType } from "../../content/types";
import { SketchCanvas, type SketchFactory, type ThemeColors } from "./SketchCanvas";

// Deterministic ambient sketch per episode.
//
// The piece is keyed on (slug, day, scene_type). Same episode ⇒ same
// composition across reloads, across devices, across the cream/ink
// theme toggle (the toggle re-themes via re-mount; geometry is stable).
//
// Why deterministic: this is the editorial fingerprint of the episode,
// not generative noise. A reader who comes back to Day 7 should see
// the same shape they associate with Day 7.

// FNV-1a 32-bit. Five lines, no dependency. Sufficient for seeding —
// we don't need cryptographic strength, we need a wide spread between
// adjacent (day-N, day-N+1) inputs so consecutive episodes don't look
// like rotations of each other.
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

type SceneStyle = {
  primary: keyof ThemeColors;
  secondary: keyof ThemeColors;
  // Particle count baseline; 'feature' is denser (forward momentum),
  // 'support' is sparser (contemplative breath).
  density: number;
  // Drift speed multiplier. 'incident' moves faster + more chaotically.
  speed: number;
  // 'accrete' = particles settle into clusters; 'scatter' = degrade
  // outward over time; 'orbit' = circulate; 'grid' = snap to lattice.
  pattern: "accrete" | "scatter" | "orbit" | "grid";
};

const STYLES: Record<SceneType, SceneStyle> = {
  feature: { primary: "mint", secondary: "mintSoft", density: 80, speed: 0.4, pattern: "accrete" },
  incident: { primary: "amber", secondary: "amberSoft", density: 110, speed: 1.0, pattern: "scatter" },
  support: { primary: "mintSoft", secondary: "muted", density: 50, speed: 0.25, pattern: "orbit" },
  decision: { primary: "amberSoft", secondary: "fgMuted", density: 64, speed: 0.3, pattern: "grid" },
};

function makeFactory(seed: number, style: SceneStyle): SketchFactory {
  return (p: p5Type, theme: ThemeColors) => {
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
    let particles: Particle[] = [];
    let t = 0;

    p.setup = () => {
      const host = (p as unknown as { _userNode: HTMLElement })._userNode;
      const w = host.clientWidth || 600;
      const h = host.clientHeight || 180;
      const c = p.createCanvas(w, h);
      // Render below crisp 1px text without blurring on hi-dpi.
      p.pixelDensity(window.devicePixelRatio || 1);
      // p5 v2 still ships .parent; v1 too — keeps the canvas inside
      // the React-owned host div instead of appended to body.
      c.parent(host);

      p.randomSeed(seed);
      p.noiseSeed(seed);

      particles = Array.from({ length: style.density }, () => ({
        x: p.random(w),
        y: p.random(h),
        vx: (p.random() - 0.5) * style.speed,
        vy: (p.random() - 0.5) * style.speed,
        r: p.random(0.6, 1.8),
        phase: p.random(p.TWO_PI),
      }));
    };

    p.windowResized = () => {
      const host = (p as unknown as { _userNode: HTMLElement })._userNode;
      p.resizeCanvas(host.clientWidth || 600, host.clientHeight || 180);
    };

    p.draw = () => {
      // Translucent overlay produces a low-cost motion trail that
      // reads as ink wash on cream; full clear would look strobing.
      const overlay = p.color(theme.bg);
      overlay.setAlpha(28);
      p.noStroke();
      p.fill(overlay);
      p.rect(0, 0, p.width, p.height);

      const primary = p.color(theme[style.primary]);
      const secondary = p.color(theme[style.secondary]);

      t += 0.005;

      for (const part of particles) {
        switch (style.pattern) {
          case "accrete": {
            // Slow vector field drawing particles toward column anchors;
            // editorially: "things converging on the design".
            const targetX = p.width * (0.2 + 0.6 * ((p.noise(part.phase) * 5) % 1));
            part.vx += (targetX - part.x) * 0.0008;
            part.vy += p.sin(t + part.phase) * 0.01;
            break;
          }
          case "scatter": {
            // Field flow that pushes outward from the center over
            // time — "things falling apart". The center pulses.
            const dx = part.x - p.width / 2;
            const dy = part.y - p.height / 2;
            const d = Math.max(1, Math.hypot(dx, dy));
            part.vx += (dx / d) * 0.02;
            part.vy += (dy / d) * 0.02;
            break;
          }
          case "orbit": {
            // Curl noise: smooth circulation, no convergence — used for
            // 'support' (contemplation). Reads as breath.
            const angle = p.noise(part.x * 0.01, part.y * 0.01, t) * p.TWO_PI * 2;
            part.vx = p.cos(angle) * style.speed;
            part.vy = p.sin(angle) * style.speed;
            break;
          }
          case "grid": {
            // Snap toward a 6×6 lattice. Particles bias into structured
            // positions — 'decision' as crystallised choice.
            const colW = p.width / 6;
            const rowH = p.height / 4;
            const tx = Math.round(part.x / colW) * colW + colW / 2;
            const ty = Math.round(part.y / rowH) * rowH + rowH / 2;
            part.vx += (tx - part.x) * 0.002;
            part.vy += (ty - part.y) * 0.002;
            break;
          }
        }

        // Damping keeps velocities sane regardless of pattern math.
        part.vx *= 0.96;
        part.vy *= 0.96;
        part.x += part.vx;
        part.y += part.vy;

        // Toroidal wrap — cheaper than reflecting and looks fine at
        // these densities and speeds.
        if (part.x < -2) part.x = p.width + 2;
        if (part.x > p.width + 2) part.x = -2;
        if (part.y < -2) part.y = p.height + 2;
        if (part.y > p.height + 2) part.y = -2;

        const c = p.lerpColor(primary, secondary, p.noise(part.phase + t) as number);
        p.fill(c);
        p.circle(part.x, part.y, part.r * 2);
      }
    };
  };
}

export function AmbientSketch({ episode }: { episode: Episode }) {
  const style = STYLES[episode.sceneType];
  const seed = hash(`${episode.slug}::${episode.episode}::${episode.sceneType}`);

  // useMemo + sketchKey ensure the factory is built once per episode
  // and the canvas is torn down + rebuilt on episode change.
  const factory = useMemo(() => makeFactory(seed, style), [seed, style]);
  const key = `ambient::${episode.slug}`;

  return (
    <SketchCanvas
      factory={factory}
      sketchKey={key}
      className="sketch-figure sketch-figure--ambient"
      aspect={16 / 5}
    />
  );
}
