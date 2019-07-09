module.exports = {
  clickCard: clickCard
};

const GAME_SYSTEM = require('./game-system');
const CONFIG = require('../config/game-config');

const PLAYGROUND_CARDS_CHANGED = CONFIG.responseType.playgroundCardsChanged;
const CANDIDATE_CARDS_CHANGED = CONFIG.responseType.candidateCardsChanged;
const SCORE_CHANGED = CONFIG.responseType.scoreChanged;
const BEST_SCORE_CHANGED = CONFIG.responseType.bestScoreChanged;

function clickCard(socket, rowIndex, columnIndex) {
  const gameDatas = GAME_SYSTEM.getGameDatasByToken(socket.handshake.query.token);
  let playgroundCards = gameDatas.playgroundCards;

  const hasCardAtClickedPosition = playgroundCards[rowIndex][columnIndex] != null;
  if (hasCardAtClickedPosition) {
    return;
  }

  placeCardsBeforeCombinCards(socket, gameDatas, rowIndex, columnIndex);

  combinCardsUntilNoSameCardsAround(socket, gameDatas, rowIndex, columnIndex);
}

function placeCardsBeforeCombinCards(socket, gameDatas, rowIndex, columnIndex) {
  let currentCandidateCard = gameDatas.candidateCards.shift();
  generateAndEmitNewCandidateCards(socket, gameDatas);
  emitCurrentCandidateCardAtClickedPosition(socket, gameDatas, currentCandidateCard, rowIndex, columnIndex);
}

function generateAndEmitNewCandidateCards(socket, gameDatas) {
  GAME_SYSTEM.appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
  socket.emit(CANDIDATE_CARDS_CHANGED, gameDatas.candidateCards);
}

function emitCurrentCandidateCardAtClickedPosition(socket, gameDatas, currentCandidateCard, rowIndex, columnIndex) {
  gameDatas.playgroundCards[rowIndex][columnIndex] = currentCandidateCard;
  socket.emit(PLAYGROUND_CARDS_CHANGED, gameDatas.playgroundCards);
}

function combinCardsUntilNoSameCardsAround(socket, gameDatas, rowIndex, columnIndex) {
  let playgroundCards = gameDatas.playgroundCards;
  let combinedCardsIndexs = getSameCardsFromAround(playgroundCards, rowIndex, columnIndex);
  let foundSameCardsFromAround = combinedCardsIndexs.length > 0;

  while (foundSameCardsFromAround) {
    let combinedScore = sumCombinedCards(playgroundCards, combinedCardsIndexs);
    gameDatas.score += combinedScore;
    socket.emit(SCORE_CHANGED, gameDatas.score);
    if (gameDatas.score > gameDatas.bestScore) {
      gameDatas.bestScore = gameDatas.score;
      socket.emit(BEST_SCORE_CHANGED, gameDatas.bestScore);
    }

    combineCards(playgroundCards, combinedCardsIndexs, rowIndex, columnIndex);
    socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);

    combinedCardsIndexs = getSameCardsFromAround(playgroundCards, rowIndex, columnIndex);
    foundSameCardsFromAround = combinedCardsIndexs.length > 0;
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
