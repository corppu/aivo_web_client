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

	// Just testing....
	let _lastDate;
	let _fps;
	function updateFps() {
	  if(!_lastDate) {
		 _lastDate = Date.now();
		 _fps = 0;
		 return;
	  }
	  const delta = (Date.now() - _lastDate)/1000;
	  _lastDate = Date.now();
	  _fps = Math.round(1/delta);
	} 

	// The logic for drawing the node...
	function drawNode(ctx, title = "Preview", x = 0, y = 0, r = 5, color = "blue") {
			// Draw the circle
			ctx.beginPath();
			ctx.arc(x, y, r, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "black";
			ctx.stroke();

			// Draw the first title letter inside the circle
			ctx.fillStyle = "white"; 
			ctx.font = "30px Verdana";
			let msr = ctx.measureText(title.charAt(0).toUpperCase());
			ctx.fillText(title.charAt(0).toUpperCase(), x - msr.width/2, y+r/2);
		
			// Draw the image once it is loaded instead of general drawing with the canvas context
			//if(_imgLoaded)ctx.drawImage(_img, 0, 0, 240, 240, x-r, y-r, 2*r, 2*r);

			// Draw the title
			ctx.fillStyle = "black";
			ctx.font="30px Verdana";
			if(title.length > 10) title = title.substring(0, 10);
			msr = ctx.measureText(title);
			ctx.fillText(title, x-msr.width/2, y+3*r);
	}

	// Below some testing stuff for image drawing...
	let _imgLoaded = false;
	let _img = new Image();
	_img.onload	 = function() {
	 _imgLoaded = true;
	};
	_img.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/DU30_small_triambic_icosahedron.png/240px-DU30_small_triambic_icosahedron.png";
	//

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

            //console.log(`added node ${id}`)
        })
    }

    function onInputStart(e) {
        let node = null

        const hits = Query.point(_engine.world.bodies, e.position)

        if (hits.length > 0) {
            node = _bodyToNodeMapping[hits[0].id]
        }
        _inputAction = createAction(e.position, node)
    }

    function onInputEnd(e) {
        if (!_inputAction) {
            return
        }
        const result = actionResult(_inputAction, e.position) // does nothing atm

        /*
        const hits = Query.point(_engine.world.bodies, e.position)

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
        */

        _inputAction = null
    }

    function onInputMove(e) {
        if (!_inputAction) {
            return;
        }
        if (_inputAction.data && _actions.updateNode) {
            const { id, title } = _inputAction.data

            _actions.updateNode(id, {
                title,
                x: e.position.x,
                y: e.position.y,
            })
        }
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
    
	
	// Just testing...
	function drawFps(ctx) {
		ctx.font="30px Verdana";
		// Create gradient
		var gradient=ctx.createLinearGradient(0,0,1000,0);
		gradient.addColorStop("0","magenta");
		gradient.addColorStop("0.5","blue");
		gradient.addColorStop("1.0","red");
		// Fill with gradient
		ctx.fillStyle=gradient;
		ctx.fillText(_fps.toString(),10,90);
	}
	
	
    function render(ctx) {
		updateFps(); // Just testing...
		
		// Clear old canvas context
		clear(ctx);	

		// Draw the nodes
        _nodes.forEach((node) => {
			if(_imgLoaded)drawNode(ctx, node.title, node.body.position.x, node.body.position.y, node.radius);	
        });
		
		drawFps(ctx); // Just testing...
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
