module.exports = {
  canExecuteCombinedSkill: canExecuteCombinedSkill
};

const GAME_SYSTEM = require('./game-system');
const SKILL_NAMES = GAME_SYSTEM.SKILL_NAMES;

const critsScoreSkill = {
  name: SKILL_NAMES.critsScoreSkill,
  type: 'buff',
  canExecute: (combinedInfor, gameDatas) => {
    return combinedInfor.round > 3;
  },
  execute: combinedInfor => {
    switch (combinedInfor.round) {
      case 8:
        combinedInfor.score = combinedInfor.score * 10;
        break;
      case 7:
        combinedInfor.score = combinedInfor.score * 5;
        break;
      case 6:
        combinedInfor.score = combinedInfor.score * 4;
        break;
      case 5:
        combinedInfor.score = combinedInfor.score * 3;
        break;
      default:
        combinedInfor.score = combinedInfor.score * 2;
        break;
    }
  }
};

const numberAttackSkill = {
  name: SKILL_NAMES.numberAttackSkill,
  type: 'action',
  canExecute: (combinedInfor, gameDatas) => {
    return combinedInfor.totalCountOfCards > 2 && gameDatas.charCardsMap.size > 0;
  },
  execute: () => {}
};

const SKILLS = [numberAttackSkill, critsScoreSkill];

function canExecuteCombinedSkill(combinedInfor, gameDatas) {
  for (let index = 0; index < SKILLS.length; index++) {
    const skill = SKILLS[index];
    if (skill.canExecute(combinedInfor, gameDatas)) {
      combinedInfor.skill = skill;
      console.log('can execute bombined skill');
      return true;
    }
  }
  return false;
}
