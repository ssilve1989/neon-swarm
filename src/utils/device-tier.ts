const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1199;

const PARTICLE_COUNT_MOBILE = 1_000;
const PARTICLE_COUNT_TABLET = 3_000;
const PARTICLE_COUNT_DESKTOP = 10_000;

export type DeviceTier = "mobile" | "tablet" | "desktop";

export function getDeviceTier(): DeviceTier {
	const w = window.innerWidth;
	if (w <= MOBILE_BREAKPOINT) return "mobile";
	if (w <= TABLET_BREAKPOINT) return "tablet";
	return "desktop";
}

export function getParticleCount(): number {
	switch (getDeviceTier()) {
		case "mobile":
			return PARTICLE_COUNT_MOBILE;
		case "tablet":
			return PARTICLE_COUNT_TABLET;
		case "desktop":
			return PARTICLE_COUNT_DESKTOP;
	}
}
