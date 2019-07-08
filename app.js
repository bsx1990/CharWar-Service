const APP = require('http').createServer();
const IO = require('socket.io')(APP);
const CONFIG = require('./config/game-config');

const PLAYGROUND_CARDS_CHANGED = CONFIG.responseType.playgroundCardsChanged;
const CANDIDATE_CARDS_CHANGED = CONFIG.responseType.candidateCardsChanged;
const SCORE_CHANGED = CONFIG.responseType.scoreChanged;
const BEST_SCORE_CHANGED = CONFIG.responseType.bestScoreChanged;
const CLICK_CARD = CONFIG.requestType.clickCard;

let requestMapping = new Map();

APP.listen(CONFIG.PORT);

IO.on('connection', function(socket) {
  console.log(`received connection request, request id: ${socket.id}, token is:${socket.handshake.query.token}`);

  if (!requestMapping.has(socket.handshake.query.token)) {
    const gameDatas = { playgroundCards: getDefaultPlaygroundCards(), candidateCards: [], score: 0, bestScore: 0 };
    appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
    appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
    requestMapping.set(socket.handshake.query.token, gameDatas);
  }

  socket.on(CONFIG.requestType.getData, () => {
    console.log(`received getData request, request id: ${socket.id}, token is:${socket.handshake.query.token}`);
    const dataCollection = requestMapping.get(socket.handshake.query.token);
    const playgroundCards = dataCollection.playgroundCards;
    const candidateCards = dataCollection.candidateCards;
    const score = dataCollection.score;
    const bestScore = dataCollection.bestScore;

    socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);
    socket.emit(CANDIDATE_CARDS_CHANGED, candidateCards);
    socket.emit(SCORE_CHANGED, score);
    socket.emit(BEST_SCORE_CHANGED, bestScore);
  });

  socket.on(CLICK_CARD, (rowIndex, columnIndex) => {
    console.log(`received clickCard request from token is:${socket.handshake.query.token}, rowIndex:${rowIndex} columnIndex:${columnIndex}`);
    clickCard(socket, rowIndex, columnIndex);
  });
});

function getDefaultPlaygroundCards() {
  let playgroundCards = [];
  for (let row = 0; row < CONFIG.PLAYGROUND_SIZE; row++) {
    playgroundCards[row] = [];
    for (let column = 0; column < CONFIG.PLAYGROUND_SIZE; column++) {
      playgroundCards[row][column] = null;
    }
  }
  return playgroundCards;
}

function appendCandidateCard(playgroundCards, candidateCards) {
  candidateCards.push(generateCard(playgroundCards));
}

function generateCard(playgroundCards) {
  let maxCard = Math.max(...Array.prototype.concat.apply([], playgroundCards));
  if (isNaN(maxCard)) {
    maxCard = 0;
  }

  if (maxCard > CONFIG.MAX_GENERATED_CARD) {
    maxCard = CONFIG.MAX_GENERATED_CARD;
  }

  return Math.trunc(Math.random() * maxCard + 1);
}

function clickCard(socket, rowIndex, columnIndex) {
  let token = socket.handshake.query.token;
  let playgroundCards = requestMapping.get(token).playgroundCards;
  let candidateCards = requestMapping.get(token).candidateCards;

  if (playgroundCards[rowIndex][columnIndex] != null) {
    return;
  }

  let currentCandidateCard = candidateCards.shift();

  appendCandidateCard(playgroundCards, candidateCards);
  socket.emit(CANDIDATE_CARDS_CHANGED, candidateCards);

  playgroundCards[rowIndex][columnIndex] = currentCandidateCard;
  socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);

  let combinedCardsIndexs = getSameCardsFromAround(playgroundCards, rowIndex, columnIndex);
  while (combinedCardsIndexs.length > 0) {
    let combinedScore = sumCombinedCards(playgroundCards, combinedCardsIndexs);
    requestMapping.get(token).score += combinedScore;
    socket.emit(SCORE_CHANGED, requestMapping.get(token).score);

    if (requestMapping.get(token).score > requestMapping.get(token).bestScore) {
      requestMapping.get(token).bestScore = requestMapping.get(token).score;
      socket.emit(BEST_SCORE_CHANGED, requestMapping.get(token).bestScore);
    }

    combineCards(playgroundCards, combinedCardsIndexs, rowIndex, columnIndex);
    socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);

    combinedCardsIndexs = getSameCardsFromAround(playgroundCards, rowIndex, columnIndex);
  }
}

function getSameCardsFromAround(playgroundCards, rowIndex, columnIndex) {
  const centerCard = playgroundCards[rowIndex][columnIndex];
  let result = [];

  const arrows = [
    CONFIG.ARROW.LEFT_UP,
    CONFIG.ARROW.UP,
    CONFIG.ARROW.RIGHT_UP,
    CONFIG.ARROW.LEFT,
    CONFIG.ARROW.RIGHT,
    CONFIG.ARROW.LEFT_DOWN,
    CONFIG.ARROW.DOWN,
    CONFIG.ARROW.RIGHT_DOWN
  ];
  arrows.forEach(arrow => {
    const columnOffset = arrow[0];
    const rowOffset = arrow[1];
    const targetRowIndex = rowIndex + rowOffset;
    const targetColumnIndex = columnIndex + columnOffset;

    if (isOutofPlaygroundRange(targetRowIndex) || isOutofPlaygroundRange(targetColumnIndex)) {
      return;
    }

    if (playgroundCards[targetRowIndex][targetColumnIndex] === centerCard) {
      result.push([targetRowIndex, targetColumnIndex]);
    }
  });

  return result;
}

function isOutofPlaygroundRange(index) {
  return CONFIG.PLAYGROUND_SIZE <= index || index < 0;
}

function sumCombinedCards(playgroundCards, combinedCardsIndexs) {
  let result = 0;
  combinedCardsIndexs.forEach(index => {
    result += playgroundCards[index[0]][index[1]];
  });
  return result;
}

function combineCards(playgroundCards, combinedCardsIndexs, rowIndex, columnIndex) {
  combinedCardsIndexs.forEach(index => {
    playgroundCards[index[0]][index[1]] = null;
  });

  playgroundCards[rowIndex][columnIndex] = playgroundCards[rowIndex][columnIndex] + 1;
}

console.log('app listen at:' + CONFIG.PORT);
