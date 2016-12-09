import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import React, { createClass } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router, Route, IndexRoute, browserHistory } from "react-router";
import { syncHistoryWithStore, routerReducer, routerMiddleware } from "react-router-redux";

import authReducer from "./reducers/auth";
import mindmapReducer from "./reducers/mindmap";

import App from "./containers/app";
import BoardList from "./containers/board-list";
import MindMap from "./containers/mindmap";
import NodeView from "./containers/node-view";

import createStoreAdapter from "./backend/store-adapter";
import { init } from "./backend/backend-adapter";

import { debugAddRandomNode, debugMoveRandomNode } from "./actions/debug";

const store = createStore(
	combineReducers({
        auth: authReducer,
        mindmap: mindmapReducer,
        routing: routerReducer
    }),
    applyMiddleware(
        thunk,
        routerMiddleware(browserHistory)
    )
);

const storeAdapter = createStoreAdapter(store);
init(storeAdapter);

const history = syncHistoryWithStore(browserHistory, store);

render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={App}>
                <IndexRoute component={BoardList}/>
                <Route path="/board/:boardID" component={MindMap}>
                    <Route path="/board/:boardID/:nodeID" component={NodeView}/>
                </Route>
            </Route>
        </Router>
    </Provider>
, document.getElementById("app-root"));

// add some test data
//store.dispatch(debugAddRandomNode("-KX_x5LAZaLLVFp1drzg", 5))

/*
setInterval(() => {
    //store.dispatch(debugMoveRandomNode("-KX_x5LAZaLLVFp1drzg", 2))
	//store.dispatch(debugAddRandomNode("-KX_x5LAZaLLVFp1drzg", 1))

}, 1000)
*/