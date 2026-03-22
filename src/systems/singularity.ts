import { Container, Sprite } from "pixi.js";
import { app } from "../app";
import { pointer } from "./input";

export const EVENT_HORIZON_RADIUS = 20;
export const ABSORPTION_RADIUS = 30;
export const INFLUENCE_RADIUS = 120;

const INFLUENCE_RATIO = INFLUENCE_RADIUS / ABSORPTION_RADIUS;
let currentAbsorptionRadius = ABSORPTION_RADIUS;
let currentInfluenceRadius = INFLUENCE_RADIUS;

const container = new Container();
const diskContainer = new Container();
let lensSprite: Sprite;
let hotSprite: Sprite;

// Hot spot color lerp state (RGB 0-255)
const cur = { r: 255, g: 255, b: 255 };
const tgt = { r: 255, g: 255, b: 255 };
const LERP = 0.03;

function makeSprite(
	size: number,
	draw: (ctx: CanvasRenderingContext2D, c: number) => void,
): Sprite {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	draw(canvas.getContext("2d")!, size / 2);
	return Sprite.from(canvas);
}

// Outer gravitational lensing halo
function buildLens(): Sprite {
	const SIZE = 256;
	const sprite = makeSprite(SIZE, (ctx, c) => {
		const g = ctx.createRadialGradient(c, c, 0, c, c, c);
		g.addColorStop(0.0, "rgba(0,220,255,0.20)");
		g.addColorStop(0.25, "rgba(0,140,255,0.09)");
		g.addColorStop(0.6, "rgba(0,60,180,0.04)");
		g.addColorStop(1.0, "rgba(0,0,0,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, SIZE, SIZE);
	});
	sprite.blendMode = "add";
	sprite.anchor.set(0.5);
	return sprite;
}

// Accretion disk ring — pure gradient, no hot spot (hot spot is a separate tintable sprite)
function buildDiskRing(): Sprite {
	const SIZE = 128;
	const sprite = makeSprite(SIZE, (ctx, c) => {
		const g = ctx.createRadialGradient(c, c, 0, c, c, c);
		g.addColorStop(0.0, "rgba(0,0,0,0)");
		g.addColorStop(0.3, "rgba(0,0,0,0)");
		g.addColorStop(0.35, "rgba(20,50,220,0.80)");
		g.addColorStop(0.47, "rgba(0,200,255,1.00)");
		g.addColorStop(0.52, "rgba(255,255,255,1.00)");
		g.addColorStop(0.6, "rgba(255,150,20,0.80)");
		g.addColorStop(0.7, "rgba(180,40,0,0.35)");
		g.addColorStop(0.85, "rgba(0,0,0,0)");
		g.addColorStop(1.0, "rgba(0,0,0,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, SIZE, SIZE);
	});
	sprite.blendMode = "add";
	sprite.anchor.set(0.5);
	return sprite;
}

// Hot spot — pure white radial glow, positioned on the ring so tint = absorbed color
// Sits at r≈33px from disk center (ring peak), receives tint from setHotSpotColor
function buildHotSpot(): Sprite {
	const SIZE = 56;
	const sprite = makeSprite(SIZE, (ctx, c) => {
		const g = ctx.createRadialGradient(c, c, 0, c, c, c * 0.85);
		g.addColorStop(0.0, "rgba(255,255,255,1.00)");
		g.addColorStop(0.4, "rgba(255,255,255,0.50)");
		g.addColorStop(1.0, "rgba(0,0,0,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, SIZE, SIZE);
	});
	sprite.blendMode = "add";
	sprite.anchor.set(0.5);
	return sprite;
}

// Photon sphere — soft cyan rim at event horizon boundary
function buildRim(): Sprite {
	const SIZE = 64;
	const sprite = makeSprite(SIZE, (ctx, c) => {
		const g = ctx.createRadialGradient(c, c, 10, c, c, c);
		g.addColorStop(0.0, "rgba(0,0,0,0)");
		g.addColorStop(0.45, "rgba(0,180,255,0.55)");
		g.addColorStop(0.65, "rgba(100,210,255,0.25)");
		g.addColorStop(1.0, "rgba(0,0,0,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, SIZE, SIZE);
	});
	sprite.blendMode = "add";
	sprite.anchor.set(0.5);
	return sprite;
}

// Event horizon — solid black void, normal blend so it occludes particles
function buildVoid(): Sprite {
	const SIZE = 52;
	const sprite = makeSprite(SIZE, (ctx, c) => {
		ctx.beginPath();
		ctx.arc(c, c, EVENT_HORIZON_RADIUS, 0, Math.PI * 2);
		ctx.fillStyle = "#000";
		ctx.fill();
	});
	sprite.anchor.set(0.5);
	return sprite;
}

// Called by absorption system each frame particles are absorbed
export function setHotSpotColor(hex: number): void {
	tgt.r = (hex >> 16) & 0xff;
	tgt.g = (hex >> 8) & 0xff;
	tgt.b = hex & 0xff;
}

export function setRadius(absorptionRadius: number): void {
	currentAbsorptionRadius = absorptionRadius;
	currentInfluenceRadius = absorptionRadius * INFLUENCE_RATIO;
	if (lensSprite) lensSprite.scale.set(currentInfluenceRadius / 128);
	diskContainer.scale.set(absorptionRadius / ABSORPTION_RADIUS);
}

export function getRadius(): number {
	return currentAbsorptionRadius;
}

export function getInfluenceRadius(): number {
	return currentInfluenceRadius;
}

const _pos = { x: 0, y: 0 };
export function getSingularityPosition(): { x: number; y: number } {
	_pos.x = container.x;
	_pos.y = container.y;
	return _pos;
}

export function initSingularity(): void {
	lensSprite = buildLens();
	const ring = buildDiskRing();
	hotSprite = buildHotSpot();
	const rim = buildRim();
	const void_ = buildVoid();

	lensSprite.scale.set(INFLUENCE_RADIUS / 128);

	// Hot spot sits at ring peak (r≈33px from disk center), rotates with disk
	hotSprite.position.set(33, 0);
	diskContainer.addChild(ring);
	diskContainer.addChild(hotSprite);

	// Layer order: lens → rotating disk (ring + hot spot) → rim → void
	container.addChild(lensSprite);
	container.addChild(diskContainer);
	container.addChild(rim);
	container.addChild(void_);

	app.stage.addChild(container);
	app.canvas.style.cursor = "none";

	const ROTATION_SPEED = 0.015;
	const MOVE_LERP = 0.05;
	app.ticker.add((ticker) => {
		const t = 1 - (1 - MOVE_LERP) ** ticker.deltaTime;
		container.x += (pointer.x - container.x) * t;
		container.y += (pointer.y - container.y) * t;
		diskContainer.rotation += ROTATION_SPEED * ticker.deltaTime;

		// Lerp hot spot color toward dominant absorbed color
		cur.r += (tgt.r - cur.r) * LERP;
		cur.g += (tgt.g - cur.g) * LERP;
		cur.b += (tgt.b - cur.b) * LERP;
		hotSprite.tint =
			(Math.round(cur.r) << 16) | (Math.round(cur.g) << 8) | Math.round(cur.b);
	});
}
