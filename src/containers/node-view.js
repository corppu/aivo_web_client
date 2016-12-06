import { connect } from "react-redux";

import NodeView from "../components/node-view";

function mapStateToProps(state, ownProps) {
    return {
        id: ownProps.params.nodeID
    };
}

export default connect(mapStateToProps)(NodeView);
