var config = require('./config');

var helper = require('../helper');
var getUrlWithParams = helper.getUrlWithParams;
var getValueByPath = helper.getValueByPath;
var exists = helper.exists;

getStreams = function(fetch, params) {
  return new Promise(function(resolve, reject) {
    fetch(getUrlWithParams(config, params))
    .then (function(response) {
      if (response.ok) {
        return response.json();
      }
    }, function(error) { console.log(error); return undefined; })
    .then (function(json) {
      if ('streams' in json) {
        var schema = config.schema;
        var headers = schema.map(function(item) { return item.label; });
        var data = [];
        var urls = [];
        json.streams.forEach(function(stream) {
          data.push(schema.map(function(item) {
            var value = getValueByPath(stream, item.path);
            if (exists(value)) {
              return String(value);
            } else {
              return item.default || '??';
            }
          }));
          urls.push(stream.channel.url);
        });
        resolve({data: [headers].concat(data), urls: urls});
      }
    });
  });
};

module.exports = {
  get: getStreams
};
