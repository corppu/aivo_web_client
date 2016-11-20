import {
    MOVE_NODE,
    ADD_NODE,
    REMOVE_NODE,
    
    REQUEST_ADD_NODE,
} from "../constants/action-types"

let staticBackendAdapter = null;

export function createBackendMiddleware({ dispatch }) {
    console.log("C")

    return next => {
        return action => {
            console.log(action)

            if (staticBackendAdapter) {
                switch (action.type) {
                    case MOVE_NODE:
                    {
                        const { id, x, y } = action
                        staticBackendAdapter.moveNode(id, x, y)
                    }
                    case REMOVE_NODE:
                    {
                        const { id } = action
                        staticBackendAdapter.removeNode(id)
                    }
                    case REQUEST_ADD_NODE:
                    {
                        const { x, y, id } = action
                        staticBackendAdapter.addNode(x, y, id)
                    }
                }
            }
            return next(action)
        }
    }
}

export function setBackendAdapter(backendAdapter) {
    staticBackendAdapter = backendAdapter;
}
