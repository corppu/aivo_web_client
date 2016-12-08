import { Engine, World, Composite, Body, Bodies, Query, Vector } from "matter-js";

import { clear, createRenderer } from "../utils/canvas-utils";
import { createAction, actionResult } from "../utils/input-utils";

export default function() {
    let _engine = Engine.create();
    let _nodes = [];
    let _bodyToNodeMapping = new Map();
    let _inputAction = null;
    let _actions = {
        addNode: null,
        updateNode: null,
        removeNode: null,
        openNode: null
    };

	// Just testing....
	let _lastDate;
	let _fps;
	function updateFps() {
        if (!_lastDate) {
            _lastDate = Date.now();
            _fps = 0;
            return;
        }
        const delta = (Date.now() - _lastDate)/1000;
        _lastDate = Date.now();
        _fps = Math.round(1/delta);
	}
	
    function updateProps(props) {
        _actions.addNode = props.tryAddNode;
        _actions.updateNode = props.tryUpdateNode;
        _actions.removeNode = props.tryRemoveNode;
        _actions.openNode = props.openNode;
        
        let propsNodes = new Map(props.nodes);

        // match existing nodes to props
        _nodes = _nodes.map(node => {
            const propsNode = propsNodes.get(node.id);
            if (!propsNode) {
                 const { body } = node;

                _bodyToNodeMapping.delete(body.id);
                World.remove(_engine.world, body);

                console.log(`removed node ${node.id}`);
                return null;
            }
            propsNodes.delete(node.id);

            return Object.assign(node, {
                anchor: {
                    x: propsNode.get("x"),
                    y: propsNode.get("y")
                }
            });
        });

        // remove null nodes (were removed from props)
        _nodes = _nodes.filter(node => node !== null);

        // add new nodes (were in props and not in state)
        propsNodes.forEach((propsNode, id) => {
            const radius = 20;
            const anchor = {
                x: propsNode.get("x"),
                y: propsNode.get("y")
            };
            const body = Bodies.circle(anchor.x, anchor.y, radius, {
                frictionAir: 1,
                mass: 5
            });
            const node = {
                id,
                title: propsNode.get("title"),
				imgURL: propsNode.get("imgURL"),
                radius,
                anchor,
                body
            }		
            _bodyToNodeMapping[body.id] = node;
            
            World.add(_engine.world, body);
            _nodes.push(node);

            console.log(`added node ${id}`);
        })
    }

    function onInputStart(e) {
        let node = null;

        const hits = Query.point(_engine.world.bodies, e.position);

        if (hits.length > 0) {
            node = _bodyToNodeMapping[hits[0].id];
        }
        _inputAction = createAction(e.position, node);
    }

    function onInputEnd(e) {
        if (!_inputAction) {
            return;
        }
        const result = actionResult(_inputAction, e.position);
	        
        const hits = Query.point(_engine.world.bodies, e.position);
        if (hits.length > 0) {
            /*
            hits.forEach(body => {
                const node = _bodyToNodeMapping[body.id];

                if (_actions.removeNode) {
                    _actions.removeNode(node.id)
                }
            })
            */

            console.log(result.deltaMagnitude);

            if (result.deltaMagnitude <= 10) {
                const node = _bodyToNodeMapping[hits[0].id];
                
                if (_actions.openNode) {
                    _actions.openNode(node.id);
                }
            }

        } else {
            if (result.deltaMagnitude <= 10 && result.duration >= 0.25) {
                if (_actions.addNode) {
                    _actions.addNode({
                        title: Math.random().toString(36).substring(Math.random() * 20 + 1),
                        type: "undefined",
                        imgURL: "http://www.hbc333.com/data/out/190/47199326-profile-pictures.png",
                        x: e.position.x,
                        y: e.position.y
                    });
                }
            }
        }

        _inputAction = null
    }

    function onInputMove(e) {
        if (!_inputAction) {
            return;
        }
        if (_inputAction.data && _actions.updateNode) {
            const { id, title, imgURL } = _inputAction.data;

			if(imgURL) {
				_actions.updateNode(id, {
					title,
					x: e.position.x,
					y: e.position.y,
					imgURL
				});
			} else {
				_actions.updateNode(id, {
					title,
					x: e.position.x,
					y: e.position.y,
				});
			}
        }
    }

    function update() {
        updateFps(); // Just testing...

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
		clear(ctx, { color: "#f0f0f0" });

        const draw = createRenderer(ctx);

        _nodes.forEach(node => {
            drawNode(draw, node);
        });

		drawFps(draw, _fps);
    }

    return {
        updateProps,
        onInputStart,
        onInputEnd,
        onInputMove,
        update,
        render
    };
}

function drawFps(draw, fps) {
    draw.text({
        text: fps,
        x: 5,
        y: 5,
        baseline: "hanging"
    });
}

function drawNode(draw, { imgURL, title, body, radius }) {
    const { x, y } = body.position;
	
    draw.circle({x, y, r: radius,
            color: "blue", imageURL: imgURL, strokeColor: "black", strokeWidth: 2});
	
    // draw the first title letter inside the circle
    const content = title.charAt(0).toUpperCase();
    draw.text({text: content, x, y, baseline: "middle", align: "center", color: "white"});

    // draw the title
    if (title.length > 10) {
        title = title.substring(0, 10);
    }
    draw.text({text: title, x, y: y + radius * 2, baseline: "middle", align: "center"});
}
