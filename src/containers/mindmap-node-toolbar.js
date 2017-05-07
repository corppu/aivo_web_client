import { connect } from "react-redux";

import MindMapNodeToolbar from "../components/mindmap-node-toolbar";

import { tryUpdateObject, tryCreateObject, tryRemoveObject } from "../actions/mindmap";

import {
    TYPE_NODE,
    TYPE_LINE,
    TYPE_NONE,
    TYPE_PIN,
    TYPE_CLUSTER
} from "../constants/types";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { id, primaryType, canvasCamera } = ownProps;

    let data = null;
    switch (primaryType) {
    case TYPE_NODE:
        data = mindmap.getIn(["nodes", id]).toJS();
        break;
    }
    return {
        id,
        primaryType,
        data,

        canvasCamera
    }
}

function mergeProps(stateProps, dispatchProps) {
    const { id, primaryType, data, canvasCamera } = stateProps;
    const { tryUpdateObject, tryCreateObject, tryRemoveObject } = dispatchProps;

    return {
        id,
        primaryType,
        data,

        canvasCamera,

        update: function(changes) {
            const next = Object.assign({}, data, changes);
			console.log(next);
			if(next.type === TYPE_CLUSTER) {
				
				tryRemoveObject(next.primaryType, next.id);
				
				
				tryCreateObject( {
					primaryType : TYPE_CLUSTER,
					x: next.x,
					y: next.y
				} );
			} else {
				tryUpdateObject(next);
			}
        },
        remove: function() {
            tryRemoveObject(primaryType, id);
        }
    }
}

export default connect(mapStateToProps,
    { tryUpdateObject, tryCreateObject, tryRemoveObject }, mergeProps)(MindMapNodeToolbar);
