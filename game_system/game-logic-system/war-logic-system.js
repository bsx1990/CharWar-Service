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
    if (gameDatas.combinedSkills.legth == 0) {
      gameDatas.gameState = null;
    }
    return;
  }

  if ((needResponseSkill && !hasCardAtClickedPosition) || (!needResponseSkill && hasCardAtClickedPosition)) {
    recordInfor(`need response skill:${needResponseSkill}, has card at clicked position:${hasCardAtClickedPosition}`);
    return;
  }

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

  LOGIC_SYSTEM.recordGameDatasToLog(gameDatas);
}

function responseSkill(gameDatas, clickedCard) {
  recordInfor('begin response skill');
  if (clickedCard == null) {
    recordError('end response skill. clicked card is null');
    return;
  }

  const skills = gameDatas.combinedSkills;
  recordInfor(`game combined skills length is:${skills.length} are:`);
  recordObject(skills);

  while (skills.length > 0) {
    const skill = gameDatas.combinedSkills.shift();
    recordInfor('current skill is:');
    recordObject(skill);
    skill.execute(clickedCard, gameDatas);
  }
  recordInfor('end response skill');
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
const MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD = LOGIC_SYSTEM.MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
const PLAY_SKILL = LOGIC_SYSTEM.PLAY_SKILL;
const PLAYGROUND_CARDS_CHANGED = LOGIC_SYSTEM.PLAYGROUND_CARDS_CHANGED;
const GAME_STATE_CHANGED = LOGIC_SYSTEM.GAME_STATE_CHANGED;
const SKILL_TYPE = LOGIC_SYSTEM.SKILL_TYPE;
const recordInfor = LOGIC_SYSTEM.recordInfor;
const recordError = LOGIC_SYSTEM.recordError;
const recordObject = LOGIC_SYSTEM.recordObject;
