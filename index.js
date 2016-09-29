var blessed = require('blessed');
var fetch = require('node-fetch');
var exec = require('child_process').exec;

var config = require('./config');
var twitch = require('./twitch');

var urls = [];
var gamesNames = [];
var type = 'stream';
var selectedGame = '';

var screen = blessed.screen({
  smartCSR: true,
  debug: true
});

var table = blessed.listtable({
  parent: screen,
  width: '100%',
  height: '100%',
  abottom: '40px',
  selectedFg: 'white',
  selectedBg: 'grey',
  keys: true,
  interactive: true,
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'black'
    }
  }
});

var renderStreams = function (params) {
  twitch.streams.get(fetch, params)
  .then(function(response) {
    urls = response.urls;
    table.setData(response.data);
    table.setLabel('Streams');
    table.focus();
    screen.render();
  });
};

var renderGamesTop = function (params) {
  twitch.games.getTop(fetch, params)
  .then(function(response) {
    gamesNames = response.names;
    type = 'game';
    table.setData(response.data);
    table.setLabel('Games:Top');
    table.focus();
    screen.render();
  });
};

table.on('select', function(element, index) {
  if (type === 'stream') {
    exec('livestreamer ' + urls[index - 1] + ' best,720p30 --http-header Client-ID=' + config.client_id, function (error, stdout, stderr) {
      //
    });
  } else if (type === 'game') {
    type = 'stream';
    selectedGame = gamesNames[index - 1];
    renderStreams({game: gamesNames[index - 1]});
  }
});

screen.key('g', function(ch, key) {
  renderGamesTop();
});

screen.key('u', function(ch, key) {
  if (selectedGame) {
    renderStreams({game: selectedGame});
  } else {
    renderStreams();
  }
});

screen.key('r', function(ch, key) {
  type = 'stream';
  selectedGame = '';
  renderStreams();
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

renderStreams();
