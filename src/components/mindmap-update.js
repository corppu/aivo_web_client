
export default function(props, state) {
    const nodes = props.nodes.reduce((nodes, node) =>
        nodes.set(node.id, node)
    , new Map())

    return {
        nodes
    }
}
