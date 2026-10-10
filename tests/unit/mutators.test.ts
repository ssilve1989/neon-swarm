import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { changeMode, confirmMode, setState } from "../../src/state";
import {
	combine,
	getModifiers,
	getOffer,
	getPicked,
	initMutators,
	MUTATORS,
	onMutatorPicked,
	openDraft,
	pickOffer,
	rollOffer,
} from "../../src/systems/mutators";
import { hashSeed, mulberry32, todayKey } from "../../src/utils/seeded-random";

const byId = (id: string) => {
	const m = MUTATORS.find((x) => x.id === id);
	if (!m) throw new Error(`no mutator ${id}`);
	return m;
};

beforeAll(() => {
	initMutators();
});

beforeEach(() => {
	changeMode();
	confirmMode("standard");
});

describe("combine", () => {
	it("returns neutral modifiers for an empty build", () => {
		const m = combine([]);
		expect(m.scoreMult).toBe(1);
		expect(m.vortex).toBe(0);
	});

	it("multiplies multipliers and adds vortex across picks", () => {
		const m = combine([byId("greed"), byId("heavy"), byId("vortex")]);
		expect(m.scoreMult).toBe(2);
		expect(m.clockDrainMult).toBe(1.5);
		expect(m.absorbMult).toBe(1.5);
		expect(m.moveMult).toBe(0.5);
		expect(m.vortex).toBe(byId("vortex").effects.vortex);
	});
});

describe("rollOffer", () => {
	it("offers 3 distinct mutators", () => {
		const offer = rollOffer(mulberry32(1), []);
		expect(offer).toHaveLength(3);
		expect(new Set(offer).size).toBe(3);
	});

	it("never offers an already-picked mutator", () => {
		const picked = [byId("vortex"), byId("surge"), byId("magnet")];
		const offer = rollOffer(mulberry32(7), picked);
		for (const m of offer) expect(picked).not.toContain(m);
	});

	it("is deterministic for the same seed", () => {
		expect(rollOffer(mulberry32(42), [])).toEqual(
			rollOffer(mulberry32(42), []),
		);
	});
});

describe("daily seed", () => {
	it("is the same for the same calendar day", () => {
		const a = todayKey(new Date(2026, 9, 10, 1));
		const b = todayKey(new Date(2026, 9, 10, 23));
		expect(a).toBe("2026-10-10");
		expect(hashSeed(a)).toBe(hashSeed(b));
	});

	it("gives every daily run the same first offer", () => {
		changeMode();
		confirmMode("daily");
		openDraft();
		const first = getOffer().map((m) => m.id);
		setState("game-over");
		setState("playing");
		openDraft();
		expect(getOffer().map((m) => m.id)).toEqual(first);
	});
});

describe("draft flow", () => {
	it("applies a pick to the run modifiers and closes the offer", () => {
		openDraft();
		const choice = getOffer()[1];
		pickOffer(1);
		expect(getPicked()).toEqual([choice]);
		expect(getOffer()).toHaveLength(0);
		expect(getModifiers()).toEqual(combine([choice]));
	});

	it("queues a draft earned while an offer is open and opens it after the pick", () => {
		openDraft();
		const first = getOffer();
		openDraft();
		expect(getOffer()).toEqual(first);
		expect(getPicked()).toHaveLength(0);
		pickOffer(0);
		expect(getPicked()).toEqual([first[0]]);
		expect(getOffer()).toHaveLength(3);
		expect(getOffer()).not.toContain(first[0]);
	});

	it("notifies pick listeners", () => {
		const fn = vi.fn();
		const unsub = onMutatorPicked(fn);
		openDraft();
		pickOffer(0);
		expect(fn).toHaveBeenCalledOnce();
		unsub();
	});

	it("does not open drafts in Blitz or Zen", () => {
		for (const mode of ["blitz", "zen"] as const) {
			changeMode();
			confirmMode(mode);
			openDraft();
			expect(getOffer()).toHaveLength(0);
		}
	});

	it("resets the build on a new run but keeps it across pause", () => {
		openDraft();
		pickOffer(0);
		setState("paused");
		setState("playing");
		expect(getPicked()).toHaveLength(1);
		setState("game-over");
		setState("playing");
		expect(getPicked()).toHaveLength(0);
		expect(getModifiers()).toEqual(combine([]));
	});
});
