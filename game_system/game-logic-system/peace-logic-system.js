module.exports = {
  combineCardsWithReceivedCard,
  preHandleClickRequest
};

function combineCardsWithReceivedCard(gameDatas, clickedCard) {
  LOGIC_SYSTEM.placeCardAtClickedPositionAndEmitChange(gameDatas, clickedCard);

  const combinedInfor = LOGIC_SYSTEM.combinCardsUntilNoSameCardsAroundAndReturnCombinedInfor(gameDatas, clickedCard);
  LOGIC_SYSTEM.updateAndEmitScoreChanged(combinedInfor.score, gameDatas);
  LOGIC_SYSTEM.checkGameStatusAfterCombined(gameDatas);

  LOGIC_SYSTEM.recordGameDatasToLog(gameDatas);
}

function preHandleClickRequest(gameDatas, clickedCard) {
  const HANDLED = true;
  const UNHANDLED = false;
  const playgroundCards = gameDatas.playgroundCards;
  const hasCardAtClickedPosition = playgroundCards[clickedCard.row][clickedCard.column] != null;
  if (hasCardAtClickedPosition) {
    return HANDLED;
  }
  return UNHANDLED;
}

const GAME_SYSTEM = require('../game-system');
const LOGIC_SYSTEM = require('./logic-system');
