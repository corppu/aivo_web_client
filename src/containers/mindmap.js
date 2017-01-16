import { connect } from "react-redux";
import { push } from "react-router-redux";

import { tryCreateObject, tryUpdateObject, tryRemoveObject } from "../actions/mindmap";
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
        children
    };
}

function mergeProps(stateProps, dispatchProps) {
    const { boardID, lines, nodes, pins, children } = stateProps;
    const { tryCreateObject, tryUpdateObject, tryRemoveObject, tryOpenBoard, push } = dispatchProps;

    return {
        nodes,
		lines,
		pins,
		
        children,

        tryCreateObject,
        tryUpdateObject,
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
        { tryCreateObject, tryUpdateObject, tryRemoveObject, tryOpenBoard, push }, mergeProps)(MindMap);
