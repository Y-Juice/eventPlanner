/* global workbox */
/*
  Workbox service worker
  - CacheFirst for static assets (images, fonts, css, js)
  - NetworkFirst for API calls (Supabase and our own API)
*/

// In case Workbox is injected via CDN for Expo Web builds
self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (self.workbox) {
  // Precache will be populated at build time if using injectManifest; here we keep it empty
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // CacheFirst for static assets
  workbox.routing.registerRoute(
    ({ request }) => ['style', 'script', 'image', 'font'].includes(request.destination),
    new workbox.strategies.CacheFirst({
      cacheName: 'static-assets-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 300, purgeOnQuotaError: true }),
      ],
    })
  );

  // NetworkFirst for API responses (adjust patterns as needed)
  workbox.routing.registerRoute(
    ({ url }) => url.hostname.endsWith('supabase.co') || url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-responses-v1',
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 200, purgeOnQuotaError: true }),
      ],
    })
  );

  // Fallback to index on navigation requests (SPA routing)
  workbox.routing.registerNavigationRoute('/index.html', {
    allowlist: [/^\/((?!__).*?$)/],
  });
} else {
  // Minimal offline fallback when Workbox not available
  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });
}


