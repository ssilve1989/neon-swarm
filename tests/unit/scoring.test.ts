import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type AbsorbFn = (count: number, color: number) => void;

const mocks = vi.hoisted(() => ({
	absorbListeners: [] as AbsorbFn[],
	multiplier: 1,
}));

vi.mock("../../src/systems/absorption", () => ({
	onAbsorb: (fn: AbsorbFn) => {
		mocks.absorbListeners.push(fn);
		return () => {};
	},
}));

vi.mock("../../src/systems/combo", () => ({
	getMultiplier: () => mocks.multiplier,
}));

import { setState } from "../../src/state";
import { getScore, initScoring } from "../../src/systems/scoring";

function triggerAbsorb(count: number) {
	for (const fn of mocks.absorbListeners) fn(count, 0);
}

beforeAll(() => {
	initScoring();
});

beforeEach(() => {
	mocks.multiplier = 1;
	setState("game-over");
	setState("idle");
	setState("playing"); // resets score to 0
});

describe("getScore", () => {
	it("starts at 0 on new game", () => {
		expect(getScore()).toBe(0);
	});

	it("increments by count × multiplier", () => {
		mocks.multiplier = 3;
		triggerAbsorb(5);
		expect(getScore()).toBe(15);
	});

	it("accumulates across multiple absorbs", () => {
		mocks.multiplier = 2;
		triggerAbsorb(10); // +20
		mocks.multiplier = 5;
		triggerAbsorb(4); // +20
		expect(getScore()).toBe(40);
	});

	it("works with multiplier of 1", () => {
		mocks.multiplier = 1;
		triggerAbsorb(7);
		expect(getScore()).toBe(7);
	});

	it("resets to 0 on new game", () => {
		mocks.multiplier = 10;
		triggerAbsorb(100);
		setState("game-over");
		setState("idle");
		setState("playing");
		expect(getScore()).toBe(0);
	});
});
