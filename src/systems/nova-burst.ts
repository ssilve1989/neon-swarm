import { Graphics } from "pixi.js";
import { app } from "../app";
import { getParticlesInRegion, px, py, vx, vy } from "./particles";
import {
	getRadius,
	getSingularityPosition,
	setSingularityScale,
} from "./singularity";
import { onThreshold } from "./threshold";

// Tuning knobs
const NOVA_RADIUS = 400; // px — shockwave max radius and scatter influence area
const NOVA_DURATION = 600; // ms — shockwave ring expansion time
const NOVA_IMPULSE_STRENGTH = 8; // px/frame — peak outward velocity at singularity center
const NOVA_BLOOM_SCALE = 2.5; // × — peak singularity visual scale during bloom
const BLOOM_EXPAND_MS = 150; // ms — singularity bloom-up duration
const BLOOM_SNAP_MS = 50; // ms — singularity snap-back duration

const COLOR_START = 0xffffff;
const COLOR_END = 0xffa500;

type ActiveBurst = {
	g: Graphics;
	cx: number;
	cy: number;
	startR: number;
	elapsed: number;
};

const activeBursts: ActiveBurst[] = [];

let bloomPhase: "idle" | "expand" | "snap" = "idle";
let bloomProgress = 0;

function lerpColor(a: number, b: number, t: number): number {
	const ar = (a >> 16) & 0xff;
	const ag = (a >> 8) & 0xff;
	const ab = a & 0xff;
	const br = (b >> 16) & 0xff;
	const bg = (b >> 8) & 0xff;
	const bb = b & 0xff;
	return (
		(Math.round(ar + (br - ar) * t) << 16) |
		(Math.round(ag + (bg - ag) * t) << 8) |
		Math.round(ab + (bb - ab) * t)
	);
}

function applyScatter(cx: number, cy: number): void {
	const candidates = getParticlesInRegion(cx, cy, NOVA_RADIUS);
	for (const i of candidates) {
		const dx = px[i] - cx;
		const dy = py[i] - cy;
		const distSq = dx * dx + dy * dy;
		// Skip particles at or beyond the radius, and guard against zero-distance divide
		if (distSq === 0 || distSq > NOVA_RADIUS * NOVA_RADIUS) continue;
		const dist = Math.sqrt(distSq);
		const falloff = 1 - dist / NOVA_RADIUS;
		const impulse = NOVA_IMPULSE_STRENGTH * falloff;
		vx[i] += (dx / dist) * impulse;
		vy[i] += (dy / dist) * impulse;
	}
}

export function initNovaBurst(): void {
	onThreshold(() => {
		const pos = getSingularityPosition();

		// Scatter particles immediately at trigger
		applyScatter(pos.x, pos.y);

		// Restart bloom (restarts cleanly even if already in progress)
		bloomPhase = "expand";
		bloomProgress = 0;

		// Spawn a new shockwave ring for this burst
		const g = new Graphics();
		g.blendMode = "add";
		app.stage.addChild(g);
		activeBursts.push({
			g,
			cx: pos.x,
			cy: pos.y,
			startR: getRadius(),
			elapsed: 0,
		});
	});

	app.ticker.add((ticker) => {
		const dt = ticker.deltaMS;

		// ── Shockwave rings ──────────────────────────────────────────────────
		for (let i = activeBursts.length - 1; i >= 0; i--) {
			const burst = activeBursts[i];
			burst.elapsed += dt;
			const t = Math.min(1, burst.elapsed / NOVA_DURATION);
			const radius = burst.startR + (NOVA_RADIUS - burst.startR) * t;
			const alpha = 1 - t;
			const strokeWidth = 4 * (1 - t * 0.6);
			const color = lerpColor(COLOR_START, COLOR_END, t);

			burst.g.clear();
			if (alpha > 0.01) {
				burst.g.circle(burst.cx, burst.cy, radius);
				burst.g.stroke({ color, alpha, width: strokeWidth });
			}

			if (t >= 1) {
				burst.g.destroy();
				activeBursts.splice(i, 1);
			}
		}

		// ── Singularity bloom ────────────────────────────────────────────────
		if (bloomPhase !== "idle") {
			if (bloomPhase === "expand") {
				bloomProgress = Math.min(1, bloomProgress + dt / BLOOM_EXPAND_MS);
				setSingularityScale(1 + (NOVA_BLOOM_SCALE - 1) * bloomProgress);
				if (bloomProgress >= 1) {
					bloomPhase = "snap";
					bloomProgress = 0;
				}
			} else {
				bloomProgress = Math.min(1, bloomProgress + dt / BLOOM_SNAP_MS);
				setSingularityScale(
					NOVA_BLOOM_SCALE - (NOVA_BLOOM_SCALE - 1) * bloomProgress,
				);
				if (bloomProgress >= 1) {
					setSingularityScale(1);
					bloomPhase = "idle";
				}
			}
		}
	});
}
