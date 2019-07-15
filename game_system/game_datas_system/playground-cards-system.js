module.exports = {
  getPlaygroundCards: getPlaygroundCards,
  updatePlaygroundCardsByCard: updatePlaygroundCardsByCard
};

let gameDatasSystem = require('./game-datas-system');
const PLAYGROUND_SIZE = gameDatasSystem.PLAYGROUND_SIZE;

function getPlaygroundCards(numberCardsMap, charCardsMap, emptyCardsMap) {
  let playgroundCards = getEmptyPlaygroundCards();
  numberCardsMap.forEach(card => {
    updatePlaygroundCardsByCard(playgroundCards, card);
  });
  charCardsMap.forEach(card => {
    updatePlaygroundCardsByCard(playgroundCards, card);
  });
  emptyCardsMap.forEach(card => {
    updatePlaygroundCardsByCard(playgroundCards, card);
  });
  return playgroundCards;
}

function getEmptyPlaygroundCards() {
  let playgroundCards = [];
  for (let row = 0; row < PLAYGROUND_SIZE; row++) {
    playgroundCards[row] = [];
    for (let column = 0; column < PLAYGROUND_SIZE; column++) {
      playgroundCards[row][column] = null;
    }
  }
  return playgroundCards;
}

function updatePlaygroundCardsByCard(playgroundCards, card) {
  playgroundCards[card.row][card.column] = card.value;
}
