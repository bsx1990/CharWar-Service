module.exports = {
  initDatas: initDatas,
  recordTokenToRequestMapping: recordTokenToRequestMapping,
  getGameDatasByToken: getGameDatasByToken,
  resetGameDatas: resetGameDatas,
  emitGameDatas: emitGameDatas,
  setCurrentGameMode: setCurrentGameMode
};

const GAME_SYSTEM = require('./game-system');

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
  const gameDatas = { playgroundCards: getDefaultPlaygroundCards(), candidateCards: [], score: 0, bestScore: 0, gameState: '' };
  GAME_SYSTEM.appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
  GAME_SYSTEM.appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
  return gameDatas;
}

function getDefaultPlaygroundCards() {
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
