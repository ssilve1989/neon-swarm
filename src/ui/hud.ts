import { Container, Graphics, Rectangle, Text } from "pixi.js";
import { app } from "../app";
import { getScore } from "../systems/scoring";
import { getMultiplier, getComboTimer } from "../systems/combo";
import { getTimeRemaining } from "../systems/clock";
import { getState, getMode, pauseGame } from "../state";

const PAD              = 16;
const STRIP_H          = 80;
const LABEL_STYLE      = { fontSize: 11, fill: 0x8888aa, fontFamily: "monospace" };
const VALUE_STYLE      = { fontSize: 22, fill: 0xffffff, fontFamily: "monospace", fontWeight: "bold" };
const CLOCK_URGENT_FILL = 0xff4444;

const container = new Container();
const bgPanel   = new Graphics();

const scoreLabel = new Text({ text: "SCORE", style: LABEL_STYLE });
const scoreValue = new Text({ text: "0",     style: VALUE_STYLE });

const clockLabel = new Text({ text: "TIME",  style: LABEL_STYLE });
const clockValue = new Text({ text: "30.0",  style: { ...VALUE_STYLE } });
const modeBadge  = new Text({ text: "",      style: { fontSize: 10, fill: 0x445566, fontFamily: "monospace" } });
const zenLabel   = new Text({ text: "ZEN",   style: { fontSize: 22, fill: 0x9944ff, fontFamily: "monospace", fontWeight: "bold" } });

const comboLabel = new Text({ text: "COMBO", style: LABEL_STYLE });
const comboValue = new Text({ text: "1×",    style: VALUE_STYLE });
const comboBar   = new Graphics();

const pauseBtn     = new Container();
const pauseBtnText = new Text({ text: "II", style: { fontSize: 13, fill: 0x5555aa, fontFamily: "monospace" } });

export function initHud(): void {
	pauseBtn.addChild(pauseBtnText);
	pauseBtn.eventMode = "static";
	pauseBtn.cursor    = "pointer";
	pauseBtn.on("pointerdown", pauseGame);

	container.addChild(bgPanel);
	container.addChild(scoreLabel, scoreValue);
	container.addChild(clockLabel, clockValue, modeBadge, zenLabel);
	container.addChild(comboLabel, comboValue, comboBar);
	container.addChild(pauseBtn);
	app.stage.addChild(container);

	window.addEventListener("keydown", (e) => {
		if ((e.code === "Escape" || e.code === "KeyP") && getState() === "playing") {
			pauseGame();
		}
	});

	app.ticker.add(() => {
		const state = getState();

		// HUD visible during playing and paused (frozen values show behind pause overlay)
		if (state !== "playing" && state !== "paused") {
			container.visible = false;
			return;
		}
		container.visible = true;
		if (state !== "playing") return;

		const w    = app.screen.width;
		const BAR_W = 120;
		const BAR_H = 6;
		const mode  = getMode();

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
			modeBadge.visible  = false;
			zenLabel.visible   = true;
			zenLabel.position.set(w / 2 - zenLabel.width / 2, PAD + 14);
		} else {
			zenLabel.visible   = false;
			clockLabel.visible = true;
			clockValue.visible = true;
			modeBadge.visible  = true;

			const t = getTimeRemaining();
			clockValue.text = t.toFixed(1);
			(clockValue.style as { fill: number }).fill = t < 5 ? CLOCK_URGENT_FILL : 0xffffff;
			clockLabel.position.set(w / 2 - clockValue.width / 2, PAD);
			clockValue.position.set(w / 2 - clockValue.width / 2, PAD + 14);

			modeBadge.text = mode === "blitz" ? "BLITZ" : "STANDARD";
			(modeBadge.style as { fill: number }).fill = mode === "blitz" ? 0x774400 : 0x336677;
			modeBadge.position.set(w / 2 - modeBadge.width / 2, PAD + 40);
		}

		// ── Combo + bar (top-right) ───────────────────────────────────────────
		const mult   = getMultiplier();
		comboValue.text = `${mult}×`;
		const comboX = w - PAD - BAR_W;
		comboLabel.position.set(comboX, PAD);
		comboValue.position.set(comboX, PAD + 14);

		const fill = getComboTimer();
		comboBar.clear();
		comboBar.rect(comboX, PAD + 42, BAR_W, BAR_H).fill({ color: 0x333355 });
		if (fill > 0) {
			comboBar.rect(comboX, PAD + 42, BAR_W * fill, BAR_H).fill({ color: 0x00ccff });
		}

		// ── Pause button (top-right corner, above combo) ──────────────────────
		const btnW = pauseBtnText.width;
		const btnH = pauseBtnText.height;
		pauseBtn.hitArea = new Rectangle(-4, -4, btnW + 8, btnH + 8);
		pauseBtn.position.set(w - PAD - btnW, 6);
	});
}
