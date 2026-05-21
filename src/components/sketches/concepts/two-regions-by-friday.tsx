import { useMemo, useRef, useState } from "react";
import type p5Type from "p5";
import { SketchCanvas, type SketchFactory, type ThemeColors } from "../SketchCanvas";

// Day 1 — concept widget for "Two regions by Friday".
//
// Editorial intent: the episode is about the 8 fallacies of distributed
// computing landing on the whiteboard before the arch diagram. The two
// fallacies the reader can feel hardest are "network is reliable" and
// "latency is zero". So: two region nodes, a packet flow between them,
// and two sliders — drop probability and round-trip latency.
//
// The reader leaves with a felt number: at 5% drop and 80ms RTT, what
// p99 do my chained calls actually hit?

type Controls = {
  dropPct: number;       // 0..30
  rttMs: number;         // 10..400
  chained: number;       // 1..6 sequential calls per request
  retries: boolean;      // retry-with-immediate (no backoff — the Day 2 sin)
};

function makeFactory(controlsRef: { current: Controls }): SketchFactory {
  return (p: p5Type, theme: ThemeColors) => {
    type Packet = {
      // 0 = at region A, 1 = at region B. Direction reverses on arrival.
      progress: number;
      dir: 1 | -1;
      // Index 0..(chained-1) — when chained==3, a request fires 3
      // sequential packets and only the final return counts as "done".
      stepIndex: number;
      // Lifecycle of the parent request.
      reqId: number;
      // Speed is set from rttMs at spawn time so slider changes during
      // flight don't retroactively warp inflight packets.
      speedPerFrame: number;
      lost: boolean;
    };

    let packets: Packet[] = [];
    let nextReqId = 0;
    let attempted = 0;
    let succeeded = 0;
    let lastSpawn = 0;
    let p99Latency = 0;
    const latencies: number[] = [];
    const FRAMES_PER_MS = 0.06;

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
    };

    function spawnRequest() {
      const { rttMs } = controlsRef.current;
      const reqId = nextReqId++;
      attempted++;
      packets.push({
        progress: 0,
        dir: 1,
        stepIndex: 0,
        reqId,
        speedPerFrame: 1 / Math.max(1, rttMs * FRAMES_PER_MS),
        lost: false,
      });
    }

    p.draw = () => {
      const ctrl = controlsRef.current;
      const { dropPct, rttMs, chained, retries } = ctrl;

      p.background(p.color(theme.bg));

      // Two region nodes — A on left, B on right. Round-trip path is
      // the straight line between them; the y bobs slightly to read
      // as "the network", not "the highway".
      const ax = p.width * 0.12;
      const bx = p.width * 0.88;
      const ay = p.height * 0.55;
      const by = p.height * 0.55;

      // Connection line.
      p.stroke(p.color(theme.ruleSoft));
      p.strokeWeight(1);
      p.line(ax, ay, bx, by);

      // Region labels and dots.
      const drawRegion = (x: number, y: number, label: string) => {
        p.noStroke();
        p.fill(p.color(theme.mint));
        p.circle(x, y, 14);
        p.fill(p.color(theme.fgMuted));
        p.textSize(11);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(label, x, y + 20);
      };
      drawRegion(ax, ay, "eu-west-1");
      drawRegion(bx, by, "us-east-1");

      // Spawn a new request every ~600ms regardless of RTT — the
      // request rate is what the *customer* sends, not what the
      // network completes.
      lastSpawn += p.deltaTime;
      if (lastSpawn > 600) {
        lastSpawn = 0;
        spawnRequest();
      }

      const dropProb = dropPct / 100;
      const survivors: Packet[] = [];

      for (const pkt of packets) {
        if (pkt.lost) continue;
        pkt.progress += pkt.speedPerFrame * pkt.dir;

        // Each direction transition is one network hop. Roll the dice
        // on completion. Loss is detected at the receiver (progress
        // reaches the far side and we sample drop probability).
        if (pkt.progress >= 1 || pkt.progress <= 0) {
          if (p.random() < dropProb) {
            pkt.lost = true;
            if (retries) {
              // Retry-without-backoff: amplifies load 1× per failure.
              // This is the Day 2 sin the reader will feel here.
              packets.push({
                progress: 0,
                dir: 1,
                stepIndex: pkt.stepIndex,
                reqId: pkt.reqId,
                speedPerFrame: 1 / Math.max(1, rttMs * FRAMES_PER_MS),
                lost: false,
              });
            }
            continue;
          }
          // Bounced back? Was outbound — flip direction.
          if (pkt.dir === 1) {
            pkt.dir = -1;
            pkt.progress = 1;
          } else {
            // Returned to origin. If more chained steps remain, queue
            // the next one; otherwise this request is done.
            if (pkt.stepIndex + 1 < chained) {
              survivors.push({
                progress: 0,
                dir: 1,
                stepIndex: pkt.stepIndex + 1,
                reqId: pkt.reqId,
                speedPerFrame: 1 / Math.max(1, rttMs * FRAMES_PER_MS),
                lost: false,
              });
              continue;
            } else {
              succeeded++;
              const totalMs = chained * rttMs;
              latencies.push(totalMs);
              if (latencies.length > 200) latencies.shift();
              const sorted = [...latencies].sort((a, b) => a - b);
              p99Latency = sorted[Math.floor(sorted.length * 0.99)] || totalMs;
              continue;
            }
          }
        }
        survivors.push(pkt);
      }
      packets = survivors;

      // Render packets.
      for (const pkt of packets) {
        const x = ax + (bx - ax) * pkt.progress;
        const yBob = p.sin((p.frameCount + pkt.reqId) * 0.08) * 4;
        p.noStroke();
        // Step index colors the packet — first step mint, later steps
        // fade toward amber to show "chained calls compound risk".
        const t = chained > 1 ? pkt.stepIndex / (chained - 1) : 0;
        const c = p.lerpColor(p.color(theme.mint), p.color(theme.amber), t);
        p.fill(c);
        p.circle(x, ay + yBob, 5);
      }

      // Readout band — bottom-left mono, the editorial point of the
      // widget. Numbers, not poetry.
      p.noStroke();
      p.fill(p.color(theme.muted));
      p.textSize(11);
      p.textAlign(p.LEFT, p.TOP);
      const successPct = attempted ? Math.round((succeeded / attempted) * 100) : 100;
      p.text(`requests   ${attempted}`, 10, 8);
      p.text(`succeeded  ${succeeded} (${successPct}%)`, 10, 22);
      p.text(`p99        ${Math.round(p99Latency)}ms (chain×${chained})`, 10, 36);
      if (retries) {
        p.fill(p.color(theme.amber));
        p.text("retries: no backoff (Day 2 spoiler)", 10, 50);
      }
    };
  };
}

export default function TwoRegionsByFridaySketch() {
  const [dropPct, setDropPct] = useState(2);
  const [rttMs, setRttMs] = useState(80);
  const [chained, setChained] = useState(1);
  const [retries, setRetries] = useState(false);

  // controlsRef lets the p5 draw loop read the latest slider values
  // every frame without forcing React to rebuild the canvas wrapper
  // on every input. The factory is built exactly once.
  const controlsRef = useRef<Controls>({ dropPct, rttMs, chained, retries });
  controlsRef.current = { dropPct, rttMs, chained, retries };

  const factory = useMemo(() => makeFactory(controlsRef), []);

  return (
    <div className="concept-sketch">
      <SketchCanvas
        factory={factory}
        sketchKey="two-regions-by-friday"
        className="sketch-figure sketch-figure--concept"
        aspect={16 / 6}
      />
      <div className="concept-sketch__controls">
        <label className="concept-sketch__ctrl">
          <span>drop %</span>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={dropPct}
            onChange={(e) => setDropPct(Number(e.target.value))}
          />
          <output>{dropPct}%</output>
        </label>
        <label className="concept-sketch__ctrl">
          <span>RTT</span>
          <input
            type="range"
            min={10}
            max={400}
            step={5}
            value={rttMs}
            onChange={(e) => setRttMs(Number(e.target.value))}
          />
          <output>{rttMs}ms</output>
        </label>
        <label className="concept-sketch__ctrl">
          <span>chain</span>
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={chained}
            onChange={(e) => setChained(Number(e.target.value))}
          />
          <output>×{chained}</output>
        </label>
        <label className="concept-sketch__ctrl concept-sketch__ctrl--toggle">
          <input
            type="checkbox"
            checked={retries}
            onChange={(e) => setRetries(e.target.checked)}
          />
          <span>retry on failure (no backoff)</span>
        </label>
      </div>
      <p className="concept-sketch__caption">
        Two regions, one packet stream. Move drop % above 5 and watch the
        retry-on-failure toggle amplify load — that's the Day 2 incident
        in slow motion.
      </p>
    </div>
  );
}
