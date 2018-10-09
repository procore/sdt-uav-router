(() => {

    /**
     * Convert an object to key=value&key=value notation.
     */
    function serialize(obj) {

        if (!obj) {

            return '';

        }

        const parts = [];

        Object.keys(obj).forEach(key => {

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

        const obj = {};

        const parts = decodeURIComponent(str).split('&');

        parts.forEach(part => {

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

        const hash = serialize(router.params);

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
    const hashchange = () => {

        syncParams();

        router.load();

    };

    /**
     * Start listening for URL changes
     */
    function bindHashChange() {

        /**
         * If unbindHashChange() has been called multiple times,
         * bindHashChange() must be called an equal number of
         * times before the listener is actually bound.
         */
        router.unbound--;

        if (router.unbound < 1) {

            router.unbound = 0;

            window.addEventListener('hashchange', hashchange);

        }

    }

    /**
     * Stop listening for URL changes
     */
    function unbindHashChange() {

        router.unbound++;

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

    /**
     * Merge the given params with router.params
     */
    function mergeParams(params) {

        Object.assign(router.params, normalize(params));

    }

    function replaceURL() {

        const hash = '#' + serialize(router.params);

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

        unbindHashChange();

        setTimeout(() => {

            callback();

            setTimeout(bindHashChange);

        });

    }

    /**
     * Remove the given parameters from router.params
     */
    function removeParams(params) {

        params.forEach(param => {

            delete router.params[param];

        });

    }

    const url = {

        /**
         * Remove the provided keys from the URL
         */
        remove(...params) {

            removeParams(params);

            url.set(router.params);

        },

        /**
         * Remove the provided keys form the URL
         * without adding a browser history entry
         */
        removeReplace(...params) {

            removeParams(params);

            changeURL(replaceURL);

        },

        /**
         * Add the provided keys to the URL
         */
        merge(params) {

            mergeParams(params);

            changeURL(syncURL);

        },

        /**
         * Update the URL to match the given params
         */
        set(params) {

            router.params = normalize(params);

            changeURL(syncURL);

        },

        /**
         * Replace the current URL without adding
         * a browser history entry
         */
        replace(params) {

            router.params = normalize(params);

            changeURL(replaceURL);

        },

        /**
         * Add the given params to the URL without
         * adding a browser history entry
         */
        mergeReplace(params) {

            mergeParams(params);

            changeURL(replaceURL);

        }

    };

    const router = {

        params: {},

        url,

        unbound: 1,

        /**
         * Reload the app.
         */
        load() {

            if (router.app) {

                router.app(router.params);

            }

        },

        /**
         * Register the app with the router, and run it.
         */
        init(app) {

            router.app = app;

            bindHashChange();

            syncParams();

            router.load();

        },

        /**
         * Remove the provided keys from the URL,
         * and reload the app.
         */
        remove(...params) {

            removeParams(params);

            syncURL(true);

        },

        /**
         * Remove the provided keys form the URL
         * without adding a browser history entry
         * and reload the app.
         */
        removeReplace(...params) {

            removeParams(params);

            replaceURL();

        },

        /**
         * Add the provided keys to the URL,
         * and reload the app.
         */
        merge(params) {

            mergeParams(params);

            syncURL(true);

        },

        /**
         * Set the URL to an exact param list,
         * and reload the app
         */
        set(params) {

            router.params = normalize(params);

            syncURL(true);

        },

        /**
         * Replace the current URL without adding a
         * browser history entry, and reload the app. 
         */
        replace(params) {

            router.params = normalize(params);

            replaceURL();

        },

        /**
         * Replace params in the current URL without adding
         * a browser history entry, and reload the app.
         */
        mergeReplace(params) {

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
