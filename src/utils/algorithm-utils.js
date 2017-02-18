import { Bounds, Query, Vector } from "matter-js";

const DIVIDER_WIDTH = 40;
import {
	NODE_TYPE_CLUSTER,
	TYPE_NODE,
	TYPE_PIN
} from "../constants/types";

let _idCounter = 0;
let _bodies = null;
let _nodes = null;
let _clusterNodes = null;
let _pins = null;
let _lines = null;

/** 
	bodies from matter-js world,
	nodes mapped as [ node.id, node ],
	clusterNodes mapped as [ node.id, node ]
	pins mapped as [ pin.id, pin ],
	lines mapped as [ line.id, line ]
**/

export function init( bodies, nodes, clusterNodes, pins, lines ) {
	_bodies = bodies;
	_nodes = nodes;
	_clusterNodes = clusterNodes;
	_pins = pins;
	_lines = lines;
	
	// Build clusters
	for( var clusterNode of _clusterNodes ) {
		if( clusterNode.clusterNode.id !== clusterNode.id ) {
			buildCluster( clusterNode[ 1 ] );
		}
	}

	// Build paths
	for( var line of _lines ) {
		buildPath( line[ 1 ] );
	}
}

export function buildCluster( clusterNode, visited = null, parentNode = null ) {
	if( !clusterNode || !_nodes ) {
		console.warn("clusterNode or nodes are invalid");
		return;
	}
	
	const MAX_LINE_WIDTH = 30;
	
	if( !parentNode ) {
		parentNode = clusterNode;
		if( !clusterNode.members ) {
			clusterNode.members = new Set();
		}
	}
	
	if( !parentNode.children ) {
		parentNode.children = new Set();
	}
	
	if( !visited ) {
		visited = new Set();
		visited.add( clusterNode.id );
	}
	
	for ( var node of _nodes ) {
		node = node[ 1 ];
		
		if( visited.has( node.id ) ) {
			continue;
		} else {
			visited.add( node.id );
		}
		
		if( boundsDistance( parentNode.body.bounds, node.body.bounds ) <= MAX_LINE_WIDTH ) {
			parentNode.children.add( node.id );
			node.parent = parentNode.id;
			clusterNode.members.add( node.id );
			node.clusterNode = clusterNode;
		}
	}
}


export function buildPath( line ) {
	
	var parent = line.parentType === TYPE_NODE 	? _nodes.get( line.parentId ) 
													: _pins.get( line.parentId );
	var child = line.childType === TYPE_NODE 	? _nodes.get( line.childId ) 
													: _pins.get( line.childId );
	
	if( parent && child ) {
		line.path = findPath( parent.body, child.body );
	}
	else {
		line.path = [];
	}
}



export function onNodeMove( nodeA ) {	
	var nodeBoundsA = nodeA.body.bounds;
	var nodeBoundsB = null;
	
	for ( var nodeB of _nodes ) {
		
		nodeB = nodeB[ 1 ];
		
		if( nodeA.body.id === nodeB.body.id ) {
			continue;
		}
		
		// Vertaillaan kahta eri nodea A ja B
		
		if( ( ( nodeB.clusterNode && nodeA.clusterNode ) && ( nodeB.clusterNode.id !== nodeA.clusterNode.id ) ) || ( nodeB.clusterNode || nodeA.clusterNode ) ) {
			// Tilanne, jossa vähintään toinen node A tai B kuuluu klusteriin...
			nodeBoundsB = {
				max : {
					x: nodeB.body.bounds.max.x + DIVIDER_WIDTH, 
					y: nodeB.body.bounds.max.y + DIVIDER_WIDTH
				},
				
				min: {
					x: nodeB.body.bounds.min.x - DIVIDER_WIDTH,
					y: nodeB.body.bounds.min.y - DIVIDER_WIDTH
				}
			};
		
			if( Bounds.overlaps( nodeBoundsA, nodeBoundsB ) ) {
				// Tarkastellaan nodejen A ja B törmäystä...
				var clusterNodeA = nodeA.clusterNode; // ? nodes.get( nodeA.clusterNodeId ) : null;
				var clusterNodeB =  nodeB.clusterNode; // ? nodes.get( nodeB.clusterNodeId ) : null;
				
				
				if( clusterNodeA && clusterNodeB ) {
					// Tarkastellaan tilannetta, jossa molemmat nodet, A ja B, kuuluvat jo klusteriin...
					if( clusterNodeA.children.size > clusterNodeB.children.size ) {
						clusterNodeA.clusterNode = clusterNodeB;
					}
					else {
						clusterNodeB.clusterNode = clusterNodeA;
					}
				}
				
				// Tarkastellaan tilannetta, jossa nodeB ei kuulu klusteriin...
				else if( clusterNodeA ) {
					nodeB.clusterNode = clusterNodeA;
				}
				
				// Tarkastellaan tilannetta, jossa nodeA ei kuulu klusteriin...
				else {
					nodeA.clusterNode = clusterNodeB;
				}
			}
		}
	}
	
	for( var line of _lines ) {
		buildPath( line[ 1 ] );
	}
}

export function onNodeRemove( node ) {
	
	if( node.parent ) {
		_nodes.get( node.parent ).children.delete( node.id );
	}
	if ( node.children ) {
		node.children.forEach( child => {
			_nodes.get( child ).parent = null;
		} );
	}
	
	if(node.clusterNode) {
		node.clusterNode.members.delete( node.id );
	}
}

function centerX(bounds) {
	return bounds.min.x + (bounds.max.x - bounds.min.x) / 2;
}

function centerY(bounds) {
	return bounds.min.y + (bounds.max.y - bounds.min.y) / 2;
}

function vecDistance(startPoint, endPoint) {
	return Math.hypot(
		(startPoint.x - endPoint.x),
		(startPoint.y - endPoint.y)
	);
}

function vecDistanceToBounds(startPoint, endBounds) {
	
}

function pointDistance(sx, sy, ex, ey) {
	return Math.hypot(
		(sx - ex),
		(sy - ey)
	);
}

/* // TODO: start using these to reduce code size...
function boundsAlignment( startBounds, endBounds ) {
	return {
		angle: boundsAngle( startBounds, endBounds ),
		left : endBounds.max.x < startBounds.min.x,
		right : startBounds.max.x < endBounds.min.x,
		top : endBounds.max.y < startBounds.min.y,
		bottom : startBounds.max.y < endBounds.min.y
	};
}

function pointAlignment( startPoint, endPoint ) {
	return {
		angle : Vector.angle( startPoint, endPoint ),
		left: endPoint.x < startPoint.x,
		right: startPoint.x < endPoint.x,
		top: endPoint.y < startPoint.y,
		bottom: startPoint.y < endPoint.y
	};
}

function boundsAngle( startBounds, endBounds ) {
	var startPoint = Vector.create(
		centerX(startBounds),
		centerY(startBounds)
	);
	
	var endPoint = Vector.create(
		centerX(endBounds),
		centerY(endBounds)
	);
	
	return Vector.angle(startPoint, endPoint);
}
*/ // TODO:start using these to decrease code size...

function boundsDistance(startBounds, endBounds) {
	var left = endBounds.max.x < startBounds.min.x;
	var right = startBounds.max.x < endBounds.min.x;
	var top = endBounds.max.y < startBounds.min.y;
	var bottom = startBounds.max.y < endBounds.min.y;
	
	if(top && left) {
		return vecDistance(startBounds.min, endBounds.max);
	}
	
	else if(top && right) {
		return pointDistance(startBounds.max.x, startBounds.max.y, endBounds.min.x, endBounds.max.y);
	}
	
	else if(top) {
		return startBounds.max.y - endBounds.min.y;
	}
	
	else if(bottom && left) {
		return pointDistance(startBounds.min.x, startBounds.max.y, endBounds.max.x, endBounds.min.y);
	}
	
	else if(bottom && right) {
		return vecDistance(startBounds.max, endBounds.min);
	}
	
	else if(bottom) {
		return endBounds.min.y - startBounds.max.y;
	}
	
	else if(right) {
		return endBounds.min.x - startBounds.max.x;
	}
	
	else if(left) {
		return startBounds.min.x - endBounds.max.x;
	}
	
	return 0;
}

function compareCollisionsToBounds( startBounds ) {
	return function (collisionA, collisionB) {
		var distA = boundsDistance(startBounds, collisionA.body.bounds);
		var distB = boundsDistance(startBounds, collisionB.body.bounds);
		
		if(distA < distB) 
			return -1;
		
		if(distB < distA) 
			return 1;
		
		return 0;
	}
}

function compareCollisionsToVector( startPoint ) {
	return function (collisionA, collisionB) {
		var distA = vecDistanceToBounds(startPoint, collisionA.body.bounds);
		var distB = vecDistanceToBounds(startPoint, collisionB.body.bounds);
		
		if(distA < distB) 
			return -1;
		
		if(distB < distA) 
			return 1;
		
		return 0;
	}
}

function halfWidth(bounds) {
	return (bounds.max.x - bounds.min.x) / 2;
}

function halfHeight(bounds) {
	return (bounds.max.y - bounds.min.y) / 2;
}

function findPath( startBody, endBody ) {
	var startPoint = Vector.create(
		centerX(startBody.bounds),
		centerY(startBody.bounds)
	);
	
	var endPoint = Vector.create(
		centerX(endBody.bounds),
		centerY(endBody.bounds)
	);
	
	var path = [ startPoint.x, startPoint.y ];

	
	// Add the body ids to set in order to avoid never ending loop...
	var bodyIdSet = new Set();
	bodyIdSet.add( startBody.id );
	bodyIdSet.add( endBody.id );
	
	findWayPoint( startBody.bounds, startPoint, endPoint, path, bodyIdSet );

	// Dirty curving the line...:
	if( path.length === 2 ) {
		
		var middlePoint = Vector.create(
			( endPoint.x + startPoint.x ) / 2,
			( endPoint.y + startPoint.y ) / 2
		);
		
		if( startPoint.x < endPoint.x ) {
			middlePoint.x += 40;
		}
		else {
			middlePoint.x -= 40;
		}
		
		if( startPoint.y < endPoint.y ) {
			middlePoint.y += 40;
		}
		else {
			middlePoint.y -= 40;
		}
		
		var oldPathLength = path.length;
		
		findWayPoint( startBody.bounds, startPoint, middlePoint, path, bodyIdSet );
		
		if( path.length === oldPathLength ) {
			findWayPoint( startBody.bounds, middlePoint, endPoint, path, bodyIdSet );
			if(path.length === oldPathLength) {
				path.push( middlePoint.x );
				path.push( middlePoint.y );
			}
		}
	}
	
	path.push( endPoint.x );
	path.push( endPoint.y );
	
	return path;
}


function findWayPoint( startBounds, startPoint, endPoint, path, bodyIdSet ) {
	
	var collisions = Query.ray( _bodies, startPoint, endPoint );
	collisions.sort( compareCollisionsToBounds( startBounds ) );
	
	var shortestPath = [ ];
	
	for( var i = 0; i < collisions.length; ++i ) {
		// Avoid change to itself and neverending collision
		if ( bodyIdSet.has( collisions[ i ].body.id ) )  {
			continue;
		} 
		
		// Choose the collided bounds
		var middleBounds = collisions[ i ].body.bounds;
		// Add the body id to set in order to avoid neverending loop
		bodyIdSet.add( collisions[ i ].body.id );
		
	
		var middlePoint = Vector.create(
			centerX( middleBounds ),
			centerY( middleBounds )
		);
		
		var testPath = [ ];

		// Dirty way around object...:
		// TODO: perhaps add more control points by following the tangent...
		var left = middlePoint.x < startPoint.x;
		var right = startPoint.x < middlePoint.x;
		var top = middlePoint.y < startPoint.y;
		var bottom = startPoint.y < middlePoint.y;
		
		if( top && left ) {
			middlePoint.y += halfHeight( middleBounds );
			middlePoint.x -= halfWidth( middleBounds );
		}
		
		else if( bottom && left ) {
			middlePoint.y += halfHeight( middleBounds );
			middlePoint.x += halfWidth( middleBounds );
		}
		
		else if ( top && right ) {
			middlePoint.y += halfHeight( middleBounds );
			middlePoint.x += halfWidth( middleBounds );
		}
		
		else if ( bottom && right ) {
			middlePoint.y += halfHeight( middleBounds );
			middlePoint.x -= halfWidth( middleBounds );
		}
		
		else if ( top ) {
			middlePoint.x -= halfWidth( middleBounds );
		}
		
		else if ( bottom ) {
			middlePoint.x -= halfWidth( middleBounds );
		}
		
		else if( right ) {
			middlePoint.y -= halfHeight( middleBounds );
		}
		
		else if( left ) {
			middlePoint.y -= halfHeight( middleBounds );
		}
		
		// Backward check hack :
		findWayPoint( startBounds, startPoint, middlePoint, path, bodyIdSet );
		
		// Do the push...
		path.push( middlePoint.x );
		path.push( middlePoint.y );
	
		// Forward check...
		var testPath = [ ];
		findWayPoint( startBounds, middlePoint, endPoint, testPath, bodyIdSet );
		
		if( testPath.length !== 0 && ( shortestPath.length === 0 || shortestPath.length > testPath.length ) ) {
			shortestPath = testPath;
		}
	}
	
	for( var i = 0; i < shortestPath.length; ++i ) {
		path.push( shortestPath[ i ] );
	}
}
