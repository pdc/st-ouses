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

const clsByAttr = {
    holder: 'person',
};


export const initialDlState = {
    nextID: 1,
    idsByUrl: {},
    entitiesByID: {},
};


/**
* Arguments:
*    dlState -- current state
*    idOrUrl -- either a numeric ID or a string that is a URL reference
*/
export function getLoadedEntity(dlState, idOrUrl, depth=0) {
    let id = idOrUrl;
    if (typeof idOrUrl === 'string') {
        let url = unresolveUrl(dlState, idOrUrl);
        id = dlState.idsByUrl[url];
    }
    const entity = dlState.entitiesByID[id];
    let copy = null;
    if (entity && depth > 0) {
        for (const k in entity) {
            if (entity.hasOwnProperty(k)) {
                if (entity[k].id) {
                    if (!copy) {
                        copy = Object.assign({}, entity);
                    }
                    copy[k] = getLoadedEntity(dlState, entity[k].id, depth - 1);
                } else if (entity[k].ids) {
                    if (!copy) {
                        copy = Object.assign({}, entity);
                    }
                    copy[k].items = entity[k].ids.map(id => getLoadedEntity(dlState, id, depth - 1));
                }
            }
        }
    }
    return copy || entity;
}


/**
 * Map collection name to entity class (lowercase).
 *
 * Generally class is singular of collection name.
 * This is only used to record exceptions to that rule.
 */
const clsByCollection = {};

function clsFromCollection(collectionName) {
    return clsByCollection[collectionName] || collectionName.slice(0, collectionName.length - 1);
}

/**
 * Create a new copyof state with this entity loaded.
 * Also updated with any embedded entities.
 */
export function withLoadedEntity(dlState, cls, url, entities) {
    if (entities.length === 0) {
        return dlState;
    }

    // Record changes here. We will apply them at the end.
    const entitiesByID = {};
    let nextID = dlState.nextID;

    // Put one entity & return its ID.
    function put1(cls, url, entities) {
        const ids = [];
        for (const entity of entities) {
            const entityUrl = urlResolve(url, entity.href);
            const entityUrlTrimmed = unresolveUrl(dlState, entityUrl); // relative to prefix

            let id = dlState.idsByUrl[entityUrlTrimmed];
            const isNew = !id;
            if (isNew) {
                dlState.idsByUrl[entityUrlTrimmed] = id = nextID++;
            }

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
                            const colnCls = clsFromCollection(coln);
                            const colnUrl = urlResolve(entityUrl, v.href);
                            if (v.items) {
                                v.ids = put1(colnCls, colnUrl, v.items);
                            }
                            delete v.items;
                        } else if ('href' in v) {
                            // This is a single entity.
                            const vCls = clsByAttr[k] || k;
                            const vUrl = urlResolve(entityUrl, v.href);
                            const [vID] = put1(vCls, vUrl, [v]);
                            v.id = vID
                            v.href =unresolveUrl(dlState, vUrl);
                        }
                    }
                }
            }
            ids.push(id);
            entitiesByID[id] = entity1;
        }
        return ids;
    }

    put1(cls, url, entities);
    return Object.assign({}, dlState, {nextID, entitiesByID});
}


export function unresolveUrl(dlState, url) {
    if (!dlState.prefix) {
        throw Error('Cannot get entities without setting API endpoint URL.')
    }
    if (url.substr(0, dlState.prefix.length) === dlState.prefix) {
        return url.substr(dlState.prefix.length);
    }
    return url;
}

export function resolveHref(dlState, href) {
    if (!dlState.prefix) {
        throw Error('Cannot get entities without setting API endpoint URL.')
    }
    return urlResolve(dlState.prefix, href);
}
