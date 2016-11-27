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
    function updateNode(id, data) {
        store.dispatch(mindmapActions.updateNode(id, data))
    }

    function removeNode(id) {
        store.dispatch(mindmapActions.removeNode(id))
    }

    return {
        login,
        logout,
        error,

        updateNode,
        removeNode
    }
}
