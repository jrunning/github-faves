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
    , postData  = { login : this.username
                  , token : this.apiToken
                  , 'file_ext[gistfile1]'       : '.json'
                  , 'file_name[gistfile1]'      : filename
                  , 'file_contents[gistfile1]'  : data
                  }
  ;

  if(options.isPrivate) {
    postData.action_button = 'private';
  }

  this.genericPost(this.CREATE_URI, postData, callback);
};


// overwrite contents of one file in a gist
// (WARNING: Only works with one-file gists. WILL nuke additional files.)
Gister.prototype.writeOne = function write(repoId, filename, data, callback) {
  var filenameSplit = filename.split('.')
    , fileExt       = filenameSplit[filenameSplit.length - 1] // yes this is naive but good enough
    , postData      = { _method : 'put'
                    , login   : this.username
                    , token   : this.apiToken
                    }
  ;

  postData['file_name[' + filename + ']']     = filename;
  postData['file_contents[' + filename + ']'] = data;
  postData['file_ext[' + filename + ']']      = fileExt;

  this.genericPost(this.CREATE_URI + '/' + repoId, postData, callback);
};


// get the JSON content of a gist as an object
Gister.prototype.getJSON = function getJSON(repoId, callback) {
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

// a generified Ajax POST--takes either a string or an object as postData
Gister.prototype.genericPost = function genericPost(uri, postData, callback) {
    var xhr = this.getXHR(callback)
    , formData
  ;


  if(new String(postData) == postData) {
    formData = postData;
  } else {
    var formData = new FormData()
      , paramName
    ;

    for(paramName in postData) {
      if(postData.hasOwnProperty(paramName)) {
        formData.append(paramName, postData[paramName]);
      }
    }
  }

  xhr.open('POST', uri, true);
  xhr.send(formData);
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
