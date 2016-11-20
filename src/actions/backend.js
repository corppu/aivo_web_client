import {
    BACKEND_INIT,
    BACKEND_ERROR
} from "../constants/action-types"

export function init(state) {
    return { type: BACKEND_INIT, state }
}

export function error(err) {
    return { type: BACKEND_ERROR, err }
}
