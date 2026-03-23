import {
	defaultFilterVert,
	Filter,
	GlProgram,
	Graphics,
	UniformGroup,
} from "pixi.js";
import { app } from "../app";
import { onAbsorb } from "./absorption";
import { onThreshold } from "./threshold";

// ─── Bloom Flash ──────────────────────────────────────────────────────────────
const flash = new Graphics();
let flashAlpha = 0;

// ─── Chromatic Aberration ─────────────────────────────────────────────────────
const CHROMA_FRAG = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform float uOffset;
void main() {
  float r = texture(uTexture, vTextureCoord + vec2(uOffset, 0.0)).r;
  float g = texture(uTexture, vTextureCoord).g;
  float b = texture(uTexture, vTextureCoord - vec2(uOffset, 0.0)).b;
  float a = texture(uTexture, vTextureCoord).a;
  finalColor = vec4(r, g, b, a);
}`;

const chromaUniforms = new UniformGroup({ uOffset: { value: 0, type: "f32" } });
const chromaFilter = new Filter({
	glProgram: GlProgram.from({
		vertex: defaultFilterVert,
		fragment: CHROMA_FRAG,
		name: "chroma",
	}),
	resources: { chromaUniforms },
	padding: 4,
});
chromaFilter.enabled = false;

// CA ramp params — reserved for future use with an absorption-count driver
const CHROMA_MAX = 0.006;
const chromaTarget = 0;
let chromaCurrent = 0;

export function initVisualFeedback(): void {
	app.stage.addChild(flash);
	app.stage.filters = [chromaFilter];

	onAbsorb(() => {
		// TODO: drive CA ramp from absorption count when re-enabled
		void chromaTarget;
	});

	onThreshold(() => {
		flashAlpha = 0.35;
	});

	app.ticker.add(() => {
		const { width: w, height: h } = app.screen;

		// Bloom flash — white overlay, decay alpha
		if (flashAlpha > 0.004) {
			flash.clear();
			flash.rect(0, 0, w, h).fill({ color: 0xffffff, alpha: flashAlpha });
			flashAlpha *= 0.88;
		} else if (flashAlpha > 0) {
			flash.clear();
			flashAlpha = 0;
		}

		// Chromatic aberration — lerp toward target, enable/disable filter
		chromaCurrent += (chromaTarget - chromaCurrent) * 0.1;
		if (chromaCurrent > 0.0001) {
			chromaFilter.enabled = true;
			chromaUniforms.uniforms.uOffset = chromaCurrent;
		} else {
			chromaFilter.enabled = false;
		}
	});
}

// Suppress unused warning — kept for future CA driver
void CHROMA_MAX;
