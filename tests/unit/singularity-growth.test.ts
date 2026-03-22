import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type AbsorbFn = (count: number, color: number) => void;
type BreakFn = () => void;

const mocks = vi.hoisted(() => ({
	absorbListeners: [] as AbsorbFn[],
	comboBreakListeners: [] as BreakFn[],
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

import { initSingularityGrowth } from "../../src/systems/singularity-growth";

// Mirror the private constants from singularity-growth.ts
const ABSORPTION_RADIUS = 30;
const GROWTH_SCALE = 2;
const MAX_RADIUS = 120;

function computeExpectedRadius(multiplier: number): number {
	return Math.min(
		ABSORPTION_RADIUS + GROWTH_SCALE * Math.sqrt(multiplier - 1),
		MAX_RADIUS,
	);
}

function triggerAbsorb() {
	for (const fn of mocks.absorbListeners) fn(1, 0);
}

function triggerComboBreak() {
	for (const fn of mocks.comboBreakListeners) fn();
}

beforeAll(() => {
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

	it("caps radius at MAX_RADIUS", () => {
		mocks.multiplier = 3000; // far past the cap
		triggerAbsorb();
		expect(mocks.setRadius).toHaveBeenCalledWith(MAX_RADIUS);
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
