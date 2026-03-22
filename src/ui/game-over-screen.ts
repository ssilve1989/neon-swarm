import { Container, Graphics, Text } from "pixi.js";
import { app } from "../app";
import { getScore } from "../systems/scoring";
import { setState, onStateChange } from "../state";

const overlay = new Container();
const bg = new Graphics();

const titleText = new Text({
	text: "",
	style: {
		fontSize: 52,
		fill: 0xffffff,
		fontFamily: "monospace",
		fontWeight: "bold",
	},
});
const scoreText = new Text({
	text: "",
	style: { fontSize: 24, fill: 0xaaaacc, fontFamily: "monospace" },
});
const promptText = new Text({
	text: "",
	style: { fontSize: 14, fill: 0x5555aa, fontFamily: "monospace" },
});

let visible = true;
let targetAlpha = 1;

function startGame(): void {
	if (!visible) return;
	visible = false;
	targetAlpha = 0;
	setState("playing");
}

function showFor(state: "idle" | "game-over"): void {
	if (state === "idle") {
		titleText.text = "NEON SWARM";
		scoreText.text = "";
		promptText.text = "CLICK OR PRESS SPACE TO START";
	} else {
		titleText.text = "GAME OVER";
		scoreText.text = `SCORE  ${getScore().toLocaleString()}`;
		promptText.text = "CLICK OR PRESS SPACE TO PLAY AGAIN";
	}
	visible = true;
	targetAlpha = 1;
	overlay.eventMode = "static";
}

export function initGameOverScreen(): void {
	overlay.addChild(bg, titleText, scoreText, promptText);
	overlay.eventMode = "static";
	overlay.on("pointerdown", startGame);
	app.stage.addChild(overlay);

	window.addEventListener("keydown", (e) => {
		if (e.code === "Space" || e.code === "Enter") startGame();
	});

	onStateChange((state) => {
		if (state === "idle" || state === "game-over") showFor(state);
		else overlay.eventMode = "none";
	});

	// Show immediately — initial state is idle, onStateChange won't fire for it
	showFor("idle");

	app.ticker.add(() => {
		overlay.alpha += (targetAlpha - overlay.alpha) * 0.12;

		const w = app.screen.width;
		const h = app.screen.height;
		const mid = h / 2;

		bg.clear();
		bg.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0.78 });

		titleText.position.set(w / 2 - titleText.width / 2, mid - 70);
		scoreText.position.set(w / 2 - scoreText.width / 2, mid);
		promptText.position.set(w / 2 - promptText.width / 2, mid + 60);
	});
}
