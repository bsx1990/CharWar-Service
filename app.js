const APP = require('http').createServer();
const IO = require('socket.io')(APP);
const GAME_SYSTEM = require('./game_system/game-system');

const GET_DATA = GAME_SYSTEM.GET_DATA;
const CLICK_CARD = GAME_SYSTEM.CLICK_CARD;
const REPLAY = GAME_SYSTEM.REPLAY;
const GAME_MODE_CHANGED = GAME_SYSTEM.GAME_MODE_CHANGED;
const recordInfor = GAME_SYSTEM.recordInfor;
const recordError = GAME_SYSTEM.recordError;

APP.listen(GAME_SYSTEM.PORT);

IO.on('connection', function(socket) {
  let token = GAME_SYSTEM.getTokenBySocket(socket);
  recordInfor(`received connection request, request id: ${socket.id}, token is:${token}`);
  if (token == undefined || token == null) {
    recordError('token is empth, exit.');
    return;
  }

  socket.on(GET_DATA, () => {
    recordInfor(`received getData request, request id: ${socket.id}, token is:${GAME_SYSTEM.getTokenBySocket(socket)}`);
    GAME_SYSTEM.emitGameDatas(socket);
  });

  socket.on(CLICK_CARD, (rowIndex, columnIndex) => {
    recordInfor(`received clickCard request from token is:${GAME_SYSTEM.getTokenBySocket(socket)}, rowIndex:${rowIndex} columnIndex:${columnIndex}`);
    GAME_SYSTEM.clickCard(socket, rowIndex, columnIndex);
  });

  socket.on(REPLAY, () => {
    recordInfor(`received replay request from token is:${GAME_SYSTEM.getTokenBySocket(socket)}`);
    GAME_SYSTEM.replay(socket);
  });

  socket.on(GAME_MODE_CHANGED, mode => {
    recordInfor(`received gameModeChanged request from token is:${socket.handshake.query.token}`);
    GAME_SYSTEM.changeGameMode(socket, mode);
  });
});

recordInfor('app listen at:' + GAME_SYSTEM.PORT);
