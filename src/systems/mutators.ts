import { getMode, onStateChange } from "../state";
import { hasDrafts } from "../types";
import { hashSeed, mulberry32, todayKey } from "../utils/seeded-random";

/** Run-wide modifiers. Every field except `vortex` is a multiplier (base 1). */
export type Modifiers = {
	scoreMult: number;
	clockDrainMult: number;
	absorbMult: number;
	influenceMult: number;
	moveMult: number;
	driftMult: number;
	rampMult: number;
	/** Orbital speed (px/frame) particles gain around the singularity. Additive, base 0. */
	vortex: number;
};

export type MutatorLever = "swarm" | "singularity" | "rules";

export type Mutator = {
	id: string;
	name: string;
	desc: string;
	lever: MutatorLever;
	color: number;
	effects: Partial<Modifiers>;
	/** One-shot clock bonus granted on pick. */
	bonusSeconds?: number;
};

// ── Tuning knobs — mutator roster (design/gdd/mutators-concept.md) ───────────
export const MUTATORS: readonly Mutator[] = [
	{
		id: "vortex",
		name: "VORTEX",
		desc: "swarm orbits you",
		lever: "swarm",
		color: 0x00ffff,
		effects: { vortex: 1.6 },
	},
	{
		id: "surge",
		name: "SURGE",
		desc: "swarm moves 2x faster",
		lever: "swarm",
		color: 0xff00ff,
		effects: { driftMult: 2 },
	},
	{
		id: "magnet",
		name: "MAGNET",
		desc: "2x pull range",
		lever: "singularity",
		color: 0x7799ff,
		effects: { influenceMult: 2 },
	},
	{
		id: "heavy",
		name: "HEAVY",
		desc: "1.5x size · half speed",
		lever: "singularity",
		color: 0xff4400,
		effects: { absorbMult: 1.5, moveMult: 0.5 },
	},
	{
		id: "greed",
		name: "GREED",
		desc: "2x score · faster clock",
		lever: "rules",
		color: 0xffcc00,
		effects: { scoreMult: 2, clockDrainMult: 1.5 },
	},
	{
		id: "overclock",
		name: "OVERCLOCK",
		desc: "+5s · swarm floods in",
		lever: "rules",
		color: 0x00ff88,
		effects: { rampMult: 3 },
		bonusSeconds: 5,
	},
];

export const OFFER_SIZE = 3;

const BASE: Modifiers = {
	scoreMult: 1,
	clockDrainMult: 1,
	absorbMult: 1,
	influenceMult: 1,
	moveMult: 1,
	driftMult: 1,
	rampMult: 1,
	vortex: 0,
};

/** Folds mutator effects into one Modifiers value: `vortex` adds, the rest multiply. */
export function combine(picks: readonly Mutator[]): Modifiers {
	const out = { ...BASE };
	for (const m of picks) {
		const e = m.effects;
		out.scoreMult *= e.scoreMult ?? 1;
		out.clockDrainMult *= e.clockDrainMult ?? 1;
		out.absorbMult *= e.absorbMult ?? 1;
		out.influenceMult *= e.influenceMult ?? 1;
		out.moveMult *= e.moveMult ?? 1;
		out.driftMult *= e.driftMult ?? 1;
		out.rampMult *= e.rampMult ?? 1;
		out.vortex += e.vortex ?? 0;
	}
	return out;
}

/** Picks up to `size` distinct mutators not yet in `picked`, using `rand`. */
export function rollOffer(
	rand: () => number,
	picked: readonly Mutator[],
	size = OFFER_SIZE,
): Mutator[] {
	const pool = MUTATORS.filter((m) => !picked.includes(m));
	const offer: Mutator[] = [];
	while (offer.length < size && pool.length > 0) {
		offer.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
	}
	return offer;
}

// ── Run state ────────────────────────────────────────────────────────────────
let rand: () => number = Math.random;
let picked: Mutator[] = [];
let offer: Mutator[] = [];
// Drafts earned while an offer is still open — opened one after another
let queued = 0;
let modifiers: Modifiers = { ...BASE };

type OfferListener = (offer: readonly Mutator[]) => void;
type PickListener = (m: Mutator) => void;
const offerListeners: OfferListener[] = [];
const pickListeners: PickListener[] = [];

export function getModifiers(): Modifiers {
	return modifiers;
}

export function getPicked(): readonly Mutator[] {
	return picked;
}

export function getOffer(): readonly Mutator[] {
	return offer;
}

/** Subscribe to new draft offers (empty array = offer closed). Returns unsubscribe. */
export function onOffer(fn: OfferListener): () => void {
	offerListeners.push(fn);
	return () => {
		const i = offerListeners.indexOf(fn);
		if (i !== -1) offerListeners.splice(i, 1);
	};
}

/** Subscribe to mutator picks. Returns unsubscribe. */
export function onMutatorPicked(fn: PickListener): () => void {
	pickListeners.push(fn);
	return () => {
		const i = pickListeners.indexOf(fn);
		if (i !== -1) pickListeners.splice(i, 1);
	};
}

function setOffer(next: Mutator[]): void {
	offer = next;
	for (const fn of offerListeners) fn(offer);
}

/** Commit the offer entry at `index`. No-op without an open offer. */
export function pickOffer(index: number): void {
	const m = offer[index];
	if (!m) return;
	picked = [...picked, m];
	modifiers = combine(picked);
	setOffer([]);
	for (const fn of pickListeners) fn(m);
	if (queued > 0) {
		queued--;
		const next = rollOffer(rand, picked);
		if (next.length > 0) setOffer(next);
	}
}

/** Opens a draft (wired to threshold crossings), or queues it behind an open offer. */
export function openDraft(): void {
	if (!hasDrafts(getMode())) return;
	if (offer.length > 0) {
		queued++;
		return;
	}
	const next = rollOffer(rand, picked);
	if (next.length > 0) setOffer(next);
}

function resetRun(): void {
	const mode = getMode();
	rand =
		mode === "daily"
			? mulberry32(hashSeed(todayKey()))
			: mulberry32((Math.random() * 2 ** 32) >>> 0);
	picked = [];
	queued = 0;
	modifiers = { ...BASE };
	setOffer([]);
}

export function initMutators(): void {
	onStateChange((state, prev) => {
		if ((state === "playing" && prev !== "paused") || state === "mode-select")
			resetRun();
		else if (state === "game-over") {
			queued = 0;
			if (offer.length > 0) setOffer([]);
		}
	});
}
