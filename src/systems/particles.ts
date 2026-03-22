import { Container, Sprite, Graphics } from "pixi.js";
import { app } from "../app";
import { getParticleCount } from "../utils/device-tier";
import { getState, onStateChange } from "../state";

export const PARTICLE_COUNT = getParticleCount();

const CELL_SIZE = 128;
let cellHeads = new Int32Array(0);
const cellNext = new Int32Array(PARTICLE_COUNT).fill(-1);
let gridCols = 0;
let gridRows = 0;

export function getParticlesInRegion(cx: number, cy: number, radius: number): number[] {
	const result: number[] = [];
	const minCellX = Math.max(0, Math.floor((cx - radius) / CELL_SIZE));
	const maxCellX = Math.min(gridCols - 1, Math.floor((cx + radius) / CELL_SIZE));
	const minCellY = Math.max(0, Math.floor((cy - radius) / CELL_SIZE));
	const maxCellY = Math.min(gridRows - 1, Math.floor((cy + radius) / CELL_SIZE));
	for (let cellRow = minCellY; cellRow <= maxCellY; cellRow++) {
		for (let cellCol = minCellX; cellCol <= maxCellX; cellCol++) {
			let idx = cellHeads[cellRow * gridCols + cellCol];
			while (idx !== -1) {
				result.push(idx);
				idx = cellNext[idx];
			}
		}
	}
	return result;
}

export const px = new Float32Array(PARTICLE_COUNT);
export const py = new Float32Array(PARTICLE_COUNT);
export const vx = new Float32Array(PARTICLE_COUNT);
export const vy = new Float32Array(PARTICLE_COUNT);

const sprites: Sprite[] = [];

export const PARTICLE_COLORS = [
	0x00ffff, 0xff00ff, 0x7700ff, 0x00ff88, 0xff4400, 0xccccff,
];
const SPEED_MIN = 0.3;
const SPEED_MAX = 0.9;

function createGlowTexture() {
	const g = new Graphics();
	g.circle(8, 8, 8);
	g.fill({ color: 0xffffff, alpha: 0.15 });
	g.circle(8, 8, 4);
	g.fill({ color: 0xffffff, alpha: 1.0 });
	return app.renderer.generateTexture(g);
}

function spawn(i: number): void {
	const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
	const angle = Math.random() * Math.PI * 2;
	px[i] = Math.random() * app.screen.width;
	py[i] = Math.random() * app.screen.height;
	vx[i] = Math.cos(angle) * speed;
	vy[i] = Math.sin(angle) * speed;
}

export function absorbParticle(i: number): void {
	spawn(i);
	sprites[i].alpha = 0.4 + Math.random() * 0.6;
}

export function initParticles(): void {
	const texture = createGlowTexture();
	const container = new Container();
	app.stage.addChild(container);

	for (let i = 0; i < PARTICLE_COUNT; i++) {
		const sprite = new Sprite(texture);
		sprite.anchor.set(0.5);
		sprite.blendMode = "add";
		sprite.tint = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
		sprite.alpha = 0.4 + Math.random() * 0.6;
		sprite.scale.set(0.3 + Math.random() * 1.2);
		sprites.push(sprite);
		container.addChild(sprite);
		spawn(i);
	}

	let prevState = getState();
	onStateChange((state) => {
		if (state === "playing" && prevState !== "paused") {
			for (let i = 0; i < PARTICLE_COUNT; i++) {
				spawn(i);
				sprites[i].alpha = 0.4 + Math.random() * 0.6;
			}
		}
		prevState = state;
	});

	app.ticker.add((ticker) => {
		const w = app.screen.width;
		const h = app.screen.height;
		const dt = ticker.deltaTime;

		// Pass 1: update positions + wrap
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			px[i] += vx[i] * dt;
			py[i] += vy[i] * dt;
			if (px[i] < 0) px[i] += w;
			else if (px[i] >= w) px[i] -= w;
			if (py[i] < 0) py[i] += h;
			else if (py[i] >= h) py[i] -= h;
		}

		// Pass 2: rebuild spatial grid
		const newCols = Math.ceil(w / CELL_SIZE);
		const newRows = Math.ceil(h / CELL_SIZE);
		const cellCount = newCols * newRows;
		if (gridCols !== newCols || gridRows !== newRows || cellHeads.length < cellCount) {
			gridCols = newCols;
			gridRows = newRows;
			cellHeads = new Int32Array(cellCount).fill(-1);
		} else {
			cellHeads.fill(-1);
		}
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const cellX = Math.floor(px[i] / CELL_SIZE);
			const cellY = Math.floor(py[i] / CELL_SIZE);
			const cellIdx = cellY * gridCols + cellX;
			cellNext[i] = cellHeads[cellIdx];
			cellHeads[cellIdx] = i;
		}

		// Pass 3: write sprite positions
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			sprites[i].x = px[i];
			sprites[i].y = py[i];
		}
	});
}
