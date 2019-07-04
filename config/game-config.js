exports.requestType = {
  getData: "getData",
  clickCard: "clickCard"
};

exports.responseType = {
  playgroundCardsChanged: "playgroundCardsChanged",
  candidateCardsChanged: "CandidateCardsChanged",
  scoreChanged: "ScoreChanged",
  bestScoreChanged: "BestScoreChanged"
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
