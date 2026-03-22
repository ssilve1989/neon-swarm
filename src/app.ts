import { Application } from "pixi.js";

export const app = new Application();

export async function initApp(): Promise<void> {
	await app.init({
		resizeTo: window,
		backgroundColor: 0x000000,
		antialias: false,
		preference: "webgl",
		powerPreference: "high-performance",
	});
	document.body.appendChild(app.canvas);
}
