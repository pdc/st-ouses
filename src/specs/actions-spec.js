import {bootAction, dlActions} from '../actions'

describe('dlActions.request', () => {

    it('is a thunk', () => {
        expect(typeof dlActions.request('example.json')).toBe('function');
    });

    it('dispatches REQUESTED and RECEIVED actions', done => {
        const before = {
            endpoints: {
                pop: 'http://example.com/',
            },
        };

        const payload = {
            "sacks": {
                "items": [
                    [
                        {
                            "href": "sack5.json"
                        }
                    ]
                ],
                "href": "person4-sacks.json"
            },
            "index": {
                "persons": {
                    "href": "index-persons.json"
                },
                "href": "index.json"
            },
            "spouses": {
                "items": [
                    []
                ],
                "href": "person4-spouses.json"
            },
            "href": "person4.json",
            "name": "Charley"
        };
        spyOn(window, 'fetch')
        .and.returnValue(Promise.resolve({json: () => payload}));
        const dispatch = jasmine.createSpy('displatch');
        const getState = () => before;

        dlActions.request('person', 'http://example.com/person4.json')
        (dispatch, getState)
        .then(() => {
            expect(dispatch).toHaveBeenCalledWith(dlActions.requested('person', 'http://example.com/person4.json'));
            expect(dispatch).toHaveBeenCalledWith(dlActions.received('person', [payload]));
        })
        .then(done, fail);
    });
});
