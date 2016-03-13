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
    holders: 'persons',  // when following a `holder` link
};


/**
 * Map collection name to entity class (lowercase).
 *
 * Generally class is singular of collection name.
 * This is only used to record exceptions to that rule.
 */
const clsByCollection = {}


export const initialDlState = {
    nextID: 1,
    idsByUrl: {},
    entitiesByID: {},
};


/**
* Arguments:
*    dlState --
*    collection -- collection name (e.g., `cats`)
*    idOrUrl -- either a numeric ID or a string that is a URL reference
*/
export function getLoadedEntity(dlState, collectionName, idOrUrl) {
    let id = idOrUrl;
    if (typeof idOrUrl === 'string') {
        let url = trimmedUrl(dlState, idOrUrl);
        id = dlState.idsByUrl[url];
    }
    return dlState.entitiesByID[id];
}


/**
 * Create a new copyof state with this entity loaded.
 * Also updated with any embedded entities.
 */
export function withLoadedEntity(dlState, collectionName, url, entities) {
    if (entities.length === 0) {
        return;
    }

    // Record changes here. We will apply them at the end.
    const entitiesByID = {};
    let nextID = dlState.nextID;

    // Put one entity & return its ID.
    function put1(collectionName, url, entities) {
        const ids = [];
        for (const entity of entities) {
            const entityUrl = urlResolve(url, entity.href);
            const entityUrlTrimmed = trimmedUrl(dlState, entityUrl); // relative to prefix

            let id = dlState.idsByUrl[entityUrlTrimmed];
            const isNew = !id;
            if (isNew) {
                dlState.idsByUrl[entityUrlTrimmed] = id = nextID++;
            }

            const cls = clsByCollection[collectionName] || collectionName.slice(0, collectionName.length - 1);
            const entity1 = Object.assign(
                {id, cls},
                dlState.entitiesByID[id],
                entitiesByID[id],
                entity,
                {href: entityUrlTrimmed}
            );
            for (const k in entity) {
                if (entity.hasOwnProperty(k)) {
                    const v = entity[k];
                    if (typeof v === 'object') {
                        if ('items' in v) {
                            // This is a collection.
                            const coln = collectionByAttr[k] || k;
                            const colnUrl = urlResolve(entityUrl, v.href);
                            if (v.items) {
                                v.ids = put1(coln, colnUrl, v.items);
                            }
                            delete v.items;
                        } else if ('href' in v) {
                            // This is a single entity.
                            const kplural = k + 's';
                            const coln = collectionByAttr[kplural] || kplural;
                            const vUrl = urlResolve(entityUrl, v.href);
                            const [vID] = put1(coln, vUrl, [v]);
                            v.id = vID
                            v.href =trimmedUrl(dlState, vUrl);
                        }
                    }
                }
            }
            ids.push(id);
            entitiesByID[id] = entity1;
        }
        return ids;
    }

    put1(collectionName, url, entities);
    return Object.assign({}, dlState, {nextID, entitiesByID});
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
