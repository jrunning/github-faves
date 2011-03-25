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
  this.get(repoId, function(data) {
    callback(JSON.parse(data));
  });
};

// get the content of a gist
Gister.prototype.get = function get(repoId, callback) {
  var xhr       = this.getXHR(callback)
    , uri       = this.GIST_URI + repoId + '.txt'
  ;

  xhr.open('GET', uri, true);
  xhr.send();
};

// TODO: Make these private
Gister.prototype.getXHR = function getXHR(responseHandler) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = this.xhrResponseHandler(xhr, responseHandler);

  return xhr;
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
