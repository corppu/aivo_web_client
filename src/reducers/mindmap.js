import { fromJS } from "immutable"

import {
    DEBUG_MOVE_RANDOM_NODE,
    DEBUG_ADD_RANDOM_NODE,
    DEBUG_REMOVE_RANDOM_NODE
} from "../constants/action-types"

const initialState = fromJS({
    nodes: {}
})

export default function(state = initialState, action) {
    switch (action.type) {
    case DEBUG_MOVE_RANDOM_NODE:
        return state // TODO: implement

    case DEBUG_ADD_RANDOM_NODE:
        for (let i = 0; i < action.count; ++i) {
            state = state.setIn(["nodes", generateID()], fromJS({
                title: "foo",
                x: 100 + Math.random() * 400,
                y: 100 + Math.random() * 400,
            }))
        }
        return state

    case DEBUG_REMOVE_RANDOM_NODE:
        return state // TODO: implement

    default:
        return state
    }
}

function generateID() {
    return Math.round(Math.random() * 1000 * 1000 * 1000)
}
