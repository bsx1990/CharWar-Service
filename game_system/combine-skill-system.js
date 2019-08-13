module.exports = {
  canExecuteCombinedSkill
};

const GAME_SYSTEM = require('./game-system');
const SKILL_NAMES = GAME_SYSTEM.SKILL_NAMES;
const SKILL_PRIORITY = GAME_SYSTEM.SKILL_PRIORITY;
const SKILL_TYPE = GAME_SYSTEM.SKILL_TYPE;
const recordInfor = GAME_SYSTEM.recordInfor;
const recordObject = GAME_SYSTEM.recordObject;

const kingOfTheWorldSkill = {
  name: SKILL_NAMES.kingOfTheWorld,
  type: SKILL_TYPE.noResponse,
  priority: SKILL_PRIORITY.high,
  canExecute: combinedInfor => {
    return combinedInfor.round == 8;
  },
  execute: (combinedInfor, gameDatas) => {
    combinedInfor.score = combinedInfor.score * 10;

    const numberCards = Array.from(gameDatas.numberCardsMap.values());
    const sumOfNumbers = GAME_SYSTEM.getSumOfCardValues(numberCards);
    combinedInfor.score += sumOfNumbers * 10;

    GAME_SYSTEM.clearAllCards(gameDatas);
    GAME_SYSTEM.emitGameDatas(gameDatas);
  },
  blockList: []
};

const critsScoreSkill = {
  name: SKILL_NAMES.critsScoreSkill,
  type: SKILL_TYPE.noResponse,
  priority: SKILL_PRIORITY.normal,
  canExecute: combinedInfor => {
    return combinedInfor.round > 1;
  },
  execute: combinedInfor => {
    combinedInfor.score = combinedInfor.score * 2;
  },
  blockList: []
};

const critsScore3TimesSkill = {
  name: SKILL_NAMES.critsScore3TimesSkill,
  type: SKILL_TYPE.noResponse,
  priority: SKILL_PRIORITY.normal,
  canExecute: combinedInfor => {
    return combinedInfor.round > 2;
  },
  execute: combinedInfor => {
    combinedInfor.score = combinedInfor.score * 3;
  },
  blockList: [critsScoreSkill]
};

const critsScore5TimesSkill = {
  name: SKILL_NAMES.critsScore5TimesSkill,
  type: SKILL_TYPE.noResponse,
  priority: SKILL_PRIORITY.normal,
  canExecute: combinedInfor => {
    return combinedInfor.round > 3;
  },
  execute: combinedInfor => {
    combinedInfor.score = combinedInfor.score * 5;
  },
  blockList: [critsScoreSkill, critsScore3TimesSkill]
};

const critsScore10TimesSkill = {
  name: SKILL_NAMES.critsScore10TimesSkill,
  type: SKILL_TYPE.noResponse,
  priority: SKILL_PRIORITY.normal,
  canExecute: combinedInfor => {
    return combinedInfor.round > 5;
  },
  execute: combinedInfor => {
    combinedInfor.score = combinedInfor.score * 10;
  },
  blockList: [critsScoreSkill, critsScore3TimesSkill, critsScore5TimesSkill]
};

const numberAttackSkill = {
  name: SKILL_NAMES.numberAttackSkill,
  type: SKILL_TYPE.needResponse,
  priority: SKILL_PRIORITY.normal,
  canExecute: (combinedInfor, gameDatas) => {
    return combinedInfor.totalCountOfCards > 0 && gameDatas.charCardsMap.size > 0;
  },
  execute: (clickedCard, gameDatas) => {
    recordInfor('begin number attack skill execute');
    clickedCard = GAME_SYSTEM.decreaseCard(clickedCard);
    GAME_SYSTEM.setCard(gameDatas, clickedCard);
    gameDatas.gameState = '';
    GAME_SYSTEM.emitGameDatas(gameDatas);
    GAME_SYSTEM.checkGameStatusAfterCombined(gameDatas);
    recordInfor('end number attack skill execute');
  }
};

const ALL_SKILLS = [critsScoreSkill, critsScore3TimesSkill, critsScore5TimesSkill, critsScore10TimesSkill, numberAttackSkill, kingOfTheWorldSkill];
const PRIORITY_SKILLS = splitAllSkillsIntoDifferentPriority(ALL_SKILLS);

function getCanExecutedCombinedSkills(combinedInfor, gameDatas) {
  var result = [];

  for (const samePrioritySkills of PRIORITY_SKILLS) {
    samePrioritySkills.forEach(skill => {
      if (skill.canExecute(combinedInfor, gameDatas)) {
        result.push(skill);
      }
    });

    if (result.length > 0) {
      break;
    }
  }

  result = removeBlockedSkills(result);

  return result;
}

function removeBlockedSkills(skills) {
  var blockedSkills = [];
  skills.forEach(skill => {
    blockedSkills = blockedSkills.concat(skill.blockList);
  });

  blockedSkills = Array.from(new Set(blockedSkills));
  return skills.filter(function(skill) {
    return blockedSkills.indexOf(skill) == -1;
  });
}

function splitAllSkillsIntoDifferentPriority(allSkills) {
  var result = new Array();
  for (var priority in SKILL_PRIORITY) {
    result[SKILL_PRIORITY[priority]] = [];
  }

  allSkills.forEach(skill => {
    result[skill.priority].push(skill);
  });

  return result;
}

function canExecuteCombinedSkill(combinedInfor, gameDatas) {
  combinedInfor.skills = getCanExecutedCombinedSkills(combinedInfor, gameDatas);
  return combinedInfor.skills.length > 0;
}
