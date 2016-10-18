import { Engine, World } from "matter-js"

export default function(props, state) {
    let propsNodes = new Map(props.nodes)

    // update existing nodes
    let nodes = state.nodes.map(node => {
        const propsNode = propsNodes.get(node.id)
        if (!propsNode) {
            console.log(`removed node ${id}`)
            return null
        }
        propsNodes.delete(node.id)
        
        return Object.assign(node, {
            x: propsNode.get("x"),
            y: propsNode.get("y")
        })
    })

    // remove null nodes (were removed from props)
    nodes = nodes.filter(node => node !== null)

    // add new nodes (were in props and not in state)
    propsNodes.forEach((propNode, id) => {
        nodes.push({
            id,
            titie: propNode.get("title"),
            x: propNode.get("x"),
            y: propNode.get("y"),
        })
        console.log(`added node ${id}`)
    })

    return Object.assign(state, {
        nodes
    })
}
