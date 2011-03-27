function bind(f, obj) {
  return function() {
    return f.apply(obj, arguments);
  };
}
      
function GHFaves() {
}

GHFaves.prototype.messageHandlers = {
  'acquiredCredentials' : function msg_acquiredCredentials(request, _, callback) {
    this.saveCredentials(request.username, request.apiToken, callback);
  },

  'doSetup'             : function() { this.doSetup(); },
  
  'hasCredentials?'     : function msg_hasCredentials(_, _, callback) {
    this.hasCredentials(callback);
  }
};

GHFaves.prototype.saveCredentials = function saveCredentials(username, apiToken, callback) {
  localStorage['github-username']   = this.username = username;
  localStorage['github-api-token']  = this.apiToken = apiToken;

  callback();
};

GHFaves.prototype.hasCredentials = function hasCredentials(sendResponse) {
  sendResponse( { 'message'         : 'hasCredentials?'
                , 'hasCredentials'  : localStorage['github-username'] && localStorage['github-api-token']
                }
  );
};

GHFaves.prototype.loadCredentials = function loadCredentials(sendResponse) {
  if(     this.username = localStorage['github-username']
      &&  this.apiToken  = localStorage['github-api-token']
  ) {
    sendResponse({ message : 'credentials', username : this.username, apiToken : this.apiToken });
  } else {
    sendResponse({ message : 'credentials' });
  }
};

GHFaves.prototype.doSetup = function doSetup() {
  chrome.tabs.getSelected(null, bind(function(currentTab) {
    var url = this.parseURL(currentTab.url);

    if(url.pathname == '/account') {
      // if we're looking at the Account page, use that tab
      chrome.tabs.executeScript(currentTab.id, { file : 'setup.js' });
    } else {
      // otherwise open it in a new tab
      chrome.tabs.create( { url : 'https://github.com/account' },
        bind(function(newTab) {
          var runSetupWhenReady = bind(function runSetupWhenReady(tabId, changeInfo, tab) {
            // so this doesn't get run on every page update
            chrome.tabs.onUpdated.removeListener(runSetupWhenReady);

            var pathname = this.parseURL(newTab.url).pathname;

            // wait til the tab's done loading
            if(pathname == '/account' && changeInfo.status == 'complete') {
              // TODO: Figure out why this isn't happening
              chrome.tabs.executeScript(newTab.id, { file : 'setup.js' });
            }
          }, this);

          chrome.tabs.onUpdated.addListener(runSetupWhenReady);
        }, this)
      );
    }
  }, this));
};

// a.k.a. poorMansParseURL
GHFaves.prototype.parseURL = function parseURL(url) {
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

