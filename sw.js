// ClinicalGoTo Service Worker - DISABLED
// This service worker is intentionally disabled to prevent registration errors
// Uncomment and configure when PWA functionality is needed

console.log('Service Worker loaded but not active - PWA functionality disabled');

// Immediately skip waiting and activate
self.addEventListener('install', function(event) {
    console.log('Service Worker install event - skipping');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activate event - cleaning up');
    // Clear any existing caches
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Don't intercept fetch requests
self.addEventListener('fetch', function(event) {
    // Let all requests go through normally
    return;
});
