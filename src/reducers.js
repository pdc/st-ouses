import {combineReducers} from 'redux';

import {OPTIONS, DL_REQUESTED, DL_RECEIVED, DL_ERROR, NAV_GOTO} from './actions';
import {withLoadedEntity, initialDlState} from './dl-state';
import {initialNavState, UNKNOWN, LOADING, OK, ERROR} from './nav-state';

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
            const {cls, url, entities} = action;
            return withLoadedEntity(state, cls, url, entities);
        default:
            // Pass
    }
    return state;
}


function nav(state=initialNavState, action) {
    if (!action) {
        return state;
    }
    switch (action.type) {
        case NAV_GOTO:
            return Object.assign({}, state, {
                entity: {href: action.url, cls: action.cls},
                loadingStatus: UNKNOWN,
            });
        case DL_REQUESTED:
            if (state.entity && action.url === state.entity.href) {
                return Object.assign({}, state, {
                    loadingStatus: LOADING,
                });
            }
            break;
        case DL_RECEIVED:
            if (state.entity && action.url === state.entity.href) {
                return Object.assign({}, state, {
                    loadingStatus: OK,
                });
            }
            break;
        default:
            // pass
    }
    return state;
}


export const reducer = combineReducers({
    dl,
    nav,
});
