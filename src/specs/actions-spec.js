import {dlRequestAction, dlRequestedAction, dlReceivedAction, optionsAction} from '../actions'
import {initialDlState} from '../dl-state';


describe('dlRequestAction', () => {
    it('is a thunk', () => {
        expect(typeof dlRequestAction('person', 'example.json')).toBe('function');
    });

    it('dispatches REQUESTED and RECEIVED actions relative to prefix', done => {
        // Fake enough state for URL resolution to work.
        const before = {
            dl: Object.assign({}, initialDlState, {
                prefix: 'http://example.com/static/',
            }),
        };

        const payload = {
            href: "person4.json",
            name: "Charley",
            sacks: {
                href: "person4-sacks.json"
            },
            spouses: {
                href: "person4-spouses.json"
            }
        };
        spyOn(window, 'fetch')
        .and.returnValue(Promise.resolve({json: () => payload}));
        const dispatch = jasmine.createSpy('dispatch');
        const getState = () => before;

        dlRequestAction('person', 'http://example.com/static/person4.json')
        (dispatch, getState)
        .then(() => {
            expect(window.fetch).toHaveBeenCalledWith('http://example.com/static/person4.json');
            expect(dispatch).toHaveBeenCalledWith(dlRequestedAction('person', 'person4.json'));
            expect(dispatch).toHaveBeenCalledWith(dlReceivedAction('person', 'person4.json', [payload]));
        })
        .then(done, fail);
    });

    it('resulves href relative to prefix', done => {
        // Fake enough state for URL resolution to work.
        const before = {
            dl: Object.assign({}, initialDlState, {
                prefix: 'http://example.com/api/v1/',
            }),
        };

        const payload = {
            href: "persons/4/",
            name: "Charley",
            sacks: {
                href: "sacks/"
            },
            spouses: {
                href: "spouses/"
            }
        };
        spyOn(window, 'fetch')
        .and.returnValue(Promise.resolve({json: () => payload}));
        const dispatch = jasmine.createSpy('dispatch');
        const getState = () => before;

        dlRequestAction('person', 'persons/4/')
        (dispatch, getState)
        .then(() => {
            expect(window.fetch).toHaveBeenCalledWith('http://example.com/api/v1/persons/4/');
            expect(dispatch).toHaveBeenCalledWith(dlRequestedAction('person', 'persons/4/'));
            expect(dispatch).toHaveBeenCalledWith(dlReceivedAction('person', 'persons/4/', [payload]));
        })
        .then(done, fail);
    });
});
