import { Rectangle } from "pixi.js";
import { app } from "../app";
import { particleLayer } from "../systems/particles";
import { singularityLayer } from "../systems/singularity";
import type { GameMode } from "../types";

const CARD_W = 1200;
const CARD_H = 630;

/** Text lines printed on the share card, top to bottom. */
export function shareCardLines(
	score: number,
	mode: GameMode,
	build: readonly string[],
	date: string,
): string[] {
	const title = mode === "daily" ? `DAILY ${date}` : mode.toUpperCase();
	const lines = ["NEON SWARM", title, `SCORE ${score.toLocaleString()}`];
	if (build.length > 0) lines.push(`BUILD ${build.join(" · ")}`);
	return lines;
}

/** Renders the current stage plus the score lines into a 1200×630 PNG. */
async function renderCard(lines: string[]): Promise<Blob | null> {
	const canvas = document.createElement("canvas");
	canvas.width = CARD_W;
	canvas.height = CARD_H;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CARD_W, CARD_H);
	// Swarm + singularity snapshot (no HUD/overlays), cover-fit behind the text
	const { width: sw, height: sh } = app.screen;
	const s = Math.max(CARD_W / sw, CARD_H / sh);
	const w = sw * s;
	const h = sh * s;
	for (const target of [particleLayer, singularityLayer]) {
		// extract's frame is in the target's local space — map the screen rect into it
		const tl = target.toLocal({ x: 0, y: 0 });
		const br = target.toLocal({ x: sw, y: sh });
		const frame = new Rectangle(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
		const snap = app.renderer.extract.canvas({ target, frame });
		if (snap instanceof HTMLCanvasElement) {
			ctx.drawImage(snap, (CARD_W - w) / 2, (CARD_H - h) / 2, w, h);
		}
	}
	ctx.fillStyle = "rgba(0,0,0,0.55)";
	ctx.fillRect(0, 0, CARD_W, CARD_H);

	const [title, sub, score, build] = lines;
	ctx.textAlign = "center";
	ctx.fillStyle = "#fff";
	ctx.font = "bold 72px monospace";
	ctx.fillText(title, CARD_W / 2, 190);
	ctx.fillStyle = "#8888aa";
	ctx.font = "28px monospace";
	ctx.fillText(sub, CARD_W / 2, 250);
	ctx.fillStyle = "#fff";
	ctx.font = "bold 64px monospace";
	ctx.fillText(score, CARD_W / 2, 370);
	if (build) {
		ctx.fillStyle = "#00ffcc";
		ctx.font = "28px monospace";
		ctx.fillText(build, CARD_W / 2, 440);
	}

	return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/**
 * Builds the score card and hands it to the native share sheet when it accepts
 * files, otherwise downloads it as a PNG.
 */
export async function shareScoreCard(lines: string[]): Promise<void> {
	const blob = await renderCard(lines);
	if (!blob) return;
	const file = new File([blob], "neon-swarm.png", { type: "image/png" });
	if (navigator.canShare?.({ files: [file] })) {
		try {
			await navigator.share({ files: [file], text: lines.join("\n") });
			return;
		} catch (err) {
			// Cancelling the share sheet is a choice, not a failure
			if (err instanceof DOMException && err.name === "AbortError") return;
		}
	}
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = file.name;
	a.click();
	URL.revokeObjectURL(url);
}
