module.exports = {
  getDefaultCards: getDefaultCards,
  getRandomCharValue: getRandomCharValue
};

let gameDatasSystem = require('./game-datas-system');
const CHAR_CARD_GENERATE_RATE = gameDatasSystem.EACH_CHAR_CARD_GENERATE_RATE;
const CARD_A_GENERATE_RATE = CHAR_CARD_GENERATE_RATE.cardA;
const CARD_B_GENERATE_RATE = CHAR_CARD_GENERATE_RATE.cardB;
const CARD_C_GENERATE_RATE = CHAR_CARD_GENERATE_RATE.cardC;
const CHAR_CARD_TYPE = gameDatasSystem.CHAR_CARD_TYPE;

function getDefaultCards() {
  return new Map();
}

function getRandomCharValue() {
  let random = gameDatasSystem.generateRandomValue(1, 100);

  if (random <= CARD_A_GENERATE_RATE) {
    return CHAR_CARD_TYPE.A;
  } else {
    random = random - CARD_A_GENERATE_RATE;
  }

  if (random <= CARD_B_GENERATE_RATE) {
    return CHAR_CARD_TYPE.B;
  } else {
    random = random - CARD_B_GENERATE_RATE;
  }

  if (random <= CARD_C_GENERATE_RATE) {
    return CHAR_CARD_TYPE.C;
  } else {
    random = random - CARD_C_GENERATE_RATE;
  }

  return null;
}
