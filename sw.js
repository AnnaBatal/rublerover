// ===== НАЗВАНИЕ КЕША =====
const CACHE_NAME = 'rublerover-v6';

// ===== ПАПКА ПРОЕКТА =====
const BASE_PATH = '/rublerover';

// ===== ФАЙЛЫ ДЛЯ КЕШИРОВАНИЯ =====
const FILES_TO_CACHE = [
    `${BASE_PATH}/`,
    `${BASE_PATH}/index.html`,
    `${BASE_PATH}/calculator.html`,
    `${BASE_PATH}/history.html`,
    `${BASE_PATH}/about.html`,
    `${BASE_PATH}/contacts.html`,
    `${BASE_PATH}/style.css`,
    `${BASE_PATH}/manifest.json`,
    `${BASE_PATH}/icon-192.png`,
    `${BASE_PATH}/icon-512.png`
];

// ===== УСТАНОВКА =====
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// ===== АКТИВАЦИЯ =====
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );

    self.clients.claim();
});

// ===== ПЕРЕХВАТ ЗАПРОСОВ =====
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, copy);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(`${BASE_PATH}/index.html`);
                });
        })
    );
});

// ===== КЛИК ПО УВЕДОМЛЕНИЮ =====
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || `${BASE_PATH}/`;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((windowClients) => {

            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});