import { Container, Graphics, Rectangle, Text } from "pixi.js";
import { app } from "../app";
import { getMode, getState, pauseGame } from "../state";
import { getTimeRemaining } from "../systems/clock";
import { getScore } from "../systems/scoring";
import { onThreshold } from "../systems/threshold";

const PAD = 16;
const STRIP_H = 80;
const LABEL_STYLE = { fontSize: 11, fill: 0x8888aa, fontFamily: "monospace" };
const VALUE_STYLE = {
	fontSize: 22,
	fill: 0xffffff,
	fontFamily: "monospace",
	fontWeight: "bold",
};
const CLOCK_URGENT_FILL = 0xff4444;
const TOAST_COLOR = 0x00ffcc;
const TOAST_DURATION_MS = 900;
const CLOCK_PULSE_MS = 350;

const container = new Container();
const bgPanel = new Graphics();

const scoreLabel = new Text({ text: "SCORE", style: LABEL_STYLE });
const scoreValue = new Text({ text: "0", style: VALUE_STYLE });

const clockLabel = new Text({ text: "TIME", style: LABEL_STYLE });
const clockValue = new Text({ text: "30.0", style: { ...VALUE_STYLE } });
const modeBadge = new Text({
	text: "",
	style: { fontSize: 10, fill: 0x445566, fontFamily: "monospace" },
});
const zenLabel = new Text({
	text: "ZEN",
	style: {
		fontSize: 22,
		fill: 0x9944ff,
		fontFamily: "monospace",
		fontWeight: "bold",
	},
});

// "+5s" toast — floats upward from the clock on time extension
const toastText = new Text({
	text: "+5s",
	style: {
		fontSize: 28,
		fill: TOAST_COLOR,
		fontFamily: "monospace",
		fontWeight: "bold",
	},
});
toastText.anchor.set(0.5, 0.5);
toastText.alpha = 0;

const pauseBtn = new Container();
const pauseBtnText = new Text({
	text: "II",
	style: { fontSize: 13, fill: 0x5555aa, fontFamily: "monospace" },
});

let toastProgress = 0; // 0–1 over TOAST_DURATION_MS
let toastActive = false;
let clockPulse = 0; // ms remaining in scale pulse

export function initHud(): void {
	pauseBtn.addChild(pauseBtnText);
	pauseBtn.eventMode = "static";
	pauseBtn.cursor = "pointer";
	pauseBtn.on("pointerdown", pauseGame);

	container.addChild(bgPanel);
	container.addChild(scoreLabel, scoreValue);
	container.addChild(clockLabel, clockValue, modeBadge, zenLabel);
	container.addChild(toastText);
	container.addChild(pauseBtn);
	app.stage.addChild(container);

	window.addEventListener("keydown", (e) => {
		if (
			(e.code === "Escape" || e.code === "KeyP") &&
			getState() === "playing"
		) {
			pauseGame();
		}
	});

	// Trigger toast + clock pulse on time extension (Standard only)
	onThreshold(() => {
		if (getMode() !== "standard") return;
		toastProgress = 0;
		toastActive = true;
		clockPulse = CLOCK_PULSE_MS;
	});

	app.ticker.add((ticker) => {
		const state = getState();

		// HUD visible during playing and paused (frozen values show behind pause overlay)
		if (state !== "playing" && state !== "paused") {
			container.visible = false;
			return;
		}
		container.visible = true;
		if (state !== "playing") return;

		const w = app.screen.width;
		const mode = getMode();

		// ── Background strip ──────────────────────────────────────────────────
		bgPanel.clear();
		bgPanel.rect(0, 0, w, STRIP_H).fill({ color: 0x000000, alpha: 0.55 });

		// ── Score (top-left) ──────────────────────────────────────────────────
		scoreLabel.position.set(PAD, PAD);
		scoreValue.position.set(PAD, PAD + 14);
		scoreValue.text = getScore().toLocaleString();

		// ── Clock / mode indicator (top-center) ───────────────────────────────
		if (mode === "zen") {
			clockLabel.visible = false;
			clockValue.visible = false;
			modeBadge.visible = false;
			zenLabel.visible = true;
			zenLabel.position.set(w / 2 - zenLabel.width / 2, PAD + 14);
		} else {
			zenLabel.visible = false;
			clockLabel.visible = true;
			clockValue.visible = true;
			modeBadge.visible = true;

			const t = getTimeRemaining();
			clockValue.text = t.toFixed(1);
			clockLabel.position.set(w / 2 - clockValue.width / 2, PAD);
			clockValue.position.set(w / 2 - clockValue.width / 2, PAD + 14);

			modeBadge.text = mode === "blitz" ? "BLITZ" : "STANDARD";
			(modeBadge.style as { fill: number }).fill =
				mode === "blitz" ? 0x774400 : 0x336677;
			modeBadge.position.set(w / 2 - modeBadge.width / 2, PAD + 40);

			// Clock pulse — scale + color override during animation
			if (clockPulse > 0) {
				clockPulse = Math.max(0, clockPulse - ticker.deltaMS);
				const progress = 1 - clockPulse / CLOCK_PULSE_MS;
				const peakAt = 120 / 350;
				const scale =
					progress < peakAt
						? 1 + 0.35 * (progress / peakAt)
						: 1.35 - 0.35 * ((progress - peakAt) / (1 - peakAt));
				clockValue.scale.set(scale);
				(clockValue.style as { fill: number }).fill = TOAST_COLOR;
			} else {
				clockValue.scale.set(1.0);
				(clockValue.style as { fill: number }).fill =
					t < 5 ? CLOCK_URGENT_FILL : 0xffffff;
			}
		}

		// ── "+5s" toast (floats up from clock, Standard only) ─────────────────
		if (toastActive) {
			toastProgress = Math.min(
				1,
				toastProgress + ticker.deltaMS / TOAST_DURATION_MS,
			);
			const elapsed = toastProgress * TOAST_DURATION_MS;
			const alpha = elapsed < 200 ? 1 : Math.max(0, 1 - (elapsed - 200) / 700);
			toastText.alpha = alpha;
			toastText.position.set(w / 2, PAD + 14 - toastProgress * 40);
			if (alpha <= 0) toastActive = false;
		}

		// ── Pause button (top-right) ──────────────────────────────────────────
		const btnW = pauseBtnText.width;
		const btnH = pauseBtnText.height;
		pauseBtn.hitArea = new Rectangle(-4, -4, btnW + 8, btnH + 8);
		pauseBtn.position.set(w - PAD - btnW, 6);
	});
}
