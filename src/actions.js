const PERSONS_RECEIVED = 'PERSONS_RECEIVED';

/**
 * Actions for downloading entities from server.
 *
 * cls -- specifies type of entity (person, sack, cat, kit)
 * url -- complete or abbreviated URL of entity
 * error -- an Error instance
 * entity -- an instance of cls from the server
 * entities -- an array of ditto
 */
export const dlActions = {
    /* Dispatched to request info on this entity. */
    request(cls, url) {
        return (dispatch, getState) => {
            dispatch(dlActions.requested(cls, url));
            return fetch(url)
            .then(response => response.json())
            .then(entity => {
                dispatch(dlActions.received(cls, [entity]))
            })
            .catch(error => {
                dispatch(dlActions.error(cls, url, error));
            });
        };
    },

    /* Dispatched by `request`. */
    requested(cls, url) {
        return {
            type: 'DL_REQUESTED',
            cls,
            url,
        };
    },

    /* Dispatched by `request`. */
    error(cls, url, error) {
        return {
            type: 'DL_ERROR',
            cls,
            url,
            error,
        }
    },

    /* Dispatched by `request`. */
    received(cls, entities) {
        return {
            type: 'DL_RECEIVED',
            cls,
            entities,
        }
    },
}
