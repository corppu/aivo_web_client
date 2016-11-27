import { fromJS } from "immutable"

import {
    UPDATE_BOARD,
    UPDATE_NODE,
    REMOVE_NODE
} from "../constants/action-types"

const initialState = fromJS({
    nodes: {}
})

export default function(state = initialState, action) {
    switch (action.type) {
    case UPDATE_BOARD:
    {
        const { id, data } = action;

        console.log(id, data);        
    }
    case UPDATE_NODE:
    {
        const { id, data } = action;

        return state.updateIn(["nodes", id], node => {
            const immutableData = fromJS(data)

            return node ? node.merge(immutableData) : immutableData
        })
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
