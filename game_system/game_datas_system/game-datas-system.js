const GAME_SYSTEM = require('../game-system');
const MAX_GENERATED_CARD = GAME_SYSTEM.MAX_GENERATED_CARD;
const PLAYGROUND_SIZE = GAME_SYSTEM.PLAYGROUND_SIZE;
const PLAYGROUND_CARDS_CHANGED = GAME_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const CANDIDATE_CARDS_CHANGED = GAME_SYSTEM.CANDIDATE_CARDS_CHANGED;
const SCORE_CHANGED = GAME_SYSTEM.SCORE_CHANGED;
const BEST_SCORE_CHANGED = GAME_SYSTEM.BEST_SCORE_CHANGED;
const GAME_STATE_CHANGED = GAME_SYSTEM.GAME_STATE_CHANGED;
const GAME_MODES = GAME_SYSTEM.GAME_MODES;

module.exports = {
  MAX_GENERATED_CARD,
  PLAYGROUND_SIZE,

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
let emptyCardsSystem = require('./empty-cards-system');
let charCardsSystem = require('./char-cards-system');
let playgroundCardsSystem = require('./playground-cards-system');

let identifyAndGameDatasrequestMapping = new Map();
let tokenAndGameModeMapping = new Map();

function initDatas() {
  const defaultNumerCardsMap = numberCardsSystem.getDefaultCards();
  const defaultCharCardsMap = charCardsSystem.getDefaultCards();
  const defaultEmptyCardsMap = emptyCardsSystem.getDefaultCards();
  const gameDatas = {
    numberCardsMap: defaultNumerCardsMap,
    charCardsMap: defaultCharCardsMap,
    emptyCardsMap: defaultEmptyCardsMap,
    playgroundCards: playgroundCardsSystem.getPlaygroundCards(defaultNumerCardsMap, defaultCharCardsMap, defaultEmptyCardsMap),
    candidateCards: [],
    score: 0,
    bestScore: 0,
    gameState: ''
  };
  GAME_SYSTEM.appendRandomCandidateCard(gameDatas.numberCardsMap, gameDatas.candidateCards);
  GAME_SYSTEM.appendRandomCandidateCard(gameDatas.numberCardsMap, gameDatas.candidateCards);
  return gameDatas;
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

  numberCardsSystem.setCard(numberCardsMap, card);
  if (card.value == undefined || card.value == null) {
    emptyCardsSystem.setCard(emptyCardsMap, card);
  } else {
    emptyCardsSystem.removeCard(emptyCardsMap, card);
  }
  playgroundCardsSystem.updatePlaygroundCardsByCard(playgroundCards, card);
}

function increaseNumberCardValue(token, rowIndex, columnIndex) {
  const gameDatas = getGameDatasByToken(token);
  let numberCardsMap = gameDatas.numberCardsMap;
  let playgroundCards = gameDatas.playgroundCards;
  const cardKey = getCardKeyByRowAndColumn(rowIndex, columnIndex);

  let card = numberCardsSystem.getCard(numberCardsMap, cardKey);
  if (card == null) {
    console.log(`token:${token} doesn't have card ${cardKey}`);
    return;
  }

  card.value = card.value + 1;
  numberCardsSystem.setCard(numberCardsMap, card);
  playgroundCardsSystem.updatePlaygroundCardsByCard(playgroundCards, card);
}
