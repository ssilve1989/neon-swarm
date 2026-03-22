import { app } from "../app";
import { getState } from "../state";
import {
	absorbParticle,
	getParticlesInRegion,
	PARTICLE_COLORS,
	px,
	py,
	vx,
	vy,
} from "./particles";
import {
	getInfluenceRadius,
	getRadius,
	getSingularityPosition,
} from "./singularity";

// Inverse-square gravity toward singularity center
const GRAVITY_K = 60;
// Tangential force — creates counter-clockwise spiral
const SWIRL_K = 40;
// Velocity cap for spiraling particles (px/frame)
const MAX_SPEED_SQ = 6 * 6;

type AbsorbListener = (count: number, dominantColor: number) => void;
const listeners: AbsorbListener[] = [];

export function onAbsorb(fn: AbsorbListener): () => void {
	listeners.push(fn);
	return () => {
		const i = listeners.indexOf(fn);
		if (i !== -1) listeners.splice(i, 1);
	};
}

export function initAbsorption(): void {
	app.ticker.add((ticker) => {
		if (getState() !== "playing") return;

		const { x: sx, y: sy } = getSingularityPosition();
		const r = getRadius();
		const r2 = r * r;
		const inf2 = getInfluenceRadius() * getInfluenceRadius();
		const dt = ticker.deltaTime;
		let absorbed = 0;
		let totalR = 0,
			totalG = 0,
			totalB = 0;

		for (const i of getParticlesInRegion(sx, sy, getInfluenceRadius())) {
			const dx = px[i] - sx;
			const dy = py[i] - sy;
			const dist2 = dx * dx + dy * dy;

			if (dist2 <= r2) {
				// Inside absorption radius — consume
				absorbParticle(i);
				const c = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
				totalR += (c >> 16) & 0xff;
				totalG += (c >> 8) & 0xff;
				totalB += c & 0xff;
				absorbed++;
			} else if (dist2 <= inf2) {
				// Inside influence radius — apply gravity + swirl
				// Force = (-dx * GRAVITY_K - dy * SWIRL_K) / dist²
				// No sqrt needed: dividing by dist² normalises and scales simultaneously
				const fx = (-dx * GRAVITY_K - dy * SWIRL_K) / dist2;
				const fy = (-dy * GRAVITY_K + dx * SWIRL_K) / dist2;

				vx[i] += fx * dt;
				vy[i] += fy * dt;

				// Cap speed to prevent particles blinking across screen
				const speed2 = vx[i] * vx[i] + vy[i] * vy[i];
				if (speed2 > MAX_SPEED_SQ) {
					const scale = Math.sqrt(MAX_SPEED_SQ / speed2);
					vx[i] *= scale;
					vy[i] *= scale;
				}
			}
		}

		if (absorbed > 0) {
			const dominantColor =
				(Math.round(totalR / absorbed) << 16) |
				(Math.round(totalG / absorbed) << 8) |
				Math.round(totalB / absorbed);
			for (const fn of listeners) fn(absorbed, dominantColor);
		}
	});
}
