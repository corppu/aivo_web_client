import { Engine, World, Composite, Body, Bodies, Query, Vector } from "matter-js";

import { queryNodeAtPoint } from "./mindmap-canvas-physics";
import { updatePhysics, moveObject, trySelectObject, setEngine, delNode, updateNode, delPin, updatePin, delLine, updateLine, drawNodes, drawPins, drawLines, drawClusters, updateHulls } from "../utils/algorithm-utils";
import { isDoubleTap } from "../utils/input-utils";
import { clear, createRenderer, translateToCamera } from "../utils/canvas-utils";
import { flagHidden } from "../utils/node-utils";


import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_IMAGE,
    NODE_TYPE_TEXT,
	TYPE_NODE,
	TYPE_CLUSTER,
	TYPE_LINE,
	TYPE_NONE,
	TYPE_PIN
} from "../constants/types";

import {
	MINDMAP_PIN_RADIUS,
	MINDMAP_NODE_RADIUS,
    MINDMAP_NODE_HIGHLIGHT_MARGIN,
    MINDMAP_MODE_DEFAULT,
    MINDMAP_MODE_LINE_EDIT
} from "../constants/config";


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
	
    let _selectedNodeId = null;
	//let _selectedPin = null;
    //let _inputAction = null;

    let _actions = {
        createObject: null,
        updateObject: null,
		// moveObject: null,
		removeObject: null,
        openNode: null,
		//openNodeBoard: null
        updateSelection: null
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
	
    function updateProps( props ) {
        /*
        let t = 0;
        let t0 = performance.now();
        */

    	setEngine(_context.engine );
        _actions.createObject = props.tryCreateObject;
        _actions.updateObject = function(node, changes) {
             props.tryUpdateObject( Object.assign( { }, node, changes ) );
        };
	
        _actions.removeObject = props.tryRemoveObject;
		//_actions.moveObject = props.tryMoveObject;
        _actions.openNode = props.openNode;
		//_actions.openNodeBoard = props.openNodeBoard;

        _actions.updateSelection = props.updateSelection;
		
        let propsNodes = new Map( props.nodes );
		let propsLines = new Map( props.lines );
		let propsPins = new Map( props.pins );

        
        // match existing nodes to props (update old ones)
        _context.nodes.forEach( ( node, id ) => {

            let t0 = performance.now();

            const propsNode = propsNodes.get( id );

             if ( !propsNode ) {
                 const { body } = node;

                _context.nodes.delete( id );
                _context.bodyToNodeMapping.delete( body.id );
                World.remove( _context.engine.world, body );

				if( _selectedNodeId === id ) {
					setSelectedNode(null);
				}
				
				delNode( node );
				
                //console.log(`removed node ${id}`);
                return;
            }
            propsNodes.delete( id );
			
            let posChanged = true;
            if (node && node.lastPropsX && node.lastPropsY) {
                let dx = Math.abs(node.lastPropsX - propsNode.get("x"));
                let dy = Math.abs(node.lastPropsY - propsNode.get("y"));
                
                posChanged = dx > 0 || dy > 0;
            }

            Object.assign( node, {
				id,
				primaryType: propsNode.get( "primaryType" ),
                type: propsNode.get( "type" ),
                anchor: {
                    x: propsNode.get( "x" ),
                    y: propsNode.get( "y" )
                },
				x : propsNode.get( "x" ),
				y : propsNode.get( "y" ),
                lastPropsX : propsNode.get( "x" ),
				lastPropsY : propsNode.get( "y" ),
                title: propsNode.get( "title" ) || "",
                text: propsNode.get( "text" ) || "",
                imgURL: propsNode.get( "imgURL" ) || "",
                customColor: propsNode.get( "customColor" ) || null
            });
			
			var tempLines = propsNode.get( "lines" );
			if( tempLines ) {
				node.lines = tempLines.toObject();
			}
			
            

            if (posChanged) {
                updateNode(node);
            }
 
			//console.log("updated  -> " + node);
        } );



		// match existing lines to props (update old ones)
        _context.lines.forEach( ( line, id ) => {
            const propsLine = propsLines.get( id );

             if ( !propsLine ) {
                // const { body } = line;

                _context.lines.delete( id )
                // _context.bodyToNodeMapping.delete(body.id);
                // World.remove(_context.engine.world, body);

				delLine( line );
                //console.log(`removed line ${id}`);
                return;
            }
            propsLines.delete( id );

			//console.log("updated -> " + line);

            return Object.assign( line, {
				id,
				primaryType: propsLine.get( "primaryType" ),
				parentType: propsLine.get( "parentType" ),
				parentId: propsLine.get( "parentId" ),
				childType: propsLine.get( "childType" ),
				childId: propsLine.get( "childId" )
            } );
			
			updateLine( line );
        } );
		
		// match existing pins to props (update old ones)
        _context.pins.forEach( ( pin, id ) => {
            const propsPin = propsPins.get( id );

             if ( !propsPin ) {
                 const { body } = pin;

                _context.pins.delete( id )
                //_context.bodyToNodeMapping.delete(body.id);
                //World.remove(_context.engine.world, body);
				delPin( pin );
                //console.log(`removed pin ${id}`);
                return;
            }
            propsPins.delete( id );
			//		lines: {lineIdToPin: parentId}

            Object.assign( pin, {
				id,
				primaryType: propsPin.get( "primaryType" ),
				anchor: {
                    x: propsPin.get( "x" ),
                    y: propsPin.get( "y" )
                },
				x: propsPin.get( "x" ),
				y: propsPin.get( "y" )
            });
			var tempLines = propsPin.get( "lines" );
			if( tempLines ) {
				pin.lines = tempLines.toObject();
			}
			updatePin( pin );
			//console.log(pin);
        } );

        // add new nodes (were in props and not in state)
        propsNodes.forEach( ( propsNode, id ) => {
            const radius = MINDMAP_NODE_RADIUS;
            const anchor = {
                x: propsNode.get( "x" ),
                y: propsNode.get( "y" )
            };
            const body = Bodies.circle( anchor.x, anchor.y, radius, {
                frictionAir: 1,
                mass: 5
            } );
            const node = {
				id,
				primaryType : propsNode.get( "primaryType" ),
                type: propsNode.get( "type" ),
                title: propsNode.get( "title" ) || "",
                text: propsNode.get( "text" ) || "",
				imgURL: propsNode.get( "imgURL" ) || "",
                customColor: propsNode.get( "customColor" ) || null,
                radius,
				x: anchor.x,
				y: anchor.y,
                lastPropsX : propsNode.get( "x" ),
				lastPropsY : propsNode.get( "y" ),
                anchor,
                body
            };
			
			var tempLines = propsNode.get( "lines" );
			if( tempLines ) {
				node.lines = tempLines.toObject();
			}
			
			//console.log(node);
			
            _context.nodes.set( id, node );
            _context.bodyToNodeMapping[ body.id ] = node;
            World.add( _context.engine.world, body );
			node.clusterId = 1;

			updateNode( node );

            //console.log(`added node ${id}`);
        } )
		
		// add new Lines (were in props and not in state)
        propsLines.forEach( ( propsLine, id ) => {
			const line = {
				id,
				primaryType: propsLine.get( "primaryType" ),
				parentType: propsLine.get( "parentType" ),
				parentId: propsLine.get( "parentId" ),
				childType: propsLine.get( "childType" ),
				childId: propsLine.get( "childId" )
            };
			//console.log(line);
		    _context.lines.set( id, line );
		    updateLine( line );
		    //console.log(`added line ${id}`);
		} );

		
		
		// add new pins (were in props and not in state)
        propsPins.forEach( ( propsPin, id ) => {
            const radius = MINDMAP_PIN_RADIUS;
            const anchor = {
                x: propsPin.get("x"),
                y: propsPin.get("y")
            };
            const body = Bodies.circle( anchor.x, anchor.y, radius, {
                frictionAir: 1,
                mass: 5
            } );
            const pin = {
				id,
				primaryType: propsPin.get( "primaryType" ),
				x: anchor.x,
				y: anchor.y,
                radius,
                anchor,
                body
            };
			
			var tempLines = propsPin.get( "lines" );
			if ( tempLines ) {
				pin.lines = tempLines.toObject();
			}
            _context.pins.set( id, pin );
            //_context.bodyToNodeMapping[body.id] = node;
            //World.add(_context.engine.world, body);

			updatePin( pin );
            //console.log(`added pin ${id}`);
        } )
		
		
        // search filtering
        /*
        if ( props.searchFilter && props.searchFilter !== _searchFilter ) {
            _searchFilter = props.searchFilter;

            _context.nodes = flagHidden( _context.nodes, _searchFilter );
        }
        */

        updateHulls();

        /*
        let t1 = performance.now();
        t += t1-t0

        console.log(t);
        */
    }
	
    function onInputStart( action ) {
        const pos = translateToCamera( _camera, action.startPosition );

		// const pin = queryPinAtPoint( _context, pos );
		// if( pin ) {
			// return pin;
		// }
        // const node = queryNodeAtPoint( _context, pos );
        // return node ? node : null;
		return trySelectObject( pos );
    }

    function onInputEnd( action, prevAction ) {
        const pos = translateToCamera( _camera, action.endPosition );
        const hits = Query.point( _context.engine.world.bodies, pos );

		if ( hits.length > 0 ) {
             const node = _context.bodyToNodeMapping[ hits[ 0 ].id ];
             if ( action.totalDeltaMagnitude <= 10 ) {
                 if ( _selectedNodeId !== node.id ) {
                     setSelectedNode(node);
                 }
			 }
		}
		else if ( action.totalDeltaMagnitude <= 10 ) {
            if (isDoubleTap(action, prevAction)) {
                _actions.createObject({
                        primaryType: TYPE_NODE,
                        x: pos.x,
                        y: pos.y
                });
            }
            setSelectedNode(null);
		}
	}

    function setSelectedNode(node) {
        _selectedNodeId = node ? node.id : null;
        
        if (_actions.updateSelection) {
            const selection = node
                ? {
                    id: node.id,
                    primaryType: TYPE_NODE
                }
                : null;
            
            _actions.updateSelection(selection);
        }
    }
	

    function onInputMove( action ) {
        //const pos = translateToCamera( _camera, action.endPosition );

        if (action.data) { //&& action.data === _selectedNodeId) {
            if (_actions.updateObject && action.data.primaryType  && action.data.id ) {
				
				var objects = moveObject( action.data, action.lastDelta );
				for( var i = 0; i < objects.length; ++i ) {
					_actions.updateObject( objects[ i ] );
				}
			}
         }
		 else {
             Object.assign( _camera, Vector.add( _camera, action.lastDelta ) );
         }
    }

    function onLongPress( action ) {
        // ...
    }

    function update() {
        updateFps(); // Just testing...
		updatePhysics();
        // _context.nodes.forEach( ( node ) => {
            // const { radius, anchor, body } = node;

            // const diff = Vector.sub( anchor, body.position );

            // //if (Vector.magnitude(diff) > radius * 1.5) {
                // const vel = Vector.mult( diff, 1/1000 );

                // Body.applyForce( body, Vector.create( 0, 0 ), vel );
				// updateNode(node);
            // //}
        // } );

        // // update physics
        // _context.engine.world.gravity.x = 0;
        // _context.engine.world.gravity.y = 0;
        
        // Engine.update( _context.engine );
    }
    
    function render( ctx ) {
		clear( ctx, { color: "#e6e6ff" } );

		drawClusters( ctx, _camera );
		drawLines( ctx, _camera );
		drawNodes( ctx, _camera );
		drawPins( ctx, _camera );
		
        const draw = createRenderer( ctx, { camera: _camera } );

		
		
		// _context.lines.forEach( line => {
            // drawLine(
				// draw,
				// line,
				// _context.engine.world.bodies,
				// line.parentType === "node" ? _context.nodes.get( line.parentId ) : _context.pins.get( line.parentId ), 
				// line.childType === "node" ? _context.nodes.get( line.childId ) : _context.pins.get( line.childId )
			// );
        // } );
		
        // // draw non-selected node(s)
        // _context.nodes.forEach( node => {
            // if ( node.id !== _selectedNodeId ) {
                // drawNode( draw, node, false );
            // }
        // } );

		// // draw.curve(getHull());
		// var hull = getHull(1337);
		
		// for( var i = 1; i < hull.length; ++i ) {
			// draw.line(	{
				// start : {x: hull[i - 1][0], y: hull[i -1][1]},
				// end : {x: hull[i][0], y: hull[i][1]},
				// lineWidth : 10,
				// color : "#ff0000"} );
		// }
        // // draw selected node(s)
        // if ( _selectedNodeId !== null ) {
            // drawNode( draw, _context.nodes.get( _selectedNodeId ), true );
        // }

		drawFPS( draw, _fps );
    }

    return {
        updateProps,
        onInputStart,
        onInputEnd,
        onInputMove,
        onLongPress,
        update,
        render
    };
}

function drawFPS( draw, fps ) {
    draw.text( {
        text: fps,
        x: 5,
        y: 5,
        baseline: "hanging",
        ignoreCamera: true
    } );
}

function drawLine( draw, line, bodies, parentNode, childNode ) {
	//const anchors = findAnchors(parentNode.anchor, childNode.anchor);
	if( !parentNode || !childNode ) return;
	draw.curve(
		findPath( bodies, parentNode.body, childNode.body )
	);
}

function drawNode( draw, { type, title, imgURL, customColor, body, radius, hidden }, isSelected = false ) {
    if ( hidden ) {
        return;
    }
    const { x, y } = body.position;

    // draw selection highlight
    if ( isSelected ) {
        draw.circle( { x, y, r: radius + MINDMAP_NODE_HIGHLIGHT_MARGIN, color: "red" } );
    }

    // draw node graphic
    switch ( type ) {
    case NODE_TYPE_TEXT:
        draw.circle( { x, y, r: radius,
                color: customColor || "#080", strokeColor: "black", strokeWidth: 2 } );
        break;
    
    case NODE_TYPE_IMAGE:
        draw.circle( { x, y, r: radius,
                color: "#088", imageURL: imgURL, strokeColor: "black", strokeWidth: 2 } );
        break;

    default:
        draw.circle( { x, y, r: radius,
                color: customColor || "#888", strokeColor: "black", strokeWidth: 2 } );
        break;
    }

    // draw the title
    if ( title.length > 10 ) {
        title = title.substring( 0, 7 );
		title += "...";
    }
    draw.text( { text: title, x, y: y + radius * 2, baseline: "middle", align: "center" } );
}
