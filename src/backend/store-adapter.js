import { moveNode, addNode, removeNode } from "./mindmap"

export default function(store) {

    function moveNode(id, x, y) {
        store.dispatch(moveNode(id, x, y))
    }

    function addNode(id, x, y) {
        store.dispatch(addNode(id, x, y))
    }

    function removeNode(id) {
        store.dispatch(removeNode(id))
    }

    return {
        modeNode,
        addNode,
        removeNode
    }
}
