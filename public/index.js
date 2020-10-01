// Evento ao carregar o hmtl
window.onload = () => {
  var host = 'http://localhost:3000';
  // var host = 'https://saullosouza-com.umbler.net/';
  var user = '';
  var color = '';

  if ('caches' in window) {
    caches.open('usuario').then((cache) => {
      cache.keys().then((arrayOfRequest) => {
        if(arrayOfRequest.length > 0){
          user = arrayOfRequest[0].url.replace(host + '/', '');
          document.getElementById('username').value = user;
        }
        
      });
    });

    caches.open('cor').then((ca) => {
      ca.keys().then((re) => { 
        if(re.length > 0){
          color = re[0].url.replace(host + '/', '');
          document.getElementById(re[0].url.replace(host + '/', '')).checked = true;
        }
        
      });
    });
  }

  Notification.requestPermission();

  // Instanciando a variável socket
  var socket = io(host);

  // Função para inserir no html as mensagens recebidas
  function renderMessage(message) {
    document.getElementById('messages').innerHTML += '<div class="message" id="' + message.id + '">' + '<span style="color: ' + message.color + ';" >' + message.author + '</span>: <strong> ' + message.message + '</strong></div>';
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight - document.getElementById('messages').clientHeight;
  }

  // Evento que recebe as mensagens
  socket.on('receivedMessage', (data) => {
    renderMessage(data);
    notify(data.author, data.message);
  });

  // Evento que escreve todas as mensagens salvas no servidor ao conectar
  socket.on('previousMessages', (data) => {
    for (message of data) {
      renderMessage(message);
    }
  });

  // Tratando o submit do formulário do html
  document.getElementById('chat').addEventListener('submit', (event) => {
    event.preventDefault();

    var author = document.getElementById('username').value;
    var message = document.getElementById('message').value;

    // Verificando se há usuário e mensagem
    if (author.length && message.length) {
      var messagObject = {
        id: socket.id,
        author: author,
        message: message,
        color: document.getElementById('red').checked ? 'red' : (document.getElementById('blue').checked ? 'blue' : (document.getElementById('pink').checked ? 'pink' : ''))
      };

      if ('caches' in window) {
        caches.open('usuario').then((cache) => {
          cache.delete(user).then((res) => {
            cache.add(document.getElementById('username').value).then((res2) => {
              user = document.getElementById('username').value;
            });
          });
        });

        if(document.getElementById('red').checked || document.getElementById('blue').checked || document.getElementById('pink').checked) {
          caches.open('cor').then((cache) => {
            cache.delete(color).then((res) => {
              cache.add(document.getElementById('red').checked ? 'red' : (document.getElementById('blue').checked ? 'blue' : (document.getElementById('pink').checked ? 'pink' : ''))).then((res2) => {
                color = document.getElementById('red').checked ? 'red' : (document.getElementById('blue').checked ? 'blue' : (document.getElementById('pink').checked ? 'pink' : ''));
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
        vibrate: true,
        image: './img/s1.ico',
      });
      notification.onclick = function () {
        window.open(host, '_blank', 'toolbar=no, scrollbars=no, resizable=no, width=426, height=605, location=no, status=no, top=100, left=100, titlebar=no, channelmode=yes');
      };
    });
  }
};
