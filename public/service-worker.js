>// service-worker.js
// This is a minimal service worker for handling price alerts.

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRICE_ALERT') {
    const { coin, price } = event.data.payload;

    // Show the notification
    self.registration.showNotification('Price Alert!', {
      body: `${coin} is within your waiting price range at $${price.toFixed(2)}`,
      icon: '/favicon.ico',
    });
  }
});

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  // Perform any installation steps here, such as caching assets
  self.skipWaiting(); // Immediately activate the service worker
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  // Clean up old caches, if necessary
  return self.clients.claim(); // Claim all clients controlled by this service worker
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Add any actions on notification click, such as opening a specific URL
});

