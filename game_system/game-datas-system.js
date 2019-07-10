module.exports = {
  initDatas: initDatas,
  recordTokenToRequestMapping: recordTokenToRequestMapping,
  getGameDatasByToken: getGameDatasByToken,
  resetGameDatas: resetGameDatas,
  emitGameDatas: emitGameDatas
};

const GAME_SYSTEM = require('./game-system');
const CONFIG = require('../config/game-config');

const PLAYGROUND_CARDS_CHANGED = CONFIG.responseType.playgroundCardsChanged;
const CANDIDATE_CARDS_CHANGED = CONFIG.responseType.candidateCardsChanged;
const SCORE_CHANGED = CONFIG.responseType.scoreChanged;
const BEST_SCORE_CHANGED = CONFIG.responseType.bestScoreChanged;
const GAME_STATE_CHANGED = CONFIG.responseType.gameStateChanged;

let requestMapping = new Map();

//#region initDatas
function initDatas() {
  const gameDatas = { playgroundCards: getDefaultPlaygroundCards(), candidateCards: [], score: 0, bestScore: 0, gameState: '' };
  GAME_SYSTEM.appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
  GAME_SYSTEM.appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
  return gameDatas;
}

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
//#endregion

function recordTokenToRequestMapping(token) {
  if (token != null && !requestMapping.has(token)) {
    requestMapping.set(token, GAME_SYSTEM.initDatas());
  }
}

function getGameDatasByToken(token) {
  return requestMapping.get(token);
}

function resetGameDatas(socket) {
  let token = socket.handshake.query.token;
  requestMapping.set(token, GAME_SYSTEM.initDatas());
  emitGameDatas(socket);
}

function emitGameDatas(socket) {
  const gameDatas = GAME_SYSTEM.getGameDatasByToken(socket.handshake.query.token);
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
