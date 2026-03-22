import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		VitePWA({
			registerType: "prompt",
			devOptions: {
				enabled: true,
			},
			manifest: {
				name: "Neon Swarm Sucker",
				short_name: "Neon Swarm",
				description: "An arcade particle-absorption game",
				id: "/",
				start_url: "/",
				theme_color: "#000000",
				background_color: "#000000",
				display: "fullscreen",
				orientation: "landscape",
				icons: [
					{
						src: "/icon.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,mp3}"],
				globIgnores: ["**/node_modules/**/*", "favicon.png"],
				navigateFallback: "/index.html",
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/www\.googletagmanager\.com\/gtag\/js/,
						handler: "StaleWhileRevalidate",
						options: {
							cacheName: "ga4-gtag-js",
						},
					},
					{
						urlPattern: /^https:\/\/www\.google-analytics\.com\/.*/,
						handler: "NetworkOnly",
						method: "POST",
						options: {
							backgroundSync: {
								name: "ga4-analytics-queue",
								options: {
									maxRetentionTime: 60 * 48,
								},
							},
						},
					},
					{
						urlPattern: /^https:\/\/analytics\.google\.com\/.*/,
						handler: "NetworkOnly",
						method: "POST",
						options: {
							backgroundSync: {
								name: "ga4-analytics-queue",
								options: {
									maxRetentionTime: 60 * 48,
								},
							},
						},
					},
				],
			},
		}),
	],
});
