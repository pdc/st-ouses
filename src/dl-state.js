
class Entity {
    constructor(id, url, raw, dlState) {
        this.id = id;
        this.url = url;
        Object.assign(this, raw);
    }

    /** USed during construction to convert collections */
    _clarifyCollection(attr, collection, dlState) {
        if (!collection) {
            collection = attr;
        }
        if (this[attr].items) {
            this[attr].ids = this[attr].items.map(x => getUrlID(dlState, this.href, x.href));
            delete this[attr].items;
        }
    }
}

class Person extends Entity {
    constructor(id, url, raw, dlState) {
        super(id, url, raw, dlState);
        this._clarifyCollection('spouses', 'persons');
        this._clarifyCollection('sacks');
    }
}

const classesByCls = {
    person: Person,
}

const collectionByCls = {
    person: 'persons',
}

const collectionByAttr = {
    spouses: 'persons',
}

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
export function withLoadedEntity(dlState, collectionName, url, entity) {
    const updatedCollections = {};
    let nextID = dlState.nextID;

    // Put one entity & return its ID.
    function put1(collectionName, url, entity) {
        const id = nextID++;
        dlState.idsByUrl[trimmedUrl(dlState, url)] = id;

        const entity1 = Object.assign({id}, entity);
        for (const k in entity1) {
            if (entity1.hasOwnProperty(k)) {
                const v = entity1[k];
                if (typeof v === 'object' && 'items' in v) {
                    // This is a collection.
                    const coln = collectionByAttr[k] || k;
                    const u = v.href;
                    if (v.items) {
                        v.ids = v.items.map(x => put1(coln, x.href, x));
                    }
                    delete v.items;
                }
            }
        }
        if (!updatedCollections[collectionName]) {
            const old = dlState[collectionName];
            if (old) {
                updatedCollections[collectionName] = {
                    ids: [...old.ids],
                    byID: Object.assign({}, old.byID),
                };
            } else {
                updatedCollections[collectionName] = {ids: [], byID: {}};
            }
        }
        const updated = updatedCollections[collectionName];
        updated.ids.push(id);
        updated.byID[id] = entity1;
        return id;
    }

    put1(collectionName, url, entity);
    return Object.assign({}, dlState, updatedCollections, {nextID});
}

function trimmedUrl(dlState, url) {
    if (url.substr(0, dlState.prefix.length) === dlState.prefix) {
        return url.substr(dlState.prefix.length);
    }
    return url;
}
