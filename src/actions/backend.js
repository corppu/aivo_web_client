import {
    BACKEND_LOGIN,
    BACKEND_LOGOUT,
    BACKEND_ERROR,
    LIST_UPDATE,
    LIST_REMOVE,
    REMOVE_BOARD,
} from "../constants/action-types";

import {
    createUserWithEmailAndSignIn,
    signInWithEmail,
    createHomeBoard,
    openBoard,
    removeBoard,
    closeBoard,
    addNode
} from "../backend/backend-adapter";

export function tryCreateUser(email, password) {
    return function() {
        createUserWithEmailAndSignIn(email, password);
    };
}

export function tryLogin(email, password) {
    return function() {
        signInWithEmail(email, password);
    };
}

export function tryCreateBoard(title) {
    return function() {
        createHomeBoard();
    }
}

export function tryRemoveBoard(boardId) {
    return function(dispatch) {
	    removeBoard(boardId);

        dispatch(listRemove(boardId));
    }
}

let currentSessionId = null;
export function tryOpenBoard(boardID) {
    return function(dispatch, getState) {
        const { mindmap } = getState();
        
        const currBoardID = mindmap.get("boardID");
        if (boardID === currBoardID) {
            return;
        }
        if (currBoardID) {
            closeBoard(currBoardID);
        }
        openBoard(boardID, currentSessionId);
    }
}

export function login(user) {
	currentSessionId = user.sessionId;
    return { type: BACKEND_LOGIN, user };
}

export function logout() {
    return { type: BACKEND_LOGOUT };
}

export function error(err) {
    return { type: BACKEND_ERROR, err };
}

export function listUpdate(data) {
    return { type: LIST_UPDATE, data };
}

export function listRemove(boardId) {
    return { type: LIST_REMOVE, boardId };
}