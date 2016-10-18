import { combineReducers, createStore } from "redux"

import React, { createClass } from "react"
import { render } from "react-dom"
import { Provider } from "react-redux";

import mindmapReducer from "./reducers/mindmap"
import MindMap from "./containers/mindmap"

import { debugAddRandomNode } from "./actions/debug"

const store = createStore(
	combineReducers({
        mindmap: mindmapReducer
    })
);

render(
    <Provider store={store}>
        <MindMap/>
    </Provider>
, document.getElementById("app-root"))

// add some test data
store.dispatch(debugAddRandomNode(5))
