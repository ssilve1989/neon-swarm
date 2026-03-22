import { Container, Graphics, Text } from "pixi.js";
import { app } from "../app";
import { getScore } from "../systems/scoring";
import { restartGame, changeMode, onStateChange } from "../state";

const overlay = new Container();
const bg = new Graphics();

const titleText = new Text({
	text: "GAME OVER",
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
const restartText = new Text({
	text: "CLICK OR PRESS SPACE TO PLAY AGAIN",
	style: { fontSize: 14, fill: 0x5555aa, fontFamily: "monospace" },
});
const changeModeText = new Text({
	text: "CLICK OR PRESS M TO CHANGE MODE",
	style: { fontSize: 12, fill: 0x444477, fontFamily: "monospace" },
});

let targetAlpha = 0;

function handleRestart(): void {
	if (targetAlpha === 0) return;
	targetAlpha = 0;
	overlay.eventMode = "none";
	restartGame();
}

function handleChangeMode(): void {
	if (targetAlpha === 0) return;
	targetAlpha = 0;
	overlay.eventMode = "none";
	changeMode();
}

export function initGameOverScreen(): void {
	changeModeText.eventMode = "static";
	changeModeText.cursor = "pointer";
	changeModeText.on("pointerdown", (e) => {
		e.stopPropagation();
		handleChangeMode();
	});

	overlay.addChild(bg, titleText, scoreText, restartText, changeModeText);
	overlay.eventMode = "none";
	overlay.alpha = 0;
	overlay.on("pointerdown", handleRestart);
	app.stage.addChild(overlay);

	window.addEventListener("keydown", (e) => {
		if (overlay.alpha < 0.5) return;
		if (e.code === "Space" || e.code === "Enter") handleRestart();
		if (e.code === "KeyM") handleChangeMode();
	});

	onStateChange((state) => {
		if (state === "game-over") {
			scoreText.text = `SCORE  ${getScore().toLocaleString()}`;
			targetAlpha = 1;
			overlay.eventMode = "static";
		} else {
			targetAlpha = 0;
			overlay.eventMode = "none";
		}
	});

	app.ticker.add(() => {
		overlay.alpha += (targetAlpha - overlay.alpha) * 0.12;

		const w = app.screen.width;
		const h = app.screen.height;
		const mid = h / 2;

		bg.clear();
		bg.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0.78 });

		titleText.position.set(w / 2 - titleText.width / 2, mid - 70);
		scoreText.position.set(w / 2 - scoreText.width / 2, mid);
		restartText.position.set(w / 2 - restartText.width / 2, mid + 60);
		changeModeText.position.set(w / 2 - changeModeText.width / 2, mid + 86);
	});
}
