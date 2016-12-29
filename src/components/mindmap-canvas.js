// View for the mindmap
import { Engine, World, Composite, Body, Bodies, Query, Vector } from "matter-js";

import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_IMAGE,
    NODE_TYPE_TEXT
} from "../constants/types";

import {
	NODE_RADIUS,
	NODE_TXT_BOX_WIDTH,
	NODE_TXT_BOX_HEIGHT
} from "../constants/values";

import { clear, createRenderer, transformToCamera } from "../utils/canvas-utils";
import { createAction, updateAction, actionResult } from "../utils/input-utils";
import { flagHidden } from "../utils/node-utils";

export default function() {
	let _engine = Engine.create();
    let _nodes = new Map();
	let _lines = [];
    let _bodyToNodeMapping = new Map();
    let _searchFilter = "";
    let _camera = {
        x: 0,
        y: 0
    };

    let _inputAction = null;
    let _actions = {
        addNode: null,
		addLine: null,
        updateNode: null,
		updateLine: null,
        removeNode: null,
		removeLine: null,
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
        const delta = (Date.now() - _lastDate) / 1000;
        _lastDate = Date.now();
        _fps = Math.round(1/delta);
	}
	
    function updateProps(props) {
        _actions.addNode = props.tryAddNode;
		_actions.addLine = props.tryAddLine;
        _actions.updateNode = props.tryUpdateNode;
		_actions.updateLine = props.tryUpdateLine;
        _actions.removeNode = props.tryRemoveNode;
		_actions.removeLine = props.tryRemoveLine;
        _actions.openNode = props.openNode;
        
        let propsNodes = new Map(props.nodes);
		let propsLines = new Map(props.lines);

        // match existing nodes to props (update old ones)
        _nodes.forEach((node, id) => {
            const propsNode = propsNodes.get(id);

             if (!propsNode) {
                 const { body } = node;

                _nodes.delete(id)
                _bodyToNodeMapping.delete(body.id);
                World.remove(_engine.world, body);

                console.log(`removed node ${id}`);
                return;
            }
            propsNodes.delete(id);

            Object.assign(node, {
                type: propsNode.get("type"),
                anchor: {
                    x: propsNode.get("x"),
                    y: propsNode.get("y")
                },
                title: propsNode.get("title"),
                text: propsNode.get("text"),
                imgURL: propsNode.get("imgURL")
            });
        });

        // match existing lines to props (update old ones)
        _lines = _lines.map(line => {
            const propsLine = propsLines.get(line.id);
            if (!propsLine) {
                //const { body } = node;

                //_bodyToNodeMapping.delete(body.id);
                //World.remove(_engine.world, body);

                console.log(`removed line ${line.id}`);
                return null;
            }
            propsLines.delete(line.id);

            return Object.assign(line, {

				parentType: propsLine.get("parentType"),
				parentId: propsLine.get("parentId"),
				childType: propsLine.get("childType"),
				childId: propsLine.get("childId"),
				
				// sx: propsLine.get("sx"),
				// sy: propsLine.get("sy"),
				// ex: propsLine.get("ex"),
				// ey: propsLine.get("ey"),				
				// cp1x: propsLine.get("cp1x"),
				// cp1y: propsLine.get("cp1y"), 
				// cp2x: propsLine.get("cp2x"), 
				// cp2y: propsLine.get("cp2y"),
				
                title: propsLine.get("title")
            });
        });		
		
		// remove null lines (were removed from props)
        _lines = _lines.filter(line => line !== null);

        // add new nodes (were in props and not in state)
        propsNodes.forEach((propsNode, id) => {
            const radius = NODE_RADIUS;
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
                type: propsNode.get("type"),
                title: propsNode.get("title"),
                text: propsNode.get("text"),
				imgURL: propsNode.get("imgURL"),
                radius,
                anchor,
                body
            }		
            _nodes.set(node.id, node);
            _bodyToNodeMapping[body.id] = node;
            World.add(_engine.world, body);

            console.log("added node ${id}");
        })
		
		 // add new Lines (were in props and not in state)
        propsLines.forEach((propsLine, id) => {
			const line = {
				id,
				
				parentType: propsLine.get("parentType"),
				parentId: propsLine.get("parentId"),
				childType: propsLine.get("childType"),
				childId: propsLine.get("childId"),
				
				// sx: propsLine.get("sx"),
				// sy: propsLine.get("sy"),
				// ex: propsLine.get("ex"),
				// ey: propsLine.get("ey"),
				// cp1x: propsLine.get("cp1x"),
				// cp1y: propsLine.get("cp1y"), 
				// cp2x: propsLine.get("cp2x"), 
				// cp2y: propsLine.get("cp2y"),
				
                title: propsLine.get("title")
            };
			
		   _lines.push(line);
			console.log("added line ${id}");
		});

        // search filtering
        if (props.searchFilter && props.searchFilter !== _searchFilter) {
            _searchFilter = props.searchFilter;

            _nodes = flagHidden(_nodes, _searchFilter);
        }
    }
	
    function onInputStart(e) {
        const pos = transformToCamera(_camera, e.position);
        _inputAction = createAction(pos);
    }

    function onInputEnd(e) {
        if (!_inputAction) {
            return;
        }
        const pos = transformToCamera(_camera, e.position);

        updateAction(_inputAction, pos);
        const result = actionResult(_inputAction, pos);
	        
        const hits = Query.point(_engine.world.bodies, pos);
        if (hits.length > 0) {
            
            // delete node
            /*
            hits.forEach(body => {
                const node = _bodyToNodeMapping[body.id];

                if (_actions.removeNode) {
                    _actions.removeNode(node.id)
                }
            })
            */

            // move node
            if (_inputAction.totalDeltaMagnitude <= 10) {
                const node = _bodyToNodeMapping[hits[0].id];
                
                if (_actions.openNode) {
                    _actions.openNode(node.id);
                }
            }

        } else {
            if (_inputAction.totalDeltaMagnitude <= 10 && result.duration >= 0.25) {
                if (_actions.addNode) {
                    _actions.addNode({
                        title: "",
                        type: NODE_TYPE_UNDEFINED,
                        imgURL: null,
                        x: pos.x,
                        y: pos.y
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
        const pos = transformToCamera(_camera, e.position);
        updateAction(_inputAction, pos);

        Object.assign(_camera, Vector.add(_camera, _inputAction.lastDelta));
    }

    function update() {
        updateFps(); // Just testing...

        _nodes.forEach((node) => {
            const { radius, anchor, body } = node;

            const diff = Vector.sub(anchor, body.position);

            if (Vector.magnitude(diff) > radius * 1.5) {
                const vel = Vector.mult(diff, 1/1000);

                Body.applyForce(body, Vector.create(0, 0), vel);
            }
        });

        // update physics
        _engine.world.gravity.x = 0;
        _engine.world.gravity.y = 0;
        
        Engine.update(_engine);
    }
    
    function render(ctx) {
		clear(ctx, { color: "#f0f0f0" });

        const draw = createRenderer(ctx, { camera: _camera });

        _nodes.forEach(node => {
            drawNode(draw, node);
        });

		_lines.forEach(line => {
            drawLine(draw, line, _engine.world.bodies, _nodes.get(line.parentId), _nodes.get(line.childId));
        });
		
		drawFPS(draw, _fps);
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

function drawFPS(draw, fps) {
    draw.text({
        text: fps,
        x: 5,
        y: 5,
        baseline: "hanging",
        ignoreCamera: true
    });
}

function findAnchors(parentAnchor, childAnchor) {
	let anchors = {
		parentAnchor: {
			x: parentAnchor.x,
			y: parentAnchor.y
		},
		
		childAnchor: {
			x: childAnchor.x,
			y: childAnchor.y
		}
	};
	
	if(parentAnchor.x < childAnchor.x) {
		anchors.parentAnchor.x = parentAnchor.x + NODE_RADIUS;
		anchors.childAnchor.x = childAnchor.x - NODE_RADIUS;
	}
	else if(parentAnchor.x > childAnchor.x) {
		anchors.parentAnchor.x = parentAnchor.x - NODE_RADIUS;
		anchors.childAnchor.x = childAnchor.y + NODE_RADIUS;
	}
	
	if(parentAnchor.y < childAnchor.y) {
		anchors.parentAnchor.y = parentAnchor.y + NODE_RADIUS;
		anchors.childAnchor.y = childAnchor.y - NODE_RADIUS;
	}
	else if(parentAnchor.y > childAnchor.y) {
		anchors.parentAnchor.y = parentAnchor.y - NODE_RADIUS;
		anchors.childAnchor.y = childAnchor.y + NODE_RADIUS;
	}
	
	return anchors;
}


function drawLine(draw, line, bodies, parentNode, childNode) {
	const anchors = findAnchors(parentNode.anchor, childNode.anchor);
	draw.curve(
		createPath(
			bodies, 
			anchors.parentAnchor.x,
			anchors.parentAnchor.y,
			anchors.childAnchor.x,
			anchors.childAnchor.y
		)
	);
}

function drawNode(draw, { type, imgURL, title, body, radius, hidden }) {
    if (hidden) {
        return;
    }
    const { x, y } = body.position;

    switch (type) {
    case NODE_TYPE_TEXT:
        draw.circle({x, y, r: radius,
                color: "#080", strokeColor: "black", strokeWidth: 2});
        break;
    
    case NODE_TYPE_IMAGE:
        draw.circle({x, y, r: radius,
                color: "#088", imageURL: imgURL, strokeColor: "black", strokeWidth: 2});
        break;

    default:
        draw.circle({x, y, r: radius,
                color: "#888", strokeColor: "black", strokeWidth: 2});
        break; 
    }

    // draw the first title letter inside the circle, if no image is present
    /*
    if (!imgURL) {
        const content = title.charAt(0).toUpperCase();
        draw.text({text: content, x, y, baseline: "middle", align: "center", color: "white"});
    }
    */
    
    // draw the title
    if (title.length > 10) {
        title = title.substring(0, 7);
		title += "...";
    }
    draw.text({text: title, x, y: y + radius * 2, baseline: "middle", align: "center"});
}




function createPath(bodies, sx, sy, ex, ey) {
	const startPoint = Vector.create(sx, sy);
	const endPoint = Vector.create(ex, ey);
	//const rayWidth = 6;
	//Matter.Query.ray(bodies, startPoint, endPoint, [rayWidth])
	const collisions = Query.ray(bodies, startPoint, endPoint);
	if(collisions.length === 0) {
		return [sx, sy, ex, ey];
	}

	let topMostBdy = collisions[0].body;
	let leftMostBdy = collisions[0].body;
	let rightMostBdy = collisions[0].body;
	let bottomMostBdy = collisions[0].body;
	let bdyBoundsA = null;
	let bdyBoundsB = null;
	for(let i = 1; i < collisions.length; ++i) {
		bdyBoundsA = collisions[i].body.bounds;
		
		// Check leftMostBdy
		bdyBoundsB = leftMostBdy.bounds;
		if(bdyBoundsA.min.x < bdyBoundsB.min.x) {
			leftMostBdy = collisions[i].body;
		}
		// Check topMostBdy
		bdyBoundsB = topMostBdy.bounds;
		if(bdyBoundsA.min.y < bdyBoundsB.min.y) {
			topMostBdy = collisions[i].body;
		}
		
		// Check rightMostBdy
		bdyBoundsB = rightMostBdy.bounds;
		if(bdyBoundsA.max.x > bdyBoundsB.max.x) {
			rightMostBdy = collisions[i].body;
		}
		
		// Check bottomMostBdy
		bdyBoundsB = bottomMostBdy.bounds;
		if(bdyBoundsA.max.y > bdyBoundsB.max.y) {
			bottomMostBdy = collisions[i].body;
		}
	}
	
	let point1 = {x:sx, y:sy};
	let point2 = {x:ex, y:ey};
	
	// Start is top
	if(sy < ey) {
		point1.y = topMostBdy.bounds.min.y;
		point2.y = bottomMostBdy.bounds.max.y;
	}

	// Start is bottom
	else if(sy >= ey) {
		point1.y = bottomMostBdy.bounds.max.y;
		point2.y = topMostBdy.bounds.min.y;
	}
	
	// Start is left
	if(sx < ex) {
		point1.x = leftMostBdy.bounds.min.x;
		point2.x = point1.x;
	}
	
	// Start is right
	else if(sx >= ex) {
		point1.x = rightMostBdy.bounds.max.x;
		point2.x = point1.x;
	}
	
	
	return [sx, sy, point1.x, point1.y, point2.x, point2.y, ex, ey];
}