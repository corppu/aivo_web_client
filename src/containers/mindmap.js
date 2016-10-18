import { connect } from "react-redux"

import MindMap from "../components/mindmap"

function mapStateToProps(state) {
    const { mindmap } = state

    return {
        nodes: mindmap.get("nodes")
    }
}

export default connect(mapStateToProps)(MindMap)
