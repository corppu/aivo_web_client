import { connect } from "react-redux";

import MindMapNodeToolbar from "../components/mindmap-node-toolbar";

import { tryRemoveObject } from "../actions/mindmap";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { id, primaryType } = ownProps;

    let data = null;
    /*
    switch (primaryType) {
        case 
    }
    */

    return {
        id,
        primaryType,
        data
    }
}

function mergeProps(stateProps, dispatchProps) {
    const { id, primaryType, data } = stateProps;
    const { tryRemoveObject } = dispatchProps;

    return {
        id,
        primaryType,
        data,

        remove: function() {
            tryRemoveObject(primaryType, id);
        }
    }
}

export default connect(mapStateToProps,
    { tryRemoveObject }, mergeProps)(MindMapNodeToolbar);
