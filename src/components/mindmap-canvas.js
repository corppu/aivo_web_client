import { Engine, World, Composite, Body, Bodies, Query, Vector } from "matter-js"

import { clear, createRenderer } from "../utils/canvas-utils" 
import { createAction, actionResult } from "../utils/input-utils" 

export default function() {
    let _engine = Engine.create()
    let _nodes = []
    let _bodyToNodeMapping = new Map()
    let _inputAction = null;

    let _actions = {
        addNode: null,
        updateNode: null,
        removeNode: null
    };

    function updateProps(props) {
        _actions.addNode = props.tryAddNode;
        _actions.updateNode = props.tryUpdateNode;
        _actions.removeNode = props.tryRemoveNode;
        
        let propsNodes = new Map(props.nodes)

        // match existing nodes to props
        _nodes = _nodes.map(node => {
            const propsNode = propsNodes.get(node.id)
            if (!propsNode) {
                 const { body } = node

                _bodyToNodeMapping.delete(body.id)
                World.remove(_engine.world, body)

                console.log(`removed node ${node.id}`)
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
            const body = Bodies.circle(anchor.x, anchor.y, radius, {
                frictionAir: 1,
                mass: 5
            })
            const node = {
                id,
                title: propsNode.get("title"),
                radius,
                anchor,
                body
            }
            _bodyToNodeMapping[body.id] = node
            
            World.add(_engine.world, body)
            _nodes.push(node)

            console.log(`added node ${id}`)
        })
    }

    function onInputStart(e) {
        _inputAction = createAction(e.position);
    }

    function onInputEnd(e) {
        if (!_inputAction) {
            return
        }
        const result = actionResult(_inputAction, e.position) // does nothing atm

        const hits =  Query.point(_engine.world.bodies, e.position)

        if (hits.length > 0) {
           hits.forEach(body => {
                const node = _bodyToNodeMapping[body.id];

                if (_actions.removeNode) {
                    _actions.removeNode(node.id)
                }
            })
        } else {
            if (_actions.addNode) {
                _actions.addNode({
                    title: "asd",
                    x: e.position.x,
                    y: e.position.y,
                })
            }
        }

        _inputAction = null
    }

    function onInputMove(e) {
        if (!_inputAction) {
            return;
        }

        // ...

    }

    function update() {
        for (let i = 0; i < _nodes.length; ++i) {
            const node = _nodes[i]
            const { radius, anchor, body } = node

            const diff = Vector.sub(anchor, body.position)

            if (Vector.magnitude(diff) > radius * 1.5) {
                const vel = Vector.mult(diff, 1/1000)

                Body.applyForce(body, Vector.create(0, 0), vel)
            }
        }

        // update physics
        _engine.world.gravity.x = 0
        _engine.world.gravity.y = 0
        
        Engine.update(_engine)
    }

    function render(ctx) {
        clear(ctx)

        const render = createRenderer(ctx);

        _nodes.forEach((node) => {
            render.circle({
                x: node.body.position.x,
                y: node.body.position.y,
                r: node.radius
            })
        })
    }

    return {
        updateProps,
        onInputStart,
        onInputEnd,
        onInputMove,
        update,
        render
    }
}
