const GAME_SYSTEM = require('../game-system');
const MAX_GENERATED_CARD = GAME_SYSTEM.MAX_GENERATED_CARD;

module.exports = {
  MAX_GENERATED_CARD,

  getMaxCardValue: numberCardsMap => {
    return numberCardsSystem.getMaxCardValue(numberCardsMap);
  },
  appendRandomCandidateCard: (numberCardsMap, candidateCards) => {
    const currentMaxCardValue = numberCardsSystem.getMaxCardValue(numberCardsMap);
    candidateCardsSystem.appendRandomCandidateCard(candidateCards, currentMaxCardValue);
  },
  generateRandomValue: (minValue, maxValue) => {
    return Math.trunc(Math.random() * maxValue + minValue);
  },

  initDatas: initDatas,
  recordTokenToRequestMapping: recordTokenToRequestMapping,
  getGameDatasByToken: getGameDatasByToken,
  resetGameDatas: resetGameDatas,
  emitGameDatas: emitGameDatas,
  setCurrentGameMode: setCurrentGameMode,
  getGameModeByToken: getGameModeByToken,
  getCardKeyByRowAndColumn: getCardKeyByRowAndColumn,
  createCard: createCard,
  setNumberCard: setNumberCard,
  increaseNumberCardValue: increaseNumberCardValue
};

let candidateCardsSystem = require('./candidate-cards-system');
let numberCardsSystem = require('./number-cards-system');

const PLAYGROUND_CARDS_CHANGED = GAME_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const CANDIDATE_CARDS_CHANGED = GAME_SYSTEM.CANDIDATE_CARDS_CHANGED;
const SCORE_CHANGED = GAME_SYSTEM.SCORE_CHANGED;
const BEST_SCORE_CHANGED = GAME_SYSTEM.BEST_SCORE_CHANGED;
const GAME_STATE_CHANGED = GAME_SYSTEM.GAME_STATE_CHANGED;
const GAME_MODES = GAME_SYSTEM.GAME_MODES;
const PLAYGROUND_SIZE = GAME_SYSTEM.PLAYGROUND_SIZE;

let identifyAndGameDatasrequestMapping = new Map();
let tokenAndGameModeMapping = new Map();

//#region initDatas
function initDatas() {
  const defaultNumerCardsMap = getDefaultNumberCardsMap();
  const defaultCharCardsMap = getDefaultCharCardsMap();
  const defaultEmptyCardsMap = getDefaultEmptyCardsMap();
  const gameDatas = {
    numberCardsMap: defaultNumerCardsMap,
    charCardsMap: defaultCharCardsMap,
    emptyCardsMap: defaultEmptyCardsMap,
    playgroundCards: getPlaygroundCards(defaultNumerCardsMap, defaultCharCardsMap, defaultEmptyCardsMap),
    candidateCards: [],
    score: 0,
    bestScore: 0,
    gameState: ''
  };
  GAME_SYSTEM.appendRandomCandidateCard(gameDatas.numberCardsMap, gameDatas.candidateCards);
  GAME_SYSTEM.appendRandomCandidateCard(gameDatas.numberCardsMap, gameDatas.candidateCards);
  return gameDatas;
}

function getDefaultNumberCardsMap() {
  return new Map();
}

function getDefaultCharCardsMap() {
  return new Map();
}

function getDefaultEmptyCardsMap() {
  let emptyCardsMap = new Map();
  for (let row = 0; row < PLAYGROUND_SIZE; row++) {
    for (let column = 0; column < PLAYGROUND_SIZE; column++) {
      const card = createCard(row, column, null);
      emptyCardsMap.set(card.key, card);
    }
  }
  return emptyCardsMap;
}

function createCard(rowIndex, columnIndex, value) {
  return {
    row: rowIndex,
    column: columnIndex,
    key: getCardKeyByRowAndColumn(rowIndex, columnIndex),
    value: value
  };
}

function getCardKeyByRowAndColumn(row, column) {
  return `${row}/${column}`;
}

function getPlaygroundCards(numberCardsMap, charCardsMap, emptyCardsMap) {
  let playgroundCards = getEmptyPlaygroundCards();
  numberCardsMap.forEach(card => {
    updatePlaygroundCardsByCard(playgroundCards, card);
  });
  charCardsMap.forEach(card => {
    updatePlaygroundCardsByCard(playgroundCards, card);
  });
  emptyCardsMap.forEach(card => {
    updatePlaygroundCardsByCard(playgroundCards, card);
  });
  return playgroundCards;
}

function getEmptyPlaygroundCards() {
  let playgroundCards = [];
  for (let row = 0; row < PLAYGROUND_SIZE; row++) {
    playgroundCards[row] = [];
    for (let column = 0; column < PLAYGROUND_SIZE; column++) {
      playgroundCards[row][column] = null;
    }
  }
  return playgroundCards;
}

//#endregion

function recordTokenToRequestMapping(token) {
  if (token == undefined || token == null) {
    return;
  }

  const identify = getIdentifyByToken(token);
  if (!identifyAndGameDatasrequestMapping.has(identify)) {
    identifyAndGameDatasrequestMapping.set(identify, GAME_SYSTEM.initDatas());
  }
}

function getGameDatasByToken(token) {
  const identify = getIdentifyByToken(token);
  return identifyAndGameDatasrequestMapping.get(identify);
}

function resetGameDatas(socket) {
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  const identify = getIdentifyByToken(token);
  identifyAndGameDatasrequestMapping.set(identify, GAME_SYSTEM.initDatas());
  emitGameDatas(socket);
}

function emitGameDatas(socket) {
  const gameDatas = GAME_SYSTEM.getGameDatasByToken(GAME_SYSTEM.getTokenBySocket(socket));
  const playgroundCards = gameDatas.playgroundCards;
  const candidateCards = gameDatas.candidateCards;
  const score = gameDatas.score;
  const bestScore = gameDatas.bestScore;
  const gameState = gameDatas.gameState;

  socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);
  socket.emit(CANDIDATE_CARDS_CHANGED, candidateCards);
  socket.emit(SCORE_CHANGED, score);
  socket.emit(BEST_SCORE_CHANGED, bestScore);
  socket.emit(GAME_STATE_CHANGED, gameState);
}

function setCurrentGameMode(token, mode) {
  tokenAndGameModeMapping.set(token, mode);
  GAME_SYSTEM.recordTokenToRequestMapping(token);
}

function getGameModeByToken(token) {
  const mode = tokenAndGameModeMapping.get(token);
  if (mode == undefined || mode == null) {
    return GAME_MODES.war;
  } else {
    return GAME_MODES[mode];
  }
}

function getIdentifyByToken(token) {
  return `${token}=>${getGameModeByToken(token)}`;
}

function setNumberCard(token, card) {
  let gameDatas = getGameDatasByToken(token);
  let numberCardsMap = gameDatas.numberCardsMap;
  let emptyCardsMap = gameDatas.emptyCardsMap;
  let playgroundCards = gameDatas.playgroundCards;

  numberCardsMap.set(card.key, card);
  if (card.value == undefined || card.value == null) {
    addToEmptyCardsMap(emptyCardsMap, card);
  } else {
    removeFromEmptyCardsMap(emptyCardsMap, card);
  }
  updatePlaygroundCardsByCard(playgroundCards, card);
}

function removeFromEmptyCardsMap(emptyCardsMap, card) {
  emptyCardsMap.delete(card.key);
}

function addToEmptyCardsMap(emptyCardsMap, card) {
  emptyCardsMap.set(card.key, card);
}

function updatePlaygroundCardsByCard(playgroundCards, card) {
  playgroundCards[card.row][card.column] = card.value;
}

function increaseNumberCardValue(token, rowIndex, columnIndex) {
  const gameDatas = getGameDatasByToken(token);
  let numberCardsMap = gameDatas.numberCardsMap;
  let playgroundCards = gameDatas.playgroundCards;
  const cardKey = getCardKeyByRowAndColumn(rowIndex, columnIndex);

  if (!numberCardsMap.has(cardKey)) {
    console.log(`token:${token} doesn't have card ${cardKey}`);
    return;
  }

  let card = numberCardsMap.get(cardKey);
  card.value = card.value + 1;
  numberCardsMap.set(card.key, card);
  updatePlaygroundCardsByCard(playgroundCards, card);
}
