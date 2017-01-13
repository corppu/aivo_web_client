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
		if(data.lines) console.log(data.lines);
		var lines = {keyVal: "valVal"};
        store.dispatch(mindmapActions.updateNode(id, data))
    }

    function removeNode(id) {
        store.dispatch(mindmapActions.removeNode(id))
    }

	function updateLine(id, data) {
        store.dispatch(mindmapActions.updateLine(id, data))
    }

    function removeLine(id) {
        store.dispatch(mindmapActions.removeLine(id))
    }
	
	function updatePin(id, data) {
        store.dispatch(mindmapActions.updatePin(id, data))
    }

    function removePin(id) {
        store.dispatch(mindmapActions.removePin(id))
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
		
		updateLine,
		removeLine,

		updatePin,
		removePin,		
	
		updateListItem,
		removeListItem
    }
}
