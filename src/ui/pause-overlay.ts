import { Container, Graphics, Text } from "pixi.js";
import { app } from "../app";
import { resumeGame, endRun, quitToMenu, onStateChange } from "../state";

const FADE_SPEED = 0.12;

// ── PixiJS objects ────────────────────────────────────────────────────────────
const overlay  = new Container();
const screenBg = new Graphics();

const titleText = new Text({
	text: "PAUSED",
	style: { fontSize: 52, fill: 0xffffff, fontFamily: "monospace", fontWeight: "bold" },
});

type Option = { label: string; action: () => void };
const OPTIONS: Option[] = [
	{ label: "RESUME",       action: resumeGame },
	{ label: "END RUN",      action: endRun     },
	{ label: "QUIT TO MENU", action: quitToMenu },
];

const optionTexts = OPTIONS.map((o) =>
	new Text({
		text: o.label,
		style: { fontSize: 18, fill: 0x5555aa, fontFamily: "monospace" },
	}),
);

// ── Runtime state ─────────────────────────────────────────────────────────────
let targetAlpha = 0;
let focused     = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────
function confirmFocused(): void {
	if (overlay.alpha < 0.5) return;
	OPTIONS[focused].action();
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initPauseOverlay(): void {
	overlay.addChild(screenBg, titleText);

	optionTexts.forEach((t, i) => {
		t.eventMode = "static";
		t.cursor    = "pointer";
		t.on("pointerover",  () => { focused = i; });
		t.on("pointerdown",  (e) => { e.stopPropagation(); focused = i; confirmFocused(); });
		overlay.addChild(t);
	});

	overlay.alpha     = 0;
	overlay.eventMode = "none";
	app.stage.addChild(overlay);

	window.addEventListener("keydown", (e) => {
		if (overlay.alpha < 0.5) return;
		switch (e.code) {
			case "ArrowDown":
				focused = (focused + 1) % OPTIONS.length;
				break;
			case "ArrowUp":
				focused = (focused - 1 + OPTIONS.length) % OPTIONS.length;
				break;
			case "Enter":
				e.preventDefault();
				confirmFocused();
				break;
			case "Escape":
			case "KeyP":
				resumeGame();
				break;
		}
	});

	onStateChange((state) => {
		if (state === "paused") {
			targetAlpha       = 1;
			focused           = 0;
			overlay.eventMode = "static";
		} else {
			targetAlpha       = 0;
			overlay.eventMode = "none";
		}
	});

	app.ticker.add(() => {
		overlay.alpha += (targetAlpha - overlay.alpha) * FADE_SPEED;

		// Update focus highlight
		optionTexts.forEach((t, i) => {
			(t.style as { fill: number }).fill = i === focused ? 0xffffff : 0x5555aa;
		});

		const w   = app.screen.width;
		const h   = app.screen.height;
		const mid = h / 2;

		screenBg.clear();
		screenBg.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0.78 });

		titleText.position.set(w / 2 - titleText.width / 2, mid - 80);

		optionTexts.forEach((t, i) => {
			t.position.set(w / 2 - t.width / 2, mid - 10 + i * 36);
		});
	});
}
