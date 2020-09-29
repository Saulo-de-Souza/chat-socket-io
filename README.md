# chat-socket-io
>Exemplo simples para criar socket com o NodeJS

### Servidor:
```js
// Importações:
const express = require('express');
const path = require('path');
const app = express();

// Setando o protocolo http
const server = require('http').createServer(app);

// Configurando o protocolo socket
const io = require('socket.io')(server);

// Setando a pasta public onde estará o front
app.use(express.static(path.join(__dirname, 'public')));

// Setando a pasta de visualização na pasta public
app.set('views', path.join(__dirname, 'public'));

// Setando como retorno o html
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Setando a view index como raiz
app.use('/', (req, res) => {
  res.render('index.html');
});

// Variavel onde será armazenda as mensagens para quando usuário logar, ver o histórico
let messages = [];

// Evento ao conectar ao socket
io.on('connection', (socket) => {
  console.log(socket.id);

  // Enviando as mensagens salvas na variável messages com o nome de evento como previousMessages
  socket.emit('previousMessages', messages);

  // Evento para receber as mensagens dos sockets conectados para poder reenviar a todos em tempo real
  socket.on('sendMessage', data => {
      console.log(data);
      messages.push(data);

      // Enviando a mensagem
      socket.broadcast.emit('receivedMessage', data);
  });
});

// Iniciando o servidor
server.listen(3000);



```

### Javascript do front:
```js
// Evento ao carregar o hmtl
window.onload = () => {
  // Instanciando a variável socket
  var socket = io('http://localhost:3000');

  // Função para inserir no html as mensagens recebidas
  function renderMessage(message) {
    document.getElementById('messages').innerHTML += '<div class="message">' + message.author + '<strong>: ' + message.message + '</strong></div>';
  }

  // Evento que recebe as mensagens
  socket.on('receivedMessage', (data) => {
    renderMessage(data);
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
        author: author,
        message: message,
      };

      // Escrevendo no html a mensagem
      renderMessage(messagObject);

      // Enviando o objeto com a mensagem e usuário
      socket.emit('sendMessage', messagObject);
    }
  });
};

```

### Executar:
> node server.js


