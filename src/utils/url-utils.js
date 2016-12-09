
export function constructBoardURL(boardID) {
    return `/board/${boardID}`;
}

export function constructNodeURL(boardID, nodeID) {
    return `/board/${boardID}/${nodeID}`;
}
