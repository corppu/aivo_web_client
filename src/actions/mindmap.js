import {
    UPDATE_BOARD,
	REMOVE_BOARD,
	UPDATE_OBJECT,
	REMOVE_OBJECT
} from "../constants/action-types";

import * as backendAdapter from "../backend/backend-adapter";


export function tryCreateObject(
	object,
	parent = null
) {
	return function ( dispatch, getState ) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.createObject( boardID, object, parent );
    };
}


export function tryRemoveObject(
	object,
	lineMap
) {
	return function ( dispatch, getState ) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.removeObject(boardID, object, lineMap);
    };
}

export function tryMoveObject(
	object
) {
	return function ( dispatch, getState ) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
        backendAdapter.moveObject(boardID, object);
    };
}

export function tryUpdateObject(
	object
) {
	return function ( dispatch, getState ) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        
		if (!boardID) {
            return;
        }
		
        backendAdapter.updateObject( object );
    };
}

export function updateBoard( data ) {
    return { type: UPDATE_BOARD, data };
}

export function updateObject( data ) {
    return { type: UPDATE_OBJECT, data };
}

export function removeObject( data ) {
    return { type: REMOVE_OBJECT, data };
}

