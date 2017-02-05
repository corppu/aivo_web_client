import { connect } from "react-redux";

import MindMapNodeToolbar from "../components/mindmap-node-toolbar";

import {

} from "../constants/types";

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

export default connect(mapStateToProps)(MindMapNodeToolbar);
