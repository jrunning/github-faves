/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

/**
 * @param data Object JSON decoded response.  Null if the request failed.
 */
function onText(data) {
  console.log(data);
}

// Specify that onText should be called with the result.
// chrome.extension.sendRequest({'action' : 'createGist'}, onText);

