module.exports = {
  clickCard,
  replay,
  placeCardsBeforeCombinCards,
  combinCardsUntilNoSameCardsAroundAndReturnCombinedInfor,
  updateAndEmitScoreChanged,
  checkGameStatusAfterCombined
};

function clickCard(socket, rowIndex, columnIndex) {
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  const gameMode = GAME_SYSTEM.getGameModeByToken(token);

  let logicHandler = getLogicHandler(gameMode);
  if (logicHandler == null) {
    return;
  }

  logicHandler.clickCard(socket, rowIndex, columnIndex);
}

function getLogicHandler(gameMode) {
  switch (gameMode) {
    case GAME_MODES.peace:
      console.log('Using PEACE_LOGIC_SYSTEM');
      return PEACE_LOGIC_SYSTEM;
    case GAME_MODES.war:
      console.log('Using WAR_LOGIC_SYSTEM');
      return WAR_LOGIC_SYSTEM;
    default:
      return null;
  }
}

function placeCardsBeforeCombinCards(socket, gameDatas, currentCard, token) {
  generateNewCandidateCardsAndEmitChange(socket, gameDatas);
  placeCardAtClickedPositionAndEmitChange(socket, gameDatas, currentCard, token);
}

function generateNewCandidateCardsAndEmitChange(socket, gameDatas) {
  GAME_SYSTEM.appendRandomCandidateCard(gameDatas.numberCardsMap, gameDatas.candidateCards);
  socket.emit(CANDIDATE_CARDS_CHANGED, gameDatas.candidateCards);
}

function placeCardAtClickedPositionAndEmitChange(socket, gameDatas, card, token) {
  GAME_SYSTEM.setNumberCard(token, card);
  socket.emit(PLAYGROUND_CARDS_CHANGED, gameDatas.playgroundCards);
}

function combinCardsUntilNoSameCardsAroundAndReturnCombinedInfor(socket, gameDatas, centerCard) {
  let playgroundCards = gameDatas.playgroundCards;
  const numberCardsMap = gameDatas.numberCardsMap;
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  let combinedInformation = { round: 0, totalCountOfCards: 0, maxCountOfSingleCombined: 0, combinedCardValue: 0, skills: [], score: 0 };

  let combinedCards = getSameCardsFromAround(numberCardsMap, centerCard);
  let foundSameCardsFromAround = combinedCards.length > 0;

  while (foundSameCardsFromAround) {
    recordScoreToCombinedInfor(combinedCards, combinedInformation);

    combineCards(token, combinedCards, centerCard, combinedInformation);
    socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);

    combinedCards = getSameCardsFromAround(numberCardsMap, centerCard);
    foundSameCardsFromAround = combinedCards.length > 0;
  }

  return combinedInformation;
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

function recordScoreToCombinedInfor(combinedCards, combinedInformation) {
  combinedInformation.score += GAME_SYSTEM.getSumOfCardValues(combinedCards);
}

function combineCards(token, cards, centerCard, combinedInformation) {
  centerCard.value += 1;
  updateCombinedInforForSingleRound(combinedInformation, cards, centerCard);

  cards.forEach(card => {
    card.value = null;
    GAME_SYSTEM.setNumberCard(token, card);
  });

  GAME_SYSTEM.setNumberCard(token, centerCard);
}

function updateCombinedInforForSingleRound(combinedInformation, cardsOfThisRound, centerCard) {
  combinedInformation.round += 1;
  if (cardsOfThisRound.length > combinedInformation.maxCountOfSingleCombined) {
    combinedInformation.maxCountOfSingleCombined = cardsOfThisRound.length;
  }
  combinedInformation.totalCountOfCards += cardsOfThisRound.length;
  combinedInformation.combinedCardValue = centerCard.value;
}

function updateAndEmitScoreChanged(score, gameDatas, socket) {
  gameDatas.score += score;
  socket.emit(SCORE_CHANGED, gameDatas.score);
  if (GAME_SYSTEM.isBestScoreUpdated(gameDatas)) {
    socket.emit(BEST_SCORE_CHANGED, gameDatas.bestScore);
  }
}

function checkGameStatusAfterCombined(socket, gameDatas) {
  const isGameOver = gameDatas.emptyCardsMap.size == 0;
  if (isGameOver) {
    gameDatas.gameState = 'GameOver';
    console.log(`GAME OVER! request id: ${socket.id}, token is:${GAME_SYSTEM.getTokenBySocket(socket)}`);
    socket.emit(GAME_STATE_CHANGED, gameDatas.gameState);
  }
}

function replay(socket) {
  GAME_SYSTEM.resetGameDatas(socket);
}

const GAME_SYSTEM = require('../game-system');
const GAME_MODES = GAME_SYSTEM.GAME_MODES;
const ALL_AROUND_ARROW = GAME_SYSTEM.ALL_AROUND_ARROW;
const PLAYGROUND_CARDS_CHANGED = GAME_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const CANDIDATE_CARDS_CHANGED = GAME_SYSTEM.CANDIDATE_CARDS_CHANGED;
const SCORE_CHANGED = GAME_SYSTEM.SCORE_CHANGED;
const BEST_SCORE_CHANGED = GAME_SYSTEM.BEST_SCORE_CHANGED;
const GAME_STATE_CHANGED = GAME_SYSTEM.GAME_STATE_CHANGED;

const PEACE_LOGIC_SYSTEM = require('./peace-logic-system');
const WAR_LOGIC_SYSTEM = require('./war-logic-system');
