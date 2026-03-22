import { Container, Text, Graphics } from "pixi.js";
import { app } from "../app";
import { getScore } from "../systems/scoring";
import { getMultiplier, getComboTimer } from "../systems/combo";
import { getTimeRemaining } from "../systems/clock";
import { getState } from "../state";

const PAD = 16;
const STRIP_H = 80; // height of the dark background strip
const LABEL_STYLE = { fontSize: 11, fill: 0x8888aa, fontFamily: "monospace" };
const VALUE_STYLE = {
	fontSize: 22,
	fill: 0xffffff,
	fontFamily: "monospace",
	fontWeight: "bold",
};
const CLOCK_URGENT_FILL = 0xff4444; // color when < 5s

const container = new Container();
const bgPanel = new Graphics();

const scoreLabel = new Text({ text: "SCORE", style: LABEL_STYLE });
const scoreValue = new Text({ text: "0", style: VALUE_STYLE });

const clockLabel = new Text({ text: "TIME", style: LABEL_STYLE });
const clockValue = new Text({ text: "30.0", style: { ...VALUE_STYLE } });

const comboLabel = new Text({ text: "COMBO", style: LABEL_STYLE });
const comboValue = new Text({ text: "1×", style: VALUE_STYLE });
const comboBar = new Graphics();

export function initHud(): void {
	container.addChild(bgPanel);
	container.addChild(scoreLabel, scoreValue);
	container.addChild(clockLabel, clockValue);
	container.addChild(comboLabel, comboValue, comboBar);
	app.stage.addChild(container);

	app.ticker.add(() => {
		if (getState() === "idle") return;

		const w = app.screen.width;
		const BAR_W = 120;
		const BAR_H = 6;

		// ── Background strip ──────────────────────────────────────────────────
		bgPanel.clear();
		bgPanel.rect(0, 0, w, STRIP_H).fill({ color: 0x000000, alpha: 0.55 });

		// ── Score (top-left) ──────────────────────────────────────────────────
		scoreLabel.position.set(PAD, PAD);
		scoreValue.position.set(PAD, PAD + 14);
		scoreValue.text = getScore().toLocaleString();

		// ── Clock (top-center) ────────────────────────────────────────────────
		const t = getTimeRemaining();
		clockValue.text = t.toFixed(1);
		(clockValue.style as { fill: number }).fill =
			t < 5 ? CLOCK_URGENT_FILL : 0xffffff;
		clockLabel.position.set(w / 2 - clockValue.width / 2, PAD);
		clockValue.position.set(w / 2 - clockValue.width / 2, PAD + 14);

		// ── Combo + bar (top-right) ───────────────────────────────────────────
		const mult = getMultiplier();
		comboValue.text = `${mult}×`;
		const comboX = w - PAD - BAR_W;
		comboLabel.position.set(comboX, PAD);
		comboValue.position.set(comboX, PAD + 14);

		const fill = getComboTimer();
		comboBar.clear();
		// track
		comboBar.rect(comboX, PAD + 42, BAR_W, BAR_H).fill({ color: 0x333355 });
		// fill
		if (fill > 0) {
			comboBar
				.rect(comboX, PAD + 42, BAR_W * fill, BAR_H)
				.fill({ color: 0x00ccff });
		}
	});
}
