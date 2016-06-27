var blessed = require('blessed');
var fetch = require('node-fetch');
var exec = require('child_process').exec;
var games = require('./games');

var DEFAULT_VALUE = 'TBA';
var DEFAULT_SLICE_VALUE = 25;

var urls = [];
var gamesNames = [];
var type = 'stream';
var selectedGame = '';

var headers = [
  {label: 'Name', value: 'name', scope: 'channel'},
  {label: 'Game', value: 'game', scope: 'channel'},
  {label: 'Viewers', value: 'viewers'},
  {label: 'Lang', value: 'broadcaster_language', scope: 'channel'},
  {label: 'Description', value: 'status', scope: 'channel', slice: true}];

var screen = blessed.screen({
  smartCSR: true
});

var table = blessed.listtable({
  parent: screen,
  width: '100%',
  height: '100%',
  abottom: '40px',
  // top: 0,
  // left: 0,
  // rows: [],
  // data: [],
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


// NOTE: actually need to duplicate everything for loadGames... =(
// var demoStatusBar = blessed.box({
//   parent: screen,
//   width: '100%',
//   height: '20px', // pick some better size
//   bottom: 0,
//   style: {
//     fg: 'white'
//   }
// });

var loadStreams = function (params) {
  var fetchUrl = 'https://api.twitch.tv/kraken/streams?limit=100';
  if (params && params.game) {
    fetchUrl += '&game=' + params.game;
  }
  // demoStatusBar.setContent('Listing update in progress');
  fetch(fetchUrl)
  .then (function(response) {
    // demoStatusBar.setContent('Listing update complited');
    if (response.ok) {
      return response.json();
    }
  }, function(error) {
    // demoStatusBar.setContent('Listing update errored');
    //console.log(error.message);
  })
  .then (function(json) {
    if ('streams' in json) {
      // demoStatusBar.setContent('Preparing table for display');
      var streams = json['streams'];
      var data = streams.map(function(stream, index, s) {
        var streamData = headers.map(function(header) {
          var value = header.scope ? stream[header.scope][header.value] : stream[header.value]
          if (typeof value !== "undefined" && value !== null) {
            var text = String(value)
            return (header.slice && text.length > DEFAULT_SLICE_VALUE) ? text.slice(0, DEFAULT_SLICE_VALUE) : text;
          } else {
            return DEFAULT_VALUE;
          }
        });
        return streamData;
      });
      data.unshift(headers.map(function(header) {return header.label}));
      urls = streams.map(function(stream, i, s) {
        return stream.channel.url;
      });
      table.setData(data);
      table.setLabel('Streams listing');
      table.focus();
      // demoStatusBar.setContent('Table has been updated');
      // setTimeout(function() {demoStatusBar.setContent(''); screen.render();}, 500);
      screen.render();
    }
  })
}

table.on('select', function(element, index) {
  if (type === 'stream') {
    exec('livestreamer ' + urls[index - 1] + ' best', function(error, stdout, stderr) {
      //
    });
  } else if (type === 'game') {
    type = 'stream';
    selectedGame = gamesNames[index - 1];
    loadStreams({game: gamesNames[index - 1]});
  }
});

screen.key('g', function(ch, key) {
  games(fetch)
  .then(function(gamesData) {
    gamesNames = gamesData.names;
    type = 'game';
    table.setData(gamesData.data);
    table.setLabel('Games listing');
    table.focus();
    screen.render();
  })

})

screen.key('u', function(ch, key) {
  if (selectedGame) {
    loadStreams({game: selectedGame});
  } else {
    loadStreams();
  }
});

screen.key('r', function(ch, key) {
  type = 'stream';
  selectedGame = '';
  loadStreams();
})

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

loadStreams();
