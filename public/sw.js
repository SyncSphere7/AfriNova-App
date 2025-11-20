// AfriNova Service Worker - PWA Offline Support
// Version 1.0.0

const CACHE_VERSION = 'afrinova-v1';
const OFFLINE_URL = '/offline';

// Resources to cache on install
const STATIC_CACHE = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/AfriNova_new_logo-transparent.png',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[Service Worker] Caching static resources');
      return cache.addAll(STATIC_CACHE);
    }).then(() => {
      console.log('[Service Worker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome extensions and non-http(s) requests
  if (
    url.protocol !== 'http:' && 
    url.protocol !== 'https:' ||
    url.hostname === 'localhost' && url.port === '3000'
  ) {
    return;
  }

  // Skip Supabase requests (always fetch fresh)
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // Skip OpenRouter API requests (always fetch fresh)
  if (url.hostname.includes('openrouter.ai')) {
    return;
  }

  // HTML pages - Network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Show offline page
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Cache the fetched resource
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Default - Network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects());
  }
  
  if (event.tag === 'sync-generations') {
    event.waitUntil(syncGenerations());
  }
});

// Push notifications for generation completion
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event.data?.text());
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'AfriNova';
  const options = {
    body: data.body || 'Your code generation is complete!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      {
        action: 'open',
        title: 'View Code',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/dashboard';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Helper functions
async function syncProjects() {
  console.log('[Service Worker] Syncing projects...');
  // Implement project sync logic here
  return Promise.resolve();
}

async function syncGenerations() {
  console.log('[Service Worker] Syncing generations...');
  // Implement generation sync logic here
  return Promise.resolve();
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_VERSION).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[Service Worker] Loaded successfully');
