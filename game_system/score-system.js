module.exports = {
  getSumOfCardValues: getSumOfCardValues,
  isBestScoreUpdated: isBestScoreUpdated
};

function getSumOfCardValues(cards) {
  const reducer = (accumulator, currentValue) => accumulator + currentValue.value;
  return cards.reduce(reducer, 0);
}

function isBestScoreUpdated(gameDatas) {
  if (gameDatas.score <= gameDatas.bestScore) {
    return false;
  }
  gameDatas.bestScore = gameDatas.score;
  return true;
}
