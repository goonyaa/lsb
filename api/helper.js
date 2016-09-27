var globalConfig = require('../config');

var exists = function (something) {
  return typeof something !== "undefined" && something !== null;
};

var getUrlWithParams = function(config, params) {
  params = params || {};
  var url = config.url;
  var url_params = config.url_params || [];
  if (url_params.length >= 1) {
    var url_params_string = url_params.map(function(param) {
      var key = param.key;
      var value;
      if (exists(param.value)) {
        value = String(param.value) || '';
      } else if (param.useGlobal) {
        value = globalConfig[key] || '';
      } else if (param.useParams) {
        value = params[key] || '';
      } else {
        value = '';
      }
      return key + '=' + value;
    }).join('&');
    return url + '?' + url_params_string;
  } else {
    return url;
  }
};

var getValueByPath = function(object, path) {
  var splits = path.trim().split('.');
  var value = object;
  for(var i = 0; i < splits.length; i++) {
    split = splits[i];
    if (split in value) {
      value = value[split];
    } else {
      return undefined;
    }
  }
  return value;
};

module.exports = {
  exists: exists,
  getValueByPath: getValueByPath,
  getUrlWithParams: getUrlWithParams
};
