import { createStore, combineReducers, applyMiddleware } from "redux"
import thunk from "redux-thunk"

import React, { createClass } from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"
import { Router, Route, IndexRedirect, browserHistory } from "react-router"
import { syncHistoryWithStore, routerReducer } from "react-router-redux"

import authReducer from "./reducers/auth"
import mindmapReducer from "./reducers/mindmap"

import App from "./containers/app"
import MindMap from "./containers/mindmap"

import createStoreAdapter from "./backend/store-adapter"
import { init } from "./backend/backend-adapter"

import { debugAddRandomNode, debugMoveRandomNode } from "./actions/debug"

const store = createStore(
	combineReducers({
        auth: authReducer,
        mindmap: mindmapReducer,
        routing: routerReducer
    }),
    applyMiddleware(
        thunk
    )
);

const storeAdapter = createStoreAdapter(store)
init(storeAdapter)

const history = syncHistoryWithStore(browserHistory, store)

render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={App}>
                <IndexRedirect to="/board/-KX_x5LAZaLLVFp1drzg"/>
                <Route path="/board/:boardID" component={MindMap}/>
            </Route>
        </Router>
    </Provider>
, document.getElementById("app-root"))

// add some test data
//store.dispatch(debugAddRandomNode(10))
/*
setInterval(() => {
    store.dispatch(debugMoveRandomNode("-KX_x5LAZaLLVFp1drzg", 2))
}, 1000)
*/
