import {reducer} from '../reducers';
import {dlRequestedAction, dlReceivedAction, optionsAction, navGotoAction} from '../actions';
import {getLoadedEntity} from '../dl-state';
import {initialNavState, UNKNOWN, LOADING, OK} from '../nav-state';


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
        const after = reducer(before, dlReceivedAction('kit', 'http://example.com/kit77.json', [entity]));

        const e = getLoadedEntity(after.dl, 'kit77.json');
        expect(e.name).toBe('Muschi');
        expect(e.cls).toBe('kit');
    });
});

describe('nav [reducer]', () => {
    let before;  // holds state before action

    beforeEach(() => {
        before = reducer(reducer(), optionsAction({
            api: {
                href: 'http://example.com/',
            }
        }));
    });

    it('sets entityUrl after GOTO', () => {
        const after = reducer(before, navGotoAction('person', 'person34/'));

        expect(after.nav.entity.href).toBe('person34/');
        expect(after.nav.entity.cls).toBe('person');
        expect(after.nav.loadingStatus).toBe(UNKNOWN);
    });

    it('sets loadingStatus to LOADING when REQUESTED', () => {
        before = reducer(before, navGotoAction('person', 'persons/34/'));

        const after = reducer(before, dlRequestedAction('person', 'persons/34/'));

        expect(after.nav.loadingStatus).toBe(LOADING);
    });

    it('doesn’t set loadingStatus when REQUESTED wth different URL', () => {
        before = reducer(before, navGotoAction('person', 'persons/34/'));

        const after = reducer(before, dlRequestedAction('person', 'cats/69/'));

        expect(after.nav.loadingStatus).toBe(UNKNOWN);
    });

    it('sets loadingStatus to OK when RECEIVED', () => {
        before = reducer(before, navGotoAction('person', 'persons/34/'));

        const after = reducer(before, dlReceivedAction('person', 'persons/34/', []));

        expect(after.nav.loadingStatus).toBe(OK);
    });
});
