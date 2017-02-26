import { connect } from "react-redux";

import MindMapNodeToolbar from "../components/mindmap-node-toolbar";

import { tryUpdateObject, tryRemoveObject } from "../actions/mindmap";

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

        update: function(changes) {
            tryUpdateObject(Object.assign({id, primaryType}, changes));
        },
        remove: function() {
            tryRemoveObject(primaryType, id);
        }
    }
}

export default connect(mapStateToProps,
    { tryUpdateObject, tryRemoveObject }, mergeProps)(MindMapNodeToolbar);
