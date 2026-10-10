import { describe, expect, it, vi } from "vitest";

// share-card pulls in the Pixi app and stage layers; the line builder needs none of them
vi.mock("../../src/app", () => ({ app: {} }));
vi.mock("../../src/systems/particles", () => ({ particleLayer: {} }));
vi.mock("../../src/systems/singularity", () => ({ singularityLayer: {} }));

import { shareCardLines } from "../../src/ui/share-card";

describe("shareCardLines", () => {
	it("lists title, mode, score and build", () => {
		expect(
			shareCardLines(1234, "standard", ["VORTEX", "GREED"], "2026-10-10"),
		).toEqual([
			"NEON SWARM",
			"STANDARD",
			`SCORE ${(1234).toLocaleString()}`,
			"BUILD VORTEX · GREED",
		]);
	});

	it("labels daily runs with their date", () => {
		expect(shareCardLines(5, "daily", [], "2026-10-10")[1]).toBe(
			"DAILY 2026-10-10",
		);
	});

	it("omits the build line when nothing was picked", () => {
		expect(shareCardLines(5, "blitz", [], "2026-10-10")).toHaveLength(3);
	});
});
