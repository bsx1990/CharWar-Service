const APP = require('http').createServer();
const IO = require('socket.io')(APP);
const CONFIG = require('./config/game-config');
const GAME_SYSTEM = require('./game_system/game-system');

const CLICK_CARD = CONFIG.requestType.clickCard;
const REPLAY = CONFIG.requestType.replay;

APP.listen(CONFIG.PORT);

IO.on('connection', function(socket) {
  console.log(`received connection request, request id: ${socket.id}, token is:${socket.handshake.query.token}`);
  GAME_SYSTEM.recordTokenToRequestMapping(socket.handshake.query.token);

  socket.on(CONFIG.requestType.getData, () => {
    console.log(`received getData request, request id: ${socket.id}, token is:${socket.handshake.query.token}`);
    GAME_SYSTEM.emitGameDatas(socket);
  });

  socket.on(CLICK_CARD, (rowIndex, columnIndex) => {
    console.log(`received clickCard request from token is:${socket.handshake.query.token}, rowIndex:${rowIndex} columnIndex:${columnIndex}`);
    GAME_SYSTEM.clickCard(socket, rowIndex, columnIndex);
  });

  socket.on(REPLAY, () => {
    console.log(`received replay request from token is:${socket.handshake.query.token}`);
    GAME_SYSTEM.replay(socket);
  });
});

console.log('app listen at:' + CONFIG.PORT);
