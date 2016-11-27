import {
    UPDATE_BOARD,
    UPDATE_NODE,
    REMOVE_NODE
} from "../constants/action-types"

import * as backendAdapter from "../backend/backend-adapter"

export function updateBoard(id, data) {
    return { type: UPDATE_BOARD, id, data }
}

export function updateNode(id, data) {
    return { type: UPDATE_NODE, id, data }
}

export function removeNode(id) {
    return { type: REMOVE_NODE }
}
