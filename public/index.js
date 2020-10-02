// Evento ao carregar o hmtl
window.onload = function () {
  var swRegistration;

  var user = '';
  var color = '';

  if ('caches' in window) {
    caches.open('usuario').then(function (cache) {
      cache.keys().then(function (arrayOfRequest) {
        if (arrayOfRequest.length > 0) {
          user = arrayOfRequest[0].url.replace(host + '/', '');
          document.getElementById('username').value = user;
        }
      });
    });

    caches.open('cor').then(function (ca) {
      ca.keys().then(function (re) {
        if (re.length > 0) {
          color = re[0].url.replace(host + '/', '');
          document.getElementById(re[0].url.replace(host + '/', '')).checked = true;
        }
      });
    });
  }

  // Permissão
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
  } else if (Notification.permission === 'granted') {
    console.log('Permission to receive notifications has been granted');
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      if (permission === 'granted') {
        console.log('Permission to receive notifications has been granted');
      }
    });
  }

  // Instanciando a variável socket
  var socket = io(host);

  // Função para inserir no html as mensagens recebidas
  function renderMessage(message) {
    document.getElementById('messages').innerHTML += '<div class="message" id="' + message.id + '">' + '<span style="color: ' + message.color + ';" >' + message.author + '</span>: <strong> ' + message.message + '</strong></div>';
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight - document.getElementById('messages').clientHeight;
  }

  // Evento que recebe as mensagens
  socket.on('receivedMessage', function (data) {
    renderMessage(data);
    notify(data.author, data.message);
  });

  // Evento que escreve todas as mensagens salvas no servidor ao conectar
  socket.on('previousMessages', function (data) {
    for (x = 0; x < data.length; x++) {
      renderMessage(data[x]);
    }
    // for (message of data) {
    //   renderMessage(message);
    // }
  });

  socket.on('chave', function (data) {
    console.log(data);

    window.vapidPublicKey = new Uint8Array(data.valor);

    if ('serviceWorker' in navigator) {
      console.log('ServiceWorker é suportado, vamos usar!');
      navigator.serviceWorker
        .register('sw.js')
        .then(function (reg) {
          console.log('Service worker registrado');

          swRegistration = reg;

          navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            console.log('navigator.serviceWorker.ready ok');

            swRegistration.pushManager.getSubscription().then(function (res1) {
              console.log(res1 == null);

              if (res1 == undefined || res1 == null) {
                navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                  swRegistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: data.valor }).then(function (res3) {
                    console.log('PushNotification registrado');
                  });
                });
              } else {
                res1.unsubscribe().then(function () {
                  console.log('PushNotification removido');

                  swRegistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: data.valor }).then(function (res2) {
                    console.log('PushNotification registrado');
                  });
                });
              }
            });
          });
        })
        .catch(function (err) {
          console.error('error registering sw', err);
        });
    } else {
      console.log('ServiceWorker não é suportado.');
    }
  });

  // Tratando o submit do formulário do html
  document.getElementById('chat').addEventListener('submit', function (event) {
    event.preventDefault();

    var author = document.getElementById('username').value;
    var message = document.getElementById('message').value;

    // Verificando se há usuário e mensagem
    if (author.length && message.length) {
      navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        serviceWorkerRegistration.pushManager
          .getSubscription()
          .then(function (subscription) {
            console.log('subscription', subscription);

            var messagObject = {
              id: socket.id,
              author: author,
              message: message,
              color: document.getElementById('red').checked ? 'red' : document.getElementById('blue').checked ? 'blue' : document.getElementById('pink').checked ? 'pink' : '',
              subscription: subscription.toJSON(),
            };

            if ('caches' in window) {
              caches.open('usuario').then(function (cache) {
                cache.delete(user).then(function (res) {
                  cache.add(document.getElementById('username').value).then(function (res2) {
                    user = document.getElementById('username').value;
                  });
                });
              });

              if (document.getElementById('red').checked || document.getElementById('blue').checked || document.getElementById('pink').checked) {
                caches.open('cor').then(function (cache) {
                  cache.delete(color).then(function (res) {
                    cache.add(document.getElementById('red').checked ? 'red' : document.getElementById('blue').checked ? 'blue' : document.getElementById('pink').checked ? 'pink' : '').then(function (res2) {
                      color = document.getElementById('red').checked ? 'red' : document.getElementById('blue').checked ? 'blue' : document.getElementById('pink').checked ? 'pink' : '';
                    });
                  });
                });
              }
            }

            // Escrevendo no html a mensagem
            renderMessage(messagObject);

            // Enviando o objeto com a mensagem e usuário
            socket.emit('sendMessage', messagObject);

            document.getElementById('message').value = '';
            document.getElementById('message').focus();
          })
          .catch(function (err) {
            console.error(err);
          });
      });
    } else {
      alert('Para enviar mensagem, deve ter pelo menos um NOME e uma MENSAGEM!');
    }
  });

  // Push Notification
  function notify(author, message) {
    Notification.requestPermission(function () {
      var notification = new Notification(author, {
        icon: './img/s1.ico',
        body: message,
        vibrate: [300, 100, 400, 100, 400, 100, 400],
        image: './img/s1.ico',
      });
      notification.onclick = function () {
        window.open(host, '_blank', 'toolbar=no, scrollbars=no, resizable=no, width=426, height=640, location=no, status=no, top=150, left=100, titlebar=no, channelmode=yes');
      };
    });
  }
};
