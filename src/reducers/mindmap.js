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
        if (state.get("nodes").size === 0) {
            return state
        }
        for (let i = 0; i < action.count; ++i) {
            const id = findRandomMapKey(state.get("nodes"))
            
            state = state.updateIn(["nodes", id], node =>
                node
                    .set("x", randomPosition())
                    .set("y", randomPosition())
            )
        }
        return state

    case DEBUG_ADD_RANDOM_NODE:
        for (let i = 0; i < action.count; ++i) {
            state = state.setIn(["nodes", generateID()], fromJS({
                title: "foo",
                x: randomPosition(),
                y: randomPosition()
            }))
        }
        return state

    case DEBUG_REMOVE_RANDOM_NODE:
        return state // TODO: implement

    default:
        return state
    }
}

// will crash if map is empty, check it beforehand
// this is also probably slow as fuck but it doesn't matter here 
function findRandomMapKey(map) {
    const index = Math.floor(Math.random() * map.size)
    return Array.from(map.keys())[index]
}

function generateID() {
    return Math.round(Math.random() * 1000 * 1000 * 1000)
}

function randomPosition() {
    return 100 + Math.random() * 800
}
