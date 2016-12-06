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

const imgURLs = ["default",
 "http://68.media.tumblr.com/d2e06250e2e9c965e3d77c4a169dba28/tumblr_inline_moeijfyPG81qz4rgp.png",
 "http://worldartsme.com/images/mustache-tennis-ball-clipart-1.jpg",
 "http://shushi168.com/data/out/19/37103947-ball.png",
 "http://shushi168.com/data/out/190/37371806-profile-pictures.png",
 "default"
 ];

 function makeTitle()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
		if(0 === (Math.floor(Math.random() * 6))) return text;
    return text;
}

export function debugAddRandomNode(boardID, count = 1) {
    return function (dispatch) {
        for (let i = 0; i < count; ++i) {
            addNode(boardID, {
				title: makeTitle(),
                x: tempRandomPosition(100, 900),
                y: tempRandomPosition(100, 900),
				imgURL: imgURLs[Math.floor(Math.random() * 6)]
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
