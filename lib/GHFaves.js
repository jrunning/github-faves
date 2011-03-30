function GHFaves() {
}

GHFaves.ACCOUNT_ADMIN_PATHNAME  = '/account';
GHFaves.ACCOUNT_ADMIN_URL       = 'https://github.com/account';

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
  sendResponse( { 'message'         : 'hasCredentials?'
                , 'hasCredentials'  : localStorage['github-username'] && localStorage['github-api-token']
                }
  );
};

GHFaves.prototype.loadCredentials = function loadCredentials(sendResponse) {
  if(     this.username = localStorage['github-username']
      &&  this.apiToken = localStorage['github-api-token']
  ) {
    sendResponse({ message : 'credentials', username : this.username, apiToken : this.apiToken });
  } else {
    sendResponse({ message : 'credentials' });
  }
};

GHFaves.prototype.doSetup = function doSetup() {
  var executeSetup = function executeSetup(tab) {
        console.log(tab);
        chrome.tabs.executeScript(tab.id, { file : 'setup.js' });
      }

    , runSetupWhenReady = function runSetupWhenReady(_, changeInfo, tab) {
        // so this doesn't get run on every page update
        chrome.tabs.onUpdated.removeListener(runSetupWhenReady);

        var pathname = GHFaves.parseURL(tab.url).pathname;

        // wait til the tab's done loading
        if(pathname == GHFaves.ACCOUNT_ADMIN_PATHNAME && changeInfo.status == 'complete') {
          // TODO: Figure out why this isn't happening
          executeSetup(tab);
        }
      }

    , afterTabCreate = function afterTabCreate(newTab) {
        chrome.tabs.onUpdated.addListener(runSetupWhenReady);
      }

    , afterGetSelected = function afterGetSelected(selectedTab) {
        var url = GHFaves.parseURL(selectedTab.url);

        if(url.pathname == this.ACCOUNT_ADMIN_PATHNAME) {
          executeSetup(selectedTab);
        } else {
          chrome.tabs.create({ url : GHFaves.ACCOUNT_ADMIN_URL }, afterTabCreate);
        }
      }
  ;

  chrome.tabs.getSelected(null, afterGetSelected);
};

// a.k.a. poorMansParseURL
GHFaves.parseURL = function parseURL(url) {
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

