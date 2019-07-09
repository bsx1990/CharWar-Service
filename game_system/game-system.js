module.exports = {
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
  }
};

let candidateCardSystem = require('./candidate-card-system');
let gameDatasSystem = require('./game-datas-system');
let gameLogicSystem = require('./game-logic-system');
