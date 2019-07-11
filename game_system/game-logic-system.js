module.exports = {
  clickCard: clickCard,
  replay: replay
};

const GAME_SYSTEM = require('./game-system');

const PLAYGROUND_CARDS_CHANGED = GAME_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const CANDIDATE_CARDS_CHANGED = GAME_SYSTEM.CANDIDATE_CARDS_CHANGED;
const SCORE_CHANGED = GAME_SYSTEM.SCORE_CHANGED;
const BEST_SCORE_CHANGED = GAME_SYSTEM.BEST_SCORE_CHANGED;
const GAME_STATE_CHANGED = GAME_SYSTEM.GAME_STATE_CHANGED;
const ALL_AROUND_ARROW = GAME_SYSTEM.ALL_AROUND_ARROW;
const PLAYGROUND_SIZE = GAME_SYSTEM.PLAYGROUND_SIZE;

function clickCard(socket, rowIndex, columnIndex) {
  const gameDatas = GAME_SYSTEM.getGameDatasByToken(socket.handshake.query.token);
  let playgroundCards = gameDatas.playgroundCards;

  const hasCardAtClickedPosition = playgroundCards[rowIndex][columnIndex] != null;
  if (hasCardAtClickedPosition) {
    return;
  }

  placeCardsBeforeCombinCards(socket, gameDatas, rowIndex, columnIndex);

  combinCardsUntilNoSameCardsAround(socket, gameDatas, rowIndex, columnIndex);

  CheckGameStatusAfterCombined(socket, gameDatas);
}

function placeCardsBeforeCombinCards(socket, gameDatas, rowIndex, columnIndex) {
  let currentCandidateCard = gameDatas.candidateCards.shift();
  generateAndEmitNewCandidateCards(socket, gameDatas);
  emitCurrentCandidateCardAtClickedPosition(socket, gameDatas, currentCandidateCard, rowIndex, columnIndex);
}

function generateAndEmitNewCandidateCards(socket, gameDatas) {
  GAME_SYSTEM.appendCandidateCard(gameDatas.playgroundCards, gameDatas.candidateCards);
  socket.emit(CANDIDATE_CARDS_CHANGED, gameDatas.candidateCards);
}

function emitCurrentCandidateCardAtClickedPosition(socket, gameDatas, currentCandidateCard, rowIndex, columnIndex) {
  gameDatas.playgroundCards[rowIndex][columnIndex] = currentCandidateCard;
  socket.emit(PLAYGROUND_CARDS_CHANGED, gameDatas.playgroundCards);
}

function combinCardsUntilNoSameCardsAround(socket, gameDatas, rowIndex, columnIndex) {
  let playgroundCards = gameDatas.playgroundCards;
  let combinedCardsIndexs = getSameCardsFromAround(playgroundCards, rowIndex, columnIndex);
  let foundSameCardsFromAround = combinedCardsIndexs.length > 0;

  while (foundSameCardsFromAround) {
    let combinedScore = sumCombinedCards(playgroundCards, combinedCardsIndexs);
    gameDatas.score += combinedScore;
    socket.emit(SCORE_CHANGED, gameDatas.score);
    if (gameDatas.score > gameDatas.bestScore) {
      gameDatas.bestScore = gameDatas.score;
      socket.emit(BEST_SCORE_CHANGED, gameDatas.bestScore);
    }

    combineCards(playgroundCards, combinedCardsIndexs, rowIndex, columnIndex);
    socket.emit(PLAYGROUND_CARDS_CHANGED, playgroundCards);

    combinedCardsIndexs = getSameCardsFromAround(playgroundCards, rowIndex, columnIndex);
    foundSameCardsFromAround = combinedCardsIndexs.length > 0;
  }
}

function getSameCardsFromAround(playgroundCards, rowIndex, columnIndex) {
  const centerCard = playgroundCards[rowIndex][columnIndex];
  let result = [];

  ALL_AROUND_ARROW.forEach(arrow => {
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
  return PLAYGROUND_SIZE <= index || index < 0;
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

function CheckGameStatusAfterCombined(socket, gameDatas) {
  const isGameOver = gameDatas.playgroundCards.filter(array => array.includes(undefined) || array.includes(null)).length == 0;
  if (isGameOver) {
    gameDatas.gameState = 'GameOver';
    console.log(`GAME OVER! request id: ${socket.id}, token is:${socket.handshake.query.token}`);
    socket.emit(GAME_STATE_CHANGED, gameDatas.gameState);
  }
}

function replay(socket) {
  GAME_SYSTEM.resetGameDatas(socket);
}
