import * as backendActions from "../actions/backend"
import * as mindmapActions from "../actions/mindmap"

export default function(store) {

    // backend actions
    function login() {
        store.dispatch(backendActions.login())
    }

    function logout() {
        store.dispatch(backendActions.logout())
    }

    function error(err) {
        store.dispatch(backendActions.error(err))
    }

    // mindmap actions
    function moveNode(id, x, y) {
        store.dispatch(mindmapActions.moveNode(id, x, y))
    }

    function addNode(id, x, y) {
        store.dispatch(mindmapActions.addNode(id, x, y))
    }

    function removeNode(id) {
        store.dispatch(mindmapActions.removeNode(id))
    }

    return {
        login,
        logout,
        error,

        moveNode,
        addNode,
        removeNode
    }
}
