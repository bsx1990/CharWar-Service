module.exports = {
  createExpectedGameDatas,
  getResultGameDatas
};

function createExpectedGameDatas(numberCardsMap, charCardsMap, emptyCardsMap, playgroundCards, score, gameState, combinedSkills) {
  return {
    numberCardsMap: numberCardsMap,
    charCardsMap: charCardsMap,
    emptyCardsMap: emptyCardsMap,
    playgroundCards: playgroundCards,
    score: score,
    gameState: gameState,
    combinedSkills: combinedSkills
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
