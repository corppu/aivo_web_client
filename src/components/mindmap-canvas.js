import { Engine, World, Body, Bodies, Vector } from "matter-js"
import { clear, drawCircle } from "../utils/canvas-utils" 

export default function() {
    let _engine = Engine.create()
    let _nodes = []

    function updateProps(props) {
        let propsNodes = new Map(props.nodes)

        // match existing nodes to props
        _nodes = _nodes.map(node => {
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
        _nodes = _nodes.filter(node => node !== null)

        // add new nodes (were in props and not in state)
        propsNodes.forEach((propsNode, id) => {
            const radius = 20
            const anchor = {
                x: propsNode.get("x"),
                y: propsNode.get("y")
            }        
            let body = Bodies.circle(anchor.x, anchor.y, radius, {
                frictionAir: 1,
                mass: 5
            })
            
            World.add(_engine.world, body)
            _nodes.push({
                id,
                title: propsNode.get("title"),
                radius,
                anchor,
                body
            })
            console.log(`added node ${id}`)
        })
    }

    function update() {
        for (let i = 0; i < _nodes.length; ++i) {
            const node = _nodes[i]
            const { anchor, body } = node

            const diff = Vector.sub(anchor, body.position)
            const vel = Vector.mult(diff, 1/1000)

            Body.applyForce(body, Vector.create(0, 0), vel)
        }

        // update physics
        _engine.world.gravity.x = 0
        _engine.world.gravity.y = 0
        
        Engine.update(_engine)
    }

    function render(ctx) {
        clear(ctx)

        _nodes.forEach((node) => {
            drawCircle(ctx, {
                x: node.body.position.x,
                y: node.body.position.y,
                r: node.radius
            })
        })
    }

    return {
        updateProps,
        update,
        render
    }
}
