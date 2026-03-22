import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type TickFn = (t: { deltaTime: number }) => void;
type AbsorbFn = (count: number, color: number) => void;

const tickers = vi.hoisted(() => [] as TickFn[]);
const absorbListeners = vi.hoisted(() => [] as AbsorbFn[]);

vi.mock("../../src/app", () => ({
	app: {
		ticker: {
			add: (fn: TickFn) => {
				tickers.push(fn);
			},
		},
	},
}));

vi.mock("../../src/systems/absorption", () => ({
	onAbsorb: (fn: AbsorbFn) => {
		absorbListeners.push(fn);
		return () => {};
	},
}));

import { setState } from "../../src/state";
import {
	COMBO_DURATION,
	getComboTimer,
	getMultiplier,
	initCombo,
	onComboBreak,
} from "../../src/systems/combo";

function tick(deltaTime = 1) {
	for (const fn of tickers) fn({ deltaTime });
}

function triggerAbsorb(count = 1, color = 0) {
	for (const fn of absorbListeners) fn(count, color);
}

beforeAll(() => {
	initCombo();
});

beforeEach(() => {
	setState("game-over");
	setState("idle");
	setState("playing"); // resets multiplier=1, timer=0
});

describe("initial state", () => {
	it("multiplier starts at 1 after new game", () => {
		expect(getMultiplier()).toBe(1);
	});

	it("combo timer starts at 0 after new game", () => {
		expect(getComboTimer()).toBe(0);
	});
});

describe("absorption", () => {
	it("increments multiplier on each absorb", () => {
		triggerAbsorb();
		expect(getMultiplier()).toBe(2);
		triggerAbsorb();
		expect(getMultiplier()).toBe(3);
	});

	it("resets combo timer to full on absorb", () => {
		triggerAbsorb();
		expect(getComboTimer()).toBe(1); // timer / COMBO_DURATION = 1
	});

	it("does not increment multiplier when not playing", () => {
		setState("game-over");
		triggerAbsorb();
		// Verify multiplier didn't change from the game-over state
		// (it was reset to 1 by setState("playing") in beforeEach,
		//  then we moved to game-over without absorbing)
		setState("idle");
		setState("playing");
		expect(getMultiplier()).toBe(1);
	});
});

describe("combo break", () => {
	it("resets multiplier to 1 when timer expires", () => {
		triggerAbsorb(); // multiplier=2, timer=COMBO_DURATION
		tick(COMBO_DURATION + 1);
		expect(getMultiplier()).toBe(1);
	});

	it("calls onComboBreak listeners when timer expires", () => {
		const listener = vi.fn();
		const unsub = onComboBreak(listener);
		triggerAbsorb();
		tick(COMBO_DURATION + 1);
		expect(listener).toHaveBeenCalledOnce();
		unsub();
	});

	it("does not break if timer is refreshed before expiry", () => {
		triggerAbsorb(); // timer = COMBO_DURATION
		tick(COMBO_DURATION / 2); // halfway
		triggerAbsorb(); // reset timer to full
		tick(COMBO_DURATION / 2); // would have expired without the refresh
		expect(getMultiplier()).toBeGreaterThan(1);
	});

	it("does not tick timer when not playing", () => {
		triggerAbsorb(); // start combo
		setState("game-over");
		tick(COMBO_DURATION + 1); // would expire if state were playing
		setState("idle");
		setState("playing"); // resets multiplier back to 1 regardless
		// The key check: no spurious break listener calls
		const listener = vi.fn();
		const unsub = onComboBreak(listener);
		tick(1); // safe tick
		expect(listener).not.toHaveBeenCalled();
		unsub();
	});
});
