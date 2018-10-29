"use strict";

(function () {
  var pendingCallbacks = [];
  /**
   * Convert an object to key=value&key=value notation.
   */

  function serialize(obj) {
    if (!obj) {
      return '';
    }

    var parts = [];
    Object.keys(obj).forEach(function (key) {
      if (obj[key] !== undefined) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
      }
    });
    return parts.join('&');
  }
  /**
   * Convert a serialzed string to an object.
   */


  function deserialize(str) {
    var obj = {};
    var parts = decodeURIComponent(str).split('&');
    parts.forEach(function (part) {
      part = part.split('=');

      if (part[0]) {
        obj[part[0]] = part[1];
      }
    });
    return obj;
  }
  /**
   * Set router.params to reflect the current URL
   */


  function syncParams() {
    router.params = deserialize(location.hash.substring(1));
  }
  /**
   * Set the URL to reflect router.params
   */


  function syncURL(forceLoad) {
    var hash = serialize(router.params);

    if (forceLoad && location.hash === hash) {
      router.load();
    } else {
      location.hash = hash;
    }
  }
  /**
   * Update router.params and reload the app
   * after a change to the URL
   */


  var hashchange = function hashchange() {
    syncParams();
    router.load();
  };
  /**
   * Start listening for URL changes
   */


  function bindHashChange() {
    window.addEventListener('hashchange', hashchange);
  }
  /**
   * Stop listening for URL changes
   */


  function unbindHashChange() {
    window.removeEventListener('hashchange', hashchange);
  }
  /**
   * Take either an object or a serialized string,
   * and return an object.
   */


  function normalize(params) {
    if (typeof params === 'string') {
      params = deserialize(params);
    }

    return params || {};
  }

  function paramsAreDifferent(params) {
    var newKeys = Object.keys(params);
    var oldKeys = Object.keys(router.params);

    if (newKeys.length !== oldKeys.length) {
      return true;
    }

    for (var i = 0; i < newKeys.length; i++) {
      if (router.params[newKeys[i]] !== params[newKeys[i]]) {
        return true;
      }
    }

    for (var _i = 0; _i < oldKeys.length; _i++) {
      if (router.params[oldKeys[_i]] !== params[oldKeys[_i]]) {
        return true;
      }
    }
  }
  /**
   * Merge the given params with router.params
   */


  function mergeParams(params) {
    var isDifferent;
    params = normalize(params);
    Object.keys(params).forEach(function (key) {
      if (router.params[key] !== params[key]) {
        isDifferent = true;
        router.params[key] = params[key];
      }
    });
    return isDifferent;
  }

  function replaceURL() {
    var hash = '#' + serialize(router.params);

    if (location.hash !== hash) {
      history.replaceState(undefined, undefined, hash);
    }
  }
  /**
   * Handles the given parameters, and runs the
   * provided callback for changing the URL without
   * reloading the app.
   */


  function changeURL(callback) {
    if (!pendingCallbacks.length) {
      unbindHashChange();
      requestAnimationFrame(function () {
        var callbacks = Array.from(pendingCallbacks);
        pendingCallbacks = [];
        callbacks.forEach(function (fn) {
          return fn();
        });
        requestAnimationFrame(bindHashChange);
      });
    }

    pendingCallbacks.push(callback);
  }
  /**
   * Remove the given parameters from router.params
   */


  function removeParams(params) {
    var isDifferent;
    params.forEach(function (param) {
      if (router.params[param] !== undefined) {
        isDifferent = true;
        delete router.params[param];
      }
    });
    return isDifferent;
  }

  var url = {
    /**
     * Remove the provided keys from the URL
     */
    remove: function remove() {
      for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      if (removeParams(params)) {
        url.set(router.params, true);
      }
    },

    /**
     * Remove the provided keys form the URL
     * without adding a browser history entry
     */
    removeReplace: function removeReplace() {
      for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        params[_key2] = arguments[_key2];
      }

      if (removeParams(params)) {
        changeURL(replaceURL);
      }
    },

    /**
     * Add the provided keys to the URL
     */
    merge: function merge(params) {
      if (mergeParams(params)) {
        changeURL(syncURL);
      }
    },

    /**
     * Update the URL to match the given params
     */
    set: function set(params, force) {
      params = normalize(params);

      if (force || paramsAreDifferent(params)) {
        router.params = params;
        changeURL(syncURL);
      }
    },

    /**
     * Replace the current URL without adding
     * a browser history entry
     */
    replace: function replace(params) {
      params = normalize(params);

      if (paramsAreDifferent(params)) {
        router.params = params;
        changeURL(replaceURL);
      }
    },

    /**
     * Add the given params to the URL without
     * adding a browser history entry
     */
    mergeReplace: function mergeReplace(params) {
      if (mergeParams(params)) {
        changeURL(replaceURL);
      }
    }
  };
  var router = {
    params: {},
    url: url,
    unbound: 1,

    /**
     * Reload the app.
     */
    load: function load() {
      if (router.app) {
        router.app(router.params);
      }
    },

    /**
     * Register the app with the router, and run it.
     */
    init: function init(app) {
      router.app = app;
      bindHashChange();
      syncParams();
      router.load();
    },

    /**
     * Remove the provided keys from the URL,
     * and reload the app.
     */
    remove: function remove() {
      for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        params[_key3] = arguments[_key3];
      }

      removeParams(params);
      syncURL(true);
    },

    /**
     * Remove the provided keys form the URL
     * without adding a browser history entry
     * and reload the app.
     */
    removeReplace: function removeReplace() {
      for (var _len4 = arguments.length, params = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        params[_key4] = arguments[_key4];
      }

      removeParams(params);
      replaceURL();
    },

    /**
     * Add the provided keys to the URL,
     * and reload the app.
     */
    merge: function merge(params) {
      mergeParams(params);
      syncURL(true);
    },

    /**
     * Set the URL to an exact param list,
     * and reload the app
     */
    set: function set(params) {
      router.params = normalize(params);
      syncURL(true);
    },

    /**
     * Replace the current URL without adding a
     * browser history entry, and reload the app. 
     */
    replace: function replace(params) {
      router.params = normalize(params);
      replaceURL();
    },

    /**
     * Replace params in the current URL without adding
     * a browser history entry, and reload the app.
     */
    mergeReplace: function mergeReplace(params) {
      mergeParams(params);
      replaceURL();
    }
  };
  window.uav = window.uav || {};
  window.uav.router = router;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = router;
  }
})();
