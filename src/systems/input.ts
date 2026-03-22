import { app } from "../app";

export const pointer = { x: 0, y: 0 };

export function initInput(): void {
	// Default to screen center so singularity doesn't start at (0,0)
	pointer.x = app.screen.width / 2;
	pointer.y = app.screen.height / 2;

	app.stage.eventMode = "static";
	app.stage.hitArea = { contains: () => true };

	app.stage.on("pointermove", (e) => {
		pointer.x = e.global.x;
		pointer.y = e.global.y;
	});
}
