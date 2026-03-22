import { onComboBreak } from "./combo";
import { onThreshold } from "./threshold";
import { onStateChange } from "../state";
import type { ThresholdTier } from "./threshold";

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

// Single bell tone per threshold tier
const TIER_FREQ: Record<ThresholdTier, number> = { 1: 523, 2: 659, 3: 784 };

function playThreshold(tier: ThresholdTier): void {
	const ac = getCtx();
	const osc = ac.createOscillator();
	const gain = ac.createGain();
	osc.connect(gain);
	gain.connect(ac.destination);
	osc.type = "triangle";
	osc.frequency.setValueAtTime(TIER_FREQ[tier], ac.currentTime);
	gain.gain.setValueAtTime(0.08, ac.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 1.0);
	osc.start(ac.currentTime);
	osc.stop(ac.currentTime + 1.0);
}

export function initAudio(): void {
	onStateChange((state) => {
		if (state === "playing") {
			bgm.currentTime = 0;
			bgm.play().catch(() => undefined);
		} else {
			bgm.pause();
		}
	});

	onComboBreak(() => playComboBreak());
	onThreshold((tier) => playThreshold(tier));
}
