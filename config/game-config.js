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
  gameStateChanged: 'GameStateChanged'
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
