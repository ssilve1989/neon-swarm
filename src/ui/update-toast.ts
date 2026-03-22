import { registerSW } from "virtual:pwa-register";

export function initUpdateToast(): void {
	const updateSW = registerSW({
		onNeedRefresh() {
			showToast(updateSW);
		},
	});
}

function showToast(updateSW: (reload?: boolean) => Promise<void>): void {
	const toast = document.createElement("div");
	toast.style.cssText = `
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 8, 18, 0.92);
		border: 1px solid rgba(0, 204, 255, 0.25);
		color: #aaddff;
		font-family: monospace;
		font-size: 13px;
		padding: 12px 20px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		gap: 16px;
		z-index: 9999;
		box-shadow: 0 0 24px rgba(0, 204, 255, 0.12);
		white-space: nowrap;
	`;

	const msg = document.createElement("span");
	msg.textContent = "New version available";

	const btn = document.createElement("button");
	btn.textContent = "Update";
	btn.style.cssText = `
		background: rgba(0, 204, 255, 0.1);
		border: 1px solid rgba(0, 204, 255, 0.5);
		color: #00ccff;
		font-family: monospace;
		font-size: 13px;
		padding: 4px 14px;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.15s;
	`;
	btn.addEventListener("mouseenter", () => {
		btn.style.background = "rgba(0, 204, 255, 0.2)";
	});
	btn.addEventListener("mouseleave", () => {
		btn.style.background = "rgba(0, 204, 255, 0.1)";
	});
	btn.addEventListener("click", () => updateSW(true));

	const dismiss = document.createElement("button");
	dismiss.textContent = "✕";
	dismiss.style.cssText = `
		background: none;
		border: none;
		color: rgba(0, 204, 255, 0.4);
		font-size: 14px;
		cursor: pointer;
		padding: 0 2px;
		line-height: 1;
	`;
	dismiss.addEventListener("click", () => toast.remove());

	toast.appendChild(msg);
	toast.appendChild(btn);
	toast.appendChild(dismiss);
	document.body.appendChild(toast);
}
