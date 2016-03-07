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
 * collectionName -- specifies type of entity (person, sack, cat, kit)
 * url -- complete or abbreviated URL of entity
 * error -- an Error instance
 * entity -- an instance of collectionName from the server
 * entities -- an array of ditto
 */

/* Dispatched to request info on this entity. */
export function dlRequestAction(collectionName, url) {
    return (dispatch, getState) => {
        dispatch(dlRequestedAction(collectionName, url));
        return fetch(url)
        .then(response => response.json())
        .then(entity => {
            dispatch(dlReceivedAction(collectionName, url, [entity]))
        })
        .catch(error => {
            dispatch(dlErrorActon(collectionName, url, error));
        });
    };
}

/* Dispatched by `request`. */
export function dlRequestedAction(collectionName, url) {
    return {
        type: DL_REQUESTED,
        collectionName,
        url,
    };
}

/* Dispatched by `request`. */
export function dlErrorAction(collectionName, url, error) {
    return {
        type: DL_ERROR,
        collectionName,
        url,
        error,
    }
}

/* Dispatched by `request`. */
export function dlReceivedAction(collectionName, url, entities) {
    return {
        type: DL_RECEIVED,
        collectionName,
        url,
        entities,
    }
}
