import { moveNode, addNode, removeNode } from "../backend/backend-adapter"

export function debugMoveRandomNode(count = 1) {
    return function (dispatch, getState) {
        const { mindmap } = getState()

        if (mindmap.get("nodes").size === 0) {
            return
        }
        for (let i = 0; i < count; ++i) {
            const id = findRandomMapKey(mindmap.get("nodes"))

            moveNode(
                id,
                tempRandomPosition(100, 900),
                tempRandomPosition(100, 900)
            )
        }
    }
}

export function debugAddRandomNode(count = 1) {
    return function (dispatch) {
        for (let i = 0; i < count; ++i) {
            addNode(
                tempRandomPosition(100, 900),
                tempRandomPosition(100, 900)
            )
        }
    }
}

export function debugRemoveRandomNode() {
    return function (dispatch, getState) {
        const { mindmap } = getState()
       
        if (mindmap.get("nodes").size === 0) {
            return
        }
        const id = findRandomMapKey(mindmap.get("nodes"))

        removeNode(id)
    }
}

// will crash if map is empty, check it beforehand
// this is also probably slow as fuck but that doesn't matter here 
function findRandomMapKey(map) {
    const index = Math.floor(Math.random() * map.size)
    return Array.from(map.keys())[index]
}

function tempRandomPosition(min = 100, max = 900) {
    return min + Math.random() * (max - min)
}
