require('should');
const TEST_UTIL = require('./test_util');
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
    clientSocket = CLIENT_IO(`ws://192.168.12.65:${PORT}?token=${TOKEN}`);
    clientSocket.on('connect', function() {
      clientSocket.emit(GAME_MODE_CHANGED, WAR_MODE);
      clientSocket.emit(GET_DATA);
      done();
    });
  });

  beforeEach(function(done) {
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
        var expectedGameDatas = TEST_UTIL.createExpectedGameDatas(
          expectedNumberMap,
          expectedCharMap,
          expectedEmptyMap,
          expectedPlaygroundCards,
          expectedScore,
          expectedGameState,
          expectedCombinedSkills
        );

        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.should.be.deepEqual(resultGameDatas);
        done();
      }, 1000);
    });
  });

  describe('Combine Cards Without Skills', function() {
    it('should have one card in number map, card value should be 2, for combining one card(value: 1)', function(done) {
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
        var expectedGameDatas = TEST_UTIL.createExpectedGameDatas(
          expectedNumberMap,
          expectedCharMap,
          expectedEmptyMap,
          expectedPlaygroundCards,
          expectedScore,
          expectedGameState,
          expectedCombinedSkills
        );

        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.should.be.deepEqual(resultGameDatas);
        done();
      }, 1000);
    });

    it('should have one card in number map, card value should be 2, for combining two cards (value: 1)', function(done) {
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
        var expectedGameDatas = TEST_UTIL.createExpectedGameDatas(
          expectedNumberMap,
          expectedCharMap,
          expectedEmptyMap,
          expectedPlaygroundCards,
          expectedScore,
          expectedGameState,
          expectedCombinedSkills
        );

        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.should.be.deepEqual(resultGameDatas);
        done();
      }, 1000);
    });
  });

  describe('Simple Crits Score Skills', function() {
    it('should have one card in number map, card value should be 3, score should be 6, for combining 2 rounds with cards(value: 1,2)', function(done) {
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
          var expectedGameDatas = TEST_UTIL.createExpectedGameDatas(
            expectedNumberMap,
            expectedCharMap,
            expectedEmptyMap,
            expectedPlaygroundCards,
            expectedScore,
            expectedGameState,
            expectedCombinedSkills
          );

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.should.be.deepEqual(resultGameDatas);
          done();
        }, 1000);
      }, 200);
    });

    it('should have one card in number map, card value should be 4, score should be 18, for combining 3 rounds with cards(value: 1,2,3)', function(done) {
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
          var expectedGameDatas = TEST_UTIL.createExpectedGameDatas(
            expectedNumberMap,
            expectedCharMap,
            expectedEmptyMap,
            expectedPlaygroundCards,
            expectedScore,
            expectedGameState,
            expectedCombinedSkills
          );

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.should.be.deepEqual(resultGameDatas);
          done();
        }, 1000);
      }, 200);
    });

    it('should have one card in number map, card value should be 5, score should be 50, for combining 4 rounds with cards(value: 1,2,3,4)', function(done) {
      setTimeout(() => {
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var mockedNumberMap = new Map([
          ['1/0', { row: 1, column: 0, key: '1/0', value: 1 }],
          ['1/1', { row: 1, column: 1, key: '1/1', value: 2 }],
          ['1/2', { row: 1, column: 2, key: '1/2', value: 3 }],
          ['0/2', { row: 0, column: 2, key: '0/2', value: 4 }]
        ]);
        var mockedEmptyMap = new Map([
          ['0/0', { row: 0, column: 0, key: '0/0', value: null }],
          ['0/1', { row: 0, column: 1, key: '0/1', value: null }],
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
        var mockedPlaygroundCards = [[null, null, 4, null], [1, 2, 3, null], [null, null, null, null], [null, null, null, null]];
        var mockedCandidateCards = [1, 1];
        gameDatas.numberCardsMap = mockedNumberMap;
        gameDatas.emptyCardsMap = mockedEmptyMap;
        gameDatas.playgroundCards = mockedPlaygroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 0, 1);
        setTimeout(() => {
          var expectedNumberMap = new Map([['0/1', { row: 0, column: 1, key: '0/1', value: 5 }]]);
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
          var expectedPlaygroundCards = [[null, 5, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
          var expectedScore = 50;
          var expectedGameState = '';
          var expectedCombinedSkills = [];
          var expectedGameDatas = TEST_UTIL.createExpectedGameDatas(
            expectedNumberMap,
            expectedCharMap,
            expectedEmptyMap,
            expectedPlaygroundCards,
            expectedScore,
            expectedGameState,
            expectedCombinedSkills
          );

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.should.be.deepEqual(resultGameDatas);
          done();
        }, 1000);
      }, 200);
    });

    it('should have one card in number map, card value should be 7, score should be 210, for combining 6 rounds with cards(value: 1,2,3,4,5,6)', function(done) {
      setTimeout(() => {
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var mockedNumberMap = new Map([
          ['0/0', { row: 0, column: 0, key: '0/0', value: 1 }],
          ['0/1', { row: 0, column: 1, key: '0/1', value: 2 }],
          ['0/2', { row: 0, column: 2, key: '0/2', value: 3 }],
          ['1/0', { row: 1, column: 0, key: '1/0', value: 4 }],
          ['1/2', { row: 1, column: 2, key: '1/2', value: 5 }],
          ['2/0', { row: 2, column: 0, key: '2/0', value: 6 }]
        ]);
        var mockedEmptyMap = new Map([
          ['0/3', { row: 0, column: 3, key: '0/3', value: null }],
          ['1/1', { row: 1, column: 1, key: '1/1', value: null }],
          ['1/3', { row: 1, column: 3, key: '1/3', value: null }],
          ['2/1', { row: 2, column: 1, key: '2/1', value: null }],
          ['2/2', { row: 2, column: 2, key: '2/2', value: null }],
          ['2/3', { row: 2, column: 3, key: '2/3', value: null }],
          ['3/0', { row: 3, column: 0, key: '3/0', value: null }],
          ['3/1', { row: 3, column: 1, key: '3/1', value: null }],
          ['3/2', { row: 3, column: 2, key: '3/2', value: null }],
          ['3/3', { row: 3, column: 3, key: '3/3', value: null }]
        ]);
        var mockedPlaygroundCards = [[1, 2, 3, null], [4, null, 5, null], [6, null, null, null], [null, null, null, null]];
        var mockedCandidateCards = [1, 1];
        gameDatas.numberCardsMap = mockedNumberMap;
        gameDatas.emptyCardsMap = mockedEmptyMap;
        gameDatas.playgroundCards = mockedPlaygroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 1, 1);
        setTimeout(() => {
          var expectedNumberMap = new Map([['1/1', { row: 1, column: 1, key: '1/1', value: 7 }]]);
          var expectedCharMap = new Map();
          var expectedEmptyMap = new Map([
            ['0/0', { row: 0, column: 0, key: '0/0', value: null }],
            ['0/1', { row: 0, column: 1, key: '0/1', value: null }],
            ['0/2', { row: 0, column: 2, key: '0/2', value: null }],
            ['0/3', { row: 0, column: 3, key: '0/3', value: null }],
            ['1/0', { row: 1, column: 0, key: '1/0', value: null }],
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
          var expectedPlaygroundCards = [[null, null, null, null], [null, 7, null, null], [null, null, null, null], [null, null, null, null]];
          var expectedScore = 210;
          var expectedGameState = '';
          var expectedCombinedSkills = [];
          var expectedGameDatas = TEST_UTIL.createExpectedGameDatas(
            expectedNumberMap,
            expectedCharMap,
            expectedEmptyMap,
            expectedPlaygroundCards,
            expectedScore,
            expectedGameState,
            expectedCombinedSkills
          );

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.should.be.deepEqual(resultGameDatas);
          done();
        }, 1000);
      }, 200);
    });
  });
});
