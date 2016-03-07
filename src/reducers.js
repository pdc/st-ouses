import {combineReducers} from 'redux';

import {OPTIONS, DL_REQUESTED, DL_RECEIVED, DL_ERROR} from './actions';
import {withLoadedEntity, initialDlState} from './dl-state';

/**
 * Reducer for dl state.
 */
function dl(state=initialDlState, action) {
    if (!action) {
        return state;
    }
    switch (action.type) {
        case OPTIONS:
            if (action.api && action.api.href) {
                return Object.assign({}, state, {
                    prefix: action.api.href,
                });
            }
            break;
        case DL_RECEIVED:
            const {collectionName, url, entities} = action;
            return withLoadedEntity(state, collectionName, url, entities);
        default:
            // pass
    }
    return state;
}


export const reducer = combineReducers({
    dl,
});
