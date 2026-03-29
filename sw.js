// LinguaKids Progressive Service Worker v7
// Copyright © 2026 ThS.BS CK2. Lê Trọng Thiên Long. All rights reserved.
// Strategy: Stale-While-Revalidate for shell, Cache-First for immutable assets,
// Network-First for public video manifests, Network-Only for streamed video.
const CACHE_NAME = 'linguakids-v7';
const DATA_CACHE = 'linguakids-data-v6';
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '');
const INDEX_URL = `${BASE_PATH}/index.html`;

// Core shell assets
const SHELL_ASSETS = [
    `${BASE_PATH}/`,
    INDEX_URL,
    `${BASE_PATH}/manifest.json`,
    `${BASE_PATH}/copyright-notice.txt`,
];

// Data file patterns to cache aggressively
const DATA_PATTERNS = [
    /\/assets\/.*\.js$/,   // Bundled JS (contains data files)
    /\/assets\/.*\.css$/,  // Styles
];

const NETWORK_FIRST_PATTERNS = [
    /\/data\/video-manifests\/.*\.json$/,
];

const API_PATTERNS = [
    /api\.quotable\.io/,
    /api\.dictionaryapi\.dev/,
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME && k !== DATA_CACHE)
                    .map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Stream video directly from the canonical host. Never cache lesson video blobs.
    if (event.request.destination === 'video') {
        event.respondWith(networkOnly(event.request));
        return;
    }

    // Strategy 1: API calls — Network first, cache fallback (5s timeout)
    if (API_PATTERNS.some(p => p.test(url.href))) {
        event.respondWith(
            networkFirstWithTimeout(event.request, 5000)
        );
        return;
    }

    // Strategy 1b: public video manifests — network first so hotfixes are not trapped behind stale caches
    if (NETWORK_FIRST_PATTERNS.some(p => p.test(url.pathname))) {
        event.respondWith(
            networkFirstWithTimeout(event.request, 5000)
        );
        return;
    }

    // Strategy 2: Bundled assets — Cache first, then network
    if (DATA_PATTERNS.some(p => p.test(url.pathname))) {
        event.respondWith(
            cacheFirst(event.request, DATA_CACHE)
        );
        return;
    }

    // Strategy 3: Everything else — Stale-While-Revalidate
    event.respondWith(
        staleWhileRevalidate(event.request)
    );
});

// Cache-First strategy (best for immutable hashed assets)
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

// Network-First with timeout (best for APIs)
async function networkFirstWithTimeout(request, timeoutMs) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const cache = await caches.open(DATA_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
        });
    }
}

async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

// Stale-While-Revalidate (best for HTML, general assets)
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);

    const fetchPromise = fetch(request).then(async (response) => {
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => null);

    if (cached) {
        // Return cached immediately, update in background
        fetchPromise; // fire-and-forget
        return cached;
    }

    // No cache — must wait for network
    const response = await fetchPromise;
    if (response) return response;

    // Ultimate fallback
    if (request.destination === 'document') {
        return caches.match(INDEX_URL);
    }
    return new Response('Offline', { status: 503 });
}
