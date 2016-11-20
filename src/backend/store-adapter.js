import * as backendActions from "../actions/backend"
import * as mindmapActions from "../actions/mindmap"

export default function(store) {

    function init(state) {
        store.dispatch(backendActions.init(state))
    }

    function moveNode(id, x, y) {
        store.dispatch(mindmapActions.moveNode(id, x, y))
    }

    function addNode(id, x, y) {
        store.dispatch(mindmapActions.addNode(id, x, y))
    }

    function removeNode(id) {
        store.dispatch(mindmapActions.removeNode(id))
    }

    function error(err) {
        store.dispatch(backendActions.error(err))
    }

    return {
        init,
        moveNode,
        addNode,
        removeNode,
        error
    }
}
