exports.requestType = {
  getData: 'GetData',
  clickCard: 'ClickCard',
  replay: 'Replay',
  gameModeChanged: 'GameModeChanged'
};

exports.responseType = {
  playgroundCardsChanged: 'PlaygroundCardsChanged',
  candidateCardsChanged: 'CandidateCardsChanged',
  scoreChanged: 'ScoreChanged',
  bestScoreChanged: 'BestScoreChanged',
  gameStateChanged: 'GameStateChanged',
  playSkill: 'PlaySkill'
};

exports.PORT = 1001;
exports.PLAYGROUND_SIZE = 4;
exports.MAX_GENERATED_CARD = 9;

exports.ARROW = {
  LEFT_UP: [-1, -1],
  UP: [0, -1],
  RIGHT_UP: [1, -1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  LEFT_DOWN: [-1, 1],
  DOWN: [0, 1],
  RIGHT_DOWN: [1, 1]
};

exports.ALL_AROUND_ARROW = [
  this.ARROW.LEFT_UP,
  this.ARROW.UP,
  this.ARROW.RIGHT_UP,
  this.ARROW.LEFT,
  this.ARROW.RIGHT,
  this.ARROW.LEFT_DOWN,
  this.ARROW.DOWN,
  this.ARROW.RIGHT_DOWN
];

exports.gameModes = {
  peace: 'Peace',
  war: 'War'
};

exports.CHAR_CARDS_GENERATE_RATE = 20;
exports.MIN_CARD_VALUE_LIMIT_FOR_GENERATE_CHAR_CARD = 5;

exports.eachCharCardGenerateRate = {
  cardA: 60,
  cardB: 30,
  cardC: 10
};

exports.charCardType = {
  A: 'A',
  B: 'B',
  C: 'C'
};

exports.skillNames = {
  critsScoreSkill: 'Crits Score',
  critsScore3TimesSkill: 'Crits Score: 3 Times',
  critsScore5TimesSkill: 'Crits Score: 5 Times',
  critsScore10TimesSkill: 'Crits Score: 10 Times',
  numberAttackSkill: 'Number Attack'
};

exports.skillPriority = {
  high: 0,
  normal: 1,
  low: 2
};

exports.skillType = {
  noResponse: 'NoResponse',
  needResponse: 'NeedResponse'
};
