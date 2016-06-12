var blessed = require('blessed');
var fetch = require('node-fetch');
var exec = require('child_process').exec;

var urls = []

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
      var channelNames = streams.map(function(stream, i, s) {
        return stream.channel.name;
      });
      urls = streams.map(function(stream, i, s) {
        return stream.channel.url;
      });
      list.clearItems();
      list.setItems(channelNames);
      screen.render();
    }
  })
}

var screen = blessed.screen({
  smartCSR: true
});

var box = blessed.box({
  width: '100%',
  height: '100%'
});

screen.append(box);

var list = blessed.list({
  parent: box,
  top: 0,
  left: 0,
  items: [],
  keys: true,
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: '#f0f0f0'
    },
    fg: 'white',
    header: {
      bg: 'red',
      fg: 'white'
    },
    cell: {
      bg: 'blue',
      fg: 'black'
    }
  }
});

list.on('select', function(element, index) {
  exec('livestreamer ' + urls[index] + ' best', (error, stdout, stderr) => {
    //
  });
});

screen.key('u', function(ch, key) {
  loadStreams();
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

list.focus();
screen.render();
loadStreams();
