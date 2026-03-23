import { onStateChange } from "../state";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
	prompt(): Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DISMISS_KEY = "neon-swarm-install-dismissed";

// Z-index layering: canvas (no z-index) < install button (9990) < install modal
// (9991) < update-toast (9999, ephemeral). Stacking is intentional — the update
// toast always appears above the persistent install button.
const Z_BUTTON = "9990";
const Z_MODAL = "9991";

// ── Platform detection ────────────────────────────────────────────────────────
function isIOS(): boolean {
	return (
		/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
	);
}

function isStandalone(): boolean {
	return window.matchMedia("(display-mode: standalone)").matches;
}

function isDismissed(): boolean {
	return localStorage.getItem(DISMISS_KEY) === "1";
}

// ── Module state ──────────────────────────────────────────────────────────────
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let wrapperEl: HTMLElement | null = null;

// Capture beforeinstallprompt as early as possible (before any user gesture).
// This must run at module scope — moving it inside initPwaInstallButton would
// miss the event if the browser fires it before init is called.
window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault();
	deferredPrompt = e as BeforeInstallPromptEvent;
	showIfEligible();
});

// ── Visibility helpers ────────────────────────────────────────────────────────
function isEligible(): boolean {
	if (isStandalone()) return false;
	if (isIOS()) return !isDismissed();
	return deferredPrompt !== null;
}

function showIfEligible(): void {
	if (!wrapperEl || !isEligible()) return;
	wrapperEl.style.display = "flex";
}

function hide(): void {
	if (!wrapperEl) return;
	wrapperEl.style.display = "none";
}

// ── iOS instruction modal ─────────────────────────────────────────────────────
function showIOSModal(): void {
	const backdrop = document.createElement("div");
	backdrop.setAttribute("role", "dialog");
	backdrop.setAttribute("aria-modal", "true");
	backdrop.setAttribute("aria-label", "Install Neon Swarm instructions");
	backdrop.style.cssText = `
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.72);
		z-index: ${Z_MODAL};
	`;

	const card = document.createElement("div");
	card.style.cssText = `
		position: relative;
		background: rgba(0, 8, 18, 0.96);
		border: 1px solid rgba(0, 204, 255, 0.25);
		border-radius: 8px;
		padding: 28px 32px 24px;
		max-width: min(420px, calc(100vw - 48px));
		font-family: monospace;
		box-shadow: 0 0 32px rgba(0, 204, 255, 0.08);
	`;

	const heading = document.createElement("div");
	heading.textContent = "TO INSTALL NEON SWARM";
	heading.style.cssText = `
		font-size: 14px;
		font-weight: bold;
		color: #aaddff;
		letter-spacing: 0.06em;
		margin-bottom: 20px;
	`;

	const steps = document.createElement("ol");
	steps.style.cssText = `
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 14px;
		color: #aaddff;
		line-height: 2.0;
	`;
	[
		`Tap the <strong>Share</strong> button in Safari's toolbar`,
		`Scroll down and tap <strong>"Add to Home Screen"</strong>`,
		`Tap <strong>"Add"</strong> to confirm`,
	].forEach((text, i) => {
		const li = document.createElement("li");
		li.innerHTML = `<span style="color:rgba(0,204,255,0.4);margin-right:10px">${i + 1}</span>${text}`;
		steps.appendChild(li);
	});

	const note = document.createElement("div");
	note.textContent = "The game will open full-screen with no browser chrome.";
	note.style.cssText = `
		font-size: 12px;
		color: rgba(0, 204, 255, 0.4);
		margin-top: 18px;
		font-family: monospace;
	`;

	const dismissBtn = document.createElement("button");
	dismissBtn.textContent = "✕";
	dismissBtn.setAttribute("aria-label", "Close");
	dismissBtn.style.cssText = `
		position: absolute;
		top: 12px;
		right: 14px;
		background: none;
		border: none;
		color: rgba(0, 204, 255, 0.4);
		font-size: 16px;
		font-family: monospace;
		cursor: pointer;
		padding: 4px 6px;
		line-height: 1;
	`;
	dismissBtn.addEventListener("mouseenter", () => {
		dismissBtn.style.color = "rgba(0, 204, 255, 0.8)";
	});
	dismissBtn.addEventListener("mouseleave", () => {
		dismissBtn.style.color = "rgba(0, 204, 255, 0.4)";
	});
	dismissBtn.addEventListener("click", () => {
		backdrop.remove();
		localStorage.setItem(DISMISS_KEY, "1");
		hide();
	});

	card.appendChild(dismissBtn);
	card.appendChild(heading);
	card.appendChild(steps);
	card.appendChild(note);
	backdrop.appendChild(card);
	document.body.appendChild(backdrop);
	dismissBtn.focus();
}

// ── Click handler ─────────────────────────────────────────────────────────────
async function handleClick(): Promise<void> {
	if (isIOS()) {
		showIOSModal();
		return;
	}
	if (!deferredPrompt) return;

	// Null before await: prevents a second click mid-flight from calling
	// .prompt() again on the same event (double-click guard).
	const prompt = deferredPrompt;
	deferredPrompt = null;

	await prompt.prompt();
	const { outcome } = await prompt.userChoice;

	// BeforeInstallPromptEvent can only be .prompt()-ed once — clear it
	// regardless of outcome. isEligible() returns false without it, which
	// hides the button automatically on dismissed as well as accepted.
	if (outcome === "accepted") hide();
}

// ── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialises the PWA install button DOM overlay. Shows a non-intrusive
 * "+ ADD TO HOME SCREEN" chip on the mode-select screen when the app is
 * installable. Triggers the native OS install prompt on Chromium/Android;
 * shows a step-by-step instruction modal on iOS (no beforeinstallprompt API).
 * No-ops immediately if already running in standalone (installed) mode.
 */
export function initPwaInstallButton(): void {
	if (isStandalone()) return;

	wrapperEl = document.createElement("div");
	wrapperEl.style.cssText = `
		position: fixed;
		bottom: 48px;
		left: 50%;
		transform: translateX(-50%);
		display: none;
		z-index: ${Z_BUTTON};
	`;

	const btn = document.createElement("button");
	btn.textContent = "+ ADD TO HOME SCREEN";
	btn.setAttribute("aria-label", "Install Neon Swarm as an app");
	btn.style.cssText = `
		background: transparent;
		border: 1px solid rgba(0, 204, 255, 0.2);
		color: rgba(0, 204, 255, 0.55);
		font-family: monospace;
		font-size: 13px;
		padding: 8px 18px;
		border-radius: 4px;
		cursor: pointer;
		letter-spacing: 0.05em;
		white-space: nowrap;
		transition: border-color 0.15s, color 0.15s;
	`;
	btn.addEventListener("mouseenter", () => {
		btn.style.borderColor = "rgba(0, 204, 255, 0.5)";
		btn.style.color = "rgba(0, 204, 255, 0.85)";
	});
	btn.addEventListener("mouseleave", () => {
		btn.style.borderColor = "rgba(0, 204, 255, 0.2)";
		btn.style.color = "rgba(0, 204, 255, 0.55)";
	});
	btn.addEventListener("click", () => void handleClick());

	wrapperEl.appendChild(btn);
	document.body.appendChild(wrapperEl);

	// Hide button if the OS confirms installation (e.g. via browser UI, not our prompt)
	window.addEventListener("appinstalled", () => {
		hide();
		deferredPrompt = null;
	});

	// Show on mode-select, hide during gameplay. The listener is intentionally
	// page-lifetime (no unsubscribe) — this overlay exists for the full session.
	onStateChange((state) => {
		if (state === "mode-select" && window.innerHeight >= 400) {
			showIfEligible();
		} else {
			hide();
		}
	});

	// Initial state is already mode-select — onStateChange won't fire for it
	if (window.innerHeight >= 400) showIfEligible();
}
