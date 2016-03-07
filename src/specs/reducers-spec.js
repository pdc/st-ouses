import {reducer} from '../reducers';
import {dlReceivedAction, optionsAction} from '../actions';
import {getLoadedEntity} from '../dl-state';


describe('dl [reducer]', () => {
    let before;

    beforeEach(() => {
        before = reducer(reducer(), optionsAction({
            api: {
                href: 'http://example.com/',
            }
        }));
    });

    it('got prefix from options', () => {
        expect(before.dl.prefix).toEqual('http://example.com/');
    });

    it('passes received entities to dl state', () => {
        const entity = {
            href: "kit77.json",
            name: "Muschi",
            fluffiness: 6,
            cat: {
                href: "cat11.json",
                aloofness: 11,
                name: "Lucky",
                sack: {
                    href: "sack10.json"
                },
                kits: {
                    href: "cat11-kits.json"
                },
            },
        };
        const after = reducer(before, dlReceivedAction('kits', 'http://example.com/kit77.json', [entity]));

        expect(getLoadedEntity(after.dl, 'kits', 'kit77.json').name).toBe('Muschi');
    });
});
