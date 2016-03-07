import {dlRequestAction, dlRequestedAction, dlReceivedAction} from '../actions'


describe('dlRequestAction', () => {
    it('is a thunk', () => {
        expect(typeof dlRequestAction('example.json')).toBe('function');
    });

    it('dispatches REQUESTED and RECEIVED actions', done => {
        const before = {
            endpoints: {
                pop: 'http://example.com/',
            },
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

        dlRequestAction('persons', 'http://example.com/person4.json')
        (dispatch, getState)
        .then(() => {
            expect(dispatch).toHaveBeenCalledWith(dlRequestedAction('persons', 'http://example.com/person4.json'));
            expect(dispatch).toHaveBeenCalledWith(dlReceivedAction('persons', 'http://example.com/person4.json', [payload]));
        })
        .then(done, fail);
    });
});
