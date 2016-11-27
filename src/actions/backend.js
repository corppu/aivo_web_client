import {
    BACKEND_LOGIN,
    BACKEND_LOGOUT,
    BACKEND_ERROR
} from "../constants/action-types"

import {
    createUserWithEmailAndSignIn,
    signInWithEmail
} from "../backend/backend-adapter"


export function tryCreateUser(email, password) {
    return function() {
        createUserWithEmailAndSignIn(email, password)
    }
}

export function tryLogin(email, password) {
    return function() {
        signInWithEmail(email, password)
    }
}

export function login(user) {
    return { type: BACKEND_LOGIN, user }
}

export function logout() {
    return { type: BACKEND_LOGOUT }
}

export function error(err) {
    return { type: BACKEND_ERROR, err }
}
