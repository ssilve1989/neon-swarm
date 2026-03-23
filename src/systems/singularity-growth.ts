import { onStateChange } from "../state";
import { onAbsorb } from "./absorption";
import { ABSORPTION_RADIUS, setRadius } from "./singularity";

// Pixels added per sqrt-unit of total absorptions — increase for faster growth
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

function computeRadius(totalAbsorbed: number): number {
	return Math.min(
		ABSORPTION_RADIUS + GROWTH_SCALE * Math.sqrt(totalAbsorbed),
		getMaxRadius(),
	);
}

export function initSingularityGrowth(): void {
	let totalAbsorbed = 0;

	onStateChange((state, prev) => {
		if (state === "playing" && prev !== "paused") {
			totalAbsorbed = 0;
			setRadius(ABSORPTION_RADIUS);
		}
	});

	onAbsorb((count) => {
		totalAbsorbed += count;
		setRadius(computeRadius(totalAbsorbed));
	});
}
