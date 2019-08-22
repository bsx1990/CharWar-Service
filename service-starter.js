let APP = require('http').createServer();
let IO = require('socket.io')(APP);
const GAME_SYSTEM = require('./game_system/game-system');

const GET_DATA = GAME_SYSTEM.GET_DATA;
const CLICK_CARD = GAME_SYSTEM.CLICK_CARD;
const REPLAY = GAME_SYSTEM.REPLAY;
const GAME_MODE_CHANGED = GAME_SYSTEM.GAME_MODE_CHANGED;
const recordInfor = GAME_SYSTEM.recordInfor;
const recordError = GAME_SYSTEM.recordError;

function startServer(port) {
  APP.listen(port);
  IO = require('socket.io')(APP);
  IO.on('connection', function(socket) {
    let token = GAME_SYSTEM.getTokenBySocket(socket);
    recordInfor(`received connection request, request id: ${socket.id}, token is:${token}`);
    if (token == undefined || token == null) {
      recordError('token is empth, exit.');
      return;
    }

    subscribeGetData(socket);
    subscribeClickCard(socket);
    subscribeReplay(socket);
    subscribeGameModeChange(socket);
  });
  recordInfor(`app listen at:${port}`);
}

function subscribeGameModeChange(socket) {
  socket.on(GAME_MODE_CHANGED, mode => {
    recordInfor(`received gameModeChanged request from token:${socket.handshake.query.token}, new mode:${mode}`);
    GAME_SYSTEM.changeGameMode(socket, mode);
  });
}

function subscribeReplay(socket) {
  socket.on(REPLAY, callback => {
    recordInfor(`received replay request from token is:${GAME_SYSTEM.getTokenBySocket(socket)}`);
    GAME_SYSTEM.replay(socket);
    if (callback != null) {
      callback();
    }
  });
}

function subscribeClickCard(socket) {
  socket.on(CLICK_CARD, (rowIndex, columnIndex, callback) => {
    recordInfor(`received clickCard request from token is:${GAME_SYSTEM.getTokenBySocket(socket)}, rowIndex:${rowIndex} columnIndex:${columnIndex}`);
    GAME_SYSTEM.clickCard(socket, rowIndex, columnIndex);
    if (callback != null) {
      callback();
    }
  });
}

function subscribeGetData(socket) {
  socket.on(GET_DATA, () => {
    const token = GAME_SYSTEM.getTokenBySocket(socket);
    const gameDatas = GAME_SYSTEM.getGameDatasByToken(token);
    recordInfor(`received getData request, request id: ${socket.id}, token is:${token}`);
    GAME_SYSTEM.emitGameDatas(gameDatas);
  });
}

function stopServer() {
  IO.close(() => {
    APP.close(() => {
      recordInfor(`service stopped`);
    });
  });
}

module.exports = {
  startServer,
  stopServer,
  GAME_SYSTEM
};
