module.exports = {
  getMaxCardValue,
  getEmptyCards,
  decreaseValue
};

let gameDatasSystem = require('./game-datas-system');
const recordInfor = gameDatasSystem.recordInfor;
const recordError = gameDatasSystem.recordError;
const recordObject = gameDatasSystem.recordObject;

function getMaxCardValue(numberCardsMap) {
  let maxCard = 0;
  const isNumberCardsEmpty = numberCardsMap.size == 0;
  if (isNumberCardsEmpty) {
    recordInfor(`number cards is empty, max card value is ${maxCard}`);
    return maxCard;
  }

  const values = Array.from(numberCardsMap.values()).map(card => {
    return card.value;
  });
  maxCard = Math.max.apply(Math, values);

  if (isNaN(maxCard)) {
    recordError(`got error when get max value from number cards, max card value is ${maxCard}, cards:`);
    recordObject(numberCardsMap);
    maxCard = 0;
  }

  recordInfor(`max card value is ${maxCard}`);
  return maxCard;
}

function getEmptyCards() {
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
