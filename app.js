const APP = require('http').createServer();
const IO = require('socket.io')(APP);
const CONFIG = require('./config/game-config');
const GAME_SYSTEM = require('./game_system/game-system');

const PLAYGROUND_CARDS_CHANGED = CONFIG.responseType.playgroundCardsChanged;
const CANDIDATE_CARDS_CHANGED = CONFIG.responseType.candidateCardsChanged;
const SCORE_CHANGED = CONFIG.responseType.scoreChanged;
const BEST_SCORE_CHANGED = CONFIG.responseType.bestScoreChanged;
const CLICK_CARD = CONFIG.requestType.clickCard;

APP.listen(CONFIG.PORT);

IO.on('connection', function(socket) {
  console.log(`received connection request, request id: ${socket.id}, token is:${socket.handshake.query.token}`);
  GAME_SYSTEM.recordTokenToRequestMapping(socket.handshake.query.token);

  socket.on(CONFIG.requestType.getData, () => {
    console.log(`received getData request, request id: ${socket.id}, token is:${socket.handshake.query.token}`);
    const gameDatas = GAME_SYSTEM.getGameDatasByToken(socket.handshake.query.token);
    const playgroundCards = gameDatas.playgroundCards;
    const candidateCards = gameDatas.candidateCards;
    const score = gameDatas.score;
    const bestScore = gameDatas.bestScore;

    socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);
    socket.emit(CANDIDATE_CARDS_CHANGED, candidateCards);
    socket.emit(SCORE_CHANGED, score);
    socket.emit(BEST_SCORE_CHANGED, bestScore);
  });

  socket.on(CLICK_CARD, (rowIndex, columnIndex) => {
    console.log(`received clickCard request from token is:${socket.handshake.query.token}, rowIndex:${rowIndex} columnIndex:${columnIndex}`);
    GAME_SYSTEM.clickCard(socket, rowIndex, columnIndex);
  });
});

console.log('app listen at:' + CONFIG.PORT);
