// -------------------------
// Simple Memory Game Script
// -------------------------

// Configuration
const START_SECONDS = 60; // countdown length in seconds
const PAIRS = 8;          // number of pairs (total cards = PAIRS * 2)

// Card icons (you can change these emojis)
const ICONS = ["🍎","🍌","🍇","🍓","🍒","🍋","🥝","🍑","🍍","🍉","🥥","🍐"];

// Elements from the page
const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

// Variables for game state
let countdown = START_SECONDS;
let countdownInterval = null;
let flippedCards = [];
let lockBoard = false;
let matchesFound = 0;
let started = false;

// Shuffle helper
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Create cards on the board
function setupBoard() {
  boardEl.innerHTML = '';
  matchesFound = 0;
  flippedCards = [];
  lockBoard = false;
  started = false;
  countdown = START_SECONDS;
  updateTimerDisplay();

  const chosen = ICONS.slice(0, PAIRS);
  const cardIcons = shuffle([...chosen, ...chosen]);

  cardIcons.forEach((icon, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.icon = icon;
    card.dataset.index = index;

    const inner = document.createElement('div');
    inner.className = 'inner';

    const front = document.createElement('div');
    front.className = 'face front';
    front.textContent = '❓';

    const back = document.createElement('div');
    back.className = 'face back';
    back.textContent = icon;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener('click', onCardClick);
    boardEl.appendChild(card);
  });

  messageEl.textContent = 'Flip two cards to find matching pairs. Match all before time runs out!';
}

// Card click
function onCardClick(e) {
  const card = e.currentTarget;
  if (lockBoard || card.classList.contains('flipped')) return;

  if (!started) {
    startTimer();
    started = true;
  }

  flipCard(card);
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

function flipCard(card) {
  card.classList.add('flipped');
}

function unflipCards(c1, c2) {
  setTimeout(() => {
    c1.classList.remove('flipped');
    c2.classList.remove('flipped');
    resetFlipState();
  }, 700);
}

function checkForMatch() {
  lockBoard = true;
  const [c1, c2] = flippedCards;
  const same = c1.dataset.icon === c2.dataset.icon;

  if (same) {
    matchesFound += 1;
    c1.removeEventListener('click', onCardClick);
    c2.removeEventListener('click', onCardClick);
    resetFlipState();
    lockBoard = false;
    if (matchesFound === PAIRS) gameWon();
  } else {
    unflipCards(c1, c2);
  }
}

function resetFlipState() {
  flippedCards = [];
  lockBoard = false;
}

// Timer logic
function updateTimerDisplay() {
  timerEl.textContent = `Time: ${countdown}s`;
}

function startTimer() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    countdown -= 1;
    updateTimerDisplay();
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      gameLost();
    }
  }, 1000);
}

function stopTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

// Win / Lose messages
function gameWon() {
  stopTimer();
  messageEl.textContent = `You win! 🎉 You matched all pairs with ${countdown}s left.`;
}

function gameLost() {
  document.querySelectorAll('.card').forEach(c => c.classList.add('flipped'));
  lockBoard = true;
  messageEl.textContent = "Time's up! You lost 😢 Click Restart to try again.";
}

// Restart button
restartBtn.addEventListener('click', () => {
  stopTimer();
  setupBoard();
});

// Initial setup when page loads
setupBoard();
