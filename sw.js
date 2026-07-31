const CACHE_VERSION = 'v41';
const STATIC_CACHE = 'trendy-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'trendy-dynamic-' + CACHE_VERSION;
const IMAGE_CACHE = 'trendy-images-' + CACHE_VERSION;
const API_STATIC_CACHE = 'trendy-api-static-' + CACHE_VERSION;
const API_SEMI_CACHE = 'trendy-api-semi-' + CACHE_VERSION;

const MAX_DYNAMIC_CACHE = 30;
const MAX_IMAGE_CACHE = 80;
const MAX_API_STATIC = 10;
const MAX_API_SEMI = 20;
const IMAGE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
const API_STATIC_EXPIRY_MS = 24 * 60 * 60 * 1000;
const API_SEMI_EXPIRY_MS = 5 * 60 * 1000;

const API_STATIC_PATHS = [
    '/api/settings',
    '/api/social-links',
    '/api/categories',
    '/api/homepage/hero',
    '/api/homepage/catalogues',
    '/api/settings/heroImages',
    '/api/orders/shipping-options',
    '/api/orders/payment-methods'
];

const API_SEMI_PATHS = [
    '/api/products',
    '/api/reviews/product/',
    '/api/qa/product/',
    '/api/products/flash-sale',
    '/api/products/related/',
    '/api/promo/banners/'
];

const SHELL_PRECACHE = [
    '/',
    '/index.html',
    '/css/styles.css?v=41',
    '/js/image-utils.js?v=41',
    '/js/app.js?v=41',
    '/manifest.json',
    '/favicon.svg',
    '/404.html'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            return Promise.allSettled(
                SHELL_PRECACHE.map(url => cache.add(url).catch(() => {}))
            );
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key =>
                    key !== STATIC_CACHE &&
                    key !== DYNAMIC_CACHE &&
                    key !== IMAGE_CACHE &&
                    key !== API_STATIC_CACHE &&
                    key !== API_SEMI_CACHE
                ).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;

    if (url.pathname.startsWith('/api/')) {
        if (isApiStatic(url.pathname)) {
            event.respondWith(staleWhileRevalidate(request, API_STATIC_CACHE, API_STATIC_EXPIRY_MS));
        } else if (isApiSemi(url.pathname)) {
            event.respondWith(staleWhileRevalidate(request, API_SEMI_CACHE, API_SEMI_EXPIRY_MS));
        } else {
            event.respondWith(networkFirst(request));
        }
        return;
    }

    if (url.hostname === 'res.cloudinary.com') {
        event.respondWith(cacheFirstWithExpiry(request, IMAGE_CACHE));
        return;
    }

    if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|ico)$/i)) {
        event.respondWith(cacheFirstWithExpiry(request, IMAGE_CACHE));
        return;
    }

    if (url.pathname.match(/\.(css|js)$/i)) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    if (url.pathname.match(/\.(woff2?|ttf|eot)$/i)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

function isApiStatic(pathname) {
    return API_STATIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}

function isApiSemi(pathname) {
    return API_SEMI_PATHS.some(p => pathname.startsWith(p));
}

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
    } catch (err) {
        return new Response('', { status: 503 });
    }
}

async function cacheFirstWithExpiry(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) {
        const header = cached.headers.get('sw-cached-at');
        if (header && (Date.now() - parseInt(header)) > IMAGE_EXPIRY_MS) {
            caches.open(cacheName).then(c => c.delete(request));
        } else {
            return cached;
        }
    }
    try {
        const response = await fetch(request);
        if (response.ok) {
            const clone = response.clone();
            const cache = await caches.open(cacheName);
            const headers = new Headers(clone.headers);
            headers.set('sw-cached-at', String(Date.now()));
            const stamped = new Response(clone.body, {
                status: clone.status,
                statusText: clone.statusText,
                headers: headers
            });
            cache.put(request, stamped);
            trimCache(cacheName, MAX_IMAGE_CACHE);
        }
        return response;
    } catch (err) {
        return new Response('', { status: 503 });
    }
}

async function staleWhileRevalidate(request, cacheName = DYNAMIC_CACHE, expiryMs = 0) {
    const cached = await caches.match(request);

    const refreshOrStale = async () => {
        try {
            const fresh = await fetchAndCache(request, cacheName);
            return fresh;
        } catch (e) {
            return cached || new Response('', { status: 503 });
        }
    };

    if (cached && expiryMs > 0) {
        const header = cached.headers.get('sw-cached-at');
        if (header && (Date.now() - parseInt(header)) > expiryMs) {
            return refreshOrStale();
        }
        fetchAndCache(request, cacheName).catch(() => {});
        return cached;
    } else if (cached) {
        fetchAndCache(request, cacheName).catch(() => {});
        return cached;
    }

    return refreshOrStale();
}

async function fetchAndCache(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const clone = response.clone();
            const cache = await caches.open(cacheName);
            const headers = new Headers(clone.headers);
            headers.set('sw-cached-at', String(Date.now()));
            const stamped = new Response(clone.body, {
                status: clone.status,
                statusText: clone.statusText,
                headers: headers
            });
            cache.put(request, stamped);
            const max = cacheName === STATIC_CACHE ? 50 :
                        cacheName === API_STATIC_CACHE ? MAX_API_STATIC :
                        cacheName === API_SEMI_CACHE ? MAX_API_SEMI : MAX_DYNAMIC_CACHE;
            trimCache(cacheName, max);
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        return cached || new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
        });
    }
}

async function networkFirst(request) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok && request.mode === 'navigate') {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
            trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE);
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('/404.html');
            if (offlinePage) {
                return new Response(offlinePage.body, {
                    status: 503,
                    statusText: 'Offline',
                    headers: offlinePage.headers
                });
            }
        }
        return new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
        });
    }
}

function trimCache(cache, maxItems) {
    if (typeof maxItems !== 'number') return;
    if (typeof cache === 'string') {
        caches.open(cache).then(c => trimCache(c, maxItems));
        return;
    }
    cache.keys().then(keys => {
        if (keys.length > maxItems) {
            cache.delete(keys[0]).then(() => trimCache(cache, maxItems));
        }
    });
}

self.addEventListener('push', (event) => {
    if (!event.data) return;
    try {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title || 'Trendy Wardrobe', {
                body: data.body || 'You have a new notification',
                icon: '/favicon.svg',
                badge: '/favicon.svg',
                vibrate: [200, 100, 200],
                data: data.url || '/',
                actions: [
                    { action: 'open', title: 'View' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            })
        );
    } catch (e) {}
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(event.notification.data || '/');
        })
    );
});
