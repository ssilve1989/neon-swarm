import { afterEach, describe, expect, it, vi } from "vitest";
import { getState, onStateChange, setState } from "../../src/state";

afterEach(() => {
	// Leave state in idle after each test
	setState("game-over");
	setState("idle");
});

describe("setState / getState", () => {
	it("returns the state that was just set", () => {
		setState("playing");
		expect(getState()).toBe("playing");
	});

	it("is a no-op when setting the same state", () => {
		setState("playing");
		const listener = vi.fn();
		const unsub = onStateChange(listener);
		setState("playing");
		expect(listener).not.toHaveBeenCalled();
		unsub();
	});

	it("supports all valid transitions", () => {
		setState("idle");
		setState("playing");
		expect(getState()).toBe("playing");
		setState("game-over");
		expect(getState()).toBe("game-over");
		setState("idle");
		expect(getState()).toBe("idle");
	});
});

describe("onStateChange", () => {
	it("calls listener with the new state and previous state on transition", () => {
		setState("idle");
		const listener = vi.fn();
		const unsub = onStateChange(listener);
		setState("playing");
		expect(listener).toHaveBeenCalledWith("playing", "idle");
		unsub();
	});

	it("calls all registered listeners", () => {
		setState("idle");
		const a = vi.fn();
		const b = vi.fn();
		const unsubA = onStateChange(a);
		const unsubB = onStateChange(b);
		setState("playing");
		expect(a).toHaveBeenCalledWith("playing", "idle");
		expect(b).toHaveBeenCalledWith("playing", "idle");
		unsubA();
		unsubB();
	});

	it("does not call listener after unsubscribe", () => {
		setState("playing");
		const listener = vi.fn();
		const unsub = onStateChange(listener);
		unsub();
		setState("game-over");
		expect(listener).not.toHaveBeenCalled();
	});

	it("returns an unsubscribe function that only removes its own listener", () => {
		setState("idle");
		const a = vi.fn();
		const b = vi.fn();
		const unsubA = onStateChange(a);
		const unsubB = onStateChange(b);
		unsubA();
		setState("playing");
		expect(a).not.toHaveBeenCalled();
		expect(b).toHaveBeenCalledWith("playing", "idle");
		unsubB();
	});
});
