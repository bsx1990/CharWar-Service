module.exports = {
  appendCandidateCard: appendCandidateCard
};

const CONFIG = require('../config/game-config');

function appendCandidateCard(playgroundCards, candidateCards) {
  candidateCards.push(generateCard(playgroundCards));
}

function generateCard(playgroundCards) {
  let maxCard = Math.max(...Array.prototype.concat.apply([], playgroundCards));
  if (isNaN(maxCard)) {
    maxCard = 0;
  }

  if (maxCard > CONFIG.MAX_GENERATED_CARD) {
    maxCard = CONFIG.MAX_GENERATED_CARD;
  }

  return Math.trunc(Math.random() * maxCard + 1);
}
