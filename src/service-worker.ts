/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `rpd-v2-${version}`;
const ASSETS = [...build, ...files];
const ASSET_SET = new Set(ASSETS);

sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			await cache.addAll(ASSETS);
			// Skip waiting so the new SW activates immediately
			await sw.skipWaiting();
		})()
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== sw.location.origin) return;

	// Navigation requests (HTML pages): NETWORK-FIRST — always try fresh
	// to pick up new deploys; fall back to cache only when offline
	const isNavigation =
		request.mode === 'navigate' ||
		(request.headers.get('accept') ?? '').includes('text/html');

	if (isNavigation) {
		event.respondWith(
			(async () => {
				try {
					const fresh = await fetch(request);
					const cache = await caches.open(CACHE);
					cache.put(request, fresh.clone());
					return fresh;
				} catch {
					const cached = await caches.match(request);
					return cached ?? new Response('Offline', { status: 503 });
				}
			})()
		);
		return;
	}

	// Hashed assets (JS/CSS chunks with version in URL): CACHE-FIRST is safe
	// because URLs change on every build
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			if (ASSET_SET.has(url.pathname)) {
				const cached = await cache.match(request);
				if (cached) return cached;
			}

			try {
				const response = await fetch(request);
				if (response.ok && response.type === 'basic') {
					cache.put(request, response.clone());
				}
				return response;
			} catch {
				const cached = await cache.match(request);
				if (cached) return cached;
				return new Response('Offline', { status: 503, statusText: 'Offline' });
			}
		})()
	);
});

sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') sw.skipWaiting();
});
