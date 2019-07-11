const CONFIG = require('../config/game-config');
const GAME_MODES = CONFIG.gameModes;
const PLAYGROUND_CARDS_CHANGED = CONFIG.responseType.playgroundCardsChanged;
const CANDIDATE_CARDS_CHANGED = CONFIG.responseType.candidateCardsChanged;
const SCORE_CHANGED = CONFIG.responseType.scoreChanged;
const BEST_SCORE_CHANGED = CONFIG.responseType.bestScoreChanged;
const GAME_STATE_CHANGED = CONFIG.responseType.gameStateChanged;
const PLAYGROUND_SIZE = CONFIG.PLAYGROUND_SIZE;
const MAX_GENERATED_CARD = CONFIG.MAX_GENERATED_CARD;
const ALL_AROUND_ARROW = CONFIG.ALL_AROUND_ARROW;
const GET_DATA = CONFIG.requestType.getData;
const CLICK_CARD = CONFIG.requestType.clickCard;
const REPLAY = CONFIG.requestType.replay;
const GAME_MODE_CHANGED = CONFIG.requestType.gameModeChanged;
const PORT = CONFIG.PORT;

module.exports = {
  GAME_MODES,
  PLAYGROUND_CARDS_CHANGED,
  CANDIDATE_CARDS_CHANGED,
  SCORE_CHANGED,
  BEST_SCORE_CHANGED,
  GAME_STATE_CHANGED,
  PLAYGROUND_SIZE,
  MAX_GENERATED_CARD,
  ALL_AROUND_ARROW,
  GET_DATA,
  CLICK_CARD,
  REPLAY,
  GAME_MODE_CHANGED,
  PORT,

  initDatas: () => {
    return gameDatasSystem.initDatas();
  },
  appendCandidateCard: (playgroundCards, candidateCards) => {
    candidateCardSystem.appendCandidateCard(playgroundCards, candidateCards);
  },
  recordTokenToRequestMapping: token => {
    gameDatasSystem.recordTokenToRequestMapping(token);
  },
  getGameDatasByToken: token => {
    return gameDatasSystem.getGameDatasByToken(token);
  },
  clickCard: (socket, rowIndex, columnIndex) => {
    gameLogicSystem.clickCard(socket, rowIndex, columnIndex);
  },
  replay: socket => {
    gameLogicSystem.replay(socket);
  },
  resetGameDatas: socket => {
    gameDatasSystem.resetGameDatas(socket);
  },
  emitGameDatas: socket => {
    gameDatasSystem.emitGameDatas(socket);
  },
  changeGameMode: (token, mode) => {
    gameDatasSystem.setCurrentGameMode(token, mode);
  },
  getTokenBySocket: socket => {
    return socket.handshake.query.token;
  }
};

let candidateCardSystem = require('./candidate-card-system');
let gameDatasSystem = require('./game-datas-system');
let gameLogicSystem = require('./game-logic-system');
