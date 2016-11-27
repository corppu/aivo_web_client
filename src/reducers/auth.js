import { fromJS } from "immutable"

import {
    BACKEND_LOGIN,
    BACKEND_LOGOUT,
} from "../constants/action-types"

const initialState = fromJS({
    authed: false
})

export default function(state = initialState, action) {
    console.log(action);

    switch (action.type) {
    case BACKEND_LOGIN:
        return state.set("authed", true)

    case BACKEND_LOGOUT:
        return state.set("authed", false)
    
    default:
        return state
    }
}
