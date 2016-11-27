import * as backendActions from "../actions/backend"
import * as mindmapActions from "../actions/mindmap"

export default function(store) {

    // backend actions
    function userSignedIn(data) {
        store.dispatch(backendActions.login(data))
    }

    function userSignedOut() {
        store.dispatch(backendActions.logout())
    }

    function error(err) {
        store.dispatch(backendActions.error(err))
    }

    // mindmap actions
    function updateBoard(id, data) {
		
	}
	
	function updateNode(id, data) {
        store.dispatch(mindmapActions.updateNode(id, data))
    }

    function removeNode(id) {
        store.dispatch(mindmapActions.removeNode(id))
    }
	

    return {
        userSignedIn,
        userSignedOut,
        error,

		updateBoard,
		
        updateNode,
        removeNode
    }
}
