import {
    UPDATE_BOARD,
    UPDATE_NODE,
    REMOVE_NODE
} from "../constants/action-types"

import * as backendAdapter from "../backend/backend-adapter"

export function tryAddNode(data) {
    return function (dispatch, getState) {
        const { mindmap } = getState()

        const boardID = mindmap.get("boardID")
        if (!boardID) {
            return
        }
        backendAdapter.addNode(boardID, data)
    }
}

export function tryUpdateNode(id, data) {
    return function (dispatch, getState) {
        const { mindmap } = getState()

        const boardID = mindmap.get("boardID")
        if (!boardID) {
            return
        }
        backendAdapter.updateNode(boardID, id, data)
    }
}

export function tryRemoveNode(id) {
    return function (dispatch, getState) {
        const { mindmap } = getState()

        const boardID = mindmap.get("boardID")
        if (!boardID) {
            return
        }
        backendAdapter.removeNode(boardID, id)
    }
}

export function updateBoard(id, data) {
    return { type: UPDATE_BOARD, id, data }
}

export function updateNode(id, data) {
    return { type: UPDATE_NODE, id, data }
}

export function removeNode(id) {
    return { type: REMOVE_NODE, id }
}
