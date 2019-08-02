module.exports = {
  getDefaultCards,
  getRandomEmptyCard
};

let gameDatasSystem = require('./game-datas-system');
const PLAYGROUND_SIZE = gameDatasSystem.PLAYGROUND_SIZE;
const DEFAULT_EMPTY_CARD_VALUE = null;
const recordError = gameDatasSystem.recordError;

function getDefaultCards() {
  let emptyCardsMap = new Map();
  for (let row = 0; row < PLAYGROUND_SIZE; row++) {
    for (let column = 0; column < PLAYGROUND_SIZE; column++) {
      const card = gameDatasSystem.createCard(row, column, DEFAULT_EMPTY_CARD_VALUE);
      emptyCardsMap.set(card.key, card);
    }
  }
  return emptyCardsMap;
}

function getRandomEmptyCard(emptyCardsMap) {
  const minValue = 0;
  let maxValue = emptyCardsMap.size - 1;
  if (maxValue == 0) {
    return null;
  }

  const keys = Array.from(emptyCardsMap.keys());
  const random = gameDatasSystem.generateRandomValue(minValue, maxValue);
  const cardKey = keys[random];
  const card = emptyCardsMap.get(cardKey);
  if (card == null) {
    recordError(`error, maxValue:${maxValue}, random:${random}, cardKey:${cardKey}`);
  }

  emptyCardsMap.delete(card.key);
  return card;
}
