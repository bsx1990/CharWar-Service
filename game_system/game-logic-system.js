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
const GAME_MODES = GAME_SYSTEM.GAME_MODES;
const MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD = GAME_SYSTEM.MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
const PLAY_SKILL = GAME_SYSTEM.PLAY_SKILL;

function clickCard(socket, rowIndex, columnIndex) {
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  const gameDatas = GAME_SYSTEM.getGameDatasByToken(token);
  const gameMode = GAME_SYSTEM.getGameModeByToken(token);

  let playgroundCards = gameDatas.playgroundCards;
  let emptyCardsMap = gameDatas.emptyCardsMap;
  let numberCardsMap = gameDatas.numberCardsMap;
  const hasCardAtClickedPosition = playgroundCards[rowIndex][columnIndex] != null;
  if (hasCardAtClickedPosition) {
    return;
  }

  const currentCard = GAME_SYSTEM.createCard(rowIndex, columnIndex, gameDatas.candidateCards.shift());
  placeCardsBeforeCombinCards(socket, gameDatas, currentCard, token);

  let canGenerateCharCard = isWarMode(gameMode) && canGenerateRandomCharCard(emptyCardsMap, numberCardsMap);
  if (canGenerateCharCard) {
    generateCharCard(emptyCardsMap, socket, gameDatas);
  }

  const combinedInfor = combinCardsUntilNoSameCardsAroundAndReturnCombinedInfor(socket, gameDatas, currentCard);
  if (isWarMode(gameMode) && GAME_SYSTEM.canExecuteCombinedSkill(combinedInfor)) {
    executeCombinedSkill(combinedInfor, socket, gameDatas);
  } else {
    updateAndEmitScoreChanged(combinedInfor.score, gameDatas, socket);
    checkGameStatusAfterCombined(socket, gameDatas);
  }
}

function executeCombinedSkill(combinedInfor, socket, gameDatas) {
  const skill = combinedInfor.skill;
  socket.emit(PLAY_SKILL, skill.name);

  if (skill.type == 'buff') {
    skill.execute(combinedInfor);
    updateAndEmitScoreChanged(combinedInfor.score, gameDatas, socket);
    checkGameStatusAfterCombined(socket, gameDatas);
  } else {
    console.log('got action skill');
  }
}

function generateCharCard(emptyCardsMap, socket, gameDatas) {
  let card = GAME_SYSTEM.getRandomEmptyCard(emptyCardsMap);
  card.value = GAME_SYSTEM.getRandomCharValue();

  const token = GAME_SYSTEM.getTokenBySocket(socket);
  GAME_SYSTEM.setCharCard(token, card);
  socket.emit(PLAYGROUND_CARDS_CHANGED, gameDatas.playgroundCards);
}

function isWarMode(gameMode) {
  return gameMode == GAME_MODES.war;
}

function canGenerateRandomCharCard(emptyCardsMap, numberCardsMap) {
  const hasEmpthCards = emptyCardsMap.size > 0;
  const maxCardLargeThanGenerateLimit = GAME_SYSTEM.getMaxCardValue(numberCardsMap) > MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
  let random = GAME_SYSTEM.generateRandomValue(1, 100);
  const isRandomMatchedGenerateRate = random <= GAME_SYSTEM.CHAR_CARDS_GENERATE_RATE;

  return hasEmpthCards && maxCardLargeThanGenerateLimit && isRandomMatchedGenerateRate;
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
  let combinedInformation = { round: 0, totalCountOfCards: 0, maxCountOfSingleCombined: 0, combinedCardValue: 0, skill: null, score: 0 };

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

function recordScoreToCombinedInfor(combinedCards, combinedInformation) {
  combinedInformation.score += GAME_SYSTEM.getSumOfCardValues(combinedCards);
}

function updateAndEmitScoreChanged(score, gameDatas, socket) {
  gameDatas.score += score;
  socket.emit(SCORE_CHANGED, gameDatas.score);
  if (GAME_SYSTEM.isBestScoreUpdated(gameDatas)) {
    socket.emit(BEST_SCORE_CHANGED, gameDatas.bestScore);
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
  combinedInformation.totalCoundOfCards += cardsOfThisRound.length;
  combinedInformation.combinedCardValue = centerCard.value;
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
