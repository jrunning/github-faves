function Gister(username, apiToken) {
  this.username = username;
  this.apiToken = apiToken;
  this.caller   = arguments.callee.caller;
}

Gister.prototype.BASE_URI = 'https://gist.github.com/api/v1/json/';
Gister.prototype.CREATE_URI = 'https://gist.github.com/gists';

/*
      data["file_ext[gistfile#{i}]"]      = file[:extension] ? file[:extension] : '.txt'
      data["file_name[gistfile#{i}]"]     = file[:filename]
      data["file_contents[gistfile#{i}]"] = file[:input]

*/

// create a new gist with one file
Gister.prototype.create = function create(filename, data, options, callback) {
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
        // TODO: Make sure this is actually working
        callback(xhr.responseText);
      } else {
        callback();
      }
    }
  };

  return handleXhrResponse;
};
