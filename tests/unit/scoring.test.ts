import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type AbsorbFn = (count: number, color: number) => void;

const mocks = vi.hoisted(() => ({
	absorbListeners: [] as AbsorbFn[],
}));

vi.mock("../../src/systems/absorption", () => ({
	onAbsorb: (fn: AbsorbFn) => {
		mocks.absorbListeners.push(fn);
		return () => {};
	},
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
	setState("game-over");
	setState("playing"); // resets score to 0
});

describe("getScore", () => {
	it("starts at 0 on new game", () => {
		expect(getScore()).toBe(0);
	});

	it("increments by absorbed count", () => {
		triggerAbsorb(5);
		expect(getScore()).toBe(5);
	});

	it("accumulates across multiple absorbs", () => {
		triggerAbsorb(10);
		triggerAbsorb(4);
		expect(getScore()).toBe(14);
	});

	it("counts each absorbed particle", () => {
		triggerAbsorb(7);
		expect(getScore()).toBe(7);
	});

	it("resets to 0 on new game", () => {
		triggerAbsorb(100);
		setState("game-over");
		setState("playing");
		expect(getScore()).toBe(0);
	});

	it("preserves score when resuming from pause", () => {
		triggerAbsorb(42);
		setState("paused");
		setState("playing"); // resume
		expect(getScore()).toBe(42);
	});
});
