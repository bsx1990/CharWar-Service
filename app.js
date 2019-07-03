const app = require("http").createServer();
const IO = require("socket.io")(app);
const config = require("./config/game-config");

let playgroundCards = [];
let candidateCards = [];

app.listen(config.PORT);

IO.on("connection", function(socket) {
  console.log("received connection request");

  socket.on(config.requestType.getData, function() {
    console.log("received getData request");
    initDefaultPlaygroundCards();
    socket.emit(config.responseType.playgroundCardsChanged, playgroundCards);
    appendCandidateCard();
    appendCandidateCard();
    socket.emit(config.responseType.candidateCardsChanged, candidateCards);
  });
});

function initDefaultPlaygroundCards() {
  for (let row = 0; row < config.PLAYGROUND_SIZE; row++) {
    playgroundCards[row] = [];
    for (let column = 0; column < config.PLAYGROUND_SIZE; column++) {
      playgroundCards[row][column] = null;
    }
  }
}

function appendCandidateCard() {
  candidateCards.push(generateCard());
}

function generateCard() {
  let maxCard = Math.max(...Array.prototype.concat.apply([], playgroundCards));
  if (isNaN(maxCard)) {
    maxCard = 0;
  }

  if (maxCard > config.MAX_GENERATED_CARD) {
    maxCard = config.MAX_GENERATED_CARD;
  }

  return Math.trunc(Math.random() * maxCard + 1);
}

console.log("app listen at:" + config.PORT);
