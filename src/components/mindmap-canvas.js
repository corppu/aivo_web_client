import { Engine, World, Composite, Body, Bodies, Query, Vector } from "matter-js";

import { queryNodeAtPoint } from "./mindmap-canvas-physics";
import { findPath } from "../utils/algorithm-utils";

import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_IMAGE,
    NODE_TYPE_TEXT
} from "../constants/types";
import {
	MINDMAP_PIN_RADIUS,
	MINDMAP_NODE_RADIUS,
    MINDMAP_NODE_HIGHLIGHT_MARGIN,
    MINDMAP_MODE_DEFAULT,
    MINDMAP_MODE_LINE_EDIT
} from "../constants/config";

import { clear, createRenderer, transformToCamera } from "../utils/canvas-utils";
import { createAction, updateAction, actionResult } from "../utils/input-utils";
import { flagHidden } from "../utils/node-utils";

export default function() {
    let _context = {
        engine: Engine.create(),
        nodes: new Map(),
        lines: new Map(),
		pins: new Map(),
        bodyToNodeMapping: new Map(),  
    };
    let _camera ={
        x: 0,
        y: 0
    };
	
    let _selectedNode = null;
	let _selectedPin = null;
	
    let _inputAction = null;
    let _actions = {
        addNode: null,
		addLine: null,
		addPin: null,
        updateNode: null,
		updateLine: null,
		updatePin: null,
        removeNode: null,
		removeLine: null,
		removePin: null,
        openNode: null
    };

    let _searchFilter = "";
    let _mode = MINDMAP_MODE_LINE_EDIT;

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
		_actions.addPin = props.tryAddPin;
        _actions.updateNode = props.tryUpdateNode;
		_actions.updateLine = props.tryUpdateLine;
		_actions.updatePin = props.tryUpdatePin;
        _actions.removeNode = props.tryRemoveNode;
		_actions.removeLine = props.tryRemoveLine;
		_actions.removePin = props.tryRemovePin;
        _actions.openNode = props.openNode;
		
        let propsNodes = new Map(props.nodes);
		let propsLines = new Map(props.lines);
		let propsPins = new Map(props.pins);
		
        // match existing nodes to props (update old ones)
        _context.nodes.forEach((node, id) => {
            const propsNode = propsNodes.get(id);

             if (!propsNode) {
                 const { body } = node;

                _context.nodes.delete(id)
                _context.bodyToNodeMapping.delete(body.id);
                World.remove(_context.engine.world, body);

				if(_selectedNode.id === id) {
					_selectedNode = null;
				}
				
                console.log(`removed node ${id}`);
                return;
            }
            propsNodes.delete(id);
			
            Object.assign(node, {
				id,
                type: propsNode.get("type"),
                anchor: {
                    x: propsNode.get("x"),
                    y: propsNode.get("y")
                },
                title: propsNode.get("title"),
                text: propsNode.get("text"),
                imgURL: propsNode.get("imgURL"),
				lines: propsNode.get("lines")
            });
        });

        
		
		// match existing lines to props (update old ones)
          _context.lines.forEach((line, id) => {
            const propsLine = propsLines.get(id);

             if (!propsLine) {
                // const { body } = line;

                _context.lines.delete(id)
                // _context.bodyToNodeMapping.delete(body.id);
                // World.remove(_context.engine.world, body);

                console.log(`removed line ${id}`);
                return;
            }
            propsLines.delete(id);

            return Object.assign(line, {
				id,
				parentType: propsLine.get("parentType"),
				parentId: propsLine.get("parentId"),
				childType: propsLine.get("childType"),
				childId: propsLine.get("childId"),
                title: propsLine.get("title")
            });
        });		
		
		
		
		
		// match existing pins to props (update old ones)
        _context.pins.forEach((pin, id) => {
            const propsPin = propsPins.get(id);

             if (!propsPin) {
                 const { body } = pin;

                _context.pins.delete(id)
                //_context.bodyToNodeMapping.delete(body.id);
                //World.remove(_context.engine.world, body);

                console.log(`removed pin ${id}`);
                return;
            }
            propsPins.delete(id);
			//		lines: {lineIdToPin: parentId}

            Object.assign(pin, {
				id,
				anchor: {
                    x: propsPin.get("x"),
                    y: propsPin.get("y")
                },
				lines: propsPin.get("lines")
            });
        });
		
		
		
		
		
		// remove null lines (were removed from props)
        //_context.lines = _context.lines.filter(line => line !== null);

        // add new nodes (were in props and not in state)
        propsNodes.forEach((propsNode, id) => {
            const radius = MINDMAP_NODE_RADIUS;
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
				lines: propsNode.get("lines"),

                radius,
                anchor,
                body
            }		
            _context.nodes.set(id, node);
            _context.bodyToNodeMapping[body.id] = node;
            World.add(_context.engine.world, body);

            console.log(`added node ${id}`);
        })
		
		 // add new Lines (were in props and not in state)
        propsLines.forEach((propsLine, id) => {
			const line = {
				id,
				parentType: propsLine.get("parentType"),
				parentId: propsLine.get("parentId"),
				childType: propsLine.get("childType"),
				childId: propsLine.get("childId"),
                title: propsLine.get("title")
            };
			
		   _context.lines.set(id, line);
			console.log(`added line ${id}`);
		});

		
		
		// add new pins (were in props and not in state)
        propsPins.forEach((propsPin, id) => {
            const radius = MINDMAP_PIN_RADIUS;
            const anchor = {
                x: propsPin.get("x"),
                y: propsPin.get("y")
            };
            const body = Bodies.circle(anchor.x, anchor.y, radius, {
                frictionAir: 1,
                mass: 5
            });
            const pin = {
				id,
				lines: propsPin.get("lines"),

                radius,
                anchor,
                body
            }		
            _context.pins.set(id, pin);
            //_context.bodyToNodeMapping[body.id] = node;
            //World.add(_context.engine.world, body);

            console.log(`added pin ${id}`);
        })
		
		
        // search filtering
        if (props.searchFilter && props.searchFilter !== _searchFilter) {
            _searchFilter = props.searchFilter;

            _context.nodes = flagHidden(_context.nodes, _searchFilter);
        }
    }
	
    function onInputStart(e) {
        const pos = transformToCamera(_camera, e.position);

        _inputAction = createAction(pos, queryNodeAtPoint(_context, pos));
    }

    function onInputEnd(e) {
        if (!_inputAction) {
            return;
        }
        const pos = transformToCamera(_camera, e.position);

        updateAction(_inputAction, pos);
        const result = actionResult(_inputAction, pos);
	        
        const hits = Query.point(_context.engine.world.bodies, pos);
        if (hits.length > 0) {
            
            // hits.forEach(body => {
                // const node = _bodyToNodeMapping[body.id];
                // if (_actions.removeNode) {
                    // _actions.removeNode(node.id)
                // }
            // })
            
            
            const node = _context.bodyToNodeMapping[hits[0].id];
            
            if (_inputAction.totalDeltaMagnitude <= 10) {
                if (_selectedNode !== node) {
                    _selectedNode = node;
                } else if (_actions.removeNode) {
                    //_actions.openNode(node.id);
					if(node.lines) {
						var keys = Object.keys(node.lines);
						for(var i = 0; i < keys.length; ++i) {
							var lineId = node.lines.get(keys[i]);
							console.log("action remove line: " + lineId);
							_actions.removeLine(lineId);
						}
					}
					_actions.removeNode(node.id);
                }
            }
        } else {
            if (_inputAction.totalDeltaMagnitude <= 10) {
                //_selectedNode = null;

				
				
                if (result.duration >= 0.25) {
                    if (_actions.addNode) {
                        _actions.addNode({
                            title: "",
                            type: NODE_TYPE_UNDEFINED,
                            imgURL: null,
                            x: pos.x,
                            y: pos.y
                        });
                    }
                } else if(_actions.addPin) {
					_actions.addPin({
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

        if (_inputAction.data) {
            if (_actions.updateNode) {
                const { id, type, title, text, imgURL } = _inputAction.data;
              
                _actions.updateNode(id, {
                    type: type || NODE_TYPE_UNDEFINED,
                    x: pos.x,
                    y: pos.y,
                    title,
                    text: text || null,
                    imgURL: imgURL || null
                });
            }
        } else {
            Object.assign(_camera, Vector.add(_camera, _inputAction.lastDelta));
        }
    }

    function update() {
        updateFps(); // Just testing...

        _context.nodes.forEach((node) => {
            const { radius, anchor, body } = node;

            const diff = Vector.sub(anchor, body.position);

            //if (Vector.magnitude(diff) > radius * 1.5) {
                const vel = Vector.mult(diff, 1/1000);

                Body.applyForce(body, Vector.create(0, 0), vel);
            //}
        });

        // update physics
        _context.engine.world.gravity.x = 0;
        _context.engine.world.gravity.y = 0;
        
        Engine.update(_context.engine);
    }
    
    function render(ctx) {
		clear(ctx, { color: "#f0f0f0" });

        const draw = createRenderer(ctx, { camera: _camera });

		_context.lines.forEach(line => {
            drawLine(
				draw,
				line,
				_context.engine.world.bodies,
				line.parentType === "node" ? _context.nodes.get(line.parentId) : _context.pins.get(line.parentId), 
				line.childType === "node" ? _context.nodes.get(line.childId) : _context.pins.get(line.childId)
			);
        });
		
        // draw non-selected node(s)
        _context.nodes.forEach(node => {
            if (node !== _selectedNode) {
                drawNode(draw, node, false);
            }
        });

        // draw selected node(s)
        if (_selectedNode !== null) {
            drawNode(draw, _selectedNode, true);
        }

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
	
	if (parentAnchor.x < childAnchor.x) {
		anchors.parentAnchor.x = parentAnchor.x + MINDMAP_NODE_RADIUS;
		anchors.childAnchor.x = childAnchor.x - MINDMAP_NODE_RADIUS;
	}
	else if (parentAnchor.x > childAnchor.x) {
		anchors.parentAnchor.x = parentAnchor.x - MINDMAP_NODE_RADIUS;
		anchors.childAnchor.x = childAnchor.y + MINDMAP_NODE_RADIUS;
	}
	
	if (parentAnchor.y < childAnchor.y) {
		anchors.parentAnchor.y = parentAnchor.y + MINDMAP_NODE_RADIUS;
		anchors.childAnchor.y = childAnchor.y - MINDMAP_NODE_RADIUS;
	}
	else if (parentAnchor.y > childAnchor.y) {
		anchors.parentAnchor.y = parentAnchor.y - MINDMAP_NODE_RADIUS;
		anchors.childAnchor.y = childAnchor.y + MINDMAP_NODE_RADIUS;
	}
	
	return anchors;
}

function drawLine(draw, line, bodies, parentNode, childNode) {
	//const anchors = findAnchors(parentNode.anchor, childNode.anchor);
	if(!parentNode || !childNode) return;
	draw.curve(
		findPath(bodies, parentNode.body, childNode.body)
	);
}

function drawNode(draw, { type, imgURL, title, body, radius, hidden}, isSelected = false) {
    if (hidden) {
        return;
    }
    const { x, y } = body.position;

    // draw selection highlight
    if (isSelected) {
        draw.circle({x, y, r: radius + MINDMAP_NODE_HIGHLIGHT_MARGIN, color: "red"});
    }

    // draw node graphic
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

    // draw the title
    if (title.length > 10) {
        title = title.substring(0, 7);
		title += "...";
    }
    draw.text({text: title, x, y: y + radius * 2, baseline: "middle", align: "center"});
}