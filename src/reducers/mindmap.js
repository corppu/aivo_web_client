import { fromJS } from "immutable"

import {
    MOVE_NODE,
    ADD_NODE,
    REMOVE_NODE
} from "../constants/action-types"

const initialState = fromJS({
    nodes: {}
})

export default function(state = initialState, action) {
    switch (action.type) {
    case MOVE_NODE:
    {
        const { id, x, y } = action

        return state.updateIn(["nodes", id], node =>
            node
                .set("x", x)
                .set("y", y)
        )
    }
    case ADD_NODE:
    {   
        const { id, x, y } = action

        return state = state.setIn(["nodes", id], fromJS({
            title: "test", x, y
        }))
    }
    case REMOVE_NODE:
    {
        const { id } = action

        return state.deleteIn(["nodes", id])
    }
    default:
        return state
    }
}
