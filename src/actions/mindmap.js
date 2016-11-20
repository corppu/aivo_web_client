import {
    MOVE_NODE,
    ADD_NODE,
    REMOVE_NODE,
    
    REQUEST_ADD_NODE,
} from "../constants/action-types"

export function moveNode(id, x, y) {
    return { type: MOVE_NODE, id, x, y }
}

export function tryAddNode(x, y) {
    return { type: REQUEST_ADD_NODE, x, y }
}

export function addNode(id, x, y) {
    return { type: ADD_NODE, id, x, y }
}

export function removeNode(id) {
    return { type: REMOVE_NODE }
}
