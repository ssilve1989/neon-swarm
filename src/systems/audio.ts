import { onComboBreak } from "./combo";
import { onStateChange } from "../state";

const bgm = new Audio(
	new URL("../../assets/audio/nebula-drift.mp3", import.meta.url).href,
);
bgm.loop = true;
bgm.volume = 0.4;

// Web Audio context for effects — lazy init to satisfy autoplay policy
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
	if (!ctx) ctx = new AudioContext();
	return ctx;
}

// Soft descending sweep on combo break
function playComboBreak(): void {
	const ac = getCtx();
	const osc = ac.createOscillator();
	const gain = ac.createGain();
	osc.connect(gain);
	gain.connect(ac.destination);
	osc.type = "sine";
	osc.frequency.setValueAtTime(280, ac.currentTime);
	osc.frequency.linearRampToValueAtTime(90, ac.currentTime + 0.5);
	gain.gain.setValueAtTime(0.05, ac.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.5);
	osc.start(ac.currentTime);
	osc.stop(ac.currentTime + 0.5);
}


export function initAudio(): void {
	let gameIsPlaying = false;

	onStateChange((state) => {
		gameIsPlaying = state === "playing";
		if (gameIsPlaying) {
			bgm.currentTime = 0;
			bgm.play().catch(() => undefined);
		} else {
			bgm.pause();
		}
	});

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			bgm.pause();
		} else if (gameIsPlaying) {
			bgm.play().catch(() => undefined);
		}
	});

	onComboBreak(() => playComboBreak());
}
