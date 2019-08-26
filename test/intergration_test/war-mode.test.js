require('should');
const TEST_UTIL = require('./test_util');
const debugInfor = TEST_UTIL.debugInfor;
const debugObject = TEST_UTIL.debugObject;
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

let title = '';

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
    debugInfor('bigin replay request');
    clientSocket.emit(REPLAY, () => {
      debugInfor('finished replay request');
      done();
    });
  });

  after(function(done) {
    clientSocket.close();
    SERVICE_STARTER.stopServer();
    done();
  });

  describe('Put First Card', function() {
    title = 'should have one card in number map';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      clientSocket.emit(CLICK_CARD, 0, 0, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 0, 1);

        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        debugInfor(`END TEST: ${title}`);
        done();
      });
    });
  });

  describe('Combine Cards Without Skills', function() {
    title = 'should have one card in number map, card value should be 2, for combining one card(value: 1)';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        clientSocket.emit(CLICK_CARD, 0, 0, () => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 0, 2);
          expectedGameDatas.score = 1;

          var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
          debugInfor(`END TEST: ${title}`);
          done();
        });
      });
    });

    title = 'should have one card in number map, card value should be 2, for combining two cards (value: 1)';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      clientSocket.emit(CLICK_CARD, 0, 0, () => {
        clientSocket.emit(CLICK_CARD, 0, 2, () => {
          clientSocket.emit(CLICK_CARD, 0, 1, () => {
            var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
            expectedGameDatas.addCard(0, 1, 2);
            expectedGameDatas.score = 2;

            var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
            var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

            expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
            debugInfor(`END TEST: ${title}`);
            done();
          });
        });
      });
    });
  });

  describe('Simple Crits Score Skills', function() {
    title = 'should have one card in number map, card value should be 3, score should be 6, for combining 2 rounds with cards(value: 1,2)';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas.addCard(1, 0, 1).addCard(1, 1, 2);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 0, 0, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 0, 3);
        expectedGameDatas.score = 6;

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });

    title = 'should have one card in number map, card value should be 4, score should be 18, for combining 3 rounds with cards(value: 1,2,3)';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
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

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 1, 4);
        expectedGameDatas.score = 18;

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });

    title = 'should have one card in number map, card value should be 5, score should be 50, for combining 4 rounds with cards(value: 1,2,3,4)';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
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

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(0, 1, 5);
        expectedGameDatas.score = 50;

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });

    title = 'should have one card in number map, card value should be 7, score should be 210, for combining 6 rounds with cards(value: 1,2,3,4,5,6)';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
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

      clientSocket.emit(CLICK_CARD, 1, 1, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(1, 1, 7);
        expectedGameDatas.score = 210;
        var expectedResult = expectedGameDatas.getResult();

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedResult.numberCardsMap.should.be.deepEqual(resultGameDatas.numberCardsMap);
        expectedResult.score.should.be.deepEqual(resultGameDatas.score);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });
  });

  describe('Simple Number Attack Skill', function() {
    title = 'should kill the char card(value: A) after combined one card';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
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

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        clientSocket.emit(CLICK_CARD, 0, 2, () => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 2);
          expectedGameDatas.score = 1;

          expectedGameDatas.getResult().should.be.deepEqual(TEST_UTIL.getResultGameDatas(gameDatas));
          debugInfor(`END TEST: ${title}`);
          done();
        });
      });
    });

    title = 'should decrease the char card(value: B) to card(value: A) after combined one card';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
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

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        clientSocket.emit(CLICK_CARD, 0, 2, () => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 2).addCard(0, 2, 'A');
          expectedGameDatas.score = 1;

          expectedGameDatas.getResult().should.be.deepEqual(TEST_UTIL.getResultGameDatas(gameDatas));
          debugInfor(`END TEST: ${title}`);
          done();
        });
      });
    });

    title = 'should decrease the char card(value: C) to card(value: B) after combined one card';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
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

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        clientSocket.emit(CLICK_CARD, 0, 2, () => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 2).addCard(0, 2, 'B');
          expectedGameDatas.score = 1;

          expectedGameDatas.getResult().should.be.deepEqual(TEST_UTIL.getResultGameDatas(gameDatas));
          debugInfor(`END TEST: ${title}`);
          done();
        });
      });
    });

    title = 'should kill the char card(value: A) instead of kill a number card, after combined one card and a wrong click at number card';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(0, 0, 1)
        .addCard(0, 2, 'A')
        .addCard(0, 3, 1);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        clientSocket.emit(CLICK_CARD, 0, 3, () => {
          clientSocket.emit(CLICK_CARD, 0, 2, () => {
            var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
            expectedGameDatas.addCard(0, 1, 2).addCard(0, 3, 1);
            expectedGameDatas.score = 1;

            expectedGameDatas.getResult().should.be.deepEqual(TEST_UTIL.getResultGameDatas(gameDatas));
            debugInfor(`END TEST: ${title}`);
            done();
          });
        });
      });
    });
  });

  describe('Simple Absolutely Attack Skill', function() {
    title = 'should kill the char card(value: A) after combined total cards larger than 1';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(0, 0, 1)
        .addCard(0, 2, 1)
        .addCard(0, 3, 'A')
        .addCard(1, 3, 1);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        clientSocket.emit(CLICK_CARD, 0, 3, () => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 2).addCard(1, 3, 1);
          expectedGameDatas.score = 2;
          var expectedResult = expectedGameDatas.getResult();

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedResult.should.be.deepEqual(resultGameDatas);
          debugInfor(`END TEST: ${title}`);
          done();
        });
      });
    });

    title = 'should kill the number card(value: 1) after combined total cards larger than 1';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(0, 0, 1)
        .addCard(0, 2, 1)
        .addCard(0, 3, 'A')
        .addCard(1, 3, 1);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        clientSocket.emit(CLICK_CARD, 1, 3, () => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 2).addCard(0, 3, 'A');
          expectedGameDatas.score = 2;
          var expectedResult = expectedGameDatas.getResult();
          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);
          expectedResult.should.be.deepEqual(resultGameDatas);
          debugInfor(`END TEST: ${title}`);
          done();
        });
      });
    });

    // title = 'should kill the char card(value: A) instead of kill a number card, after combined one card and a wrong click at number card';
    // it(title, function (done) {
    //   debugInfor(`BEGIN TEST: ${title}`);
    //   var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
    //   mockedGameDatas
    //     .addCard(0, 0, 1)
    //     .addCard(0, 2, 'A')
    //     .addCard(0, 3, 1);
    //   var mockedResult = mockedGameDatas.getResult();
    //   var mockedCandidateCards = [1, 1];
    //   var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
    //   gameDatas.numberCardsMap = mockedResult.numberCardsMap;
    //   gameDatas.charCardsMap = mockedResult.charCardsMap;
    //   gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
    //   gameDatas.playgroundCards = mockedResult.playgroundCards;
    //   gameDatas.candidateCards = mockedCandidateCards;

    //   clientSocket.emit(CLICK_CARD, 0, 1, () => {
    //     clientSocket.emit(CLICK_CARD, 0, 3, () => {
    //       clientSocket.emit(CLICK_CARD, 0, 2, () => {
    //         var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
    //         expectedGameDatas.addCard(0, 1, 2).addCard(0, 3, 1);
    //         expectedGameDatas.score = 1;
    //         var expectedResult = expectedGameDatas.getResult();

    //         var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

    //         expectedResult.numberCardsMap.should.be.deepEqual(resultGameDatas.numberCardsMap);
    //         resultGameDatas.charCardsMap.has('0/2').should.be.false();
    //         expectedResult.score.should.be.deepEqual(resultGameDatas.score);
    //         done();
    //         debugInfor(`END TEST: ${title}`);
    //       });
    //     });
    //   });
    // });
  });

  describe('Crits Score And Number Attack Skills', function() {
    title = 'should execute crits score skill and attack char card A, after combining 2 rounds with cards(value: 1,2)';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(1, 0, 1)
        .addCard(1, 1, 2)
        .addCard(0, 1, 'A');
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 0, 0, () => {
        clientSocket.emit(CLICK_CARD, 0, 1, () => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 0, 3);
          expectedGameDatas.score = 6;

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
          debugInfor(`END TEST: ${title}`);
          done();
        });
      });
    });

    title = 'should execute 5 times crits score skill and attack char card C, after combining 4 rounds with cards(value: 1,2)';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(1, 0, 1)
        .addCard(1, 1, 2)
        .addCard(1, 2, 3)
        .addCard(0, 2, 4)
        .addCard(3, 3, 'C');
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 0, 1, () => {
        clientSocket.emit(CLICK_CARD, 3, 3, () => {
          var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
          expectedGameDatas.addCard(0, 1, 5).addCard(3, 3, 'B');
          expectedGameDatas.score = 50;

          var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

          expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
          debugInfor(`END TEST: ${title}`);
          done();
        });
      });
    });
  });

  describe('Simple King Of The World Skill', function() {
    title = 'should kill all cards of the playground, and get 10 times score, for king of the world skill';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(0, 0, 1)
        .addCard(0, 1, 2)
        .addCard(0, 2, 3)
        .addCard(1, 0, 4)
        .addCard(1, 2, 5)
        .addCard(2, 0, 6)
        .addCard(2, 1, 7)
        .addCard(2, 2, 8)
        .addCard(0, 3, 'C')
        .addCard(1, 3, 4);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 1, 1, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.score = 490;

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });
  });

  describe('Simple Kill All Skill', function() {
    title = 'should not kill all cards, after combining 8 cards, but the combined card value is less than 6';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(0, 0, 1)
        .addCard(0, 2, 1)
        .addCard(2, 0, 1)
        .addCard(2, 2, 1)
        .addCard(0, 1, 2)
        .addCard(2, 1, 2)
        .addCard(1, 0, 3)
        .addCard(1, 2, 3)
        .addCard(0, 3, 'C')
        .addCard(1, 3, 4);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 1, 1, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas
          .addCard(1, 1, 5)
          .addCard(0, 3, 'C')
          .addCard(1, 3, 4);
        expectedGameDatas.score = 14;

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });

    title = 'should kill all cards, after combining 8 cards, and the combined card value is not less than 6';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(0, 0, 2)
        .addCard(0, 2, 3)
        .addCard(2, 0, 3)
        .addCard(2, 2, 3)
        .addCard(0, 1, 4)
        .addCard(2, 1, 4)
        .addCard(1, 0, 6)
        .addCard(1, 2, 5)
        .addCard(0, 3, 'C')
        .addCard(1, 3, 1);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [2, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 1, 1, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas;
        expectedGameDatas.score = 30;

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });
  });

  describe('Simple Pentacle Growing Skill', function() {
    title = 'should run one more times combining, after executed Pentacle Growing Skill';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(0, 0, 1)
        .addCard(0, 2, 1)
        .addCard(2, 0, 1)
        .addCard(2, 2, 1)
        .addCard(0, 1, 3);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 1, 1, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(1, 1, 4);
        expectedGameDatas.score = 7;

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });
  });

  describe('Pentacle Growing And Crits Score Skill', function() {
    title = 'should run one more times combining, after executed Pentacle Growing Skill, and caused crits score at the second combine';
    it(title, function(done) {
      debugInfor(`BEGIN TEST: ${title}`);
      var mockedGameDatas = TEST_UTIL.emptyMockedGameDatas();
      mockedGameDatas
        .addCard(0, 0, 1)
        .addCard(0, 2, 1)
        .addCard(2, 0, 1)
        .addCard(2, 2, 1)
        .addCard(0, 1, 3)
        .addCard(2, 1, 3)
        .addCard(1, 0, 4)
        .addCard(1, 2, 4);
      var mockedResult = mockedGameDatas.getResult();
      var mockedCandidateCards = [1, 1];
      var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
      gameDatas.numberCardsMap = mockedResult.numberCardsMap;
      gameDatas.charCardsMap = mockedResult.charCardsMap;
      gameDatas.emptyCardsMap = mockedResult.emptyCardsMap;
      gameDatas.playgroundCards = mockedResult.playgroundCards;
      gameDatas.candidateCards = mockedCandidateCards;

      clientSocket.emit(CLICK_CARD, 1, 1, () => {
        var expectedGameDatas = TEST_UTIL.emptyMockedGameDatas();
        expectedGameDatas.addCard(1, 1, 5);
        expectedGameDatas.score = 32;

        var resultGameDatas = TEST_UTIL.getResultGameDatas(gameDatas);

        expectedGameDatas.getResult().should.be.deepEqual(resultGameDatas);
        done();
        debugInfor(`END TEST: ${title}`);
      });
    });
  });
});
