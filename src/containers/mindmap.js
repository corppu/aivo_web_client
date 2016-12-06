import { connect } from "react-redux";
import { push } from "react-router-redux";

import { tryAddNode, tryUpdateNode, tryRemoveNode } from "../actions/mindmap";
import { tryOpenBoard } from "../actions/backend";

import { constructNodeURL } from "../utils/url-utils";

import MindMap from "../components/mindmap";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { params, children } = ownProps;
    const { boardID } = params;

    return {
        boardID,
        nodes: mindmap.get("nodes"),

        children
    };
}

function mergeProps(stateProps, dispatchProps) {
    const { boardID, nodes, children } = stateProps;
    const { tryAddNode, tryUpdateNode, tryRemoveNode, tryOpenBoard, push } = dispatchProps;

    return {
        nodes,

        children,

        tryAddNode,
        tryUpdateNode,
        tryRemoveNode,
        tryOpenBoard: function() {
            tryOpenBoard(boardID)
        },
        openNode: function(nodeID) {
            push(constructNodeURL(boardID, nodeID));
        }
    }
}

export default connect(mapStateToProps,
        { tryAddNode, tryUpdateNode, tryRemoveNode, tryOpenBoard, push }, mergeProps)(MindMap);
