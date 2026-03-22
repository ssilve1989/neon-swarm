import { ABSORPTION_RADIUS, setRadius } from "./singularity";
import { getMultiplier, onComboBreak } from "./combo";
import { onAbsorb } from "./absorption";

// Pixels added per sqrt-unit of (multiplier - 1) — increase for faster growth
const GROWTH_SCALE = 2;
// Hard cap on absorption radius in pixels
const MAX_RADIUS = 120;

function computeRadius(multiplier: number): number {
	return Math.min(
		ABSORPTION_RADIUS + GROWTH_SCALE * Math.sqrt(multiplier - 1),
		MAX_RADIUS,
	);
}

export function initSingularityGrowth(): void {
	onAbsorb(() => {
		setRadius(computeRadius(getMultiplier()));
	});

	onComboBreak(() => {
		setRadius(ABSORPTION_RADIUS);
	});
}
