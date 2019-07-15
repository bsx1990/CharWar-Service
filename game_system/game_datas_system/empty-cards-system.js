module.exports = {
  getDefaultCards: getDefaultCards,
  setCard: setCard,
  removeCard: removeCard
};

let gameDatasSystem = require('./game-datas-system');
const PLAYGROUND_SIZE = gameDatasSystem.PLAYGROUND_SIZE;
const DEFAULT_EMPTY_CARD_VALUE = null;

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

function setCard(emptyCardsMap, card) {
  emptyCardsMap.set(card.key, card);
}

function removeCard(emptyCardsMap, card) {
  emptyCardsMap.delete(card.key);
}
