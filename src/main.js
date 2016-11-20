import { createStore, combineReducers, applyMiddleware } from "redux"
import thunk from "redux-thunk"

import React, { createClass } from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"

import mindmapReducer from "./reducers/mindmap"
import MindMap from "./containers/mindmap"

import createStoreAdapter from "./backend/store-adapter"
import { init } from "./backend/backend-adapter"

import { debugAddRandomNode, debugMoveRandomNode } from "./actions/debug"

const store = createStore(
	combineReducers({
        mindmap: mindmapReducer
    }),
    applyMiddleware(
        thunk
    )
);

const storeAdapter = createStoreAdapter(store)
init(storeAdapter)

render(
    <Provider store={store}>
        <MindMap/>
    </Provider>
, document.getElementById("app-root"))

// add some test data
store.dispatch(debugAddRandomNode(10))
setInterval(() => {
    store.dispatch(debugMoveRandomNode(2))
}, 3000)
