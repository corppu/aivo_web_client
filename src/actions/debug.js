import { addNode, updateNode, removeNode } from "../backend/backend-adapter"

export function debugMoveRandomNode(boardID, count = 1) {
    return function (dispatch, getState) {
        const { mindmap } = getState()

        if (mindmap.get("nodes").size === 0) {
            return
        }
        for (let i = 0; i < count; ++i) {
            const id = findRandomMapKey(mindmap.get("nodes"))
            const node = mindmap.getIn(["nodes", id])

            updateNode(boardID, id, {
                title: node.get("title"),
                x: tempRandomPosition(100, 900),
                y: tempRandomPosition(100, 900)
            })
        }
    }
}

export function debugAddRandomNode(boardID, count = 1) {
    return function (dispatch) {
        for (let i = 0; i < count; ++i) {
            addNode(boardID, {
                x: tempRandomPosition(100, 900),
                y: tempRandomPosition(100, 900)
            })
        }
    }
}

export function debugRemoveRandomNode(boardID) {
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
