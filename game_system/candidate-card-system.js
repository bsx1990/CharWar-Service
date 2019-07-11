module.exports = {
  appendCandidateCard: appendCandidateCard
};

const GAME_SYSTEM = require('./game-system');
const MAX_GENERATED_CARD = GAME_SYSTEM.MAX_GENERATED_CARD;

function appendCandidateCard(playgroundCards, candidateCards) {
  candidateCards.push(generateCard(playgroundCards));
}

function generateCard(playgroundCards) {
  let maxCard = Math.max(...Array.prototype.concat.apply([], playgroundCards));
  if (isNaN(maxCard)) {
    maxCard = 0;
  }

  if (maxCard > MAX_GENERATED_CARD) {
    maxCard = MAX_GENERATED_CARD;
  }

  return Math.trunc(Math.random() * maxCard + 1);
}
