import {
    UPDATE_BOARD,
    UPDATE_NODE,
	UPDATE_LINE,
	UPDATE_PIN,
    REMOVE_NODE,
	REMOVE_LINE,
	REMOVE_PIN
} from "../constants/action-types";

import * as backendAdapter from "../backend/backend-adapter";

export function tryAddNode(data) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.addNode(boardID, data);
    }
}

export function tryAddLine(data) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.addLine(boardID, data);
    }
}

export function tryAddPin(data) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.addPin(boardID, data);
    }
}

export function tryUpdateNode(id, data) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.updateNode(boardID, id, data);
    }
}

export function tryUpdateLine(id, data) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.updateLine(boardID, id, data);
    }
}

export function tryUpdatePin(id, data) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.updatePin(boardID, id, data);
    }
}

export function tryRemoveNode(id) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.removeNode(boardID, id);
    }
}

export function tryRemoveLine(id) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.removeLine(boardID, id);
    }
}

export function tryRemovePin(id) {
    return function (dispatch, getState) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.removePin(boardID, id);
    }
}

export function updateBoard(id, data) {
    return { type: UPDATE_BOARD, id, data };
}

export function updateNode(id, data) {
    return { type: UPDATE_NODE, id, data };
}

export function updateLine(id, data) {
	return { type: UPDATE_LINE, id, data };
}

export function updatePin(id, data) {
	return { type: UPDATE_PIN, id, data };
}

export function removeNode(id) {
    return { type: REMOVE_NODE, id };
}

export function removeLine(id) {
	return { type: REMOVE_LINE, id };
}

export function removePin(id) {
	return { type: REMOVE_PIN, id };
}
