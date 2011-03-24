/**
 * @param data Object JSON decoded response.  Null if the request failed.
 */

(function getCredentials() {
  (function navToAdminTab() {
    // simulate a click on the Account Admin tab;
    // not technically necessary but shows user where we get credentials
    var tabLink    = document.querySelector('a[href="#admin_bucket"]')
      , clickEvent = document.createEvent("MouseEvents")
    ;
    clickEvent.initEvent("click", true, false);
    tabLink.dispatchEvent(clickEvent);
  })();

  var flashSuccess = function flashSuccess(username, apiToken) {
    // hijack GitHub's built-in flash notification area
    var flashArea = document.querySelector('.flash-messages')
      , myFlash   = document.createElement('p')
    ;

    myFlash.setAttribute('class', 'flash flash-notice ghf-flash');
    myFlash.innerHTML = 'Great! github-faves found and saved your username '
                      + '(<code style="font-size: smaller;">' + username + '</code>) '
                      + 'and API token (<code style="font-size: smaller;">' + apiToken + '</code>). '
                      + 'You may <a href="#" id="ghf-close-tab" style="text-decoration: underline;">close this tab</a> now.'
    ;

    flashArea.appendChild(myFlash);

    document.getElementById('ghf-close-tab').addEventListener('click', function(evt) {
      console.log('WUH!');
      chrome.extension.sendRequest({ message : 'closeTab', returnToTab : null }); // TODO: Actually get returnToTab
      evt.preventDefault();
    });
  };
  
  // highlight the elements passed as arguments
  var highlight = function highlight() {
    var numEls = arguments.length
      , thisEl
      , style
    ;

    for(var i = 0; i < numEls; i++) {
      thisEl = arguments[i];
      style  = thisEl.style;
      style.setProperty('background-color', 'yellow');
      style.setProperty('padding',          '.33em');
    }
  };

  var usernameEl  = document.querySelector('.userbox .name')
    , username    = usernameEl.textContent
    , adminH3s    = document.querySelectorAll('#admin_bucket h3')
    , numH3s      = adminH3s.length
    , adminSection
    , apiTokenEl
    , apiToken
  ;

  // there's no direct selector for the API token, so find the section with the right header
  for(var i = 0; i < numH3s; i++) {
    if(adminH3s[i].textContent == "API Token") {
      adminSection  = adminH3s[i].parentElement;
      apiTokenEl    = adminSection.querySelector('.lineoption code');
      apiToken      = apiTokenEl.textContent;

      break;
    }
  }

  highlight(apiTokenEl, usernameEl);

  if(username && apiToken) {
    // send the credentials back to the main script
    chrome.extension.sendRequest(
      { message : 'acquiredCredentials', username : username, apiToken : apiToken },
      function() { flashSuccess(username, apiToken); }
    );
  } else {
    // TODO: TEH ERRORZ
  }
})();

