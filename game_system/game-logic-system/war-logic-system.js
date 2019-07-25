module.exports = {
  clickCard
};

function clickCard(socket, rowIndex, columnIndex) {
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  const gameDatas = GAME_SYSTEM.getGameDatasByToken(token);

  let playgroundCards = gameDatas.playgroundCards;
  let emptyCardsMap = gameDatas.emptyCardsMap;
  let numberCardsMap = gameDatas.numberCardsMap;
  const hasCardAtClickedPosition = playgroundCards[rowIndex][columnIndex] != null;
  const needResponseSkill = gameDatas.gameState == 'SelectTarget';

  if (needResponseSkill && hasCardAtClickedPosition) {
    responseSkill(gameDatas, socket, rowIndex, columnIndex);
    return;
  }

  if ((needResponseSkill && !hasCardAtClickedPosition) || (!needResponseSkill && hasCardAtClickedPosition)) {
    return;
  }

  const currentCard = GAME_SYSTEM.createCard(rowIndex, columnIndex, gameDatas.candidateCards.shift());
  LOGIC_SYSTEM.placeCardsBeforeCombinCards(socket, gameDatas, currentCard, token);

  let canGenerateCharCard = canGenerateRandomCharCard(emptyCardsMap, numberCardsMap);
  if (canGenerateCharCard) {
    generateCharCard(emptyCardsMap, socket, gameDatas);
  }

  const combinedInfor = LOGIC_SYSTEM.combinCardsUntilNoSameCardsAroundAndReturnCombinedInfor(socket, gameDatas, currentCard);
  if (GAME_SYSTEM.canExecuteCombinedSkill(combinedInfor, gameDatas)) {
    executeCombinedSkill(combinedInfor, socket, gameDatas);
  } else {
    LOGIC_SYSTEM.updateAndEmitScoreChanged(combinedInfor.score, gameDatas, socket);
    LOGIC_SYSTEM.checkGameStatusAfterCombined(socket, gameDatas);
  }
}

function responseSkill(gameDatas, socket, rowIndex, columnIndex) {
  const token = GAME_SYSTEM.getTokenBySocket(socket);
  var clickedCard = GAME_SYSTEM.getCardFromGameDatas(gameDatas, rowIndex, columnIndex);
  if (clickedCard == null) {
    return;
  }
  clickedCard = GAME_SYSTEM.decreaseCard(clickedCard);
  GAME_SYSTEM.setCharCard(token, clickedCard);
  gameDatas.gameState = null;
  GAME_SYSTEM.emitGameDatas(socket);
  LOGIC_SYSTEM.checkGameStatusAfterCombined(socket, gameDatas);
  return clickedCard;
}

function canGenerateRandomCharCard(emptyCardsMap, numberCardsMap) {
  const hasEmpthCards = emptyCardsMap.size > 0;
  const maxCardLargeThanGenerateLimit = GAME_SYSTEM.getMaxCardValue(numberCardsMap) > MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
  let random = GAME_SYSTEM.generateRandomValue(1, 100);
  const isRandomMatchedGenerateRate = random <= GAME_SYSTEM.CHAR_CARDS_GENERATE_RATE;

  return hasEmpthCards && maxCardLargeThanGenerateLimit && isRandomMatchedGenerateRate;
}

function generateCharCard(emptyCardsMap, socket, gameDatas) {
  let card = GAME_SYSTEM.getRandomEmptyCard(emptyCardsMap);
  card.value = GAME_SYSTEM.getRandomCharValue();

  const token = GAME_SYSTEM.getTokenBySocket(socket);
  GAME_SYSTEM.setCharCard(token, card);
  socket.emit(PLAYGROUND_CARDS_CHANGED, gameDatas.playgroundCards);
}

function executeCombinedSkill(combinedInfor, socket, gameDatas) {
  const skill = combinedInfor.skill;
  socket.emit(PLAY_SKILL, skill.name);

  if (skill.type == 'buff') {
    skill.execute(combinedInfor);
    LOGIC_SYSTEM.updateAndEmitScoreChanged(combinedInfor.score, gameDatas, socket);
    LOGIC_SYSTEM.checkGameStatusAfterCombined(socket, gameDatas);
  } else {
    console.log('got action skill');
    gameDatas.gameState = 'SelectTarget';
    socket.emit(GAME_STATE_CHANGED, gameDatas.gameState);
  }
}

const GAME_SYSTEM = require('../game-system');
const LOGIC_SYSTEM = require('./logic-system');
const MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD = GAME_SYSTEM.MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
const PLAY_SKILL = GAME_SYSTEM.PLAY_SKILL;
const PLAYGROUND_CARDS_CHANGED = GAME_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const GAME_STATE_CHANGED = GAME_SYSTEM.GAME_STATE_CHANGED;
