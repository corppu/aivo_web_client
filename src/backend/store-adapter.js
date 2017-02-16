import * as backendActions from "../actions/backend";
import * as mindmapActions from "../actions/mindmap";

export default function( store ) {

    // backend actions
    function userSignedIn( data ) {
        store.dispatch( backendActions.login( data ) );
    }

    function userSignedOut() {
        store.dispatch( backendActions.logout() );
    }

    function error( err ) {
        store.dispatch( backendActions.error( err ) );
    }

    // mindmap actions
	function initBoard( data ) {
		store.dispatch( mindmapActions.initBoard( data ) );
	}
	
	function updateBoard( data ) {
		store.dispatch( mindmapActions.updateBoard( data ) );
	}
	
	function updateObject( data ) {
        store.dispatch( mindmapActions.updateObject( data ) );
    }

    function removeObject( data ) {
        store.dispatch( mindmapActions.removeObject( data ) );
    }
	
	function removeObjects( removables, copiesForUpdate ) {
		store.dispatch( mindmapActions.removeObjects( removables, copiesForUpdate ) );
	}
	
	// list actions
	function updateListItem( data ) {
		store.dispatch( backendActions.listUpdate( data ) );
	}
	
	function removeListItem( data ) {
		store.dispatch( backendActions.listRemove( data ) );
	}
	
    return {
        userSignedIn,
        userSignedOut,
        error,

		initBoard,
		updateBoard,
	
		updateObject,
		removeObject,
		removeObjects,
	
		updateListItem,
		removeListItem
    };
}
