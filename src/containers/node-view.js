import { connect } from "react-redux";

import NodeView from "../components/node-view";

import { tryUpdateNode } from "../actions/mindmap";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { nodeID } = ownProps.params;

    const node = mindmap.getIn(["nodes", nodeID]);

    return {
        nodeID,
        node
    };
}

function mergeProps(stateProps, dispatchProps) {
    const { nodeID, node } = stateProps;
    const { tryUpdateNode } = dispatchProps;

    return {
        node: node ? node.toJS() : null,

        updateNode: function(newNode) {
            tryUpdateNode(nodeID, newNode)
        }
    }
}

export default connect(mapStateToProps, { tryUpdateNode }, mergeProps)(NodeView);
