import { connect } from "react-redux";

import NodeView from "../components/node-view";

function mapStateToProps(state, ownProps) {
    const { mindmap } = state;
    const { /*boardID,*/ nodeID } = ownProps.params;

    const node = mindmap.getIn(["nodes", nodeID]);

    return {
        node
    };
}

export default connect(mapStateToProps)(NodeView);
