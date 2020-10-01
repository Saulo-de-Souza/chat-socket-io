// Evento ao carregar o hmtl
window.onload = () => {
  // Instanciando a variável socket
  var socket = io('https://saullosouza-com.umbler.net/:3000');

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
