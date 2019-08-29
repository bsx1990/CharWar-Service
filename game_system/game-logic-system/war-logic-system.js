module.exports = {
  combineCardsWithReceivedCard,
  preHandleClickRequest
};

function combineCardsWithReceivedCard(gameDatas, clickedCard) {
  let emptyCardsMap = gameDatas.emptyCardsMap;
  let numberCardsMap = gameDatas.numberCardsMap;

  LOGIC_SYSTEM.placeCardAtClickedPositionAndEmitChange(gameDatas, clickedCard);

  let canGenerateCharCard = canGenerateRandomCharCard(emptyCardsMap, numberCardsMap);
  if (canGenerateCharCard) {
    generateCharCard(gameDatas);
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

function preHandleClickRequest(gameDatas, clickedCard) {
  const HANDLED = true;
  const UNHANDLED = false;
  const playgroundCards = gameDatas.playgroundCards;
  const hasCardAtClickedPosition = playgroundCards[clickedCard.row][clickedCard.column] != null;
  const needResponseSkill = gameDatas.gameState == 'SelectTarget';

  if (needResponseSkill && hasCardAtClickedPosition) {
    executeNeedResponsedSkills(gameDatas, clickedCard);
    if (gameDatas.combinedSkills.legth == 0) {
      gameDatas.gameState = '';
    }
    return HANDLED;
  }

  if ((needResponseSkill && !hasCardAtClickedPosition) || (!needResponseSkill && hasCardAtClickedPosition)) {
    recordInfor(`need response skill:${needResponseSkill}, has card at clicked position:${hasCardAtClickedPosition}`);
    return HANDLED;
  }
  return UNHANDLED;
}

function executeNeedResponsedSkills(gameDatas, clickedCard) {
  recordInfor('begin response skill');
  if (clickedCard == null) {
    recordError('end response skill. clicked card is null');
    return;
  }

  const skills = Array.from(gameDatas.combinedSkills);
  recordInfor(`game combined skills length is:${skills.length} are:`);
  recordObject(skills);

  while (skills.length > 0) {
    const skill = gameDatas.combinedSkills.shift();
    recordInfor('current skill is:');
    recordObject(skill);
    var isSkillExecuted = skill.execute(clickedCard, gameDatas);
    if (!isSkillExecuted) {
      recordInfor('skill has not been executed, put it back.');
      gameDatas.combinedSkills.unshift(skill);
      break;
    }

    skills.shift();
    if (hasSkillsChanged(skills, gameDatas.combinedSkills)) {
      recordInfor('skill list has changed, end current skill loop');
      break;
    }
  }
  recordInfor('end response skill');
}

function hasSkillsChanged(oldSkills, newSkills) {
  if (oldSkills.length != newSkills.length) {
    return true;
  }

  for (let index = 0; index < oldSkills.length; index++) {
    const oldElement = oldSkills[index];
    const newElement = newSkills[index];
    if (oldElement instanceof Array && newElement instanceof Array) {
      if (!oldElement.equals(newElement)) {
        return true;
      }
    } else if (oldElement != newElement) {
      return true;
    }
  }

  return false;
}

function canGenerateRandomCharCard(emptyCardsMap, numberCardsMap) {
  const hasEmpthCards = emptyCardsMap.size > 0;
  const maxCardLargeThanGenerateLimit = GAME_SYSTEM.getMaxCardValue(numberCardsMap) > MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD;
  let random = GAME_SYSTEM.generateRandomValue(1, 100);
  const isRandomMatchedGenerateRate = random <= GAME_SYSTEM.CHAR_CARDS_GENERATE_RATE;

  return hasEmpthCards && maxCardLargeThanGenerateLimit && isRandomMatchedGenerateRate;
}

function generateCharCard(gameDatas) {
  const emptyCardsMap = gameDatas.emptyCardsMap;
  const socket = gameDatas.socket;
  let card = GAME_SYSTEM.getRandomEmptyCard(emptyCardsMap);
  card.value = GAME_SYSTEM.getRandomCharValue();

  GAME_SYSTEM.setCard(gameDatas, card);
  socket.emit(PLAYGROUND_CARDS_CHANGED, gameDatas.playgroundCards);
}

function executeCombinedSkill(combinedInfor, gameDatas) {
  recordInfor('begin to execute combined skill');
  const socket = gameDatas.socket;

  combinedInfor.skills.forEach(skill => {
    socket.emit(PLAY_SKILL, skill.name);

    if (skill.type == SKILL_TYPE.noResponse) {
      skill.execute(combinedInfor, gameDatas);
      LOGIC_SYSTEM.checkGameStatusAfterCombined(gameDatas);
    } else {
      gameDatas.combinedSkills.push(skill);
      gameDatas.gameState = 'SelectTarget';
      socket.emit(GAME_STATE_CHANGED, gameDatas.gameState);
    }
  });

  LOGIC_SYSTEM.updateAndEmitScoreChanged(combinedInfor.score, gameDatas);
  combinedInfor.skills = [];
  recordInfor('end execute combined skill');
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
