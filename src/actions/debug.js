import { moveNode, addNode, removeNode } from "./mindmap"

export function debugMoveRandomNode(count = 1) {
    return function (dispatch, getState) {
        const { mindmap } = getState()

        if (mindmap.get("nodes").size === 0) {
            return state
        }
        for (let i = 0; i < count; ++i) {
            const id = findRandomMapKey(mindmap.get("nodes"))

            dispatch(moveNode(
                id,
                tempRandomPosition(100, 3000),
                tempRandomPosition(100, 1500)
            ))
        }
    }
}

export function debugAddRandomNode(count = 1) {
    return function (dispatch) {
        for (let i = 0; i < count; ++i) {
            dispatch(addNode(
                tempRandomPosition(100, 3000),
                tempRandomPosition(100, 1500)
            ))
        }
    }
}

export function debugRemoveRandomNode() {
    return function (dispatch, getState) {
        const { mindmap } = getState()
       
        if (mindmap.get("nodes").size === 0) {
            return state
        }
        const id = findRandomMapKey(mindmap.get("nodes"))

        dispatch(removeNode(id))
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
