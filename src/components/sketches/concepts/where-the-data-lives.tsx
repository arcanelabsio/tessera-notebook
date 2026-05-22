import { useMemo, useRef, useState } from "react";
import type p5Type from "p5";
import { SketchCanvas, type SketchFactory, type ThemeColors } from "../SketchCanvas";

// Day 3 — concept widget for "Where the data lives".
//
// Editorial intent: the episode's thesis is that consistency is not a
// system-wide setting — it's an endpoint-by-endpoint decision. The
// load-bearing axis runs from strong (costly, correct for racing readers)
// to eventual (cheap, fine when staleness is invisible). The widget lets
// the reader move endpoints between the two rails and watch the cost
// readout change — Diego's spreadsheet in motion.
//
// Two horizontal rails (STRONG top in amber, EVENTUAL bottom in mint).
// Endpoint tokens sit on the rails. The "strong reads" slider controls
// how many tokens sit on the amber rail; the rest fall to mint.
// A vertical cost bar on the right fills amber/mint proportionally.
// The readout prints the latency arithmetic and the cost delta ratio.

type Controls = {
  strongCount: number;   // 0..8
  totalCount: number;    // strongCount + eventualCount; total = 8 fixed
  rttMs: number;         // 10..200 — cross-region RTT for strong reads
};

const EVENTUAL_RTT_MS = 5; // local-replica cost, editorial constant
const TOTAL_ENDPOINTS = 8;

function makeFactory(controlsRef: { current: Controls }): SketchFactory {
  return (p: p5Type, theme: ThemeColors) => {
    // Token animation: each token has a target Y (strong rail or eventual
    // rail) and a current Y that eases toward the target each frame.
    type Token = {
      id: number;
      currentY: number;
      targetY: number;
    };

    const tokens: Token[] = Array.from({ length: TOTAL_ENDPOINTS }, (_, i) => ({
      id: i,
      currentY: 0, // initialized in setup once heights are known
      targetY: 0,
    }));

    let strongRailY = 0;
    let eventualRailY = 0;
    let initialized = false;

    p.setup = () => {
      const host = (p as unknown as { _userNode: HTMLElement })._userNode;
      const w = host.clientWidth || 600;
      const h = host.clientHeight || 240;
      const c = p.createCanvas(w, h);
      p.pixelDensity(window.devicePixelRatio || 1);
      c.parent(host);
      p.textFont("ui-monospace, monospace");
    };

    p.windowResized = () => {
      const host = (p as unknown as { _userNode: HTMLElement })._userNode;
      p.resizeCanvas(host.clientWidth || 600, host.clientHeight || 240);
      initialized = false; // recalculate rail positions on resize
    };

    p.draw = () => {
      const ctrl = controlsRef.current;
      const { strongCount, rttMs } = ctrl;
      const eventualCount = TOTAL_ENDPOINTS - strongCount;

      p.background(p.color(theme.bg));

      // Layout constants — computed from canvas dimensions.
      const READOUT_H = 58;
      const COST_BAR_W = 18;
      const COST_BAR_RIGHT_MARGIN = 36;
      const railAreaTop = 20;
      const railAreaBottom = p.height - READOUT_H - 12;
      const railAreaH = railAreaBottom - railAreaTop;

      strongRailY = railAreaTop + railAreaH * 0.3;
      eventualRailY = railAreaTop + railAreaH * 0.7;

      if (!initialized) {
        // Place all tokens on eventual rail at start (default 2 strong, 6 eventual
        // is set by slider defaults — tokens animate to their positions).
        for (const tok of tokens) {
          tok.currentY = eventualRailY;
          tok.targetY = eventualRailY;
        }
        initialized = true;
      }

      // Rail drawing area — left of the cost bar.
      const railLeft = 64;
      const railRight = p.width - COST_BAR_RIGHT_MARGIN - COST_BAR_W - 12;

      // Assign targets: first strongCount tokens → strong rail,
      // remainder → eventual rail.
      for (let i = 0; i < TOTAL_ENDPOINTS; i++) {
        tokens[i].targetY = i < strongCount ? strongRailY : eventualRailY;
      }

      // Ease tokens toward their targets.
      const EASE = 0.12;
      for (const tok of tokens) {
        tok.currentY += (tok.targetY - tok.currentY) * EASE;
      }

      // Draw rails.
      const drawRail = (y: number, label: string, color: string) => {
        p.stroke(p.color(color));
        p.strokeWeight(1.5);
        p.drawingContext.setLineDash([4, 4]);
        p.line(railLeft, y, railRight, y);
        p.drawingContext.setLineDash([]);
        p.noStroke();
        p.fill(p.color(color));
        p.textSize(10);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(label, railLeft - 6, y);
      };

      drawRail(strongRailY, "STRONG", theme.amber);
      drawRail(eventualRailY, "EVENTUAL", theme.mint);

      // Draw endpoint tokens.
      const tokenSpacing = (railRight - railLeft) / (TOTAL_ENDPOINTS + 1);
      for (let i = 0; i < TOTAL_ENDPOINTS; i++) {
        const tok = tokens[i];
        const x = railLeft + tokenSpacing * (i + 1);
        const onStrong = tok.currentY < (strongRailY + eventualRailY) / 2;
        const fillColor = onStrong ? theme.amber : theme.mint;
        const softColor = onStrong ? theme.amberSoft : theme.mintSoft;

        // Token circle.
        p.noStroke();
        p.fill(p.color(softColor));
        p.circle(x, tok.currentY, 20);
        p.stroke(p.color(fillColor));
        p.strokeWeight(1.5);
        p.noFill();
        p.circle(x, tok.currentY, 20);

        // Endpoint index label.
        p.noStroke();
        p.fill(p.color(fillColor));
        p.textSize(9);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(`E${i + 1}`, x, tok.currentY);
      }

      // Vertical cost bar on the right.
      const barX = p.width - COST_BAR_RIGHT_MARGIN - COST_BAR_W;
      const barTop = railAreaTop + 4;
      const barBottom = railAreaBottom - 4;
      const barH = barBottom - barTop;
      const strongFraction = strongCount / TOTAL_ENDPOINTS;

      // Background.
      p.noStroke();
      p.fill(p.color(theme.ruleSoft));
      p.rect(barX, barTop, COST_BAR_W, barH, 3);

      // Mint (eventual) fill — full bar.
      if (eventualCount > 0) {
        p.fill(p.color(theme.mintSoft));
        p.rect(barX, barTop, COST_BAR_W, barH, 3);
      }

      // Amber (strong) fill — top portion proportional to strong fraction.
      if (strongFraction > 0) {
        const amberH = barH * strongFraction;
        p.fill(p.color(theme.amber));
        p.rect(barX, barTop, COST_BAR_W, amberH, 3);
      }

      // Bar labels.
      p.noStroke();
      p.fill(p.color(theme.muted));
      p.textSize(9);
      p.textAlign(p.CENTER, p.TOP);
      p.text("cost", barX + COST_BAR_W / 2, barTop - 14);

      // Readout band — bottom mono block.
      const readoutTop = p.height - READOUT_H;

      // Horizontal rule above readout.
      p.stroke(p.color(theme.ruleSoft));
      p.strokeWeight(1);
      p.line(0, readoutTop - 2, p.width, readoutTop - 2);
      p.noStroke();

      const totalStrongMs = strongCount * rttMs;
      const totalEventualMs = eventualCount * EVENTUAL_RTT_MS;

      // Cost delta: how much cheaper eventual is vs if everything were strong.
      // Expressed as ratio of per-request cost.
      const strongPerRequest = rttMs;
      const eventualPerRequest = EVENTUAL_RTT_MS;
      const deltaRatio = Math.round(strongPerRequest / eventualPerRequest);

      p.textSize(11);
      p.textAlign(p.LEFT, p.TOP);

      p.fill(p.color(theme.amber));
      const strongLine = `strong reads    ${strongCount}  ×  ${rttMs}ms   =  ${totalStrongMs}ms`;
      p.text(strongLine, 10, readoutTop + 4);

      p.fill(p.color(theme.mint));
      const eventualLine = `eventual reads  ${eventualCount}  ×  ~${EVENTUAL_RTT_MS}ms   =  ${totalEventualMs}ms  (local replica)`;
      p.text(eventualLine, 10, readoutTop + 18);

      // Delta line — the punchline.
      if (eventualCount > 0 && strongCount > 0) {
        p.fill(p.color(theme.fg));
        p.text(`cost delta      ${deltaRatio}× cheaper per eventual read`, 10, readoutTop + 32);
      } else if (strongCount === 0) {
        p.fill(p.color(theme.mint));
        p.text(`cost delta      all reads eventual — minimum budget`, 10, readoutTop + 32);
      } else {
        p.fill(p.color(theme.amber));
        p.text(`cost delta      all reads strong — maximum budget`, 10, readoutTop + 32);
      }
    };
  };
}

export default function WhereTheDataLivesSketch() {
  const [strongCount, setStrongCount] = useState(2);
  const [rttMs, setRttMs] = useState(85);

  // controlsRef lets the p5 draw loop read the latest slider values
  // every frame without forcing React to rebuild the canvas wrapper.
  const controlsRef = useRef<Controls>({
    strongCount,
    totalCount: TOTAL_ENDPOINTS,
    rttMs,
  });
  controlsRef.current = { strongCount, totalCount: TOTAL_ENDPOINTS, rttMs };

  const factory = useMemo(() => makeFactory(controlsRef), []);

  return (
    <div className="concept-sketch">
      <SketchCanvas
        factory={factory}
        sketchKey="where-the-data-lives"
        className="sketch-figure sketch-figure--concept"
        aspect={16 / 6}
      />
      <div className="concept-sketch__controls">
        <label className="concept-sketch__ctrl">
          <span>strong reads</span>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={strongCount}
            onChange={(e) => setStrongCount(Number(e.target.value))}
          />
          <output>{strongCount}</output>
        </label>
        <label className="concept-sketch__ctrl">
          <span>cross-region RTT</span>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={rttMs}
            onChange={(e) => setRttMs(Number(e.target.value))}
          />
          <output>{rttMs}ms</output>
        </label>
      </div>
      <p className="concept-sketch__caption">
        Six endpoints, two rails. Move the strong-reads slider up and watch
        the cost bar redden — that&apos;s Diego&apos;s spreadsheet in motion.
      </p>
    </div>
  );
}
