module.exports = {
  canExecuteCombinedSkill: canExecuteCombinedSkill
};

const GAME_SYSTEM = require('./game-system');
const SKILL_NAMES = GAME_SYSTEM.SKILL_NAMES;

const critsScoreSkill = {
  name: SKILL_NAMES.critsScoreSkill,
  type: 'buff',
  canExecute: combinedInfor => {
    return combinedInfor.round > 3;
  },
  execute: combinedInfor => {
    combinedInfor.score = combinedInfor.score * 2;
  }
};

const SKILLS = [critsScoreSkill];

function canExecuteCombinedSkill(combinedInfor) {
  for (let index = 0; index < SKILLS.length; index++) {
    const skill = SKILLS[index];
    if (skill.canExecute(combinedInfor)) {
      combinedInfor.skill = skill;
      return true;
    }
  }
  return false;
}
