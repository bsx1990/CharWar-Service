module.exports = {
  clickCard
};

function clickCard(gameDatas, rowIndex, columnIndex) {
  let playgroundCards = gameDatas.playgroundCards;
  const hasCardAtClickedPosition = playgroundCards[rowIndex][columnIndex] != null;
  if (hasCardAtClickedPosition) {
    return;
  }

  const clickedCard = GAME_SYSTEM.getCardFromGameDatas(gameDatas, rowIndex, columnIndex);
  clickedCard.value = gameDatas.candidateCards.shift();
  LOGIC_SYSTEM.placeCardsBeforeCombinCards(gameDatas, clickedCard);

  const combinedInfor = LOGIC_SYSTEM.combinCardsUntilNoSameCardsAroundAndReturnCombinedInfor(gameDatas, clickedCard);
  LOGIC_SYSTEM.updateAndEmitScoreChanged(combinedInfor.score, gameDatas);
  LOGIC_SYSTEM.checkGameStatusAfterCombined(gameDatas);
}

const GAME_SYSTEM = require('../game-system');
const LOGIC_SYSTEM = require('./logic-system');
