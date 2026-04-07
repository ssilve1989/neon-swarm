import { Container, Graphics, Text } from "pixi.js";
import { app } from "../app";
import { changeMode, getMode, onStateChange, restartGame } from "../state";
import { checkAndSave, getPersonalBest } from "../systems/high-score";
import { getScore } from "../systems/scoring";

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
const pbBestText = new Text({
	text: "PERSONAL BEST!",
	style: { fontSize: 16, fill: 0xffa500, fontFamily: "monospace" },
});
const pbPrevText = new Text({
	text: "",
	style: { fontSize: 14, fill: 0x887799, fontFamily: "monospace" },
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
	pbBestText.visible = false;
	pbPrevText.visible = false;

	changeModeText.eventMode = "static";
	changeModeText.cursor = "pointer";
	changeModeText.on("pointerdown", (e) => {
		e.stopPropagation();
		handleChangeMode();
	});

	overlay.addChild(
		bg,
		titleText,
		scoreText,
		pbBestText,
		pbPrevText,
		restartText,
		changeModeText,
	);
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
			const score = getScore();
			const mode = getMode();

			scoreText.text = `SCORE  ${score.toLocaleString()}`;

			if (mode !== null) {
				const prev = getPersonalBest(mode);
				const isNewPb = checkAndSave(mode, score);

				if (prev === null) {
					// First play in this mode — save silently, show nothing
					pbBestText.visible = false;
					pbPrevText.visible = false;
				} else if (isNewPb) {
					pbBestText.visible = true;
					pbPrevText.visible = false;
				} else {
					pbPrevText.text = `BEST  ${prev.toLocaleString()}`;
					pbPrevText.visible = true;
					pbBestText.visible = false;
				}
			}

			targetAlpha = 1;
			overlay.eventMode = "static";
		} else {
			pbBestText.visible = false;
			pbPrevText.visible = false;
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
		pbBestText.position.set(w / 2 - pbBestText.width / 2, mid + 28);
		pbPrevText.position.set(w / 2 - pbPrevText.width / 2, mid + 28);
		restartText.position.set(w / 2 - restartText.width / 2, mid + 68);
		changeModeText.position.set(w / 2 - changeModeText.width / 2, mid + 92);
	});
}
