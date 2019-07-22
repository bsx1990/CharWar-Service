module.exports = {
  getMaxCardValue: getMaxCardValue,
  getDefaultCards: getDefaultCards,
  decreaseValue: decreaseValue
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

function decreaseValue(value) {
  if (value == null) {
    return null;
  }

  switch (value) {
    case 1:
      return null;
    default:
      return value - 1;
  }
}
