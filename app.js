const APP = require('http').createServer();
const IO = require('socket.io')(APP);
const GAME_SYSTEM = require('./game_system/game-system');

const GET_DATA = GAME_SYSTEM.GET_DATA;
const CLICK_CARD = GAME_SYSTEM.CLICK_CARD;
const REPLAY = GAME_SYSTEM.REPLAY;
const GAME_MODE_CHANGED = GAME_SYSTEM.GAME_MODE_CHANGED;

APP.listen(GAME_SYSTEM.PORT);

IO.on('connection', function(socket) {
  let token = GAME_SYSTEM.getTokenBySocket(socket);
  console.log(`received connection request, request id: ${socket.id}, token is:${token}`);
  if (token == undefined || token == null) {
    console.log('token is empth, exit.');
    return;
  }

  socket.on(GET_DATA, () => {
    console.log(`received getData request, request id: ${socket.id}, token is:${GAME_SYSTEM.getTokenBySocket(socket)}`);
    GAME_SYSTEM.emitGameDatas(socket);
  });

  socket.on(CLICK_CARD, (rowIndex, columnIndex) => {
    console.log(`received clickCard request from token is:${GAME_SYSTEM.getTokenBySocket(socket)}, rowIndex:${rowIndex} columnIndex:${columnIndex}`);
    GAME_SYSTEM.clickCard(socket, rowIndex, columnIndex);
  });

  socket.on(REPLAY, () => {
    console.log(`received replay request from token is:${GAME_SYSTEM.getTokenBySocket(socket)}`);
    GAME_SYSTEM.replay(socket);
  });

  socket.on(GAME_MODE_CHANGED, mode => {
    console.log(`received gameModeChanged request from token is:${socket.handshake.query.token}`);
    GAME_SYSTEM.changeGameMode(GAME_SYSTEM.getTokenBySocket(socket), mode);
  });
});

console.log('app listen at:' + GAME_SYSTEM.PORT);
