import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type AbsorbFn = (count: number, color: number) => void;
type BreakFn = () => void;
type StateListener = (state: string) => void;

const mocks = vi.hoisted(() => ({
	absorbListeners: [] as AbsorbFn[],
	comboBreakListeners: [] as BreakFn[],
	stateListeners: [] as StateListener[],
	multiplier: 1,
	setRadius: vi.fn(),
}));

vi.mock("../../src/systems/absorption", () => ({
	onAbsorb: (fn: AbsorbFn) => {
		mocks.absorbListeners.push(fn);
		return () => {};
	},
}));

vi.mock("../../src/systems/combo", () => ({
	getMultiplier: () => mocks.multiplier,
	onComboBreak: (fn: BreakFn) => {
		mocks.comboBreakListeners.push(fn);
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

function computeMaxRadius(innerWidth: number, innerHeight: number): number {
	return Math.min(
		Math.min(innerWidth, innerHeight) * MAX_RADIUS_VIEWPORT_FRACTION,
		MAX_RADIUS_ABS,
	);
}

function computeExpectedRadius(multiplier: number, w = 2000, h = 2000): number {
	return Math.min(
		ABSORPTION_RADIUS + GROWTH_SCALE * Math.sqrt(multiplier - 1),
		computeMaxRadius(w, h),
	);
}

function triggerAbsorb() {
	for (const fn of mocks.absorbListeners) fn(1, 0);
}

function triggerComboBreak() {
	for (const fn of mocks.comboBreakListeners) fn();
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
	mocks.multiplier = 1;
	mocks.setRadius.mockClear();
});

describe("radius growth formula", () => {
	it("sets radius to base value at multiplier 1 (no growth)", () => {
		mocks.multiplier = 1;
		triggerAbsorb();
		expect(mocks.setRadius).toHaveBeenCalledWith(ABSORPTION_RADIUS);
	});

	it("grows radius with sqrt curve as multiplier increases", () => {
		mocks.multiplier = 5;
		triggerAbsorb();
		expect(mocks.setRadius).toHaveBeenCalledWith(computeExpectedRadius(5));
	});

	it("grows larger at higher multipliers", () => {
		mocks.multiplier = 10;
		triggerAbsorb();
		expect(mocks.setRadius).toHaveBeenCalledWith(computeExpectedRadius(10));
	});

	it("caps radius at MAX_RADIUS_ABS on large viewport", () => {
		mocks.multiplier = 3000; // far past the cap
		triggerAbsorb();
		expect(mocks.setRadius).toHaveBeenCalledWith(MAX_RADIUS_ABS);
	});
});

describe("viewport-relative size cap", () => {
	it("caps below MAX_RADIUS_ABS on mobile landscape viewport", () => {
		// Arrange: simulate iPhone 13 landscape (844×390)
		vi.stubGlobal("innerWidth", 844);
		vi.stubGlobal("innerHeight", 390);
		mocks.multiplier = 3000;

		// Act
		triggerAbsorb();

		// Assert: cap = min(390 * 0.15, 120) = 58.5
		expect(mocks.setRadius).toHaveBeenCalledWith(computeMaxRadius(844, 390));

		// Restore
		vi.stubGlobal("innerWidth", 2000);
		vi.stubGlobal("innerHeight", 2000);
	});
});

describe("combo break", () => {
	it("resets radius to base ABSORPTION_RADIUS on combo break", () => {
		mocks.multiplier = 50;
		triggerAbsorb(); // grow radius
		mocks.setRadius.mockClear();
		triggerComboBreak();
		expect(mocks.setRadius).toHaveBeenCalledWith(ABSORPTION_RADIUS);
	});
});

describe("pause/resume behavior", () => {
	it("preserves radius when resuming from pause — regression for singularity-reset-on-resume", () => {
		// Arrange: start a game and grow the singularity
		triggerStateChange("playing");
		for (let i = 0; i < 20; i++) triggerAbsorb();
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
		// Arrange: start a game and grow the singularity
		triggerStateChange("playing");
		for (let i = 0; i < 20; i++) triggerAbsorb();
		mocks.setRadius.mockClear();

		// Act: end game and start new game
		triggerStateChange("game-over");
		triggerStateChange("playing");

		// Assert: radius was reset to base
		expect(mocks.setRadius).toHaveBeenCalledWith(ABSORPTION_RADIUS);
	});
});
