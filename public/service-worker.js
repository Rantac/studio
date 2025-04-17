// service-worker.js
self.addEventListener('install', event => {
    console.log('Service Worker installed');
    // Perform any installation steps such as caching static assets
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    // Clean up old caches, etc.
});

self.addEventListener('message', event => {
    if (event.data.type === 'notification') {
        const {title, options} = event.data;
        self.registration.showNotification(title, options)
            .then(() => console.log('Notification sent from service worker'))
            .catch(err => console.error('Service worker notification error', err));
    }
});
