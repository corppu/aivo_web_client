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
		store.dispatch(mindmapActions.updateBoard(id, data))
	}
	
	function updateNode(id, data) {
        store.dispatch(mindmapActions.updateNode(id, data))
    }

    function removeNode(id) {
        store.dispatch(mindmapActions.removeNode(id))
    }

	// list actions
	function updateListItem(id, data) {
		store.dispatch(backendActions.listUpdate(id, data));
	}
	
	function removeListItem(id) {
		store.dispatch(backendActions.listRemove(id));
	}
	
    return {
        userSignedIn,
        userSignedOut,
        error,

		updateBoard,
		
        updateNode,
        removeNode,
		
		updateListItem,
		removeListItem
    }
}
