export type GameState = "mode-select" | "playing" | "paused" | "game-over";
export type GameMode = "standard" | "blitz" | "zen" | "daily";

/** Modes that run the Standard ruleset: 30s clock, +5s extensions and mutator drafts. */
export function hasDrafts(mode: GameMode | null): boolean {
	return mode === "standard" || mode === "daily";
}
