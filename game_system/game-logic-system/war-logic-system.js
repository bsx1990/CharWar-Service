module.exports = {
  clickCard
};

function clickCard(gameDatas, rowIndex, columnIndex) {
  let playgroundCards = gameDatas.playgroundCards;
  let emptyCardsMap = gameDatas.emptyCardsMap;
  let numberCardsMap = gameDatas.numberCardsMap;
  const hasCardAtClickedPosition = playgroundCards[rowIndex][columnIndex] != null;
  const needResponseSkill = gameDatas.gameState == 'SelectTarget';
  const clickedCard = GAME_SYSTEM.getCardFromGameDatas(gameDatas, rowIndex, columnIndex);

  if (needResponseSkill && hasCardAtClickedPosition) {
    responseSkill(gameDatas, clickedCard);
    return;
  }

  if ((needResponseSkill && !hasCardAtClickedPosition) || (!needResponseSkill && hasCardAtClickedPosition)) {
    return;
  }

  clickedCard.value = gameDatas.candidateCards.shift();
  LOGIC_SYSTEM.placeCardsBeforeCombinCards(gameDatas, clickedCard);

  let canGenerateCharCard = canGenerateRandomCharCard(emptyCardsMap, numberCardsMap);
  if (canGenerateCharCard) {
    generateCharCard(emptyCardsMap, gameDatas);
  }

  const combinedInfor = LOGIC_SYSTEM.combinCardsUntilNoSameCardsAroundAndReturnCombinedInfor(gameDatas, clickedCard);
  if (GAME_SYSTEM.canExecuteCombinedSkill(combinedInfor, gameDatas)) {
    executeCombinedSkill(combinedInfor, gameDatas);
  } else {
    LOGIC_SYSTEM.updateAndEmitScoreChanged(combinedInfor.score, gameDatas);
    LOGIC_SYSTEM.checkGameStatusAfterCombined(gameDatas);
  }
}

function responseSkill(gameDatas, clickedCard) {
  if (clickedCard == null) {
    return;
  }

  while (gameDatas.combinedSkills.legth > 0) {
    const skill = gameDatas.combinedSkills.shift();
    skill.execute(clickedCard, gameDatas);
  }
}

function canGenerateRandomCharCard(emptyCardsMap, numberCardsMap) {
  const hasEmpthCards = emptyCardsMap.size > 0;
  const maxCardLargeThanGenerateLimit = GAME_SYSTEM.getMaxCardValue(numberCardsMap) > MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
  let random = GAME_SYSTEM.generateRandomValue(1, 100);
  const isRandomMatchedGenerateRate = random <= GAME_SYSTEM.CHAR_CARDS_GENERATE_RATE;

  return hasEmpthCards && maxCardLargeThanGenerateLimit && isRandomMatchedGenerateRate;
}

function generateCharCard(emptyCardsMap, gameDatas) {
  const socket = gameDatas.socket;
  let card = GAME_SYSTEM.getRandomEmptyCard(emptyCardsMap);
  card.value = GAME_SYSTEM.getRandomCharValue();

  GAME_SYSTEM.setCharCard(gameDatas, card);
  socket.emit(PLAYGROUND_CARDS_CHANGED, gameDatas.playgroundCards);
}

function executeCombinedSkill(combinedInfor, gameDatas) {
  const socket = gameDatas.socket;

  combinedInfor.skills.forEach(skill => {
    socket.emit(PLAY_SKILL, skill.name);

    if (skill.type == SKILL_TYPE.noResponse) {
      skill.execute(combinedInfor);
      LOGIC_SYSTEM.updateAndEmitScoreChanged(combinedInfor.score, gameDatas);
      LOGIC_SYSTEM.checkGameStatusAfterCombined(gameDatas);
    } else {
      gameDatas.combinedSkills.push(skill);
      gameDatas.gameState = 'SelectTarget';
      socket.emit(GAME_STATE_CHANGED, gameDatas.gameState);
    }
  });

  combinedInfor.skills = [];
}

const GAME_SYSTEM = require('../game-system');
const LOGIC_SYSTEM = require('./logic-system');
const MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD = GAME_SYSTEM.MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
const PLAY_SKILL = GAME_SYSTEM.PLAY_SKILL;
const PLAYGROUND_CARDS_CHANGED = GAME_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const GAME_STATE_CHANGED = GAME_SYSTEM.GAME_STATE_CHANGED;
const SKILL_TYPE = GAME_SYSTEM.SKILL_TYPE;
