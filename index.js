(() => {

    let syncPending,
        loadPending;

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

    function canNavigate() {

        return !router.canNavigate || router.canNavigate();

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
    function syncURL() {

        const hash = serialize(router.params);

        if (!syncPending && location.hash.substring(1) !== hash && canNavigate()) {

            syncPending = true;

            requestAnimationFrame(() => {

                location.hash = hash;

            });

        }

    }

    /**
     * Update router.params and reload the app
     * after a change to the URL
     */
    const hashchange = e => {

        if (syncPending) {

            syncPending = false;

        } else {

            if (!canNavigate()) {

                syncPending = true;

                location.hash = serialize(router.params);

                return e.preventDefault();

            }

            syncParams();

            router.load();

        }

    };

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

        const newKeys = Object.keys(params);

        const oldKeys = Object.keys(router.params);

        if (newKeys.length !== oldKeys.length) {

            return true;

        }

        const keys = newKeys.length > oldKeys.length ? newKeys : oldKeys;

        for (let i = 0; i < keys.length; i++) {

            if (router.params[keys[i]] !== params[keys[i]]) {

                return true;

            }

        }

    }

    /**
     * Merge the given params with router.params
     */
    function mergeParams(params) {

        let isDifferent;

        params = normalize(params);

        Object.keys(params).forEach(key => {

            if (router.params[key] !== params[key]) {

                isDifferent = true;

                router.params[key] = params[key];

            }

        });

        return isDifferent;

    }

    function replaceURL() {

        const hash = '#' + serialize(router.params);

        if (location.hash !== hash && canNavigate()) {

            history.replaceState(undefined, undefined, hash);

        }

    }

    /**
     * Remove the given parameters from router.params
     */
    function removeParams(params) {

        let isDifferent;

        params.forEach(param => {

            if (router.params[param] !== undefined) {

                isDifferent = true;

                delete router.params[param];

            }

        });

        return isDifferent;

    }

    const url = {

        /**
         * Remove the provided keys from the URL
         */
        remove(...params) {

            if (removeParams(params)) {

                url.set(router.params, true);

            }

        },

        /**
         * Remove the provided keys from the URL
         * without adding a browser history entry
         */
        removeReplace(...params) {

            if (removeParams(params)) {

                replaceURL();

            }

        },

        /**
         * Add the provided keys to the URL
         */
        merge(params) {

            if (mergeParams(params)) {

                syncURL();

            }

        },

        /**
         * Update the URL to match the given params
         */
        set(params, force) {

            params = normalize(params);

            if (force || paramsAreDifferent(params)) {

                router.params = params;

                syncURL();

            }

        },

        /**
         * Replace the current URL without adding
         * a browser history entry
         */
        replace(params) {

            params = normalize(params);

            if (paramsAreDifferent(params)) {

                router.params = params;

                replaceURL();

            }

        },

        /**
         * Add the given params to the URL without
         * adding a browser history entry
         */
        mergeReplace(params) {

            if (mergeParams(params)) {

                replaceURL();

            }

        }

    };

    const router = {

        params: {},

        url,

        /**
         * Reload the app.
         */
        load() {

            if (router.app && !loadPending && canNavigate()) {

                loadPending = true;

                requestAnimationFrame(() => {

                    loadPending = false;

                    router.app(router.params);

                });

            }

        },

        /**
         * Register the app with the router, and run it.
         */
        init(app) {

            /**
             * Support URLs that use query strings instead of hash fragments.
             */
            if (location.search) {

                location.href = location.href.replace('#', '&').replace('?', '#')

            } else {

                router.app = app;

                window.addEventListener('hashchange', hashchange);

                syncParams();

                router.load();

            }

        },

        /**
         * Remove the provided keys from the URL,
         * and reload the app.
         */
        remove(...params) {

            removeParams(params);

            syncURL();

            router.load();

        },

        /**
         * Remove the provided keys from the URL
         * without adding a browser history entry
         * and reload the app.
         */
        removeReplace(...params) {

            removeParams(params);

            replaceURL();

            router.load();

        },

        /**
         * Add the provided keys to the URL,
         * and reload the app.
         */
        merge(params) {

            mergeParams(params);

            syncURL();

            router.load();

        },

        /**
         * Set the URL to an exact param list,
         * and reload the app
         */
        set(params) {

            router.params = normalize(params);

            syncURL();

            router.load();

        },

        /**
         * Replace the current URL without adding a
         * browser history entry, and reload the app.
         */
        replace(params) {

            router.params = normalize(params);

            replaceURL();

            router.load();

        },

        /**
         * Replace params in the current URL without adding
         * a browser history entry, and reload the app.
         */
        mergeReplace(params) {

            mergeParams(params);

            replaceURL();

            router.load();

        }
    };

    window.uav = window.uav || {};

    window.uav.router = router;

    if (typeof module !== 'undefined' && module.exports) {

        module.exports = router;

    }

})();
