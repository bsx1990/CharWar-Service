module.exports = {
  clickCard: clickCard,
  replay: replay
};

const GAME_SYSTEM = require('./game-system');

const PLAYGROUND_CARDS_CHANGED = GAME_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const CANDIDATE_CARDS_CHANGED = GAME_SYSTEM.CANDIDATE_CARDS_CHANGED;
const SCORE_CHANGED = GAME_SYSTEM.SCORE_CHANGED;
const BEST_SCORE_CHANGED = GAME_SYSTEM.BEST_SCORE_CHANGED;
const GAME_STATE_CHANGED = GAME_SYSTEM.GAME_STATE_CHANGED;
const ALL_AROUND_ARROW = GAME_SYSTEM.ALL_AROUND_ARROW;

function clickCard(socket, rowIndex, columnIndex) {
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  const gameDatas = GAME_SYSTEM.getGameDatasByToken(token);
  const gameMode = GAME_SYSTEM.getGameModeByToken(token);

  let playgroundCards = gameDatas.playgroundCards;
  const hasCardAtClickedPosition = playgroundCards[rowIndex][columnIndex] != null;
  if (hasCardAtClickedPosition) {
    return;
  }

  const currentCard = GAME_SYSTEM.createCard(rowIndex, columnIndex, gameDatas.candidateCards.shift());
  placeCardsBeforeCombinCards(socket, gameDatas, currentCard, token);

  combinCardsUntilNoSameCardsAround(socket, gameDatas, rowIndex, columnIndex, currentCard);

  checkGameStatusAfterCombined(socket, gameDatas);
}

function placeCardsBeforeCombinCards(socket, gameDatas, currentCard, token) {
  generateNewCandidateCardsAndEmitChange(socket, gameDatas);
  placeCardAtClickedPositionAndEmitChange(socket, gameDatas, currentCard, token);
}

function generateNewCandidateCardsAndEmitChange(socket, gameDatas) {
  GAME_SYSTEM.appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
  socket.emit(CANDIDATE_CARDS_CHANGED, gameDatas.candidateCards);
}

function placeCardAtClickedPositionAndEmitChange(socket, gameDatas, card, token) {
  GAME_SYSTEM.setNumberCard(token, card);
  socket.emit(PLAYGROUND_CARDS_CHANGED, gameDatas.playgroundCards);
}

function combinCardsUntilNoSameCardsAround(socket, gameDatas, rowIndex, columnIndex, centerCard) {
  let playgroundCards = gameDatas.playgroundCards;
  const numberCardsMap = gameDatas.numberCardsMap;
  const token = GAME_SYSTEM.getTokenBySocket(socket);

  let combinedCards = getSameCardsFromAround(numberCardsMap, centerCard);
  let foundSameCardsFromAround = combinedCards.length > 0;

  while (foundSameCardsFromAround) {
    let combinedScore = sumCombinedCards(combinedCards);
    gameDatas.score += combinedScore;
    socket.emit(SCORE_CHANGED, gameDatas.score);
    if (gameDatas.score > gameDatas.bestScore) {
      gameDatas.bestScore = gameDatas.score;
      socket.emit(BEST_SCORE_CHANGED, gameDatas.bestScore);
    }

    combineCards(token, combinedCards, rowIndex, columnIndex);
    socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);

    combinedCards = getSameCardsFromAround(numberCardsMap, centerCard);
    foundSameCardsFromAround = combinedCards.length > 0;
  }
}

function getSameCardsFromAround(numberCardsMap, centerCard) {
  let result = [];

  ALL_AROUND_ARROW.forEach(arrow => {
    const columnOffset = arrow[0];
    const rowOffset = arrow[1];
    const targetRowIndex = centerCard.row + rowOffset;
    const targetColumnIndex = centerCard.column + columnOffset;

    var key = GAME_SYSTEM.getCardKeyByRowAndColumn(targetRowIndex, targetColumnIndex);
    if (!numberCardsMap.has(key)) {
      return;
    }

    var targetCard = numberCardsMap.get(key);
    if (targetCard.value == centerCard.value) {
      result.push(targetCard);
    }
  });

  return result;
}

function sumCombinedCards(combinedCards) {
  const reducer = (accumulator, currentValue) => accumulator + currentValue.value;
  return combinedCards.reduce(reducer, 0);
}

function combineCards(token, combinedCards, rowIndex, columnIndex) {
  combinedCards.forEach(card => {
    card.value = null;
    GAME_SYSTEM.setNumberCard(token, card);
  });

  GAME_SYSTEM.increaseNumberCardValue(token, rowIndex, columnIndex);
}

function checkGameStatusAfterCombined(socket, gameDatas) {
  const isGameOver = gameDatas.emptyCardsMap.size == 0;
  if (isGameOver) {
    gameDatas.gameState = 'GameOver';
    console.log(`GAME OVER! request id: ${socket.id}, token is:${socket.handshake.query.token}`);
    socket.emit(GAME_STATE_CHANGED, gameDatas.gameState);
  }
}

function replay(socket) {
  GAME_SYSTEM.resetGameDatas(socket);
}
