import * as mindmapActions from "../actions/mindmap"

export default function(store) {

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
        moveNode,
        addNode,
        removeNode
    }
}
