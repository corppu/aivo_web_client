import { connect } from "react-redux";

import MindMapNodeToolbar from "../components/mindmap-node-toolbar";

function mapStateToProps(state, ownProps) {
    //const { mindmap } = state;
    const { id, primaryType } = ownProps;

    return {
        id,
        primaryType
    }
}

export default connect(mapStateToProps)(MindMapNodeToolbar);
