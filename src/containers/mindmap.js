import { connect } from "react-redux"

import { tryAddNode, tryUpdateNode } from "../actions/mindmap"

import MindMap from "../components/mindmap"

function mapStateToProps(state) {
    const { mindmap } = state

    return {
        nodes: mindmap.get("nodes")
    }
}

export default connect(mapStateToProps, { tryAddNode, tryUpdateNode })(MindMap)
