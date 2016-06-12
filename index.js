var blessed = require('blessed');
var fetch = require('node-fetch');
var exec = require('child_process').exec;

var urls = []

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

var table = blessed.listtable({
  parent: screen,
  width: '100%',
  height: '100%',
  label: 'Streams listing',
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
  fetch('https://api.twitch.tv/kraken/streams')
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
      table.focus()
      screen.render();
    }
  })
}

table.on('select', function(element, index) {
  exec('livestreamer ' + urls[index - 1] + ' best', (error, stdout, stderr) => {
    //
  });
});

screen.key('u', function(ch, key) {
  loadStreams();
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});
loadStreams();
