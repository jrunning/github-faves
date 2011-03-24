/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

/**
 * @param data Object JSON decoded response.  Null if the request failed.
 */

// TODO: Pop up a message asking if the user would like to do setup now
chrome.extension.sendRequest({ message : 'hasCredentials?' },
  function(response) {
    response.hasCredentials || chrome.extension.sendRequest({ message : 'doSetup' });
  }
);

// Specify that onText should be called with the result.
// chrome.extension.sendRequest({'action' : 'createGist'}, onText);

