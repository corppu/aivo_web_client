import { createStore, combineReducers, applyMiddleware } from "redux"
import thunk from "redux-thunk"

import React, { createClass } from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"

import mindmapReducer from "./reducers/mindmap"
import MindMap from "./containers/mindmap"

import createStoreAdapter from "./backend/store-adapter"

import { debugAddRandomNode, debugMoveRandomNode } from "./actions/debug"

const store = createStore(
	combineReducers({
        mindmap: mindmapReducer
    }),
    applyMiddleware(
        thunk
    )
);

render(
    <Provider store={store}>
        <MindMap/>
    </Provider>
, document.getElementById("app-root"))

const adapter = createStoreAdapter;



// add some test data
/*
store.dispatch(debugAddRandomNode(100))
setInterval(() => {
    store.dispatch(debugMoveRandomNode(20))
}, 3000)
*/
