import { Engine, World, Composite, Body, Bodies, Query, Vector } from "matter-js";

import { queryNodeAtPoint } from "./mindmap-canvas-physics";
import { init, buildPath, buildCluster, onNodeMove, onNodeRemove } from "../utils/algorithm-utils";

import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_IMAGE,
    NODE_TYPE_TEXT,
	NODE_TYPE_CLUSTER,
	TYPE_NODE,
	TYPE_LINE,
	TYPE_NONE,
	TYPE_PIN,
	TYPE_CLUSTER
} from "../constants/types";

import {
	MINDMAP_PIN_RADIUS,
	MINDMAP_NODE_RADIUS,
    MINDMAP_NODE_HIGHLIGHT_MARGIN,
    MINDMAP_MODE_DEFAULT,
    MINDMAP_MODE_LINE_EDIT
} from "../constants/config";

import { clear, createRenderer, translateToCamera } from "../utils/canvas-utils";
import { flagHidden } from "../utils/node-utils";

export default function() {
    let _context = {
        engine: Engine.create(),
		clusterNodes: new Map(),
        nodes: new Map(),
        lines: new Map(),
		pins: new Map(),
        bodyToNodeMapping: new Map(),  
    };
    let _camera ={
        x: 0,
        y: 0
    };
	
	let _selectedType = null;
    let _selectedId = null;
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
	
	function initProps( props ) {
		_actions.createObject = props.tryCreateObject;
		_actions.updateObject = props.tryUpdateObject;
        _actions.removeObject = props.tryRemoveObject;
		_actions.openNode = props.openNode;

		new Map( props.nodes ).forEach( ( propsNode, id ) => {
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
                radius,
				x: anchor.x,
				y: anchor.y,
                anchor,
                body
            };
			
			var tempLines = propsNode.get( "lines" );
			if( tempLines ) {
				node.lines = tempLines.toObject();
			} else {
				node.lines = { };
			}
			
            _context.nodes.set( id, node );
			if( node.type === NODE_TYPE_CLUSTER ) {
				_context.clusterNodes.set( id, node );
			}
            _context.bodyToNodeMapping[ body.id ] = node;
			
            World.add( _context.engine.world, body );		
		} );
		
		
		new Map( props.pins ).forEach( ( propsPin, id ) => {
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
			} else {
				pin.lines = { };
			}
            _context.pins.set( id, pin );
        } );
		
		
		new Map( props.lines ).forEach( ( propsLine, id ) => {
			const line = {
				id,
				primaryType: propsLine.get( "primaryType" ),
				parentType: propsLine.get( "parentType" ),
				parentId: propsLine.get( "parentId" ),
				childType: propsLine.get( "childType" ),
				childId: propsLine.get( "childId" )
            };
			
		   _context.lines.set( id, line );
		} );
		
		init( _context.engine.world.bodies, _context.nodes, _context.clusterNodes, _context.pins, _context.lines );
	}
	
    function updateProps( props ) {
        _actions.createObject = props.tryCreateObject;
        _actions.updateObject = props.tryUpdateObject;
        _actions.removeObject = props.tryRemoveObject;
		//_actions.moveObject = props.tryMoveObject;
        _actions.openNode = props.openNode;
		//_actions.openNodeBoard = props.openNodeBoard;

        _actions.updateSelection = props.updateSelection;
		
        let propsNodes = new Map( props.nodes );
		let propsLines = new Map( props.lines );
		let propsPins = new Map( props.pins );



		// match existing lines to props (update old ones)
        _context.lines.forEach( ( line, id ) => {
            const propsLine = propsLines.get( id );

             if ( !propsLine ) {
                // const { body } = line;

                _context.lines.delete( id )
                // _context.bodyToNodeMapping.delete(body.id);
                // World.remove(_context.engine.world, body);

                //console.log(`removed line ${id}`);
                return;
            }
            propsLines.delete( id );

			//console.log("updated -> " + line);

            Object.assign( line, {
				id,
				primaryType: propsLine.get( "primaryType" ),
				parentType: propsLine.get( "parentType" ),
				parentId: propsLine.get( "parentId" ),
				childType: propsLine.get( "childType" ),
				childId: propsLine.get( "childId" )
            } );
			buildPath( line );
			return line;
        } );
		
        // match existing nodes to props (update old ones)
        _context.nodes.forEach( ( node, id ) => {
            const propsNode = propsNodes.get( id );

             if ( !propsNode ) {
                 const { body } = node;

				 onNodeRemove( node );
                _context.nodes.delete( id );
				if( node.type === NODE_TYPE_CLUSTER ) {
					_context.clusterNodes.delete( id );
				}
                _context.bodyToNodeMapping.delete( body.id );
				
				
				World.remove( _context.engine.world, body );

				if( _selectedId === id && _selectedType === TYPE_NODE ) {
					setSelectedNode(null);
				}
				
                //console.log(`removed node ${id}`);
                return;
            }
            propsNodes.delete( id );
			
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
                title: propsNode.get( "title" ) || "",
                text: propsNode.get( "text" ) || "",
                imgURL: propsNode.get( "imgURL" ) || "",
            });
			
			
			var tempLines = propsNode.get( "lines" );
			if( tempLines ) {
				node.lines = tempLines.toObject();
				//console.log( node.lines );
			} else {
				node.lines = { };
			}
			
			_context.clusterNodes.set( id, node );
			onNodeMove( node );
			//console.log("updated  -> " + node);
        } );

		// match existing pins to props (update old ones)
        _context.pins.forEach( ( pin, id ) => {
            const propsPin = propsPins.get( id );

             if ( !propsPin ) {
                 const { body } = pin;

                _context.pins.delete( id )
                //_context.bodyToNodeMapping.delete(body.id);
                //World.remove(_context.engine.world, body);

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
				//console.log( pin.lines );
			}
			else {
				pin.lines = { };
			}
			
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
                radius,
				x: anchor.x,
				y: anchor.y,
                anchor,
                body
            };
			
			var tempLines = propsNode.get( "lines" );
			if( tempLines ) {
				node.lines = tempLines.toObject();
			} else {
				node.lines = { };
			}
			
			//console.log(node);
			//console.log(node);
			
			
            _context.nodes.set( id, node );
			if( node.type === NODE_TYPE_CLUSTER ) {
				_context.clusterNodes.set( id, node );
			}
            _context.bodyToNodeMapping[ body.id ] = node;
			
            World.add( _context.engine.world, body );

			onNodeMove( node );
			if( node.type === NODE_TYPE_CLUSTER ) {
				buildCluster( node );
			}
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
		   buildPath( line );
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
			else {
				pin.lines = { };
			}
            _context.pins.set( id, pin );
            //_context.bodyToNodeMapping[body.id] = node;
            //World.add(_context.engine.world, body);

            //console.log(`added pin ${id}`);
        } )
		
		
        // search filtering
        if ( props.searchFilter && props.searchFilter !== _searchFilter ) {
            _searchFilter = props.searchFilter;

            _context.nodes = flagHidden( _context.nodes, _searchFilter );
        }
    }
	
    function onInputStart( action ) {
        const pos = translateToCamera( _camera, action.startPosition );

        const node = queryNodeAtPoint( _context, pos );
        return node ? node.id : null;
    }

    function onInputEnd( action ) {
        const pos = translateToCamera( _camera, action.endPosition );
        const hits = Query.point( _context.engine.world.bodies, pos );

		if ( hits.length > 0 ) {
             const node = _context.bodyToNodeMapping[ hits[ 0 ].id ];
             if ( action.totalDeltaMagnitude <= 10 ) {
                 if ( _selectedId !== node.id ) {
                     setSelectedNode(node);
                 }
				 else {
					 _actions.removeObject( node.primaryType, node.id );
					 setSelectedNode(null);
				 }
			 }
		}
		else if ( action.totalDeltaMagnitude <= 10 ) {
			if(_selectedId && _selectedType === TYPE_NODE ) {
				_actions.createObject( { primaryType: TYPE_NODE, type: NODE_TYPE_CLUSTER, x: pos.x, y: pos.y },  _context.nodes.get( _selectedId ) );
			}
		}
	}

    function setSelectedNode(node) {
        _selectedId = node ? node.id : null;
		
        if (_actions.updateSelection) {
            const selection = node
                ? {
                    id: node.id,
                    primaryType: TYPE_NODE
                }
                : null;
            
           // _actions.updateSelection(selection);
        }
		
		if( _selectedId ) {
			_selectedType = TYPE_NODE;
		}
		else {
			_selectedType = null;
		}
    }
	
	function setSelectedCluster(cluster) {
		_selectedId = cluster ? cluster.id : null;
		
		 if (_actions.updateSelection) {
            const selection = cluster
                ? {
                    id: cluster.id,
                    primaryType: TYPE_CLUSTER
                }
                : null;
            
            // _actions.updateSelection(selection);
        }
		
		if( _selectedId ) {
			_selectedType = TYPE_CLUSTER;
		}
		else {
			_selectedType = null;
		}
	}
	
	function setSelectedPin(pin) {
		_selectedId = pin ? pin.id : null;

		if (_actions.updateSelection) {
            const selection = pin
                ? {
                    id: pin.id,
                    primaryType: TYPE_PIN
                }
                : null;
            
            // _actions.updateSelection(selection);
        }
		
		if( _selectedId ) {
			_selectedType = TYPE_PIN;
		}
		else {
			_selectedType = null;
		}	
	}

    function onInputMove( action ) {
        const pos = translateToCamera( _camera, action.endPosition );

        if ( action.data ) {

            // REFACTOR TO WORK WITH NODE ID

            // if ( _actions.updateObject ) {
				// action.data.x = pos.x;
				// action.data.y = pos.y;
				// //console.log(action.data);
			   // _actions.updateObject( action.data );
			// }
         }
		 else {
             Object.assign( _camera, Vector.add( _camera, action.lastDelta ) );
         }
    }

    function onLongPress( action ) {
	    const pos = translateToCamera( _camera, action.endPosition );

        // _actions.createObject( { primaryType: TYPE_NODE, x: pos.x, y: pos.y } );
    }

    function update() {
        updateFps(); // Just testing...

        _context.nodes.forEach( ( node ) => {
            const { radius, anchor, body } = node;

            const diff = Vector.sub( anchor, body.position );

            //if (Vector.magnitude(diff) > radius * 1.5) {
                const vel = Vector.mult( diff, 1/1000 );

                Body.applyForce( body, Vector.create( 0, 0 ), vel );
            //}
        } );

        // update physics
        _context.engine.world.gravity.x = 0;
        _context.engine.world.gravity.y = 0;
        
        Engine.update( _context.engine );
    }
    
    function render( ctx ) {
		clear( ctx, { color: "#f0f0f0" } );

        const draw = createRenderer( ctx, { camera: _camera } );

		_context.clusterNodes.forEach( clusterNode => {

			draw.circle( {
				x: clusterNode.body.position.x,
				y: clusterNode.body.position.y,
				r: clusterNode.radius * 1.25 + MINDMAP_NODE_HIGHLIGHT_MARGIN, 
				color: "red" 
			} );
		
			if( clusterNode.members ) {	
				clusterNode.members.forEach( node => {
					node = _context.nodes.get( node );
					
					draw.circle( {
						x: node.body.position.x,
						y: node.body.position.y,
						r: node.radius * 1.25 + MINDMAP_NODE_HIGHLIGHT_MARGIN, 
						color: "red" 
					} );
				} );
			}
			
		} );
		
		_context.lines.forEach( line => {		
            draw.curve( line.path );
        } );
		
        // draw non-selected node(s)
        _context.nodes.forEach( node => {
            if ( node.id !== _selectedId ) {
                drawNode( draw, node, false );
            }
        } );

        // draw selected node(s)
        if ( _selectedId !== null ) {
            drawNode( draw, _context.nodes.get( _selectedId ), true );
        }

		drawFPS( draw, _fps );
    }

    return {
		initProps,
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
		// findPath( bodies, parentNode.body, childNode.body )
		line.path
	);
}

function drawNode( draw, { type, imgURL, title, body, radius, hidden }, isSelected = false ) {
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
                color: "#080", strokeColor: "black", strokeWidth: 2 } );
        break;
    
    case NODE_TYPE_IMAGE:
        draw.circle( { x, y, r: radius,
                color: "#088", imageURL: imgURL, strokeColor: "black", strokeWidth: 2 } );
        break;

    default:
        draw.circle( { x, y, r: radius,
                color: "#888", strokeColor: "black", strokeWidth: 2 } );
        break;
    }

    // draw the title
    if ( title.length > 10 ) {
        title = title.substring( 0, 7 );
		title += "...";
    }
    draw.text( { text: title, x, y: y + radius * 2, baseline: "middle", align: "center" } );
}
