import { connect } from "react-redux";
import { push } from "react-router-redux";

import { tryCreateObject, tryUpdateObjects, tryRemoveObject } from "../actions/mindmap";
import { tryOpenBoard } from "../actions/backend";

import { constructNodeURL } from "../utils/url-utils";

import MindMap from "../components/mindmap";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { params, children } = ownProps;
    const { boardID } = params;

    return {
        boardID,
		lines: mindmap.get("lines"),
        nodes: mindmap.get("nodes"),
		pins: mindmap.get("pins"),
		clusters: mindmap.get("clusters"),
        children
    };
}

function mergeProps(stateProps, dispatchProps) {
    const { boardID, lines, nodes, pins, clusters, children } = stateProps;
    const { tryCreateObject, tryUpdateObjects, tryRemoveObject, tryOpenBoard, push } = dispatchProps;

    return {
        nodes,
		lines,
		pins,
		clusters,
		
        children,

        tryCreateObject,
        tryUpdateObjects,
		tryRemoveObject,
        tryOpenBoard: function() {
            tryOpenBoard(boardID)
        },
        openNode: function(nodeID) {
            push(constructNodeURL(boardID, nodeID));
        }
    }
}

export default connect(mapStateToProps,
        { tryCreateObject, tryUpdateObjects, tryRemoveObject, tryOpenBoard, push }, mergeProps)(MindMap);
