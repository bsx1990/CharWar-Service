require('should');
const CLIENT_IO = require('socket.io-client');
const SERVICE_STARTER = require('../../service-starter');
const GAME_SYSTEM = SERVICE_STARTER.GAME_SYSTEM;
const GAME_MODE_CHANGED = GAME_SYSTEM.GAME_MODE_CHANGED;
const GET_DATA = GAME_SYSTEM.GET_DATA;
const GAME_MODES = GAME_SYSTEM.GAME_MODES;
const CLICK_CARD = GAME_SYSTEM.CLICK_CARD;

const PEACE_MODES_INDEX = 0;
const TOKEN = 'UnitTest';
const PORT = 2000;

describe('Peace Mode', function() {
  var clientSocket;

  before(function(done) {
    SERVICE_STARTER.startServer(PORT);
    done();
  });

  beforeEach(function(done) {
    clientSocket = CLIENT_IO(`ws://192.168.12.65:${PORT}?token=${TOKEN}`);
    clientSocket.on('connect', function() {
      clientSocket.emit(GAME_MODE_CHANGED, GAME_MODES[PEACE_MODES_INDEX]);
      clientSocket.emit(GET_DATA);
      done();
    });
  });

  describe('Put First Card', function() {
    it('should have one card in number map', function(done) {
      clientSocket.emit(CLICK_CARD, 0, 0);
      setTimeout(() => {
        var expectedNumberMap = new Map([['0/0', { row: 0, column: 0, key: '0/0', value: 1 }]]);
        var expectedCharMap = new Map();
        var expectedEmptyMap = new Map([
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
        ]);
        var expectedPlaygroundCards = [[1, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
        var expectedScore = 0;
        var expectedGameState = '';
        var expectedCombinedSkills = [];

        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultNumberMap = gameDatas.numberCardsMap;
        var resultCharMap = gameDatas.charCardsMap;
        var resultEmptyMap = gameDatas.emptyCardsMap;
        var resultPlaygroundCards = gameDatas.playgroundCards;
        var resultScore = gameDatas.score;
        var resultGameState = gameDatas.gameState;
        var resultCombinedSkills = gameDatas.combinedSkills;

        expectedNumberMap.should.be.deepEqual(resultNumberMap);
        expectedCharMap.should.be.deepEqual(resultCharMap);
        expectedEmptyMap.should.be.deepEqual(resultEmptyMap);
        expectedPlaygroundCards.should.be.deepEqual(resultPlaygroundCards);
        expectedScore.should.be.deepEqual(resultScore);
        expectedGameState.should.be.deepEqual(resultGameState);
        expectedCombinedSkills.should.be.deepEqual(resultCombinedSkills);
        done();
      }, 1000);
    });
  });
});
