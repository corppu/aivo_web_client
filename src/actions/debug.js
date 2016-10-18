import {
    DEBUG_MOVE_RANDOM_NODE,
    DEBUG_ADD_RANDOM_NODE,
    DEBUG_REMOVE_RANDOM_NODE
} from "../constants/action-types"

export function debugMoveRandomNode(count = 1) {
    return { type: DEBUG_MOVE_RANDOM_NODE, count }
}

export function debugAddRandomNode(count = 1) {
    return { type: DEBUG_ADD_RANDOM_NODE, count }
}

export function debugRemoveRandomNode(count = 1) {
    return { type: DEBUG_REMOVE_RANDOM_NODE, count }
}
