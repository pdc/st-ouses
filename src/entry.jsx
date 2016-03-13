import * as React from 'react';
import * as ReactDom from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import BrowserPage from './containers/browser-page';
import {optionsAction} from './actions';
import {reducer} from './reducers';

import "./style.css";


// Create the store.

const loggerMiddleware = createLogger();
const store = createStore(reducer,
    applyMiddleware(thunkMiddleware, loggerMiddleware));

store.dispatch(optionsAction({
    api: {
        href: '/fake/',
    },
}));


// Render the app.

ReactDom.render(
    <Provider store={store}><BrowserPage/></Provider>,
    document.getElementById('main'));
