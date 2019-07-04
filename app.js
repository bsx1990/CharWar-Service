const app = require("http").createServer();
const IO = require("socket.io")(app);
const config = require("./config/game-config");

let playgroundCards = [];
let candidateCards = [];
let socket;
let score = 0;
let bestScore = 0;

app.listen(config.PORT);

IO.on("connection", function(msgResponse) {
  console.log("received connection request");

  socket = msgResponse;
  socket.on(config.requestType.getData, () => {
    console.log("received getData request");

    initDefaultPlaygroundCards();
    emitPlaygroundCardsChanged();

    candidateCards = [];
    appendCandidateCard();
    appendCandidateCard();
    emitCandidateCardsChanged();

    score = 0;
    emitScoreChanged();

    bestScore = 0;
    emitBestScoreChanged();
  });

  msgResponse.on(config.requestType.clickCard, (rowIndex, columnIndex) => {
    console.log(`received clickCard request, rowIndex:${rowIndex} columnIndex:${columnIndex}`);
    clickCard(rowIndex, columnIndex);
  });
});

function emitCandidateCardsChanged() {
  socket.emit(config.responseType.candidateCardsChanged, candidateCards);
}

function emitPlaygroundCardsChanged() {
  socket.emit(config.responseType.playgroundCardsChanged, playgroundCards);
}

function emitScoreChanged() {
  console.log(`send score changed event, current score: ${score}`);
  socket.emit(config.responseType.scoreChanged, score);
}

function emitBestScoreChanged() {
  console.log(`send best score changed event, current best score: ${bestScore}`);
  socket.emit(config.responseType.bestScoreChanged, bestScore);
}

function initDefaultPlaygroundCards() {
  for (let row = 0; row < config.PLAYGROUND_SIZE; row++) {
    playgroundCards[row] = [];
    for (let column = 0; column < config.PLAYGROUND_SIZE; column++) {
      playgroundCards[row][column] = null;
    }
  }
}

function appendCandidateCard() {
  candidateCards.push(generateCard());
}

function generateCard() {
  let maxCard = Math.max(...Array.prototype.concat.apply([], playgroundCards));
  if (isNaN(maxCard)) {
    maxCard = 0;
  }

  if (maxCard > config.MAX_GENERATED_CARD) {
    maxCard = config.MAX_GENERATED_CARD;
  }

  return Math.trunc(Math.random() * maxCard + 1);
}

function clickCard(rowIndex, columnIndex) {
  if (playgroundCards[rowIndex][columnIndex] != null) {
    return;
  }

  let currentCandidateCard = candidateCards.shift();
  appendCandidateCard();
  emitCandidateCardsChanged();

  playgroundCards[rowIndex][columnIndex] = currentCandidateCard;
  emitPlaygroundCardsChanged();

  let combinedCardsIndexs = getSameCardsFromAround(rowIndex, columnIndex);
  while (combinedCardsIndexs.length > 0) {
    let combinedScore = sumCombinedCards(combinedCardsIndexs);
    score += combinedScore;
    emitScoreChanged();

    if (score > bestScore) {
      bestScore = score;
      emitBestScoreChanged();
    }

    combineCards(combinedCardsIndexs, rowIndex, columnIndex);
    emitPlaygroundCardsChanged();

    combinedCardsIndexs = getSameCardsFromAround(rowIndex, columnIndex);
  }
}

function getSameCardsFromAround(rowIndex, columnIndex) {
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

function sumCombinedCards(combinedCardsIndexs) {
  let result = 0;
  combinedCardsIndexs.forEach(index => {
    result += playgroundCards[index[0]][index[1]];
  });
  return result;
}

function combineCards(combinedCardsIndexs, rowIndex, columnIndex) {
  combinedCardsIndexs.forEach(index => {
    playgroundCards[index[0]][index[1]] = null;
  });

  playgroundCards[rowIndex][columnIndex] = playgroundCards[rowIndex][columnIndex] + 1;
}

console.log("app listen at:" + config.PORT);
