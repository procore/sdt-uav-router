# uav-router

`uav-router` is a simple routing solution for single page apps. It was designed to complement [uav](https://uav.js.org), but can work just as well with any view library.

Unlike many routers, `uav-router` uses the hash fragment of the URL as a key-value store to instantiate your app state, doing away with the faux directory hierarchy implemented by most routing solutions. For example, if a traditional URL looks like `website.com/users/userId`, then `uav-router` would use `website.com#user=userId`.

By definition all single page apps serve the same file regardless of the URL. Reflecting this reality in application routing leads to nontrivial complexity savings.

## Example

```javascript
import router from 'uav-router';
import login from './components/login';
import userProfile from './components/profile';
import homepage from './components/homepage';

/**
 * This is the entry point to the application. 
 * When the URL changes, this function will be called
 * with the new URL parameters.
 */
function app(params) {

    /**
     * Here we can use any arbitrary logic to render
     * a view based on the current URL parameters,
     * or other state information.
     */
    if (!document.cookie) {

        login();

    } else if (params.user) {

        userProfile(params.user);

    } else {

        homepage(params);

    }

}

/**
 * Register the entry point with the router,
 * and perform the first render.
 */
router.init(app);

```

`uav-router` can also be accessed at `window.uav.router`.

## Reading the URL

You can access the current URL parameters at `router.params`.

## Navigation

`uav-router` provides five methods for changing the URL. When a method is called on the `router` object, it will change the URL *and* re-render the UI. When a method is called on the `router.url` object, it will only change the URL, *without* rendering the UI.

### `set(params)`

`router.set(params)`

Update the URL to match the given params, *and* re-render the app.

`router.url.set(params)`

Update the URL to match the given params, *without* re-rendering the app.

### `merge(params)`

`router.merge(params)`

Merge the given params into the current URL, *and* re-render the app.

`router.url.merge(params)`

Merge the given params into the current URL, *without* re-rendering the app.

### `remove(params)`

`router.remove(params)`

Remove the given params from the current URL, *and* re-render the app.

`router.url.remove(params)`

Remove the given params from the current URL, *without* re-rendering the app.

### `replace(params)`

`router.replace(params)`

Replace the current URL without adding a browser history entry, *and* re-render the app.

`router.url.replace(params)`

Replace the current URL without adding a browser history entry, *without* re-rendering the app.

### `mergeReplace(params)`

`router.mergeReplace(params)`

Merge the given params into the current URL without adding a browser history entry, *and* re-render the app.

`router.url.mergeReplace(params)`

Merge the given params into the current URL without adding a browser history entry, *without* re-rendering the app.

---

All of the above methods accept either an object or a serialized string. For example:

```javascript
router.set({
    view: 'details',
    itemId: '123'
});
```

is equivalent to:

```javascript
router.set('view=details&itemId=123');
```
