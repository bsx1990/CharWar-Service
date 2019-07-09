module.exports = {
  initDatas: initDatas,
  recordTokenToRequestMapping: recordTokenToRequestMapping,
  getGameDatasByToken: getGameDatasByToken
};

const GAME_SYSTEM = require('./game-system');
const CONFIG = require('../config/game-config');

let requestMapping = new Map();

//#region initDatas
function initDatas() {
  const gameDatas = { playgroundCards: getDefaultPlaygroundCards(), candidateCards: [], score: 0, bestScore: 0 };
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
