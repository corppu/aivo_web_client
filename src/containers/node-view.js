import { connect } from "react-redux";
import { push } from "react-router-redux";

import NodeView from "../components/node-view";

import { tryUpdateObject } from "../actions/mindmap";

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

        updateNode: (newNode) => {
            if (newNode !== node) {
                return;
            }
            tryUpdateObject(newNode);
        },
        goToParentBoard: function() {
            push(constructBoardURL(boardID));
        }
    }
}

export default connect(mapStateToProps, { tryUpdateObject, push }, mergeProps)(NodeView);
