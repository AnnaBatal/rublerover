// ===== НАЗВАНИЕ КЕША =====
const CACHE_NAME = 'rublerover-v1';

// ===== ФАЙЛЫ ДЛЯ КЕШИРОВАНИЯ =====
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/calculator.html',
    '/history.html',
    '/about.html',
    '/contacts.html',
    '/style.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// ===== УСТАНОВКА SERVICE WORKER =====
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Кеширование файлов...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                self.skipWaiting();
            })
    );
});

// ===== АКТИВАЦИЯ SERVICE WORKER =====
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('🗑️ Удаляем старый кеш:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// ===== ПЕРЕХВАТ ЗАПРОСОВ =====
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Если есть в кеше — возвращаем из кеша
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Если нет — загружаем из сети
                return fetch(event.request)
                    .then((response) => {
                        // Сохраняем в кеш для будущего использования
                        return caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, response.clone());
                                return response;
                            });
                    })
                    .catch(() => {
                        // Если нет сети и нет кеша — показываем страницу офлайн
                        return caches.match('/offline.html');
                    });
            })
    );
});