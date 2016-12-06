import { connect } from "react-redux";

import { tryAddNode, tryUpdateNode, tryRemoveNode } from "../actions/mindmap";
import { tryOpenBoard } from "../actions/backend";

import MindMap from "../components/mindmap";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { boardID } = ownProps.params;

    return {
        boardID,
        nodes: mindmap.get("nodes")
    };
}

export default connect(mapStateToProps,
        { tryAddNode, tryUpdateNode, tryRemoveNode, tryOpenBoard })(MindMap);
