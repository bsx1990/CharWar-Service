module.exports = {
  getMaxCardValue: getMaxCardValue,
  getDefaultCards: getDefaultCards,
  setCard: setCard,
  getCard: getCard,
  removeCard: removeCard
};

function getMaxCardValue(numberCardsMap) {
  let maxCard = 0;
  const isNumberCardsEmpty = numberCardsMap.size == 0;
  if (isNumberCardsEmpty) {
    console.log(`number cards is empty, max card value is ${maxCard}`);
    return maxCard;
  }

  const values = Array.from(numberCardsMap.values()).map(card => {
    return card.value;
  });
  maxCard = Math.max.apply(Math, values);

  if (isNaN(maxCard)) {
    console.log(`got error when get max value from number cards, max card value is ${maxCard}, cards:`);
    console.log(numberCardsMap);
    maxCard = 0;
  }

  console.log(`max card value is ${maxCard}`);
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

function removeCard(numberCardsMap, card) {
  numberCardsMap.delete(card.key);
}
