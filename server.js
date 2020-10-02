// Importações:
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
const urlsafeBase64 = require('urlsafe-base64');

const usuarios = [];
const express = require('express');
const path = require('path');
const app = express();

// Setando o protocolo http
const server = require('http').createServer(app);

// Configurando o protocolo socket
const io = require('socket.io').listen(server);

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
  socket.on('sendMessage', (data) => {
    console.log(data);
    messages.push(data);

    // Enviando a mensagem
    socket.broadcast.emit('receivedMessage', data);

    const options = {
      TTL: 24 * 60 * 60,
      vapidDetails: {
        subject: 'mailto:sender@example.com',
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
      }
    };

    webpush.sendNotification(data.subscription, JSON.stringify({message: data.message, author: data.author}), options);
  });

  vapidKeys.publicKey;
  ('BDO0P...eoH');
  vapidKeys.privateKey;
  ('3J303..r4I');

  const decodedVapidPublicKey = urlsafeBase64.decode(vapidKeys.publicKey);

  usuarios.push({ id: socket.id, chave: decodedVapidPublicKey });
  socket.emit('chave', { valor: decodedVapidPublicKey });
});

// Iniciando o servidor
server.listen(3000);
