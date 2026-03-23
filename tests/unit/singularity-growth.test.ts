import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type AbsorbFn = (count: number, color: number) => void;
type StateListener = (state: string) => void;

const mocks = vi.hoisted(() => ({
	absorbListeners: [] as AbsorbFn[],
	stateListeners: [] as StateListener[],
	setRadius: vi.fn(),
}));

vi.mock("../../src/systems/absorption", () => ({
	onAbsorb: (fn: AbsorbFn) => {
		mocks.absorbListeners.push(fn);
		return () => {};
	},
}));

vi.mock("../../src/systems/singularity", () => ({
	ABSORPTION_RADIUS: 30,
	setRadius: (r: number) => mocks.setRadius(r),
}));

vi.mock("../../src/state", () => ({
	onStateChange: (fn: StateListener) => {
		mocks.stateListeners.push(fn);
		return () => {};
	},
}));

import { initSingularityGrowth } from "../../src/systems/singularity-growth";

// Mirror the private constants from singularity-growth.ts
const ABSORPTION_RADIUS = 30;
const GROWTH_SCALE = 2;
const MAX_RADIUS_ABS = 120;
const MAX_RADIUS_VIEWPORT_FRACTION = 0.15;

function computeMaxRadius(w: number, h: number): number {
	return Math.max(
		ABSORPTION_RADIUS,
		Math.min(Math.min(w, h) * MAX_RADIUS_VIEWPORT_FRACTION, MAX_RADIUS_ABS),
	);
}

function computeRadius(totalAbsorbed: number, w = 2000, h = 2000): number {
	return Math.min(
		ABSORPTION_RADIUS + GROWTH_SCALE * Math.sqrt(totalAbsorbed),
		computeMaxRadius(w, h),
	);
}

function triggerAbsorb(count = 1) {
	for (const fn of mocks.absorbListeners) fn(count, 0);
}

function triggerStateChange(state: string) {
	for (const fn of mocks.stateListeners) fn(state);
}

beforeAll(() => {
	// Use a large viewport so the absolute cap (MAX_RADIUS_ABS) is the binding constraint
	vi.stubGlobal("innerWidth", 2000);
	vi.stubGlobal("innerHeight", 2000);
	initSingularityGrowth();
});

beforeEach(() => {
	// Reset growth state to a clean new-game start before each test
	triggerStateChange("mode-select");
	triggerStateChange("playing");
	mocks.setRadius.mockClear();
});

describe("radius growth formula", () => {
	it("sets radius to base value on new game start", () => {
		triggerStateChange("mode-select");
		triggerStateChange("playing");
		expect(mocks.setRadius).toHaveBeenCalledWith(ABSORPTION_RADIUS);
	});

	it("grows radius with sqrt curve as total absorbed increases", () => {
		triggerAbsorb(5);
		expect(mocks.setRadius).toHaveBeenLastCalledWith(computeRadius(5));
	});

	it("grows larger with more total absorptions", () => {
		triggerAbsorb(10);
		expect(mocks.setRadius).toHaveBeenLastCalledWith(computeRadius(10));
		triggerAbsorb(10); // now 20 total
		expect(mocks.setRadius).toHaveBeenLastCalledWith(computeRadius(20));
	});

	it("caps radius at MAX_RADIUS_ABS on large viewport", () => {
		// 30 + 2*sqrt(3000) ≈ 139.5 — well past the 120 cap
		triggerAbsorb(3000);
		expect(mocks.setRadius).toHaveBeenLastCalledWith(MAX_RADIUS_ABS);
	});
});

describe("viewport-relative size cap", () => {
	it("caps below MAX_RADIUS_ABS on mobile landscape viewport", () => {
		// Arrange: simulate iPhone 13 landscape (844×390)
		vi.stubGlobal("innerWidth", 844);
		vi.stubGlobal("innerHeight", 390);

		// Act
		triggerAbsorb(3000);

		// Assert: cap = max(30, min(390 * 0.15, 120)) = max(30, 58.5) = 58.5
		expect(mocks.setRadius).toHaveBeenLastCalledWith(
			computeMaxRadius(844, 390),
		);

		// Restore
		vi.stubGlobal("innerWidth", 2000);
		vi.stubGlobal("innerHeight", 2000);
	});
});

describe("new game reset", () => {
	it("resets radius and absorption count when a new game starts", () => {
		// Arrange: grow past base radius
		triggerAbsorb(100);
		expect(mocks.setRadius).toHaveBeenLastCalledWith(computeRadius(100));
		mocks.setRadius.mockClear();

		// Act: end the run and start a new game
		triggerStateChange("game-over");
		triggerStateChange("playing");

		// Assert: radius reset to base
		expect(mocks.setRadius).toHaveBeenCalledWith(ABSORPTION_RADIUS);

		// Assert: absorption counter also reset — next absorb grows from 0
		mocks.setRadius.mockClear();
		triggerAbsorb(1);
		expect(mocks.setRadius).toHaveBeenCalledWith(computeRadius(1));
	});
});

describe("pause/resume behavior", () => {
	it("preserves radius when resuming from pause — regression for singularity-reset-on-resume", () => {
		// Arrange: grow the singularity
		triggerAbsorb(20);
		const grownRadius = mocks.setRadius.mock.calls.at(-1)?.[0] as number;
		expect(grownRadius).toBeGreaterThan(ABSORPTION_RADIUS);
		mocks.setRadius.mockClear();

		// Act: pause then resume
		triggerStateChange("paused");
		triggerStateChange("playing");

		// Assert: setRadius was NOT called with the base reset value on resume
		const resetCalls = mocks.setRadius.mock.calls.filter(
			(call: unknown[]) => call[0] === ABSORPTION_RADIUS,
		);
		expect(resetCalls).toHaveLength(0);
	});

	it("resets radius when starting a new game after game-over", () => {
		// Arrange: grow the singularity
		triggerAbsorb(20);
		mocks.setRadius.mockClear();

		// Act: end game and start new game
		triggerStateChange("game-over");
		triggerStateChange("playing");

		// Assert: radius was reset to base
		expect(mocks.setRadius).toHaveBeenCalledWith(ABSORPTION_RADIUS);
	});
});
