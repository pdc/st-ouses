import * as React from 'react';
import * as ReactDom from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import NavPage from './containers/nav-page';
import {optionsAction} from './actions';
import {reducer} from './reducers';

import "./style.less";


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
    <Provider store={store}><NavPage/></Provider>,
    document.getElementById('main'));
