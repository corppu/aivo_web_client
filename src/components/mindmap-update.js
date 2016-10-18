import { Engine, World, Bodies, Body, Vector } from "matter-js"

export default function(props, state) {
    let propsNodes = new Map(props.nodes)

    // match existing nodes to props
    let nodes = state.nodes.map(node => {
        const propsNode = propsNodes.get(node.id)
        if (!propsNode) {
            console.log(`removed node ${id}`)
            return null
        }
        propsNodes.delete(node.id)

        return Object.assign(node, {
            anchor: {
                x: propsNode.get("x"),
                y: propsNode.get("y")
            }
        })
    })

    // remove null nodes (were removed from props)
    nodes = nodes.filter(node => node !== null)

    // add new nodes (were in props and not in state)
    propsNodes.forEach((propsNode, id) => {
        const radius = 40
        const anchor = {
            x: propsNode.get("x"),
            y: propsNode.get("y")
        }        
        let body = Bodies.circle(anchor.x, anchor.y, radius)
        body.frictionAir = 0.5
        
        World.add(state.engine.world, body)
        nodes.push({
            id,
            title: propsNode.get("title"),
            radius,
            anchor,
            body
        })
        console.log(`added node ${id}`)
    })

    // update node positions and physics
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i]
        const { anchor, body } = node

        const diff = Vector.sub(anchor, body.position)
        const vel = Vector.mult(diff, 0.001)

        Body.applyForce(body, Vector.create(0, 0), vel)
    }
    state.engine.world.gravity.x = 0
    state.engine.world.gravity.y = 0
    
    Engine.update(state.engine)

    return Object.assign(state, {
        nodes
    })
}
