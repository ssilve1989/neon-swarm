import { Container, Graphics, Rectangle, Text } from "pixi.js";
import { app } from "../app";
import { getState } from "../state";
import {
	getOffer,
	type Mutator,
	onOffer,
	pickOffer,
} from "../systems/mutators";

// ── Tuning knobs ──────────────────────────────────────────────────────────────
const CARD_W = 200;
const CARD_H = 72;
const CARD_GAP = 10;
const BOTTOM_PAD = 24;
const FADE_SPEED = 0.2;
// No pause during a draft — an ignored offer auto-picks its first card
const DRAFT_TIMEOUT_MS = 6000;

const overlay = new Container();
const cards = [0, 1, 2].map((i) => ({
	container: new Container(),
	bg: new Graphics(),
	name: new Text({
		text: "",
		style: {
			fontSize: 16,
			fill: 0xffffff,
			fontFamily: "monospace",
			fontWeight: "bold",
		},
	}),
	desc: new Text({
		text: "",
		style: {
			fontSize: 11,
			fill: 0x8888aa,
			fontFamily: "monospace",
			wordWrap: true,
		},
	}),
	key: new Text({
		text: String(i + 1),
		style: { fontSize: 11, fill: 0x556677, fontFamily: "monospace" },
	}),
}));

let offer: readonly Mutator[] = [];
let remainingMs = 0;

/** Draft overlay — glance-and-tap mutator choice shown at threshold crossings. */
export function initDraftOverlay(): void {
	cards.forEach(({ container, bg, name, desc, key }, i) => {
		container.addChild(bg, name, desc, key);
		container.hitArea = new Rectangle(0, 0, CARD_W, CARD_H);
		container.cursor = "pointer";
		container.on("pointerdown", (e) => {
			// Keep the tap from also yanking the singularity to the card
			e.stopPropagation();
			pickOffer(i);
		});
		overlay.addChild(container);
	});
	overlay.alpha = 0;
	app.stage.addChild(overlay);

	onOffer((next) => {
		offer = next;
		remainingMs = DRAFT_TIMEOUT_MS;
		cards.forEach(({ container, name, desc }, i) => {
			const m = next[i];
			container.visible = m !== undefined;
			if (!m) return;
			name.text = m.name;
			name.style.fill = m.color;
			desc.text = m.desc;
		});
	});

	window.addEventListener("keydown", (e) => {
		if (getState() !== "playing" || offer.length === 0) return;
		const i = ["Digit1", "Digit2", "Digit3"].indexOf(e.code);
		if (i !== -1) pickOffer(i);
	});

	app.ticker.add((ticker) => {
		const open = getState() === "playing" && getOffer().length > 0;
		overlay.alpha += ((open ? 1 : 0) - overlay.alpha) * FADE_SPEED;
		overlay.visible = overlay.alpha > 0.01;
		for (const { container } of cards) {
			container.eventMode = open ? "static" : "none";
		}
		if (!open) return;

		remainingMs -= ticker.deltaMS;
		if (remainingMs <= 0) {
			pickOffer(0);
			return;
		}

		const w = app.screen.width;
		const h = app.screen.height;
		const n = offer.length;
		// Shrink cards on narrow (mobile) screens so all three fit
		const cardW = Math.min(CARD_W, (w - CARD_GAP * (n + 1)) / n);
		const totalW = cardW * n + CARD_GAP * (n - 1);
		const x0 = (w - totalW) / 2;
		const y = h - BOTTOM_PAD - CARD_H;
		const frac = remainingMs / DRAFT_TIMEOUT_MS;

		cards.forEach(({ container, bg, name, desc, key }, i) => {
			const m = offer[i];
			if (!m) return;
			container.position.set(x0 + i * (cardW + CARD_GAP), y);
			container.hitArea = new Rectangle(0, 0, cardW, CARD_H);
			bg.clear();
			bg.rect(0, 0, cardW, CARD_H).fill({ color: 0x0a0a1a, alpha: 0.8 });
			bg.rect(0, 0, cardW, CARD_H).stroke({ color: m.color, width: 2 });
			// Countdown bar — shows how long until the first card auto-picks
			bg.rect(0, CARD_H - 3, cardW * frac, 3).fill({ color: m.color });
			name.position.set(10, 10);
			// Wrap descriptions on narrow cards (mobile)
			if (desc.style.wordWrapWidth !== cardW - 20)
				desc.style.wordWrapWidth = cardW - 20;
			desc.position.set(10, 32);
			key.position.set(cardW - 16, 8);
		});
	});
}
