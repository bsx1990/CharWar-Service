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
const EACH_CHAR_CARD_GENERATE_RATE = CONFIG.eachCharCardGenerateRate;
const CHAR_CARD_TYPE = CONFIG.charCardType;
const CHAR_CARDS_GENERATE_RATE = CONFIG.CHAR_CARDS_GENERATE_RATE;
const MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD = CONFIG.MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
const SKILL_NAMES = CONFIG.skillNames;
const PLAY_SKILL = CONFIG.responseType.playSkill;
const SKILL_PRIORITY = CONFIG.skillPriority;
const SKILL_TYPE = CONFIG.skillType;

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
  EACH_CHAR_CARD_GENERATE_RATE: EACH_CHAR_CARD_GENERATE_RATE,
  CHAR_CARD_TYPE,
  CHAR_CARDS_GENERATE_RATE,
  MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD,
  SKILL_NAMES,
  PLAY_SKILL,
  SKILL_PRIORITY,
  SKILL_TYPE,

  appendRandomCandidateCard: (numberCardsMap, candidateCards) => {
    DATAS_SYSTEM.appendRandomCandidateCard(numberCardsMap, candidateCards);
  },
  getGameDatasByToken: token => {
    return DATAS_SYSTEM.getGameDatasByToken(token);
  },
  clickCard: (socket, rowIndex, columnIndex) => {
    LOGIC_SYSTEM.clickCard(socket, rowIndex, columnIndex);
  },
  replay: socket => {
    LOGIC_SYSTEM.replay(socket);
  },
  resetGameDatas: socket => {
    DATAS_SYSTEM.resetGameDatas(socket);
  },
  emitGameDatas: socket => {
    DATAS_SYSTEM.emitGameDatas(socket);
  },
  changeGameMode: (socket, mode) => {
    DATAS_SYSTEM.setCurrentGameMode(socket, mode);
  },
  getTokenBySocket: socket => {
    return socket.handshake.query.token;
  },
  getGameModeByToken: token => {
    return DATAS_SYSTEM.getGameModeByToken(token);
  },
  getCardKeyByRowAndColumn: (rowIndex, columnIndex) => {
    return DATAS_SYSTEM.getCardKeyByRowAndColumn(rowIndex, columnIndex);
  },
  createCard: (rowIndex, columnIndex, value) => {
    return DATAS_SYSTEM.createCard(rowIndex, columnIndex, value);
  },
  generateRandomValue: (minValue, maxValue) => {
    return DATAS_SYSTEM.generateRandomValue(minValue, maxValue);
  },
  getMaxCardValue: numberCardsMap => {
    return DATAS_SYSTEM.getMaxCardValue(numberCardsMap);
  },
  getRandomEmptyCard: emptyCardsMap => {
    return DATAS_SYSTEM.getRandomEmptyCard(emptyCardsMap);
  },
  getRandomCharValue: () => {
    return DATAS_SYSTEM.getRandomCharValue();
  },
  setCard: (gameDatas, card) => {
    DATAS_SYSTEM.setCard(gameDatas, card);
  },
  getSumOfCardValues: cards => {
    return SCORE_SYSTEM.getSumOfCardValues(cards);
  },
  isBestScoreUpdated: gameDatas => {
    return SCORE_SYSTEM.isBestScoreUpdated(gameDatas);
  },
  canExecuteCombinedSkill: (combinedInfor, gameDatas) => {
    return SKILL_SYSTEM.canExecuteCombinedSkill(combinedInfor, gameDatas);
  },
  getCardFromGameDatas: (gameDatas, rowIndex, columnIndex) => {
    return DATAS_SYSTEM.getCardFromGameDatas(gameDatas, rowIndex, columnIndex);
  },
  decreaseCard: card => {
    return DATAS_SYSTEM.decreaseCard(card);
  },
  checkGameStatusAfterCombined: gameDatas => {
    return LOGIC_SYSTEM.checkGameStatusAfterCombined(gameDatas);
  },
  recordInfor: text => {
    LOG_SYSTEM.infor(text);
  },
  recordError: text => {
    LOG_SYSTEM.error(text);
  },
  recordObject: obj => {
    LOG_SYSTEM.object(obj);
  },
  recordNoPrefixLog: text => {
    LOG_SYSTEM.noPrefix(text);
  },
  getPrintedGameDatas: gameDatas => {
    return DATAS_SYSTEM.getPrintedGameDatas(gameDatas);
  }
};

let DATAS_SYSTEM = require('./game_datas_system/game-datas-system');
let LOGIC_SYSTEM = require('./game-logic-system/logic-system');
let SCORE_SYSTEM = require('./score-system');
let SKILL_SYSTEM = require('./combine-skill-system');
let LOG_SYSTEM = require('./log-system');
