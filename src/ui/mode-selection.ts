import { Container, Graphics, Rectangle, Text } from "pixi.js";
import { app } from "../app";
import { confirmMode, onStateChange } from "../state";
import type { GameMode } from "../types";

// ── Tuning knobs ──────────────────────────────────────────────────────────────
const CARD_W_RATIO = 0.8;
const CARD_MAX_W = 600;
const CARD_H = 56;
const CARD_GAP = 12;
const TITLE_GAP = 32;
const FADE_SPEED = 0.12;
const FLASH_MS = 150;
const PAD = 16;

// ── Mode definitions ──────────────────────────────────────────────────────────
const MODES: Array<{
	mode: GameMode;
	label: string;
	stat: string;
	color: number;
}> = [
	{
		mode: "standard",
		label: "STANDARD",
		stat: "30s + time extensions",
		color: 0x00ccff,
	},
	{
		mode: "blitz",
		label: "BLITZ",
		stat: "15s · no extensions",
		color: 0xff8800,
	},
	{ mode: "zen", label: "ZEN", stat: "no clock · peak score", color: 0x9944ff },
];

// ── PixiJS objects ────────────────────────────────────────────────────────────
const overlay = new Container();
const screenBg = new Graphics();

const titleText = new Text({
	text: "NEON SWARM",
	style: {
		fontSize: 52,
		fill: 0xffffff,
		fontFamily: "monospace",
		fontWeight: "bold",
	},
});

const cards = MODES.map((m) => ({
	container: new Container(),
	bg: new Graphics(),
	label: new Text({
		text: m.label,
		style: {
			fontSize: 18,
			fill: 0xffffff,
			fontFamily: "monospace",
			fontWeight: "bold",
		},
	}),
	stat: new Text({
		text: m.stat,
		style: { fontSize: 12, fill: 0x8888aa, fontFamily: "monospace" },
	}),
}));

// ── Runtime state ─────────────────────────────────────────────────────────────
let targetAlpha = 0;
let focused = 0;
let confirming = false;
let flashIdx = -1;
let flashMs = 0;
let pendingMode: GameMode | null = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function pickMode(index: number): void {
	if (confirming) return;
	confirming = true;
	flashIdx = index;
	flashMs = FLASH_MS;
	pendingMode = MODES[index].mode;
	overlay.eventMode = "none";
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initModeSelection(): void {
	cards.forEach(({ container, bg, label, stat }, i) => {
		container.addChild(bg, label, stat);
		container.eventMode = "static";
		container.cursor = "pointer";
		container.on("pointerdown", () => pickMode(i));
	});

	overlay.addChild(screenBg);
	cards.forEach(({ container }) => {
		overlay.addChild(container);
	});
	overlay.addChild(titleText);
	overlay.alpha = 0;
	overlay.eventMode = "passive";
	app.stage.addChild(overlay);

	window.addEventListener("keydown", (e) => {
		if (overlay.alpha < 0.5 || confirming) return;
		switch (e.code) {
			case "ArrowDown":
				focused = (focused + 1) % MODES.length;
				break;
			case "ArrowUp":
				focused = (focused - 1 + MODES.length) % MODES.length;
				break;
			case "Enter":
			case "Space":
				e.preventDefault();
				pickMode(focused);
				break;
		}
	});

	onStateChange((state) => {
		if (state === "mode-select") {
			targetAlpha = 1;
			focused = 0;
			confirming = false;
			flashIdx = -1;
			pendingMode = null;
			overlay.eventMode = "passive";
		} else {
			targetAlpha = 0;
			overlay.eventMode = "none";
		}
	});

	// Show immediately — initial state is mode-select, onStateChange won't fire for it
	targetAlpha = 1;
	overlay.eventMode = "passive";

	app.ticker.add((ticker) => {
		overlay.alpha += (targetAlpha - overlay.alpha) * FADE_SPEED;

		// Flash countdown → commit mode on expiry
		if (flashIdx >= 0) {
			flashMs -= ticker.deltaMS;
			if (flashMs <= 0 && pendingMode !== null) {
				const mode = pendingMode;
				pendingMode = null;
				flashIdx = -1;
				targetAlpha = 0;
				confirmMode(mode);
			}
		}

		// ── Layout ──────────────────────────────────────────────────────────
		const w = app.screen.width;
		const h = app.screen.height;
		const cardW = Math.min(w * CARD_W_RATIO, CARD_MAX_W);
		const cardX = (w - cardW) / 2;

		const titleH = titleText.height;
		const stackH = CARD_H * MODES.length + CARD_GAP * (MODES.length - 1);
		const totalH = titleH + TITLE_GAP + stackH;
		const groupY = h < 320 ? 24 : (h - totalH) / 2;

		screenBg.clear();
		screenBg.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0.78 });

		titleText.position.set(w / 2 - titleText.width / 2, groupY);

		cards.forEach(({ container, bg: cardBg, label, stat }, i) => {
			const cardY = groupY + titleH + TITLE_GAP + i * (CARD_H + CARD_GAP);
			const flashing = flashIdx === i;
			const foc = focused === i && !confirming;
			const { color } = MODES[i];

			container.position.set(cardX, cardY);
			container.hitArea = new Rectangle(0, 0, cardW, CARD_H);

			cardBg.clear();
			cardBg
				.rect(0, 0, cardW, CARD_H)
				.fill({ color: flashing ? color : 0x111122, alpha: 0.85 });
			cardBg
				.rect(0, 0, cardW, CARD_H)
				.stroke({ color: foc ? color : 0x333355, width: 2 });

			label.position.set(PAD, (CARD_H - label.height) / 2);
			stat.position.set(cardW - PAD - stat.width, (CARD_H - stat.height) / 2);
		});

		// Guard: cards only interactive when fully visible
		const interactive = overlay.alpha >= 0.95 && !confirming;
		for (const { container } of cards) {
			container.eventMode = interactive ? "static" : "none";
		}
	});
}
