import type { GameMode } from "../types";
import { todayKey } from "../utils/seeded-random";

const KEYS: Record<GameMode, string> = {
	standard: "ns_hiscore_standard",
	blitz: "ns_hiscore_blitz",
	zen: "ns_hiscore_zen",
	daily: "ns_hiscore_daily",
};

// Daily best is per calendar day, so today's run competes only with today.
// shortcut: one tiny key per day played is never pruned; prune if storage use ever matters.
function keyFor(mode: GameMode): string {
	return mode === "daily" ? `${KEYS.daily}_${todayKey()}` : KEYS[mode];
}

/**
 * Returns the stored personal best for the given mode, or null if no run has
 * been completed in that mode yet.
 */
export function getPersonalBest(mode: GameMode): number | null {
	const raw = localStorage.getItem(keyFor(mode));
	if (raw === null) return null;
	const n = parseInt(raw, 10);
	return Number.isNaN(n) ? null : n;
}

/**
 * Saves score as the new personal best if it exceeds the stored value (or if
 * no value is stored yet). Returns true if the score was saved.
 */
export function checkAndSave(mode: GameMode, score: number): boolean {
	const prev = getPersonalBest(mode);
	if (prev === null || score > prev) {
		localStorage.setItem(keyFor(mode), String(score));
		return true;
	}
	return false;
}
