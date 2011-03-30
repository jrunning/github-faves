function GHFaves() {
  this.loadCredentials();

  if(this.hasCredentials()) {
    this.gist = new Gister(this.username, this.apiToken);
  }
}

GHFaves.ACCOUNT_ADMIN_PATHNAME  = '/account/admin';
GHFaves.ACCOUNT_ADMIN_URL       = 'https://github.com/account/admin';
GHFaves.GIST_FILENAME           = 'github-faves.json'

GHFaves.prototype.messageHandlers = {
  'acquiredCredentials' : function msg_acquiredCredentials(request, _, callback) {
    this.saveCredentials(request.username, request.apiToken, callback);
  },

  'doSetup'             : function() { this.doSetup(); },
  
  'hasCredentials?'     : function msg_hasCredentials(_, __, callback) {
    this.hasCredentials(callback);
  }
};

GHFaves.prototype.saveCredentials = function saveCredentials(username, apiToken, callback) {
  localStorage['github-username']   = this.username = username;
  localStorage['github-api-token']  = this.apiToken = apiToken;

  callback();
};

GHFaves.prototype.hasCredentials = function hasCredentials(sendResponse) {
  var hasCredentials = !!(this.username && this.apiToken);

  if(sendResponse) {
    sendResponse( { 'message'         : 'hasCredentials?'
                  , 'hasCredentials'  : hasCredentials
                  }
    );
  }

  return hasCredentials;
};

GHFaves.prototype.loadCredentials = function loadCredentials(sendResponse) {
  var sendResponse = sendResponse || function() {};

  if(     (this.username = localStorage['github-username'])
      &&  (this.apiToken = localStorage['github-api-token'])
  ) {
    sendResponse({ message : 'credentials', username : this.username, apiToken : this.apiToken });
  } else {
    sendResponse({ message : 'credentials' });
  }
};

GHFaves.prototype.doSetup = function doSetup() {
  var executeSetup = function executeSetup(tab) {
        chrome.tabs.executeScript(tab.id, { file : 'setup.js' });
      }

    , runSetupWhenReady = function runSetupWhenReady(_, changeInfo, tab) {
        var pathname = GHFaves.Util.parseURL(tab.url).pathname;

        // wait til the tab's done loading
        if(pathname == GHFaves.ACCOUNT_ADMIN_PATHNAME && changeInfo.status == 'complete') {
          chrome.tabs.onUpdated.removeListener(runSetupWhenReady);

          executeSetup(tab);
        }
      }
  ;

  chrome.tabs.create({ url : GHFaves.ACCOUNT_ADMIN_URL },
    function() {
      chrome.tabs.onUpdated.addListener(runSetupWhenReady);
    }
  );
};

GHFaves.prototype.getGistId = function getGistId(username, callback) {
  var gist = this.gist;

  this.gist.getGists(username, function(resp) {
    console.log(resp);
    var gists     = resp.gists
      , numGists  = gists.length
    ;

    for(var i = 0; i < numGists; i++) {
      if(gists[i].files[0] == GHFaves.GIST_FILENAME) {
        callback(gists[i].repo);
        return;
      }
    }

    // if we get this far, no such gist exists!
    gist.createOne(GHFaves.GIST_FILENAME, '{}', {}, callback);
  });
};


// a.k.a. poorMansParseURL
GHFaves.Util  = { parseURL : function parseURL(url) {
                    var dummy = document.createElement('a');
                    dummy.href = url;

                    return  { protocol  : dummy.protocol
                            , host      : dummy.host
                            , hostname  : dummy.hostname
                            , port      : dummy.port
                            , pathname  : dummy.pathname
                            , search    : dummy.search
                            , hash      : dummy.hash
                            }
                    ;
                }
}

