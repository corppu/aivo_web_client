import { connect } from "react-redux";
import { push } from "react-router-redux";

import NodeView from "../components/node-view";

import { tryUpdateNode } from "../actions/mindmap";

import { constructBoardURL } from "../utils/url-utils";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { boardID, nodeID } = ownProps.params;

    const node = mindmap.getIn(["nodes", nodeID]);

    return {
        boardID,
        nodeID,
        node
    };
}

function mergeProps(stateProps, dispatchProps) {
    const { boardID, nodeID, node } = stateProps;
    const { tryUpdateNode, push } = dispatchProps;

    return {
        nodeID,
        node,

        updateNode: function(newNode) {
            tryUpdateNode(nodeID, newNode)
        },
        goToParentBoard: function() {
            push(constructBoardURL(boardID));
        }
    }
}

export default connect(mapStateToProps, { tryUpdateNode, push }, mergeProps)(NodeView);
