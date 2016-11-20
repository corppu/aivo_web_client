import {
    BACKEND_LOGIN,
    BACKEND_LOGOUT,
    BACKEND_ERROR
} from "../constants/action-types"

export function login() {
    return { type: BACKEND_LOGIN }
}

export function logout() {
    return { type: BACKEND_LOGOUT }
}

export function error(err) {
    return { type: BACKEND_ERROR, err }
}
