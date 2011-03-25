// Much inspiration and code ported from defunkt/gist
// -> https://github.com/defunkt/gist

function Gister(username, apiToken) {
  this.username = username;
  this.apiToken = apiToken;
  this.caller   = arguments.callee.caller;
}

Gister.prototype.BASE_URI   = 'https://gist.github.com/api/v1/json/';
Gister.prototype.GIST_URI   = 'https://gist.github.com/';
Gister.prototype.CREATE_URI = 'https://gist.github.com/gists';

// create a new gist with one file
Gister.prototype.createOne = function createOne(filename, data, options, callback) {
  var options   = options || {}
    , xhr       = this.getXHR(callback)
    , postData  = { login : this.username
                  , token : this.apiToken
                  , 'file_ext[gistfile1]'       : '.json'
                  , 'file_name[gistfile1]'      : filename
                  , 'file_contents[gistfile1]'  : data
                  }
    , formData  = new FormData()
    , paramName
  ;

  if(options.isPrivate) {
    postData.action_button = 'private';
  }

  for(paramName in postData) {
    if(postData.hasOwnProperty(paramName)) {
      formData.append(paramName, postData[paramName]);
    }
  }

  xhr.open('POST', this.CREATE_URI, true);
  xhr.send(formData);
};

// get the JSON content of a gist as an object
Gister.prototype.getJSON = function(repoId, callback) {
  this.get(repoId, jsonifyCallback(callback));
};

// get the content of a gist
Gister.prototype.get = function get(repoId, callback) {
  var uri = this.GIST_URI + repoId + '.txt';

  this.genericGet(uri, callback);
};

// get a list of a user's public gists
Gister.prototype.getGists = function getGists(username, callback) {
  this.genericGet(this.BASE_URI + username, jsonifyCallback(callback));
};


// TODO: Make these private

// return an XHR object with its response handler set nicely
Gister.prototype.getXHR = function getXHR(responseHandler) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = this.xhrResponseHandler(xhr, responseHandler);

  return xhr;
};

// return a function that parses its JSON parameter before handing it to a callback
Gister.prototype.jsonifyCallback = function jsonifyCallback(callback) {
  var jsonifiedCallback = function jsonifiedCallback(data) {
    callback(JSON.parse(data));
  };

  return jsonifiedCallback;
};

// a generified Ajax GET
Gister.prototype.genericGet = function genericGet(uri, callback) {
  var xhr = this.getXHR(callback);
  xhr.open('GET', uri, true);
  xhr.send();
};

Gister.prototype.xhrResponseHandler = function xhrResponseHandler(xhr, callback) {
  var handleXhrResponse = function handleXhrResponse(evt) {
    if(xhr.readyState == 4 /* COMPLETED */) {
      if(xhr.status == 200) {
        callback(xhr.responseText);
      } else {
        callback();
      }
    }
  };

  return handleXhrResponse;
};
