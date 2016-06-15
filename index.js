var blessed = require('blessed');
var fetch = require('node-fetch');
var exec = require('child_process').exec;
var games = require('./games')

var urls = []
var gamesNames = []
var type = 'stream'
var selectedGame = ''

var headers = [
  {label: 'Name', value: 'name', scope: 'channel'},
  {label: 'Game', value: 'game', scope: 'channel'},
  {label: 'Viewers', value: 'viewers'},
  {label: 'Lang', value: 'broadcaster_language', scope: 'channel'},
  {label: 'Description', value: 'status', scope: 'channel'}]

var screen = blessed.screen({
  smartCSR: true
});

var box = blessed.box({
  parent: screen,
  width: '100%',
  height: '100%'
});

// games(screen, fetch)

var table = blessed.listtable({
  parent: screen,
  width: '100%',
  height: '100%',
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

var loadStreams = function (params) {
  var fetchUrl = 'https://api.twitch.tv/kraken/streams'
  if (params && params.game) {
    fetchUrl += '?game=' + params.game
  }
  fetch(fetchUrl)
  .then (function(response) {
    if (response.ok) {
      return response.json();
    }
  }, function(error) {
    console.log(error.message);
  })
  .then (function(json) {
    if ('streams' in json) {
      var streams = json['streams'];
      var data = streams.map(function(stream, index, s) {
        var streamData = headers.map(function(header) {
          if (header.scope) {
            return '' + stream[header.scope][header.value]
          } else {
            return '' + stream[header.value]
          }
        })
        return streamData
      })
      data.unshift(headers.map(function(header) {return header.label}))
      urls = streams.map(function(stream, i, s) {
        return stream.channel.url;
      });
      screen.append(table)
      table.setData(data)
      table.setLabel('Streams listing')
      table.focus()
      screen.render();
    }
  })
}

table.on('select', function(element, index) {
  if (type === 'stream') {
    exec('livestreamer ' + urls[index - 1] + ' best', (error, stdout, stderr) => {
      //
    });
  } else if (type === 'game') {
    selectedGame = gamesNames[index - 1]
    loadStreams({game: gamesNames[index - 1]})
  }
});

screen.key('g', function(ch, key) {
  games(fetch)
  .then(function(gamesData) {
    gamesNames = gamesData.names
    type = 'game'
    table.setData(gamesData.data)
    table.setLabel('Games listing')
    table.focus()
    screen.render()
  })

})

screen.key('u', function(ch, key) {
  if (type === 'game') {
    loadStreams({game: selectedGame});
  } else {
    loadStreams()
  }
});

screen.key('r', function(ch, key) {
  type = 'stream'
  selectedGame = ''
  loadStreams()
})

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});
loadStreams();
