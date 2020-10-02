console.log('lendo arquivo sw.js');

// var host = 'http://localhost:3000';
var host = 'https://saullosouza-com.umbler.net';

// self.addEventListener('install', function (e) {
//   e.waitUntil(
//     caches.open('airhorner').then(function (cache) {
//       return cache.addAll(['/', '/index.html', '/index.css', '/index.min.js']);
//     })
//   );
// });

self.addEventListener('push', function(event)  {
  console.log('json', event.data.json());
  // console.log('text', event.data.text());
  var title = event.data.json().author || 'Yay a message';
  var body = event.data.json().message;
  var tag = 'push-simple-demo-notification-tag' + new Date().getMilliseconds();
  var icon = './img/s1.ico';
  var actions = [{ action: 'open_url', title: 'Abrir' }];
  var data = { url: host };

  event.waitUntil(self.registration.showNotification(title, { body, icon, tag, actions, data }));

 
});

self.addEventListener(
  'notificationclick',
  function (event) {
    switch (event.action) {
      case 'open_url':
        clients.openWindow(event.notification.data.url, '_self', 'toolbar=no, scrollbars=no, resizable=no, width=426, height=640, location=no, status=no, top=150, left=100, titlebar=no, channelmode=yes'); //which we got from above
        break;
      case 'any_other_action':
        clients.openWindow('https://www.example.com');
        break;
    }
  },
  false
);

console.log('evento push e pushclick dentro do sw registrado');