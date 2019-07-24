module.exports = {
  clickCard
};

function clickCard(socket, rowIndex, columnIndex) {
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  const gameDatas = GAME_SYSTEM.getGameDatasByToken(token);

  let playgroundCards = gameDatas.playgroundCards;
  const hasCardAtClickedPosition = playgroundCards[rowIndex][columnIndex] != null;
  if (hasCardAtClickedPosition) {
    return;
  }

  const currentCard = GAME_SYSTEM.createCard(rowIndex, columnIndex, gameDatas.candidateCards.shift());
  LOGIC_SYSTEM.placeCardsBeforeCombinCards(socket, gameDatas, currentCard, token);

  const combinedInfor = LOGIC_SYSTEM.combinCardsUntilNoSameCardsAroundAndReturnCombinedInfor(socket, gameDatas, currentCard);
  LOGIC_SYSTEM.updateAndEmitScoreChanged(combinedInfor.score, gameDatas, socket);
  LOGIC_SYSTEM.checkGameStatusAfterCombined(socket, gameDatas);
}

const GAME_SYSTEM = require('../game-system');
const LOGIC_SYSTEM = require('./logic-system');
