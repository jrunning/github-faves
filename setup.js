/**
 * @param data Object JSON decoded response.  Null if the request failed.
 */

function onText(data) {
  console.log(data);
}

// Simulate a click on the Account Admin tab; not necessary, only to show user where we get credentials
(function navToAdminTab() {
  var tabLink    = document.querySelector('a[href="#admin_bucket"]')
    , clickEvent = document.createEvent("MouseEvents")
  ;
  clickEvent.initEvent("click", true, false);
  tabLink.dispatchEvent(clickEvent);
})();

function flashSuccess(username, apiToken) {
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

    chrome.extension.sendRequest({ message : 'close-tab' });
    evt.preventDefault();
  });
}

function highlight() {
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
}

var usernameEl  = document.querySelector('.userbox .name')
  , username    = usernameEl.textContent
  , adminH3s    = document.querySelectorAll('#admin_bucket h3')
  , numH3s      = adminH3s.length
  , adminSection
  , apiTokenEl
  , apiToken
;

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
  chrome.extension.sendRequest({ message : 'acquired-credentials', username : username, apiToken : apiToken },
    function() { flashSuccess(username, apiToken); }
  );
} else {
  // TEH ERRORZ
}

