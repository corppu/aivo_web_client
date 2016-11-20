import {
    MOVE_NODE,
    ADD_NODE,
    REMOVE_NODE,
    
    REQUEST_ADD_NODE,
} from "../constants/action-types"

let staticBackendAdapter = null;

export function backendMiddleware(store, action) {
    switch (action.type) {
        case MOVE_NODE:
        {
            const { id, x, y } = action
            backendAdapter.moveNode(id, x, y)
        }
        case REMOVE_NODE:
        {
            const { id } = action
            backendAdapter.removeNode(id)
        }
        case REQUEST_ADD_NODE:
        {
            const { x, y, id } = action
            backendAdapter.addNode(x, y, id)
        }
        default:
            store.dispatch(action)
    }
}

export default function setBackendAdapter(backendAdapter) {
    staticBackendAdapter = backendAdapter;
}
