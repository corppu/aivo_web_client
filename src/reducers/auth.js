import { fromJS } from "immutable"

const initialState = fromJS({
    authed: false
})

export default function(state = initialState, action) {
    switch (action.type) {
        default:
            return state
    }
}
