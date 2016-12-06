import {
    BACKEND_LOGIN,
    BACKEND_LOGOUT,
    BACKEND_ERROR,
    LIST_UPDATE,
    LIST_REMOVE
} from "../constants/action-types";

import {
    createUserWithEmailAndSignIn,
    signInWithEmail,
    createBoard,
    openBoard,
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

        // dirty hack for board creation/opening
        //setTimeout(function() {
            //createBoard({title:"stuff"})
            //openBoard("-KX_x5LAZaLLVFp1drzg", "default")

            /*
            setTimeout(function() {
                addNode("-KX_x5LAZaLLVFp1drzg", {
                    x: 100,
                    y: 100,
                    title: "persereikä"
                })
            }, 1000)
            */
        //}, 1000)
    };
}

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
        openBoard(boardID, "default"); // TODO: resolve proper session ID
    }
}

export function login(user) {
    return { type: BACKEND_LOGIN, user };
}

export function logout() {
    return { type: BACKEND_LOGOUT };
}

export function error(err) {
    return { type: BACKEND_ERROR, err };
}

export function listUpdate(id, data) {
    return { type: LIST_UPDATE, id, data };
}

export function listRemove(id) {
    return { type: LIST_REMOVE, id };
}