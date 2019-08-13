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
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 0, 1);

        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
      }, 500);
    });
  });

  describe('Combine Cards Without Skills', function() {
    it('should have one card in number map, card value should be 2, for combining one card(value: 1)', function(done) {
      clientSocket.emit(CLICK_CARD, 0, 1);
      setTimeout(() => {
        clientSocket.emit(CLICK_CARD, 0, 0);
      }, 100);
      setTimeout(() => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 0, 2);
        expectedGameDatas.score = 1;

        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
      }, 500);
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
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 1, 2);
        expectedGameDatas.score = 2;

        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
      }, 500);
    });
  });

  describe('Simple Crits Score Skills', function() {
    it('should have one card in number map, card value should be 3, score should be 6, for combining 2 rounds with cards(value: 1,2)', function(done) {
      setTimeout(() => {
        var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        mockedGameDatas.addCard(1, 0, 1).addCard(1, 1, 2);
        var mockedResult = mockedGameDatas.getResult();
        var mockedCandidateCards = [1, 1];
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        gameDatas.numberCardsMap = mockedResult.numberCardsMap;
        gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
        gameDatas.playgroundCards = mockedResult.playgroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 0, 0);
        setTimeout(() => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 0, 3);
          expectedGameDatas.score = 6;

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
          done();
        }, 500);
      }, 200);
    });

    it('should have one card in number map, card value should be 4, score should be 18, for combining 3 rounds with cards(value: 1,2,3)', function(done) {
      setTimeout(() => {
        var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        mockedGameDatas
          .addCard(1, 0, 1)
          .addCard(1, 1, 2)
          .addCard(1, 2, 3);
        var mockedResult = mockedGameDatas.getResult();
        var mockedCandidateCards = [1, 1];
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        gameDatas.numberCardsMap = mockedResult.numberCardsMap;
        gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
        gameDatas.playgroundCards = mockedResult.playgroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 0, 1);
        setTimeout(() => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 4);
          expectedGameDatas.score = 18;

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
          done();
        }, 500);
      }, 200);
    });

    it('should have one card in number map, card value should be 5, score should be 50, for combining 4 rounds with cards(value: 1,2,3,4)', function(done) {
      setTimeout(() => {
        var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        mockedGameDatas
          .addCard(1, 0, 1)
          .addCard(1, 1, 2)
          .addCard(1, 2, 3)
          .addCard(0, 2, 4);
        var mockedResult = mockedGameDatas.getResult();
        var mockedCandidateCards = [1, 1];
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        gameDatas.numberCardsMap = mockedResult.numberCardsMap;
        gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
        gameDatas.playgroundCards = mockedResult.playgroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 0, 1);
        setTimeout(() => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 5);
          expectedGameDatas.score = 50;

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
          done();
        }, 500);
      }, 200);
    });

    it('should have one card in number map, card value should be 7, score should be 210, for combining 6 rounds with cards(value: 1,2,3,4,5,6)', function(done) {
      setTimeout(() => {
        var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        mockedGameDatas
          .addCard(0, 0, 1)
          .addCard(0, 1, 2)
          .addCard(0, 2, 3)
          .addCard(1, 0, 4)
          .addCard(1, 2, 5)
          .addCard(2, 0, 6);
        var mockedResult = mockedGameDatas.getResult();
        var mockedCandidateCards = [1, 1];
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        gameDatas.numberCardsMap = mockedResult.numberCardsMap;
        gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
        gameDatas.playgroundCards = mockedResult.playgroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 1, 1);
        setTimeout(() => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(1, 1, 7);
          expectedGameDatas.score = 210;
          var expectedResult = expectedGameDatas.getResult();

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedResult.numberCardsMap.should.be.deepEqual(resultGameDatas.numberCardsMap);
          expectedResult.score.should.be.deepEqual(resultGameDatas.score);
          done();
        }, 500);
      }, 200);
    });
  });

  describe('Simple Number Attack Skill', function() {
    it('should killed the char card(value: A) after combined one card', function(done) {
      setTimeout(() => {
        var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        mockedGameDatas.addCard(0, 0, 1).addCard(0, 2, 'A');
        var mockedResult = mockedGameDatas.getResult();
        var mockedCandidateCards = [1, 1];
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        gameDatas.numberCardsMap = mockedResult.numberCardsMap;
        gameDatas.charCardsMap = mockedResult.charCardsMap;
        gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
        gameDatas.playgroundCards = mockedResult.playgroundCards;
        gameDatas.candidateCards = mockedCandidateCards;

        clientSocket.emit(CLICK_CARD, 0, 1);
        setTimeout(() => {
          clientSocket.emit(CLICK_CARD, 0, 2);
        }, 100);
        setTimeout(() => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 2);
          expectedGameDatas.score = 1;
          var expectedResult = expectedGameDatas.getResult();

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedResult.numberCardsMap.should.be.deepEqual(resultGameDatas.numberCardsMap);
          resultGameDatas.charCardsMap.has('0/2').should.be.false();
          expectedResult.score.should.be.deepEqual(resultGameDatas.score);
          done();
        }, 500);
      }, 100);
    });
  });

  it('should decrease the char card(value: B) to card(value: A) after combined one card', function(done) {
    setTimeout(() => {
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas.addCard(0, 0, 1).addCard(0, 2, 'B');
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 0, 1);
      setTimeout(() => {
        clientSocket.emit(CLICK_CARD, 0, 2);
      }, 100);
      setTimeout(() => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 1, 2);
        expectedGameDatas.score = 1;
        var expectedResult = expectedGameDatas.getResult();

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedResult.numberCardsMap.should.be.deepEqual(resultGameDatas.numberCardsMap);
        resultGameDatas.charCardsMap.get('0/2').value.should.be.equal('A');
        expectedResult.score.should.be.deepEqual(resultGameDatas.score);
        done();
      }, 500);
    }, 100);
  });

  it('should decrease the char card(value: C) to card(value: B) after combined one card', function(done) {
    setTimeout(() => {
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas.addCard(0, 0, 1).addCard(0, 2, 'C');
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 0, 1);
      setTimeout(() => {
        clientSocket.emit(CLICK_CARD, 0, 2);
      }, 100);
      setTimeout(() => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 1, 2);
        expectedGameDatas.score = 1;
        var expectedResult = expectedGameDatas.getResult();

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedResult.numberCardsMap.should.be.deepEqual(resultGameDatas.numberCardsMap);
        resultGameDatas.charCardsMap.get('0/2').value.should.be.equal('B');
        expectedResult.score.should.be.deepEqual(resultGameDatas.score);
        done();
      }, 500);
    }, 100);
  });
});