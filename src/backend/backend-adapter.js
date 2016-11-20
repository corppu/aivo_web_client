
export default function(storeAdapter, config = null) {

    function moveNode(id, x, y) {
        storeAdapter.moveNode(id, x, y)
    }

    function addNode(x, y, id = null) {
        storeAdapter.addNode(id, x, y)
    }

    function removeNode(id) {
        storeAdapter.removeNode(id)
    }

    return {
        modeNode,
        addNode,
        removeNode
    }
}
