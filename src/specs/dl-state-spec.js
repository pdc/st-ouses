import {Person,getLoadedEntity, withLoadedEntity} from '../dl-state';

describe('getLoadedEntity', () => {
    const entity = {
        "href": "person4.json",
        "name": "Charley",
        "sacks": {
            ids: null,
            "href": "person4-sacks.json"
        },
        "spouses": {
            ids: [],
            "href": "person4-spouses.json"
        },
    };
    const dlState = {
        prefix: 'http://example.com/foo/',
        idsByUrl: {
            'person4.json': 13,
        },
        persons: {
            ids: [13],
            byID: {
                13: entity,
            }
        }
    };

    it('returns entity by ID', () => {
        expect(getLoadedEntity(dlState, 'persons', 13)).toEqual(entity);
    });

    it('returns falsy if no entity with ID', () => {
        expect(getLoadedEntity(dlState, 'persons', 17)).toBeFalsy();
    });

    it('returns entity by Url relative to prefix', () => {
        expect(getLoadedEntity(dlState, 'persons', 'person4.json')).toEqual(entity);
    });

    it('returns falsy if no entity with Url', () => {
        expect(getLoadedEntity(dlState, 'persons', 'person9.json')).toBeFalsy();
    });

    it('returns entity by Url including prefix', () => {
        expect(getLoadedEntity(dlState, 'persons', 'http://example.com/foo/person4.json')).toEqual(entity);
    });
});

describe('putLoadedEntity', () => {
    it('can put with full URL and retrieve with full URL', () => {
        const entity0 = {
            "href": "person4.json",
            "name": "Charley",
            "sacks": {
                "href": "person4-sacks.json"
            },
            "spouses": {
                items: [],
                "href": "person4-spouses.json"
            },
        };
        const before = {
            prefix: 'http://example.com/bar/',
            nextID: 14,
            idsByUrl: {
            },
            persons: {
                ids: [],
                byID: {
                }
            }
        };

        const after = withLoadedEntity(before, 'persons', 'http://example.com/bar/person4.json', entity0);

        const item = {
            id: 14,
            href: 'person4.json',
            name: 'Charley',
            sacks: {
                href: 'person4-sacks.json'
            },
            spouses: {
                ids: [],
                href: 'person4-spouses.json'
            },
        };
        expect(getLoadedEntity(after, 'persons', 'http://example.com/bar/person4.json')).toEqual(item);
        expect(getLoadedEntity(after, 'persons', 'person4.json')).toEqual(item);
        expect(getLoadedEntity(after, 'persons', 14)).toEqual(item);
    });

    it('creates stubs entres from links in collection', () => {
        const entity0 = {
            "href": "cat13.json",
            "name": "Max",
            "aloofness": 6,
            "kits": {
                "items": [
                    {
                        "href": "kit39.json",
                        "name": "Molly"
                    }
                ],
                "href": "cat13-kits.json"
            },
            "sack": {
                "cats": {
                    "href": "sack10-cats.json"
                },
                "href": "sack10.json",
                "holder": {
                    "href": "person3.json",
                    "name": "Deepak"
                }
            }
        };
        const before = {
            prefix: 'http://example.com/bar/',
            nextID: 14,
            idsByUrl: {
            },
            persons: {ids: [], byID: {}},
            sacks: null,
            cats: null,
            kits: null,
        };

        const after = withLoadedEntity(before, 'cats', 'cat13.json', entity0);

        console.log(after);

        const kitID = getLoadedEntity(after, 'cats', 14).kits.ids[0];
        const kitStub = {
            "href": "kit39.json",
            "name": "Molly",
            id: kitID
        };
        expect(getLoadedEntity(after, 'kits', 'http://example.com/bar/kit39.json')).toEqual(kitStub);
        expect(getLoadedEntity(after, 'kits', 'kit39.json')).toEqual(kitStub);
        expect(getLoadedEntity(after, 'kits', 15)).toEqual(kitStub);
    });
});
