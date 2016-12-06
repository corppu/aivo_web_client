import { Engine, World, Composite, Body, Bodies, Query, Vector } from "matter-js"

import { clear, createRenderer } from "../utils/canvas-utils" 
import { createAction, actionResult } from "../utils/input-utils" 
import { createImageCache } from "../utils/image-utils"

export default function() {
    let _engine = Engine.create()
    let _nodes = []
    let _bodyToNodeMapping = new Map()
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
	  if(!_lastDate) {
		 _lastDate = Date.now();
		 _fps = 0;
		 return;
	  }
	  const delta = (Date.now() - _lastDate)/1000;
	  _lastDate = Date.now();
	  _fps = Math.round(1/delta);
	}

	let _imgCache = createImageCache();
	
	// Below some testing stuff for image drawing...
	let _imgLoaded = false;
	let _img = new Image();
	_img.onload	 = function() {
	 _imgLoaded = true;
	};
	_img.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/DU30_small_triambic_icosahedron.png/240px-DU30_small_triambic_icosahedron.png";

    function updateProps(props) {
        _actions.addNode = props.tryAddNode;
        _actions.updateNode = props.tryUpdateNode;
        _actions.removeNode = props.tryRemoveNode;
        _actions.openNode = props.openNode;
        
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
				imgURL: propsNode.get("imgURL"),
                radius,
                anchor,
                body
            }
			
			if(!_imgCache.getImg(node.imgURL)) _imgCache.addImg(node.imgURL);
			
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
		if(result.deltaMagnitude < 10 && result.duration > 2) {
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
        
        const hits = Query.point(_engine.world.bodies, e.position)

        if (hits.length > 0) {
            /*
            hits.forEach(body => {
                const node = _bodyToNodeMapping[body.id];

                if (_actions.removeNode) {
                    _actions.removeNode(node.id)
                }
            })
            */

            const node = _bodyToNodeMapping[hits[0].id];
            if (_actions.openNode) {
                _actions.openNode(node.id);
            }

        }
        /*
        else {
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
            const { id, title, imgURL } = _inputAction.data

			if(imgURL) {
				_actions.updateNode(id, {
					title,
					x: e.position.x,
					y: e.position.y,
					imgURL
				})
			} else {
				_actions.updateNode(id, {
					title,
					x: e.position.x,
					y: e.position.y,
				})
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
		clear(ctx);	

        const draw = createRenderer(ctx)

		// Draw the nodes
        _nodes.forEach(function(node){drawNode(draw, _imgCache.getImg(node.imgURL), node.title, node.body.position.x, node.body.position.y, node.radius)});
		
		drawFps(draw, _fps);
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

function drawFps(draw, fps) {
    draw.text({
        text: fps,
        x: 5,
        y: 5,
        baseline: "hanging"
    })
}

function drawNode(draw, img, title = "Preview", x = 0, y = 0, r = 5) {

	
    if(img) 
	{
		draw.circleImg({img, x, y, r, color: "blue", strokeColor: "black", strokeWidth: 2})
	}
	else 
	{
		draw.circle({x, y, r, color: "blue", strokeColor: "black", strokeWidth: 2})
	}
	
	
	
    // draw the first title letter inside the circle
    const content = title.charAt(0).toUpperCase()
    draw.text({text: content, x, y, baseline: "middle", align: "center", color: "white"})

    // Draw the image once it is loaded instead of general drawing with the canvas context
    //if(_imgLoaded)ctx.drawImage(_img, 0, 0, 240, 240, x-r, y-r, 2*r, 2*r);

    // draw the title
    if (title.length > 10) {
        title = title.substring(0, 10);
    }
    draw.text({text: title, x, y: y + r * 2,
            baseline: "middle", align: "center"})
}

 /*
    ctx.font="30px Verdana";
    
    // Create gradient
    var gradient=ctx.createLinearGradient(0,0,1000,0);
    gradient.addColorStop("0","magenta");
    gradient.addColorStop("0.5","blue");
    gradient.addColorStop("1.0","red");

    // Fill with gradient
    ctx.fillStyle=gradient;
    ctx.fillText(_fps.toString(),10,90);
*/

