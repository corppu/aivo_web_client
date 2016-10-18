import { Engine, World } from "matter-js"

export default function(props, state) {
    var propsNodes = new Map(props.nodes)

    // update existing nodes
    var nodes = state.nodes.map(node => {
        if (!propsNodes.delete(node.id)) {
            console.log(`removed node ${id}`)
            return null
        }
        return node
    })

    // remove null nodes (were removed from props)
    nodes = nodes.filter(node => node !== null)

    // add new nodes (were in props and not in state)
    propsNodes.forEach((propNode, id) => {
        nodes.push({
            id,
            titie: propNode.title,
            x: propNode.x,
            y: propNode.y,
        })
        console.log(`added node ${id}`)
    })

    return Object.assign(state, {
        nodes
    })
}
