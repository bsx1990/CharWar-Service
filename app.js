const app = require("http").createServer();
const IO = require("socket.io")(app);
const config = require("./config/game-config");

let requestMapping = new Map();

app.listen(config.PORT);

IO.on("connection", function(socket) {
  console.log(`received connection request, request id: ${socket.id}`);

  let gameDatas = { playgroundCards: [], candidateCards: [], score: 0, bestScore: 0 };
  requestMapping.set(socket.id, gameDatas);

  socket.on(config.requestType.getData, () => {
    console.log(`received getData request, request id: ${socket.id}`);

    initDefaultPlaygroundCards(socket.id);
    emitPlaygroundCardsChanged(socket);

    requestMapping.get(socket.id).candidateCards = [];
    appendCandidateCard(socket.id);
    appendCandidateCard(socket.id);
    emitCandidateCardsChanged(socket);

    requestMapping.get(socket.id).score = 0;
    emitScoreChanged(socket);

    requestMapping.get(socket.id).bestScore = 0;
    emitBestScoreChanged(socket);
  });

  socket.on(config.requestType.clickCard, (rowIndex, columnIndex) => {
    console.log(`received clickCard request, rowIndex:${rowIndex} columnIndex:${columnIndex}`);
    clickCard(socket, rowIndex, columnIndex);
  });
});

function emitCandidateCardsChanged(socket) {
  socket.emit(config.responseType.candidateCardsChanged, requestMapping.get(socket.id).candidateCards);
}

function emitPlaygroundCardsChanged(socket) {
  socket.emit(config.responseType.playgroundCardsChanged, requestMapping.get(socket.id).playgroundCards);
}

function emitScoreChanged(socket) {
  console.log(`send score changed event, current score: ${requestMapping.get(socket.id).score}`);
  socket.emit(config.responseType.scoreChanged, requestMapping.get(socket.id).score);
}

function emitBestScoreChanged(socket) {
  console.log(`send best score changed event, current best score: ${requestMapping.get(socket.id).bestScore}`);
  socket.emit(config.responseType.bestScoreChanged, requestMapping.get(socket.id).bestScore);
}

function initDefaultPlaygroundCards(socketId) {
  let playgroundCards = requestMapping.get(socketId).playgroundCards;

  for (let row = 0; row < config.PLAYGROUND_SIZE; row++) {
    playgroundCards[row] = [];
    for (let column = 0; column < config.PLAYGROUND_SIZE; column++) {
      playgroundCards[row][column] = null;
    }
  }
}

function appendCandidateCard(socketId) {
  let playgroundCards = requestMapping.get(socketId).playgroundCards;
  requestMapping.get(socketId).candidateCards.push(generateCard(playgroundCards));
}

function generateCard(playgroundCards) {
  let maxCard = Math.max(...Array.prototype.concat.apply([], playgroundCards));
  if (isNaN(maxCard)) {
    maxCard = 0;
  }

  if (maxCard > config.MAX_GENERATED_CARD) {
    maxCard = config.MAX_GENERATED_CARD;
  }

  return Math.trunc(Math.random() * maxCard + 1);
}

function clickCard(socket, rowIndex, columnIndex) {
  let socketId = socket.id;
  let playgroundCards = requestMapping.get(socketId).playgroundCards;

  if (playgroundCards[rowIndex][columnIndex] != null) {
    return;
  }

  let currentCandidateCard = requestMapping.get(socketId).candidateCards.shift();
  appendCandidateCard(socketId);
  emitCandidateCardsChanged(socket);

  playgroundCards[rowIndex][columnIndex] = currentCandidateCard;
  emitPlaygroundCardsChanged(socket);

  let combinedCardsIndexs = getSameCardsFromAround(playgroundCards, rowIndex, columnIndex);
  while (combinedCardsIndexs.length > 0) {
    let combinedScore = sumCombinedCards(playgroundCards, combinedCardsIndexs);
    requestMapping.get(socketId).score += combinedScore;
    emitScoreChanged(socket);

    if (requestMapping.get(socketId).score > requestMapping.get(socketId).bestScore) {
      requestMapping.get(socketId).bestScore = requestMapping.get(socketId).score;
      emitBestScoreChanged(socket);
    }

    combineCards(playgroundCards, combinedCardsIndexs, rowIndex, columnIndex);
    emitPlaygroundCardsChanged(socket);

    combinedCardsIndexs = getSameCardsFromAround(playgroundCards, rowIndex, columnIndex);
  }
}

function getSameCardsFromAround(playgroundCards, rowIndex, columnIndex) {
  const centerCard = playgroundCards[rowIndex][columnIndex];
  let result = [];

  const arrows = [
    config.ARROW.LEFT_UP,
    config.ARROW.UP,
    config.ARROW.RIGHT_UP,
    config.ARROW.LEFT,
    config.ARROW.RIGHT,
    config.ARROW.LEFT_DOWN,
    config.ARROW.DOWN,
    config.ARROW.RIGHT_DOWN
  ];
  arrows.forEach(arrow => {
    const columnOffset = arrow[0];
    const rowOffset = arrow[1];
    const targetRowIndex = rowIndex + rowOffset;
    const targetColumnIndex = columnIndex + columnOffset;

    if (isOutofPlaygroundRange(targetRowIndex) || isOutofPlaygroundRange(targetColumnIndex)) {
      return;
    }

    if (playgroundCards[targetRowIndex][targetColumnIndex] === centerCard) {
      result.push([targetRowIndex, targetColumnIndex]);
    }
  });

  return result;
}

function isOutofPlaygroundRange(index) {
  return config.PLAYGROUND_SIZE <= index || index < 0;
}

function sumCombinedCards(playgroundCards, combinedCardsIndexs) {
  let result = 0;
  combinedCardsIndexs.forEach(index => {
    result += playgroundCards[index[0]][index[1]];
  });
  return result;
}

function combineCards(playgroundCards, combinedCardsIndexs, rowIndex, columnIndex) {
  combinedCardsIndexs.forEach(index => {
    playgroundCards[index[0]][index[1]] = null;
  });

  playgroundCards[rowIndex][columnIndex] = playgroundCards[rowIndex][columnIndex] + 1;
}

console.log("app listen at:" + config.PORT);
