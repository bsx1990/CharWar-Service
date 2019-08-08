module.exports = {
  appendRandomCandidateCard,
  getEmptyCards
};

let gameDatasSystem = require('./game-datas-system');
const MAX_GENERATED_CARD = gameDatasSystem.MAX_GENERATED_CARD;

function appendRandomCandidateCard(candidateCards, maxCardValue) {
  candidateCards.push(generateRandomCardValue(maxCardValue));
}

function generateRandomCardValue(maxCardValue) {
  const minCardValue = 1;
  if (maxCardValue > MAX_GENERATED_CARD) {
    maxCardValue = MAX_GENERATED_CARD;
  }

  return gameDatasSystem.generateRandomValue(minCardValue, maxCardValue);
}

function getEmptyCards() {
  return [];
}
