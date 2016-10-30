import {
    MOVE_NODE,
    ADD_NODE,
    REMOVE_NODE
} from "../constants/action-types"

export function modeNode(id, x, y) {
    return { type: MOVE_NODE, id, x, y }
}

export function addNode(x, y) {
    return { type: ADD_NODE, x, y }
}

export function removeNode(id) {
    return { type: REMOVE_NODE }
}
