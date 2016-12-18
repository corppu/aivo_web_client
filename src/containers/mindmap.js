import { connect } from "react-redux";
import { push } from "react-router-redux";

import { tryAddNode, tryAddLine, tryUpdateNode, tryUpdateLine, tryRemoveNode, tryRemoveLine } from "../actions/mindmap";
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

        children
    };
}

function mergeProps(stateProps, dispatchProps) {
    const { boardID, lines, nodes, children } = stateProps;
    const { tryAddNode, tryAddLine, tryUpdateNode, tryUpdateLine, tryRemoveNode, tryRemoveLine, tryOpenBoard, push } = dispatchProps;

    return {
        nodes,
		lines,
        children,

        tryAddNode,
		tryAddLine,
        tryUpdateNode,
		tryUpdateLine,
        tryRemoveNode,
		tryRemoveLine,
        tryOpenBoard: function() {
            tryOpenBoard(boardID)
        },
        openNode: function(nodeID) {
            push(constructNodeURL(boardID, nodeID));
        }
    }
}

export default connect(mapStateToProps,
        { tryAddNode, tryAddLine, tryUpdateNode, tryUpdateLine, tryRemoveNode, tryRemoveLine, tryOpenBoard, push }, mergeProps)(MindMap);
