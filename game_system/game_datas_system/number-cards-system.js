module.exports = {
  getMaxCardValue: getMaxCardValue,
  getDefaultCards: getDefaultCards,
  setCard: setCard,
  getCard: getCard
};

function getMaxCardValue(numberCardsMap) {
  let maxCard = 0;
  const isNumberCardsEmpty = numberCardsMap.size == 0;
  if (isNumberCardsEmpty) {
    return maxCard;
  }

  const values = Array.from(numberCardsMap.values()).map(card => {
    return card.value;
  });
  maxCard = Math.max.apply(Math, values);

  if (isNaN(maxCard)) {
    maxCard = 0;
  }

  return maxCard;
}

function getDefaultCards() {
  return new Map();
}

function setCard(numberCardsMap, card) {
  numberCardsMap.set(card.key, card);
}

function getCard(numberCardsMap, cardKey) {
  return !numberCardsMap.has(cardKey) ? null : numberCardsMap.get(cardKey);
}
