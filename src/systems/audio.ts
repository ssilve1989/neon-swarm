import { getMode, onStateChange } from "../state";
import { onThreshold } from "./threshold";

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

// Ascending two-oscillator chime on clock extension (+5s granted)
function playTimeExtension(): void {
	const ac = getCtx();

	// Oscillator 1: sine body — C5 → G5
	const osc1 = ac.createOscillator();
	const gain1 = ac.createGain();
	osc1.connect(gain1);
	gain1.connect(ac.destination);
	osc1.type = "sine";
	osc1.frequency.setValueAtTime(523, ac.currentTime);
	osc1.frequency.linearRampToValueAtTime(784, ac.currentTime + 0.2);
	gain1.gain.setValueAtTime(0, ac.currentTime);
	gain1.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.01);
	gain1.gain.setValueAtTime(0.12, ac.currentTime + 0.09);
	gain1.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
	osc1.start(ac.currentTime);
	osc1.stop(ac.currentTime + 0.35);

	// Oscillator 2: triangle shimmer — C6 → G6 (one octave up, 30% gain)
	const osc2 = ac.createOscillator();
	const gain2 = ac.createGain();
	osc2.connect(gain2);
	gain2.connect(ac.destination);
	osc2.type = "triangle";
	osc2.frequency.setValueAtTime(1046, ac.currentTime);
	osc2.frequency.linearRampToValueAtTime(1568, ac.currentTime + 0.2);
	gain2.gain.setValueAtTime(0, ac.currentTime);
	gain2.gain.linearRampToValueAtTime(0.036, ac.currentTime + 0.01);
	gain2.gain.setValueAtTime(0.036, ac.currentTime + 0.09);
	gain2.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
	osc2.start(ac.currentTime);
	osc2.stop(ac.currentTime + 0.35);
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

	// Clock extension chime — Standard mode only (time is only granted in Standard)
	onThreshold(() => {
		if (getMode() === "standard") playTimeExtension();
	});
}
