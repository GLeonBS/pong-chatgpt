// Pegamos o canvas
const canvas = document.getElementById('gameCanvas');
// Criamos o contexto 2D para desenhar
const ctx = canvas.getContext('2d');

// Configurações da raquete
const paddle = {
  width: 10,
  height: 120,
  speed: 7
};

// Configurações da bola
const ball = {
  size: 10,
  speed: 5,
  dx: 5,
  dy: 5,
  x: canvas.width / 2,
  y: canvas.height / 2
};

// Configurações do jogador 1
const player = {
  x: 10,
  y: canvas.height / 2 - paddle.height / 2,
  score: 0
};

// Configurações do jogador 2 ou IA
const ai = {
  x: canvas.width - 20,
  y: canvas.height / 2 - paddle.height / 2,
  speed: 4,
  score: 0
};

// Controle de teclas pressionadas
const keys = {};

// Som de batida da bola
const bounceSound = new Audio('bounce.wav');

// Variáveis de controle do jogo
let isRoundRunning = false; // Rodada em andamento
let twoPlayers = false;     // Modo: 1 jogador (vs IA) ou 2 jogadores
let aiDifficulty = 'medium'; // Dificuldade da IA: 'easy', 'medium', 'hard'

// Configura os níveis de dificuldade da IA
const aiSpeeds = {
  easy: 2,
  medium: 4,
  hard: 6
};

// Evento de pressionar uma tecla
document.addEventListener('keydown', (e) => {
  // Começa rodada ao apertar espaço
  if (e.key === ' ' && !isRoundRunning) {
    isRoundRunning = true;
    resetBall();
  }

  // Alterna modo apenas se ninguém fez ponto ainda (0x0)
  if (e.key === 'm' && player.score === 0 && ai.score === 0) {
    twoPlayers = !twoPlayers;
  }

  // Alterna dificuldade apenas se ninguém fez ponto ainda (0x0)
  if (e.key === '1' && player.score === 0 && ai.score === 0) aiDifficulty = 'easy';
  if (e.key === '2' && player.score === 0 && ai.score === 0) aiDifficulty = 'medium';
  if (e.key === '3' && player.score === 0 && ai.score === 0) aiDifficulty = 'hard';

  // Controle do jogador 1 (teclado)
  if (e.key === 'ArrowUp') keys['ArrowUp'] = true;
  if (e.key === 'ArrowDown') keys['ArrowDown'] = true;

  // Controle do jogador 2 no modo 2 players
  if (e.key === 'w') keys['w'] = true;
  if (e.key === 's') keys['s'] = true;
});

// Evento de soltar tecla
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') keys['ArrowUp'] = false;
  if (e.key === 'ArrowDown') keys['ArrowDown'] = false;
  if (e.key === 'w') keys['w'] = false;
  if (e.key === 's') keys['s'] = false;
});

// Movimento da raquete do jogador 1 com o mouse
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  player.y = mouseY - paddle.height / 2;
  // Impede que a raquete ultrapasse as bordas
  player.y = Math.max(Math.min(player.y, canvas.height - paddle.height), 0);
});

// Atualiza o estado do jogo
function update() {
  if (!isRoundRunning) return; // Só atualiza se a rodada estiver ativa

  // Movimento do jogador 1 com teclado
  if (keys['ArrowUp']) player.y -= paddle.speed;
  if (keys['ArrowDown']) player.y += paddle.speed;
  player.y = Math.max(Math.min(player.y, canvas.height - paddle.height), 0);

  // Movimento do jogador 2
  if (twoPlayers) {
    // Segundo jogador (teclado w/s)
    if (keys['w']) ai.y -= paddle.speed;
    if (keys['s']) ai.y += paddle.speed;
    ai.y = Math.max(Math.min(ai.y, canvas.height - paddle.height), 0);
  } else {
    // Movimento da IA
    let targetY = ball.y - paddle.height / 2;
    if (ai.y < targetY) ai.y += aiSpeeds[aiDifficulty];
    else ai.y -= aiSpeeds[aiDifficulty];

    // Impede que ultrapasse as bordas
    ai.y = Math.max(Math.min(ai.y, canvas.height - paddle.height), 0);
  }

  // Movimento da bola
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Rebater na parte superior ou inferior
  if (ball.y <= 0 || ball.y >= canvas.height) {
    ball.dy *= -1;
    bounceSound.play();
  }

  // Colisão da bola com o jogador 1
  if (
    ball.x - ball.size / 2 <= player.x + paddle.width &&
    ball.y >= player.y &&
    ball.y <= player.y + paddle.height
  ) {
    ball.dx *= -1;
    ball.x = player.x + paddle.width + ball.size / 2;
    ball.speed += 0.5;
    adjustBallSpeed();
    bounceSound.play();
  }

  // Colisão da bola com o jogador 2 ou IA
  if (
    ball.x + ball.size / 2 >= ai.x &&
    ball.y >= ai.y &&
    ball.y <= ai.y + paddle.height
  ) {
    ball.dx *= -1;
    ball.x = ai.x - ball.size / 2;
    ball.speed += 0.5;
    adjustBallSpeed();
    bounceSound.play();
  }

  // Se a bola sair para esquerda - ponto para IA
  if (ball.x < 0) {
    ai.score++;
    isRoundRunning = false; // Pausa a rodada
  }

  // Se a bola sair para direita - ponto para jogador 1
  if (ball.x > canvas.width) {
    player.score++;
    isRoundRunning = false; // Pausa a rodada
  }

  // Se alguém fizer 10 pontos - fim de partida
  if (player.score >= 10 || ai.score >= 10) {
    setTimeout(() => {
      isRoundRunning = false;
      alert(player.score >= 10 ? 'Jogador 1 venceu!' : (twoPlayers ? 'Jogador 2 venceu!' : 'IA venceu!'));
      player.score = 0;
      ai.score = 0;
    }, 500);
  }
}

// Ajusta a velocidade da bola
function adjustBallSpeed() {
  const angle = Math.atan2(ball.dy, ball.dx);
  ball.dx = ball.speed * Math.cos(angle);
  ball.dy = ball.speed * Math.sin(angle);
}

// Reseta a bola para o meio
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 5;
  ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Desenha os elementos na tela
function draw() {
  // Fundo preto
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Raquetes brancas
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x, player.y, paddle.width, paddle.height);
  ctx.fillRect(ai.x, ai.y, paddle.width, paddle.height);

  // Bola branca
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Placar
  ctx.font = '32px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(`${player.score} : ${ai.score}`, canvas.width / 2 - 30, 40);

  // Informação de modo, dificuldade e instruções (apenas no início)
  if (player.score === 0 && ai.score === 0) {
    ctx.font = '16px Arial';
    ctx.fillText(twoPlayers ? 'Modo: 2 Jogadores' : 'Modo: 1 Jogador vs IA', canvas.width / 2 - 70, canvas.height - 80);

    if (!twoPlayers) {
      ctx.fillText(`Dificuldade: ${aiDifficulty.toUpperCase()} (Teclas 1/2/3)`, canvas.width / 2 - 80, canvas.height - 60);
    }

    // ➡️ Adicionando o texto pedido "aperte M para alterar o modo"
    ctx.fillText('Aperte M para alternar entre 1 jogador e 2 jogadores', canvas.width / 2 - 140, canvas.height - 40);
  }

  // Mensagem para iniciar rodada
  if (!isRoundRunning) {
    ctx.font = '24px Arial';
    ctx.fillText('Pressione ESPAÇO para Iniciar a Rodada', canvas.width / 2 - 170, canvas.height / 2);
  }
}

// Loop principal do jogo
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Inicia o jogo
gameLoop();
