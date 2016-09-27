var config = require('./config');

var helper = require('../helper');
var getUrlWithParams = helper.getUrlWithParams;
var getValueByPath = helper.getValueByPath;
var exists = helper.exists;

getTop = function(fetch, params) {
  return new Promise(function(resolve, reject) {
    fetch(getUrlWithParams(config, params))
    .then (function(response) {
      if (response.ok) {
        return response.json();
      }
    }, function(error) { console.log(error); return undefined; })
    .then (function(json) {
      if ('top' in json) {
        var schema = config.schema;
        var headers = schema.map(function(item) { return item.label; });
        var data = [];
        var names = [];
        json.top.forEach(function(game) {
          data.push(schema.map(function(item) {
            var value = getValueByPath(game, item.path);
            if (exists(value)) {
              return String(value);
            } else {
              return item.default || '??';
            }
          }));
          names.push(game.game.name);
        });
        resolve({ data: [headers].concat(data), names: names });
      }
    });
  });
};

module.exports = {
  getTop: getTop
};
