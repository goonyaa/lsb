var _ = require('lodash');
var CLIENT_ID = require('./client_id');

var TOP_URL = 'https://api.twitch.tv/kraken/games/top?' + 'client_id=' + CLIENT_ID;

var headers = [
  {label: 'Game', value: 'name', scope: 'game'},
  {label: 'Viewers', value: 'viewers'},
  {label: 'Channels count', value: 'channels'}
];

var loadGames = function (fetch) {
  return new Promise(function(resolve, reject) {
    var fetchUrl = TOP_URL;
    fetchUrl += '&limit=75';
    fetch(fetchUrl)
    .then (function(response) {
      if (response.ok) {
        return response.json();
      }
    }, function(error) {
      console.log(error.message);
    })
    .then (function(json) {
      if ('top' in json) {
        var games = json.top;
        var names = [];
        var data = games.map(function(game, index, s) {
          var gameData = headers.map(function(header) {
            names.push(game.game.name);
            if (header.scope) {
              return '' + game[header.scope][header.value];
            } else {
              return '' + game[header.value];
            }
          });
          return gameData;
        });
        data.unshift(headers.map(function(header) {return header.label;}));
        resolve({data, names: _.uniq(names)});
      }
    });
});
};

module.exports = loadGames;
