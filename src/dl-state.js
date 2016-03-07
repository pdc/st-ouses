import {resolve as urlResolve} from 'url';

/**
 * Map attributes on to the generic term for a collection of that type.
 *
 * Mostly a collection of cats will be held in a
 * variable named `cats`. This definition only includes
 * exceptions to this rule (mostly for persons).
 */
const collectionByAttr = {
    spouses: 'persons',
};


export const initialDlState = {
    nextID: 1,
    idsByUrl: {},
};


/**
* Arguments:
*    dlState --
*    collection -- collection name (e.g., `cats`)
*    idOrUrl -- either a numeric ID or a string tat is a URL reference
*/
export function getLoadedEntity(dlState, collectionName, idOrUrl) {
    let id = idOrUrl;
    if (typeof idOrUrl === 'string') {
        let url = trimmedUrl(dlState, idOrUrl);
        id = dlState.idsByUrl[url];
    }
    return dlState[collectionName].byID[id];
}


/**
 * Create a new copyof state with this entity loaded.
 * Also updated with any embedded entities.
 */
export function withLoadedEntity(dlState, collectionName, url, entities) {
    const updatedCollections = {};
    let nextID = dlState.nextID;

    // Put one entity & return its ID.
    function put1(collectionName, url, entities) {
        const ids = [];
        const byID = {};
        for (const entity of entities) {
            const entityUrl = urlResolve(url, entity.href);
            const entityUrlTrimmed = trimmedUrl(dlState, entityUrl); // relative to prefix
            const id = nextID++;
            dlState.idsByUrl[entityUrlTrimmed] = id;

            const entity1 = Object.assign({id}, entity, {href: entityUrlTrimmed});
            for (const k in entity1) {
                if (entity1.hasOwnProperty(k)) {
                    const v = entity1[k];
                    if (typeof v === 'object' && 'items' in v) {
                        // This is a collection.
                        const coln = collectionByAttr[k] || k;
                        const colnUrl = urlResolve(entityUrl, v.href);
                        if (v.items) {
                            v.ids = put1(coln, colnUrl, v.items);
                        }
                        delete v.items;
                    }
                }
            }
            ids.push(id);
            byID[id] = entity1;
        }

        let updated = updatedCollections[collectionName]
        if (!updated) {
            const old = dlState[collectionName];
            if (old) {
                updatedCollections[collectionName] = updated = {
                    ids: old.ids.slice(),
                    byID: Object.assign({}, old.byID),
                };
            } else {
                updatedCollections[collectionName] = updated = {ids: [], byID: {}};
            }
        }
        updated.ids = updated.ids.concat(ids);
        Object.assign(updated.byID, byID);
        return ids;
    }

    put1(collectionName, url, entities);
    return Object.assign({}, dlState, updatedCollections, {nextID});
}


function trimmedUrl(dlState, url) {
    if (!dlState.prefix) {
        throw Error('Cannot get entities without setting API endpoint URL.')
    }
    if (url.substr(0, dlState.prefix.length) === dlState.prefix) {
        return url.substr(dlState.prefix.length);
    }
    return url;
}
