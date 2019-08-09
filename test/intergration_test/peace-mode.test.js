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
        var gameDatas = GAME_SYSTEM.getGameDatasByToken(TOKEN);
        var resultNumberMap = gameDatas.numberCardsMap;
        JSON.stringify(expectedNumberMap).should.be.equal(JSON.stringify(resultNumberMap));
        done();
      }, 1000);
    });
  });
});
