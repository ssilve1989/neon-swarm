import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type TickFn = (t: { deltaTime: number; deltaMS: number }) => void;

const tickers = vi.hoisted(() => [] as TickFn[]);

vi.mock("../../src/app", () => ({
	app: {
		ticker: {
			add: (fn: TickFn) => {
				tickers.push(fn);
			},
		},
	},
}));

import { getState, setState } from "../../src/state";
import {
	addTime,
	CLOCK_DURATION,
	getTimeRemaining,
	initClock,
} from "../../src/systems/clock";

function tick(deltaMS: number) {
	for (const fn of tickers) fn({ deltaTime: 1, deltaMS });
}

beforeAll(() => {
	initClock();
});

beforeEach(() => {
	setState("game-over");
	setState("idle");
	setState("playing"); // resets timeRemaining to CLOCK_DURATION
});

describe("CLOCK_DURATION", () => {
	it("is 30 seconds", () => {
		expect(CLOCK_DURATION).toBe(30);
	});
});

describe("addTime", () => {
	it("increases time remaining", () => {
		tick(5000); // reduce by 5s first
		const before = getTimeRemaining();
		addTime(3);
		expect(getTimeRemaining()).toBeCloseTo(before + 3);
	});

	it("caps at CLOCK_DURATION", () => {
		addTime(100);
		expect(getTimeRemaining()).toBe(CLOCK_DURATION);
	});
});

describe("ticker", () => {
	it("decrements time by deltaMS / 1000 per tick", () => {
		tick(500); // 0.5 seconds
		expect(getTimeRemaining()).toBeCloseTo(CLOCK_DURATION - 0.5);
	});

	it("triggers game-over when time reaches zero", () => {
		tick(CLOCK_DURATION * 1000 + 1000);
		expect(getState()).toBe("game-over");
		expect(getTimeRemaining()).toBe(0);
	});

	it("does not decrement when not in playing state", () => {
		setState("game-over");
		const before = getTimeRemaining();
		tick(500);
		expect(getTimeRemaining()).toBe(before);
	});
});
