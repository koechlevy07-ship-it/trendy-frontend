const CACHE_VERSION = 'v27';
const STATIC_CACHE = 'trendy-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'trendy-dynamic-' + CACHE_VERSION;
const IMAGE_CACHE = 'trendy-images-' + CACHE_VERSION;

const MAX_DYNAMIC_CACHE = 30;
const MAX_IMAGE_CACHE = 60;
const IMAGE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
                    .map(key => caches.delete(key))
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
    if (url.origin !== self.location.origin) return;

    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
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

    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

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

async function staleWhileRevalidate(request, cacheName = DYNAMIC_CACHE) {
    const cached = await caches.match(request);
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            const cloned = response.clone();
            caches.open(cacheName).then(c => {
                c.put(request, cloned);
                if (cacheName === DYNAMIC_CACHE) trimCache(c, MAX_DYNAMIC_CACHE);
            });
        }
        return response;
    }).catch(() => cached || new Response('Offline', { status: 503 }));

    return cached || fetchPromise;
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
            trimCache(cache, MAX_DYNAMIC_CACHE);
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('/404.html');
            if (offlinePage) return offlinePage;
        }
        return new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
        });
    }
}

function trimCache(cache, maxItems) {
    if (typeof maxItems === 'number') {
        cache.keys().then(keys => {
            if (keys.length > maxItems) {
                cache.delete(keys[0]).then(() => trimCache(cache, maxItems));
            }
        });
    }
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
