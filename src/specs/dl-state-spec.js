import {initialDlState, getLoadedEntity, withLoadedEntity} from '../dl-state';

describe('getLoadedEntity', () => {
    const entity = {
        href: "person4.json",
        name: "Charley",
        sacks: {
            ids: null,
            href: "person4-sacks.json"
        },
        spouses: {
            ids: [],
            href: "person4-spouses.json"
        },
    };
    const dlState = Object.assign({}, initialDlState, {
        prefix: 'http://example.com/foo/',
        idsByUrl: {
            'person4.json': 13,
        },
        entitiesByID: {
            13: entity,
        }
    });

    it('returns entity by ID', () => {
        expect(getLoadedEntity(dlState, 13)).toEqual(entity);
    });

    it('returns falsy if no entity with ID', () => {
        expect(getLoadedEntity(dlState, 17)).toBeFalsy();
    });

    it('returns entity by Url relative to prefix', () => {
        expect(getLoadedEntity(dlState, 'person4.json')).toEqual(entity);
    });

    it('returns falsy if no entity with Url', () => {
        expect(getLoadedEntity(dlState, 'person9.json')).toBeFalsy();
    });

    it('returns entity by Url including prefix', () => {
        expect(getLoadedEntity(dlState, 'http://example.com/foo/person4.json')).toEqual(entity);
    });
});

describe('withLoadedEntity', () => {
    it('can put with full URL and retrieve with full URL', () => {
        const entity0 = {
            href: "person4.json",
            name: "Charley",
            sacks: {
                href: "person4-sacks.json"
            },
            spouses: {
                items: [],
                href: "person4-spouses.json"
            },
        };
        const before = Object.assign({}, initialDlState, {
            prefix: 'http://example.com/bar/',
            nextID: 14,
        });

        const after = withLoadedEntity(before, 'person', 'http://example.com/bar/person4.json', [entity0]);

        const item = {
            id: 14,
            cls: 'person',
            href: 'person4.json',
            name: 'Charley',
            sacks: {
                href: 'person4-sacks.json',
                id: 15,
            },
            spouses: {
                ids: [],
                href: 'person4-spouses.json',
            },
        };
        expect(getLoadedEntity(after, 'http://example.com/bar/person4.json')).toEqual(item);
        expect(getLoadedEntity(after, 'person4.json')).toEqual(item);
        expect(getLoadedEntity(after, 14)).toEqual(item);
    });

    it('creates stubs entries from links in collection', () => {
        // Intentionally using a different style of URL scheme as well.
        const before = Object.assign({}, initialDlState, {
            prefix: 'http://example.com/r/',
            nextID: 14,
        });

        const entity0 = {
            href: "/r/cats/13/",
            name: "Max",
            aloofness: 6,
            kits: {
                items: [
                    {
                        href: "/r/kits/39/",
                        name: "Molly"
                    }
                ],
                href: "kits/"
            },
            sack: {
                href: "/r/sacks/10",
                cats: {
                    href: "cats/"
                },
                holder: {
                    href: "/r/persons/3",
                    name: "Deepak"
                }
            }
        };
        const after = withLoadedEntity(before, 'cat', 'http://example.com/bar/random', [entity0]);

        const kitID = getLoadedEntity(after, 14).kits.ids[0];
        const kitStub = {
            id: kitID,
            cls: 'kit',
            href: "kits/39/",  // Changed to be relative to prefix
            name: "Molly",
        };
        expect(getLoadedEntity(after, 'http://example.com/r/kits/39/')).toEqual(kitStub);
        expect(getLoadedEntity(after, 'kits/39/')).toEqual(kitStub);
        expect(getLoadedEntity(after, 15)).toEqual(kitStub);
    });

    it('uses same ID for URL seen before', () => {
        const before = Object.assign({}, initialDlState, {
            prefix: 'http://example.com/r/',
            nextID: 14,
            idsByUrl: {'cats/13/': 13},
            entitiesByID: {
                13: {
                    id: 13,
                    href: 'cats/13/',
                    name: 'Max',
                },
            },
        });

        const entity0 = {
            href: "/r/cats/13/",
            name: "Max",
            aloofness: 6,
            kits: {
                items: [
                    {
                        href: "/r/kits/39/",
                        name: "Molly"
                    }
                ],
                href: "kits/"
            },
            sack: {
                href: "/r/sacks/10",
                cats: {
                    href: "cats/"
                },
                holder: {
                    href: "/r/persons/3",
                    name: "Deepak"
                }
            }
        };
        const after = withLoadedEntity(before, 'cat', 'http://example.com/bar/search', [entity0]);

        const cat1 = getLoadedEntity(after, 13);
        expect(cat1.aloofness).toBe(6);
        expect(cat1.kits.ids.length).toBe(1);
        const kitID = cat1.kits.ids[0];
        expect(kitID).toBe(14);
        const kit1 = getLoadedEntity(after, kitID);
        expect(kit1.name).toBe('Molly');
        expect(kit1.cls).toBe('kit');
    });

    it('does not clobber full entity with stub', () => {
        const before = Object.assign({}, initialDlState, {
            prefix: 'http://example.com/',
            nextID: 70,
            idsByUrl: {'kit44.json': 44},
            entitiesByID: {
                44: {
                    "href": "kit44.json",
                    "name": "Charlie",
                    "fluffiness": 6
                },
            },
        });

        const entity0 = {
            "kits": {
                "items": [
                    {
                        "href": "kit44.json",
                        "name": "Charlie"
                    }
                ],
                "href": "cat13-kits.json"
            },
            "aloofness": 6,
            "href": "cat13.json",
            "name": "Max",
            "sack": {
                "cats": {
                    "href": "sack7-cats.json"
                },
                "href": "sack7.json",
                "holder": {
                    "href": "person3.json",
                    "name": "Deepak"
                }
            }
        };
        const after = withLoadedEntity(before, 'cat', 'http://example.com/cat13.json', [entity0]);

        expect(getLoadedEntity(after, 44).fluffiness).toBe(6);
    });

    it('creates stubs for entities as well as collections', () => {
        const before = Object.assign({}, initialDlState, {
            prefix: 'http://example.com/',
        });

        const kit69 = {
            "href": "/kits/69/",
            "name": "Minka",
            "fluffiness": 8,
            "cat": {
                "href": "/cats/15/",
                "name": "Tiger",
                "aloofness": 15,
                "kits": {
                    "href": "cat15-kits.json"
                },
                "sack": {
                    "href": "/sacks/9/"
                }
            },
        };
        const after = withLoadedEntity(before, 'kit', 'http://example.com/kits/69/', [kit69]);

        expect(getLoadedEntity(after, 'cats/15/').name).toBe('Tiger');
    });
});
