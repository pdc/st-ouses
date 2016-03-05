import * as React from 'react';
import {renderIntoDocument} from 'react/lib/ReactTestUtils';
import {Hello} from '../content';

describe('Hello', () => {
    it('can render', () => {
        const hello = renderIntoDocument(<Hello/>);

        expect(hello).toBeTruthy();
    });
});
