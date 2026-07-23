// ===== НАЗВАНИЕ КЕША =====
const CACHE_NAME = 'rublerover-v5';

// ===== ФАЙЛЫ ДЛЯ КЕШИРОВАНИЯ (ТОЛЬКО СУЩЕСТВУЮЩИЕ!) =====
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
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then((response) => {
                        // Кэшируем только успешные ответы
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Если нет сети — возвращаем главную страницу
                        return caches.match('/index.html');
                    });
            })
    );
});

// Обработчик клика по уведомлению
self.addEventListener('notificationclick', (event) => {
    console.log('Нажато уведомление:', event.notification);
    event.notification.close();

    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Если есть уже открытое окно — переключаемся на него
                for (const client of windowClients) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Если нет — открываем новое
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});