module.exports = {
  getMaxCardValue: getMaxCardValue
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
