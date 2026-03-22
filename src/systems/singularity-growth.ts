import { ABSORPTION_RADIUS, setRadius } from "./singularity";
import { getMultiplier, onComboBreak } from "./combo";
import { onAbsorb } from "./absorption";

// Pixels added per sqrt-unit of (multiplier - 1) — increase for faster growth
const GROWTH_SCALE = 2;
// Absolute maximum radius — applies on large (desktop) viewports
const MAX_RADIUS_ABS = 120;
// Max radius as a fraction of the viewport's short axis — prevents oversized singularity on mobile
const MAX_RADIUS_VIEWPORT_FRACTION = 0.15;

function getMaxRadius(): number {
	return Math.max(
		ABSORPTION_RADIUS,
		Math.min(
			Math.min(innerWidth, innerHeight) * MAX_RADIUS_VIEWPORT_FRACTION,
			MAX_RADIUS_ABS,
		),
	);
}

function computeRadius(multiplier: number): number {
	return Math.min(
		ABSORPTION_RADIUS + GROWTH_SCALE * Math.sqrt(multiplier - 1),
		getMaxRadius(),
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
