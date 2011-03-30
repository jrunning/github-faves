// TODO: Pop up a message asking if the user would like to do setup now
chrome.extension.sendRequest({ message : 'hasCredentials?' },
  function(response) {
    response.hasCredentials || chrome.extension.sendRequest({ message : 'doSetup' });
  }
);
