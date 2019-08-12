require('should');
const CLIENT_IO = require('socket.io-client');
const SERVICE_STARTER = require('../../service-starter');
const GAME_SYSTEM = SERVICE_STARTER.GAME_SYSTEM;
const GAME_MODE_CHANGED = GAME_SYSTEM.GAME_MODE_CHANGED;
const GET_DATA = GAME_SYSTEM.GET_DATA;
const CLICK_CARD = GAME_SYSTEM.CLICK_CARD;
const REPLAY = GAME_SYSTEM.REPLAY;

const WAR_MODE = 'war';
const TOKEN = 'UnitTest-War';
const PORT = 2000;

describe('War Mode', function() {
  var clientSocket;

  before(function(done) {
    SERVICE_STARTER.startServer(PORT);
    done();
  });

  beforeEach(function(done) {
    clientSocket = CLIENT_IO(`ws://192.168.12.65:${PORT}?token=${TOKEN}`);
    clientSocket.on('connect', function() {
      clientSocket.emit(GAME_MODE_CHANGED, WAR_MODE);
      clientSocket.emit(GET_DATA);
      done();
    });
  });

  afterEach(function(done) {
    clientSocket.emit(REPLAY);
    done();
  });

  after(function(done) {
    clientSocket.close();
    SERVICE_STARTER.stopServer();
    done();
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

  describe('Simple Combine', function() {
    it('should have one card in number map, card value should be 2', function(done) {
      clientSocket.emit(CLICK_CARD, 0, 1);
      setTimeout(() => {
        clientSocket.emit(CLICK_CARD, 0, 0);
      }, 100);
      setTimeout(() => {
        var expectedNumberMap = new Map([['0/0', { row: 0, column: 0, key: '0/0', value: 2 }]]);
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
        var expectedPlaygroundCards = [[2, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
        var expectedScore = 1;
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

  describe('Combine Two Cards', function() {
    it('should have one card in number map, card value should be 2', function(done) {
      clientSocket.emit(CLICK_CARD, 0, 0);
      setTimeout(() => {
        clientSocket.emit(CLICK_CARD, 0, 2);
      }, 100);
      setTimeout(() => {
        clientSocket.emit(CLICK_CARD, 0, 1);
      }, 100);
      setTimeout(() => {
        var expectedNumberMap = new Map([['0/1', { row: 0, column: 1, key: '0/1', value: 2 }]]);
        var expectedCharMap = new Map();
        var expectedEmptyMap = new Map([
          ['0/0', { row: 0, column: 0, key: '0/0', value: null }],
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
        var expectedPlaygroundCards = [[null, 2, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
        var expectedScore = 2;
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

  describe('Combine two rounds - CritsScoreSkill', function() {
    it('should have one card in number map, card value should be 3', function(done) {
      setTimeout(() => {
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var mockedNumberMap = new Map([['1/0', { row: 1, column: 0, key: '1/0', value: 1 }], ['1/1', { row: 1, column: 1, key: '1/1', value: 2 }]]);
        var mockedEmptyMap = new Map([
          ['0/0', { row: 0, column: 0, key: '0/0', value: null }],
          ['0/1', { row: 0, column: 1, key: '0/1', value: null }],
          ['0/2', { row: 0, column: 2, key: '0/2', value: null }],
          ['0/3', { row: 0, column: 3, key: '0/3', value: null }],
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
        var mockedPlaygroundCards = [[null, null, null, null], [1, 2, null, null], [null, null, null, null], [null, null, null, null]];
        var mockedCandidateCards = [1, 1];
        gameDatas.numberCardsMap = mockedNumberMap;
        gameDatas.emptyCardsMap = mockedEmptyMap;
        gameDatas.playgroundCards = mockedPlaygroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 0, 0);
        setTimeout(() => {
          var expectedNumberMap = new Map([['0/0', { row: 0, column: 0, key: '0/0', value: 3 }]]);
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
          var expectedPlaygroundCards = [[3, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
          var expectedScore = 6;
          var expectedGameState = '';
          var expectedCombinedSkills = [];

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
      }, 200);
    });
  });

  describe('Combine 3 rounds - critsScore3TimesSkill', function() {
    it('should have one card in number map, card value should be 4', function(done) {
      setTimeout(() => {
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var mockedNumberMap = new Map([
          ['1/0', { row: 1, column: 0, key: '1/0', value: 1 }],
          ['1/1', { row: 1, column: 1, key: '1/1', value: 2 }],
          ['1/2', { row: 1, column: 2, key: '1/2', value: 3 }]
        ]);
        var mockedEmptyMap = new Map([
          ['0/0', { row: 0, column: 0, key: '0/0', value: null }],
          ['0/1', { row: 0, column: 1, key: '0/1', value: null }],
          ['0/2', { row: 0, column: 2, key: '0/2', value: null }],
          ['0/3', { row: 0, column: 3, key: '0/3', value: null }],
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
        var mockedPlaygroundCards = [[null, null, null, null], [1, 2, 3, null], [null, null, null, null], [null, null, null, null]];
        var mockedCandidateCards = [1, 1];
        gameDatas.numberCardsMap = mockedNumberMap;
        gameDatas.emptyCardsMap = mockedEmptyMap;
        gameDatas.playgroundCards = mockedPlaygroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 0, 1);
        setTimeout(() => {
          var expectedNumberMap = new Map([['0/1', { row: 0, column: 1, key: '0/1', value: 4 }]]);
          var expectedCharMap = new Map();
          var expectedEmptyMap = new Map([
            ['0/0', { row: 0, column: 0, key: '0/0', value: null }],
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
          var expectedPlaygroundCards = [[null, 4, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
          var expectedScore = 18;
          var expectedGameState = '';
          var expectedCombinedSkills = [];

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
      }, 200);
    });
  });
});
