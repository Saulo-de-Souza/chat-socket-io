'use strict';
// self.addEventListener('install', function (e) {
//   e.waitUntil(
//     caches.open('airhorner').then(function (cache) {
//       return cache.addAll(['/', '/index.html', '/index.css', '/index.min.js']);
//     })
//   );
// });

self.addEventListener('push', (event) => {
  console.log('json', event.data.json());
  // console.log('text', event.data.text());
  let title = event.data.json().author || 'Yay a message';
  let body = event.data.json().message;
  let tag = 'push-simple-demo-notification-tag' + new Date().getMilliseconds();
  let icon = './img/s1.ico';

  event.waitUntil(self.registration.showNotification(title, { body, icon, tag }));
});
