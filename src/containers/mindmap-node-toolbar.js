import { connect } from "react-redux";

import MindMapNodeToolbar from "../components/mindmap-node-toolbar";

import { tryUpdateObject, tryRemoveObject } from "../actions/mindmap";

import {
    TYPE_NODE,
    TYPE_LINE,
    TYPE_NONE,
    TYPE_PIN,
    TYPE_CLUSTER
} from "../constants/types";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { id, primaryType } = ownProps;

    let data = null;
    switch (primaryType) {
    case TYPE_NODE:
        data = mindmap.getIn(["nodes", id]).toJS();
        break;
    }
    return {
        id,
        primaryType,
        data
    }
}

function mergeProps(stateProps, dispatchProps) {
    const { id, primaryType, data } = stateProps;
    const { tryUpdateObject, tryRemoveObject } = dispatchProps;

    return {
        id,
        primaryType,
        data,

        update: function(changes) {
            const next = Object.assign({}, data, changes);
            tryUpdateObject(next);
        },
        remove: function() {
            tryRemoveObject(primaryType, id);
        }
    }
}

export default connect(mapStateToProps,
    { tryUpdateObject, tryRemoveObject }, mergeProps)(MindMapNodeToolbar);
