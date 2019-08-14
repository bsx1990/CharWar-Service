module.exports = {
  emptyMockedGameDatas,
  getResultGameDatas,
  debugInfor,
  debugObject
};

function emptyMockedGameDatas() {
  return {
    numberCardsMap: new Map(),
    charCardsMap: new Map(),
    emptyCardsMap: new Map([
      ['0/0', { row: 0, column: 0, key: '0/0', value: null }],
      ['0/1', { row: 0, column: 1, key: '0/1', value: null }],
      ['0/2', { row: 0, column: 2, key: '0/2', value: null }],
      ['0/3', { row: 0, column: 3, key: '0/3', value: null }],
      ['1/0', { row: 1, column: 0, key: '1/0', value: null }],
      ['1/1', { row: 1, column: 1, key: '1/1', value: null }],
      ['1/2', { row: 1, column: 2, key: '1/2', value: null }],
      ['1/3', { row: 1, column: 3, key: '1/3', value: null }],
      ['2/0', { row: 2, column: 0, key: '2/0', value: null }],
      ['2/1', { row: 2, column: 1, key: '2/1', value: null }],
      ['2/2', { row: 2, column: 2, key: '2/2', value: null }],
      ['2/3', { row: 2, column: 3, key: '2/3', value: null }],
      ['3/0', { row: 3, column: 0, key: '3/0', value: null }],
      ['3/1', { row: 3, column: 1, key: '3/1', value: null }],
      ['3/2', { row: 3, column: 2, key: '3/2', value: null }],
      ['3/3', { row: 3, column: 3, key: '3/3', value: null }]
    ]),
    playgroundCards: [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]],
    score: 0,
    gameState: '',
    combinedSkills: [],
    addCard: function(rowIndex, columnIndex, value) {
      let key = `${rowIndex}/${columnIndex}`;
      let card = this.emptyCardsMap.get(key);
      this.emptyCardsMap.delete(key);
      card.value = value;
      if (isNaN(value)) {
        this.charCardsMap.set(key, card);
      } else {
        this.numberCardsMap.set(key, card);
      }
      this.playgroundCards[rowIndex][columnIndex] = value;
      return this;
    },
    getResult: function() {
      return {
        numberCardsMap: this.numberCardsMap,
        charCardsMap: this.charCardsMap,
        emptyCardsMap: this.emptyCardsMap,
        playgroundCards: this.playgroundCards,
        score: this.score,
        gameState: this.gameState,
        combinedSkills: this.combinedSkills
      };
    }
  };
}

function getResultGameDatas(gameDatas) {
  return {
    numberCardsMap: gameDatas.numberCardsMap,
    charCardsMap: gameDatas.charCardsMap,
    emptyCardsMap: gameDatas.emptyCardsMap,
    playgroundCards: gameDatas.playgroundCards,
    score: gameDatas.score,
    gameState: gameDatas.gameState,
    combinedSkills: gameDatas.combinedSkills
  };
}

function debugInfor(text) {
  console.log(`DEBUG::: ${text}`);
}

function debugObject(object) {
  console.log(object);
}
