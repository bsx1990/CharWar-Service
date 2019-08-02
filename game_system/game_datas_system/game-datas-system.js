const GAME_SYSTEM = require('../game-system');
const MAX_GENERATED_CARD = GAME_SYSTEM.MAX_GENERATED_CARD;
const PLAYGROUND_SIZE = GAME_SYSTEM.PLAYGROUND_SIZE;
const PLAYGROUND_CARDS_CHANGED = GAME_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const CANDIDATE_CARDS_CHANGED = GAME_SYSTEM.CANDIDATE_CARDS_CHANGED;
const SCORE_CHANGED = GAME_SYSTEM.SCORE_CHANGED;
const BEST_SCORE_CHANGED = GAME_SYSTEM.BEST_SCORE_CHANGED;
const GAME_STATE_CHANGED = GAME_SYSTEM.GAME_STATE_CHANGED;
const GAME_MODES = GAME_SYSTEM.GAME_MODES;
const EACH_CHAR_CARD_GENERATE_RATE = GAME_SYSTEM.EACH_CHAR_CARD_GENERATE_RATE;
const CHAR_CARD_TYPE = GAME_SYSTEM.CHAR_CARD_TYPE;
const recordInfor = GAME_SYSTEM.recordInfor;
const recordError = GAME_SYSTEM.recordError;
const recordObject = GAME_SYSTEM.recordObject;

module.exports = {
  MAX_GENERATED_CARD,
  PLAYGROUND_SIZE,
  EACH_CHAR_CARD_GENERATE_RATE,
  CHAR_CARD_TYPE,
  recordInfor,
  recordError,
  recordObject,

  getMaxCardValue: numberCardsMap => {
    return numberCardsSystem.getMaxCardValue(numberCardsMap);
  },
  appendRandomCandidateCard,
  getRandomEmptyCard: emptyCardsMap => {
    return emptyCardsSystem.getRandomEmptyCard(emptyCardsMap);
  },
  getRandomCharValue: () => {
    return charCardsSystem.getRandomCharValue();
  },

  generateRandomValue,
  getGameDatasByToken,
  resetGameDatas,
  emitGameDatas,
  setCurrentGameMode,
  getGameModeByToken,
  getCardKeyByRowAndColumn,
  createCard,
  setNumberCard,
  setCharCard,
  getCardFromGameDatas,
  decreaseCard
};

let candidateCardsSystem = require('./candidate-cards-system');
let numberCardsSystem = require('./number-cards-system');
let emptyCardsSystem = require('./empty-cards-system');
let charCardsSystem = require('./char-cards-system');
let playgroundCardsSystem = require('./playground-cards-system');

let identifyAndGameDatasrequestMapping = new Map();
let tokenAndGameModeMapping = new Map();

function appendRandomCandidateCard(numberCardsMap, candidateCards) {
  recordInfor('begin append random candidate card');
  const currentMaxCardValue = numberCardsSystem.getMaxCardValue(numberCardsMap);
  candidateCardsSystem.appendRandomCandidateCard(candidateCards, currentMaxCardValue);
  recordInfor('end append random candidate card');
}

function initDatas(socket) {
  recordInfor(`begain init datas for token:${socket.token}`);
  const defaultNumerCardsMap = numberCardsSystem.getDefaultCards();
  const defaultCharCardsMap = charCardsSystem.getDefaultCards();
  const defaultEmptyCardsMap = emptyCardsSystem.getDefaultCards();
  const defaultCandidateCards = candidateCardsSystem.getDefaultCards();
  const gameDatas = createGameDatas(defaultNumerCardsMap, defaultCharCardsMap, defaultEmptyCardsMap, defaultCandidateCards, socket);
  appendRandomCandidateCard(gameDatas.numberCardsMap, gameDatas.candidateCards);
  appendRandomCandidateCard(gameDatas.numberCardsMap, gameDatas.candidateCards);
  recordInfor(`begain init datas for token:${socket.token}`);
  return gameDatas;
}

function createGameDatas(defaultNumerCardsMap, defaultCharCardsMap, defaultEmptyCardsMap, defaultCandidateCards, socket) {
  return {
    token: GAME_SYSTEM.getTokenBySocket(socket),
    socket: socket,
    numberCardsMap: defaultNumerCardsMap,
    charCardsMap: defaultCharCardsMap,
    emptyCardsMap: defaultEmptyCardsMap,
    playgroundCards: playgroundCardsSystem.getPlaygroundCards(defaultNumerCardsMap, defaultCharCardsMap, defaultEmptyCardsMap),
    candidateCards: defaultCandidateCards,
    score: 0,
    bestScore: 0,
    gameState: '',
    combinedSkills: []
  };
}

function generateRandomValue(minValue, maxValue) {
  const result = Math.trunc(Math.random() * maxValue + minValue);
  recordInfor(`generate random value between minValue:${minValue} and maxValue:${maxValue}, result:${result}`);
  return result;
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

function getGameDatasByToken(token) {
  const identify = getIdentifyByToken(token);
  return identifyAndGameDatasrequestMapping.get(identify);
}

function resetGameDatas(socket) {
  recordInfor('begin reset game datas');
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  const identify = getIdentifyByToken(token);
  identifyAndGameDatasrequestMapping.set(identify, initDatas(socket));
  emitGameDatas(socket);
  recordInfor('end reset game datas');
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

function setCurrentGameMode(socket, mode) {
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  tokenAndGameModeMapping.set(token, mode);
  recordRequest(token, socket);
}

function recordRequest(token, socket) {
  if (token == undefined || token == null) {
    return;
  }

  const identify = getIdentifyByToken(token);
  if (!identifyAndGameDatasrequestMapping.has(identify)) {
    identifyAndGameDatasrequestMapping.set(identify, initDatas(socket));
  } else {
    updateSocketInGameDatas(socket, identifyAndGameDatasrequestMapping.get(identify));
  }
}

function updateSocketInGameDatas(socket, gameDatas) {
  gameDatas.socket = socket;
}

function getIdentifyByToken(token) {
  return `${token}=>${getGameModeByToken(token)}`;
}

function getGameModeByToken(token) {
  const mode = tokenAndGameModeMapping.get(token);
  if (mode == undefined || mode == null) {
    return GAME_MODES.war;
  } else {
    return GAME_MODES[mode];
  }
}

function setNumberCard(gameDatas, card) {
  let numberCardsMap = gameDatas.numberCardsMap;
  let emptyCardsMap = gameDatas.emptyCardsMap;
  let playgroundCards = gameDatas.playgroundCards;

  if (card.value == undefined || card.value == null) {
    moveCardFromMapToMap(card, numberCardsMap, emptyCardsMap);
  } else {
    moveCardFromMapToMap(card, emptyCardsMap, numberCardsMap);
  }
  playgroundCardsSystem.updatePlaygroundCardsByCard(playgroundCards, card);
}

function setCharCard(gameDatas, card) {
  let charCardsMap = gameDatas.charCardsMap;
  let emptyCardsMap = gameDatas.emptyCardsMap;
  let playgroundCards = gameDatas.playgroundCards;

  if (card.value == undefined || card.value == null) {
    moveCardFromMapToMap(card, charCardsMap, emptyCardsMap);
  } else {
    moveCardFromMapToMap(card, emptyCardsMap, charCardsMap);
  }
  playgroundCardsSystem.updatePlaygroundCardsByCard(playgroundCards, card);
}

function moveCardFromMapToMap(card, fromMaps, toMaps) {
  toMaps.set(card.key, card);
  fromMaps.delete(card.key);
}

function getCardFromGameDatas(gameDatas, rowIndex, columnIndex) {
  const cardKey = getCardKeyByRowAndColumn(rowIndex, columnIndex);

  let charCardsMap = gameDatas.charCardsMap;
  if (charCardsMap.has(cardKey)) {
    return charCardsMap.get(cardKey);
  }

  let numberCardsMap = gameDatas.numberCardsMap;
  if (numberCardsMap.has(cardKey)) {
    return numberCardsMap.get(cardKey);
  }

  let emptyCardsMap = gameDatas.emptyCardsMap;
  if (emptyCardsMap.has(cardKey)) {
    return emptyCardsMap.get(cardKey);
  }

  return null;
}

function decreaseCard(card) {
  recordInfor('begin to decrease card, current card:');
  recordObject(card);
  let cardValue = card.value;
  if (cardValue == null) {
    recordError('end decrease card. card value is null');
    return null;
  }

  cardValue = isNaN(cardValue) ? charCardsSystem.decreaseValue(cardValue) : numberCardsSystem.decreaseValue(cardValue);
  let result = createCard(card.row, card.column, cardValue);
  recordInfor('card after decrease:');
  recordObject(result);
  return result;
}
