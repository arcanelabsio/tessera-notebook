import { useMemo, useRef, useState } from "react";
import type p5Type from "p5";
import { SketchCanvas, type SketchFactory, type ThemeColors } from "../SketchCanvas";

// Day 2 — concept widget for "Two failures, one shape".
//
// Editorial intent: three independent eviction clocks race after a
// topology change. DNS TTL, connection-pool health-check, and retry
// all drain at different rates. The slowest determines MTTR — the
// reader feels this by sliding each knob and watching which bar stays
// full longest. The idempotency-key toggle pairs with retry to show
// the safety precondition from Day 1.

type Controls = {
  dnsTtl: number;        // 5..300 seconds
  hcInterval: number;    // 5..60 seconds
  hcFailures: number;    // 1..5
  retryOnError: boolean;
  idempotencyKey: boolean;
};

function makeFactory(controlsRef: { current: Controls }): SketchFactory {
  return (p: p5Type, theme: ThemeColors) => {
    // Simulated clock — loops every LOOP_WALL_MS wall-clock milliseconds.
    // We map simulated seconds onto that window so the drain animation
    // always completes a full cycle visibly, regardless of slider values.
    const LOOP_WALL_MS = 9000;

    let simStart = 0;  // p.millis() at last loop start

    p.setup = () => {
      const host = (p as unknown as { _userNode: HTMLElement })._userNode;
      const w = host.clientWidth || 600;
      const h = host.clientHeight || 270;
      const c = p.createCanvas(w, h);
      p.pixelDensity(window.devicePixelRatio || 1);
      c.parent(host);
      p.textFont("ui-monospace, monospace");
      simStart = p.millis();
    };

    p.windowResized = () => {
      const host = (p as unknown as { _userNode: HTMLElement })._userNode;
      p.resizeCanvas(host.clientWidth || 600, host.clientHeight || 270);
    };

    p.draw = () => {
      const ctrl = controlsRef.current;
      const { dnsTtl, hcInterval, hcFailures, retryOnError, idempotencyKey } = ctrl;

      p.background(p.color(theme.bg));

      // Simulated elapsed seconds since last loop start.
      const wallElapsed = p.millis() - simStart;
      if (wallElapsed >= LOOP_WALL_MS) {
        simStart = p.millis();
      }
      // t in [0, 1] within the current loop window.
      const t = (wallElapsed % LOOP_WALL_MS) / LOOP_WALL_MS;

      // Each drain duration in simulated seconds.
      const dnsDrain = dnsTtl;
      const poolDrain = hcInterval * hcFailures;
      const maxDrain = Math.max(dnsDrain, poolDrain);

      // Progress ratio each clock has drained:
      //   0 = just started draining (full bar)
      //   1 = fully drained (empty bar — layer recovered)
      // We animate t across [0, maxDrain] simulated seconds.
      const simElapsed = t * maxDrain;
      const dnsFill = Math.max(0, 1 - simElapsed / dnsDrain);
      const poolFill = Math.max(0, 1 - simElapsed / poolDrain);
      // Retry bar: if retryOnError is off it doesn't contribute.
      // If on, the retry fires once at simElapsed > (some timeout); we
      // represent it as a pulse that appears and fades over 1 simulated
      // second at the midpoint of the pool drain.
      const retryPulseTime = poolDrain * 0.5;
      const retryDist = Math.abs(simElapsed - retryPulseTime);
      const retryPulse = retryOnError ? Math.max(0, 1 - retryDist / 1.5) : 0;

      // Which clock is the bottleneck?
      const dnsIsBottleneck = dnsDrain >= poolDrain;
      const poolIsBottleneck = poolDrain > dnsDrain;

      // Layout: three bars stacked.
      const LEFT = 120;
      const BAR_W = p.width - LEFT - 16;
      const BAR_H = 18;
      const GAP = 38;
      const TOP = 28;

      const bars = [
        {
          label: "DNS cache",
          sublabel: `TTL ${dnsTtl}s`,
          fill: dnsFill,
          drainSec: dnsDrain,
          isBottleneck: dnsIsBottleneck,
          y: TOP,
        },
        {
          label: "Conn pool",
          sublabel: `${hcInterval}s × ${hcFailures}`,
          fill: poolFill,
          drainSec: poolDrain,
          isBottleneck: poolIsBottleneck,
          y: TOP + GAP,
        },
      ];

      // Draw the t=0 event line.
      const eventX = LEFT;
      p.stroke(p.color(theme.rule));
      p.strokeWeight(1);
      p.drawingContext.setLineDash([3, 3]);
      p.line(eventX, TOP - 16, eventX, TOP + GAP * 2 + 4);
      p.drawingContext.setLineDash([]);
      p.noStroke();
      p.fill(p.color(theme.muted));
      p.textSize(9);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text("failover", eventX, TOP - 18);

      // Advancing cursor line at current simElapsed.
      const curX = LEFT + BAR_W * t;
      p.stroke(p.color(theme.ruleSoft));
      p.strokeWeight(1);
      p.line(curX, TOP - 4, curX, TOP + GAP * 1 + BAR_H + 4);
      p.noStroke();

      for (const bar of bars) {
        const barColor = bar.isBottleneck
          ? p.color(theme.amber)
          : p.color(theme.mint);
        const barFaded = bar.isBottleneck
          ? p.color(theme.amberSoft)
          : p.color(theme.mintSoft);

        // Background track.
        p.noStroke();
        p.fill(p.color(theme.bg2 ?? theme.ruleSoft));
        p.rect(LEFT, bar.y, BAR_W, BAR_H, 2);

        // Remaining fill (right portion = still stale).
        const fillW = BAR_W * bar.fill;
        if (fillW > 0) {
          p.fill(bar.fill > 0.1 ? barColor : barFaded);
          p.rect(LEFT + BAR_W - fillW, bar.y, fillW, BAR_H, 2);
        }

        // Layer label (left of bar).
        p.noStroke();
        p.fill(p.color(theme.fg));
        p.textSize(11);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(bar.label, LEFT - 6, bar.y + BAR_H / 2);

        // Sublabel (drain time) below bar.
        p.fill(p.color(theme.muted));
        p.textSize(9);
        p.textAlign(p.RIGHT, p.TOP);
        p.text(bar.sublabel, LEFT - 6, bar.y + BAR_H + 2);

        // Drain-time tick on the right edge of bar.
        const tickX = LEFT + BAR_W;
        p.stroke(p.color(theme.ruleSoft));
        p.strokeWeight(1);
        p.line(tickX, bar.y, tickX, bar.y + BAR_H);
        p.noStroke();
        p.fill(p.color(theme.muted));
        p.textSize(9);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(`${bar.drainSec}s`, tickX + 3, bar.y + BAR_H / 2);

        // Bottleneck annotation.
        if (bar.isBottleneck && bar.fill > 0.05) {
          p.fill(p.color(theme.amber));
          p.textSize(9);
          p.textAlign(p.LEFT, p.TOP);
          p.text("← bottleneck", LEFT + BAR_W * (1 - bar.fill) + 4, bar.y + 4);
        }
      }

      // Retry bar (third row).
      const retryY = TOP + GAP * 2;
      const retryBarLabel = retryOnError ? "Retry" : "Retry (off)";
      p.noStroke();
      p.fill(p.color(theme.fg));
      p.textSize(11);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text(retryBarLabel, LEFT - 6, retryY + BAR_H / 2);

      // Background track.
      p.fill(p.color(theme.bg2 ?? theme.ruleSoft));
      p.rect(LEFT, retryY, BAR_W, BAR_H, 2);

      if (retryOnError && retryPulse > 0) {
        const safe = idempotencyKey;
        const pulseColor = safe ? p.color(theme.mint) : p.color(theme.amber);
        const pulseX = LEFT + BAR_W * (retryPulseTime / maxDrain);
        const pulseR = retryPulse * 18;
        p.noStroke();
        p.fill(pulseColor);
        p.ellipse(pulseX, retryY + BAR_H / 2, pulseR, BAR_H - 4);
      }

      // Readout band — bottom, same mono register as day-01.
      const readoutY = retryY + BAR_H + 18;
      p.noStroke();
      p.textSize(11);
      p.textAlign(p.LEFT, p.TOP);

      p.fill(p.color(theme.muted));
      p.text(`DNS drain      ${dnsDrain}s`, 12, readoutY);
      p.text(`pool drain     ${poolDrain}s`, 12, readoutY + 14);

      const mttr = maxDrain;
      const bottleneckLabel = dnsIsBottleneck ? "DNS" : "pool";
      p.fill(p.color(theme.amber));
      p.text(`MTTR (worst)   ${mttr}s  [${bottleneckLabel} dominates]`, 12, readoutY + 28);

      if (retryOnError && !idempotencyKey) {
        p.fill(p.color(theme.amber));
        p.text("duplicate writes possible — add idempotency key", 12, readoutY + 42);
      } else if (retryOnError && idempotencyKey) {
        p.fill(p.color(theme.mint));
        p.text("retry safe — idempotency key enforced", 12, readoutY + 42);
      }
    };
  };
}

export default function TwoFailuresOneShapeSketch() {
  const [dnsTtl, setDnsTtl] = useState(300);
  const [hcInterval, setHcInterval] = useState(60);
  const [hcFailures, setHcFailures] = useState(3);
  const [retryOnError, setRetryOnError] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(false);

  const controlsRef = useRef<Controls>({
    dnsTtl, hcInterval, hcFailures, retryOnError, idempotencyKey,
  });
  controlsRef.current = { dnsTtl, hcInterval, hcFailures, retryOnError, idempotencyKey };

  const factory = useMemo(() => makeFactory(controlsRef), []);

  return (
    <div className="concept-sketch">
      <SketchCanvas
        factory={factory}
        sketchKey="two-failures-one-shape"
        className="sketch-figure sketch-figure--concept"
        aspect={16 / 7}
      />
      <div className="concept-sketch__controls">
        <label className="concept-sketch__ctrl">
          <span>DNS TTL</span>
          <input
            type="range"
            min={5}
            max={300}
            step={5}
            value={dnsTtl}
            onChange={(e) => setDnsTtl(Number(e.target.value))}
          />
          <output>{dnsTtl}s</output>
        </label>
        <label className="concept-sketch__ctrl">
          <span>health-check</span>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={hcInterval}
            onChange={(e) => setHcInterval(Number(e.target.value))}
          />
          <output>{hcInterval}s</output>
        </label>
        <label className="concept-sketch__ctrl">
          <span>× failures</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={hcFailures}
            onChange={(e) => setHcFailures(Number(e.target.value))}
          />
          <output>×{hcFailures}</output>
        </label>
        <label className="concept-sketch__ctrl concept-sketch__ctrl--toggle">
          <input
            type="checkbox"
            checked={retryOnError}
            onChange={(e) => setRetryOnError(e.target.checked)}
          />
          <span>retry on conn error</span>
        </label>
        <label className="concept-sketch__ctrl concept-sketch__ctrl--toggle">
          <input
            type="checkbox"
            checked={idempotencyKey}
            onChange={(e) => setIdempotencyKey(e.target.checked)}
          />
          <span>idempotency key on writes</span>
        </label>
      </div>
      <p className="concept-sketch__caption">
        Three eviction clocks, one failover. Move DNS TTL down and watch the
        pool drain dominate. Enable retry without an idempotency key to see
        the Day 1 sin surface.
      </p>
    </div>
  );
}
