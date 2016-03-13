import {unresolveUrl, resolveHref} from './dl-state';


export const OPTIONS = 'OPTIONS';

/**
 * Action dispatched from the topmost app HTML page.
 * Used to pass settings from server env to the JavaScript code.
 */
export function optionsAction(options) {
    return Object.assign({}, options, {type: OPTIONS});
}


export const DL_REQUESTED = 'DL_REQUESTED';
export const DL_ERROR = 'DL_ERROR';
export const DL_RECEIVED = 'DL_RECEIVED';

/**
 * Actions for downloading entities from server.
 *
 * cls -- specifies type of entity (person, sack, cat, kit)
 * url -- complete or abbreviated URL of entity
 * error -- an Error instance
 * entity -- an instance of cls from the server
 * entities -- an array of ditto
 */

/* Dispatched to request info on this entity. */
export function dlRequestAction(cls, href) {
    return (dispatch, getState) => {
        const state = getState();
        const url = resolveHref(state.dl, href);
        const canonicalHref = unresolveUrl(state.dl, url);

        dispatch(dlRequestedAction(cls, canonicalHref));

        return fetch(url)
        .then(response => response.json())
        .then(entity => {
            dispatch(dlReceivedAction(cls, canonicalHref, [entity]))
        })
        .catch(error => {
            dispatch(dlErrorActon(cls, canonicalHref, error));
        });
    };
}

/* Dispatched by `request`. */
export function dlRequestedAction(cls, url) {
    return {type: DL_REQUESTED, cls, url};
}

/* Dispatched by `request`. */
export function dlErrorAction(cls, url, error) {
    return {type: DL_ERROR, cls, url, error};
}

/* Dispatched by `request`. */
export function dlReceivedAction(cls, url, entities) {
    return {type: DL_RECEIVED, cls, url, entities};
}


export const NAV_GOTO = 'NAV_GOTO';

export function navGotoAction(cls, url) {
    return {type: NAV_GOTO, cls, url};
}
