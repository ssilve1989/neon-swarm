import type { TextStyleOptions } from "pixi.js";
import { Container, Graphics, Rectangle, Text, TextStyle } from "pixi.js";
import { app } from "../app";
import { getMode, getState, pauseGame } from "../state";
import { getTimeRemaining } from "../systems/clock";
import { cursorMode } from "../systems/input";
import { getScore } from "../systems/scoring";
import { onThreshold } from "../systems/threshold";

const PAD = 16;
const STRIP_H = 80;
const LABEL_STYLE: TextStyleOptions = {
	fontSize: 11,
	fill: 0x8888aa,
	fontFamily: "monospace",
};
const VALUE_STYLE: TextStyleOptions = {
	fontSize: 22,
	fill: 0xffffff,
	fontFamily: "monospace",
	fontWeight: "bold",
};
const CLOCK_URGENT_FILL = 0xff4444;
const TOAST_COLOR = 0x00ffcc;
const TOAST_DURATION_MS = 900;
const CLOCK_PULSE_MS = 350;

const SHIFT_HINT_STORAGE_KEY = "shift-hint-seen";
const SHIFT_HINT_DURATION_MS = 5000;

const BTN_W = 44;
const BTN_H = 32;
const BTN_RADIUS = 6;
const pauseBtnStyle = new TextStyle({
	fontSize: 11,
	fill: 0x8888aa,
	fontFamily: "monospace",
	fontWeight: "bold",
});

const container = new Container();
const bgPanel = new Graphics();

const scoreLabel = new Text({ text: "SCORE", style: LABEL_STYLE });
const scoreValue = new Text({ text: "0", style: VALUE_STYLE });

const clockValueStyle = new TextStyle({ ...VALUE_STYLE });
const modeBadgeStyle = new TextStyle({
	fontSize: 10,
	fill: 0x445566,
	fontFamily: "monospace",
});

const clockLabel = new Text({ text: "TIME", style: LABEL_STYLE });
const clockValue = new Text({ text: "30.0", style: clockValueStyle });
const modeBadge = new Text({ text: "", style: modeBadgeStyle });
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

type BtnState = "default" | "hover" | "pressed";
let pauseBtnState: BtnState = "default";

const pauseBtn = new Container();
const pauseBtnBg = new Graphics();
const pauseBtnText = new Text({ text: "PAUSE", style: pauseBtnStyle });

function drawPauseBtn(): void {
	pauseBtnBg.clear();

	if (pauseBtnState === "default") {
		pauseBtnBg
			.roundRect(0, 0, BTN_W, BTN_H, BTN_RADIUS)
			.stroke({ color: 0x8888aa, width: 1, alpha: 0.7 });
		pauseBtnStyle.fill = 0x8888aa;
	} else if (pauseBtnState === "hover") {
		pauseBtnBg
			.roundRect(0, 0, BTN_W, BTN_H, BTN_RADIUS)
			.fill({ color: 0x00ffcc, alpha: 0.18 })
			.stroke({ color: 0x00ffcc, width: 1, alpha: 0.9 });
		pauseBtnStyle.fill = 0xffffff;
	} else {
		pauseBtnBg
			.roundRect(0, 0, BTN_W, BTN_H, BTN_RADIUS)
			.fill({ color: 0x00ffcc, alpha: 0.35 })
			.stroke({ color: 0x00ffcc, width: 1, alpha: 1.0 });
		pauseBtnStyle.fill = 0x00ffcc;
	}

	pauseBtnText.position.set(
		(BTN_W - pauseBtnText.width) / 2,
		(BTN_H - pauseBtnText.height) / 2,
	);
}

let toastProgress = 0; // 0–1 over TOAST_DURATION_MS
let toastActive = false;
let clockPulse = 0; // ms remaining in scale pulse

// First-run SHIFT hint — shown once ever, dismissed after SHIFT_HINT_DURATION_MS or on first SHIFT use.
const shiftHintText = new Text({
	text: "SHIFT — cursor mode",
	style: { fontSize: 11, fill: 0x556677, fontFamily: "monospace" },
});
shiftHintText.anchor.set(0.5, 0);
shiftHintText.alpha = 0;
let shiftHintActive = false;
let shiftHintTimer = 0;
let shiftHintTriggered = false;

export function initHud(): void {
	pauseBtn.addChild(pauseBtnBg, pauseBtnText);
	pauseBtn.eventMode = "static";
	pauseBtn.cursor = "pointer";
	pauseBtn.hitArea = new Rectangle(0, 0, BTN_W, BTN_H);
	pauseBtn.on("pointerover", () => {
		pauseBtnState = "hover";
		drawPauseBtn();
	});
	pauseBtn.on("pointerout", () => {
		pauseBtnState = "default";
		drawPauseBtn();
	});
	pauseBtn.on("pointerdown", () => {
		pauseBtnState = "pressed";
		drawPauseBtn();
	});
	pauseBtn.on("pointerup", () => {
		pauseBtnState = "hover";
		drawPauseBtn();
		pauseGame();
	});
	pauseBtn.on("pointerupoutside", () => {
		pauseBtnState = "default";
		drawPauseBtn();
	});
	drawPauseBtn();

	container.addChild(bgPanel);
	container.addChild(scoreLabel, scoreValue);
	container.addChild(clockLabel, clockValue, modeBadge, zenLabel);
	container.addChild(toastText);
	container.addChild(pauseBtn);
	container.addChild(shiftHintText);
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
			modeBadgeStyle.fill = mode === "blitz" ? 0x774400 : 0x336677;
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
				clockValueStyle.fill = TOAST_COLOR;
			} else {
				clockValue.scale.set(1.0);
				clockValueStyle.fill = t < 5 ? CLOCK_URGENT_FILL : 0xffffff;
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
		pauseBtn.position.set(w - PAD - BTN_W, (STRIP_H - BTN_H) / 2);

		// ── First-run SHIFT hint ───────────────────────────────────────────────
		if (!shiftHintTriggered) {
			// localStorage can throw in private browsing (Firefox SecurityError) or
			// when storage is full (QuotaExceededError). Guard both calls so an
			// unhandled exception never kills the PixiJS ticker.
			shiftHintTriggered = true;
			let hintSeen = false;
			try {
				hintSeen = !!localStorage.getItem(SHIFT_HINT_STORAGE_KEY);
			} catch {
				/* storage unavailable */
			}
			if (!hintSeen) {
				shiftHintActive = true;
				shiftHintTimer = SHIFT_HINT_DURATION_MS;
				shiftHintText.position.set(w / 2, STRIP_H + 8);
			}
		}
		if (shiftHintActive) {
			shiftHintTimer -= ticker.deltaMS;
			if (cursorMode || shiftHintTimer <= 0) {
				shiftHintActive = false;
				shiftHintText.alpha = 0;
				try {
					localStorage.setItem(SHIFT_HINT_STORAGE_KEY, "1");
				} catch {
					/* storage unavailable */
				}
			} else {
				shiftHintText.alpha = shiftHintTimer < 1000 ? shiftHintTimer / 1000 : 1;
			}
		}
	});
}
