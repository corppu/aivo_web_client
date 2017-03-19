import { Engine, Bounds, Query, Vector, Vertices, Body, Bodies } from "matter-js";

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

var _nodes = new Map( );
var _pins = new Map( );
var _clusters = new Map( );
var _lines = new Map( );
var _bodies = null;
var _engine = null;

var _dirtyClusters = new Set( );

export function updatePhysics() {
	// _nodes.forEach( ( node ) => {
		// const { radius, anchor, body } = node;

		// const diff = Vector.sub( anchor, body.position );
		// if ( diff !== 0 ) {
			// const vel = Vector.mult( diff, 1/1000 );

			// Body.applyForce( body, Vector.create( 0, 0 ), vel );
			// //updateNode(node);
		// }
    // } );

	// // update physics
	// _engine.world.gravity.x = 0;
	// _engine.world.gravity.y = 0;
	
	// Engine.update( _engine );
}


export function moveObject( objectData, lastDelta ) {
	var object = null;
	
	var objects = [ ];
	var dx = lastDelta.x;
	var dy = lastDelta.y;
	
	switch( objectData.primaryType ) {	
		case TYPE_PIN:
			object = _pins.get( objectData.id );
			object.anchor.x += dx;
			object.anchor.y += dy;
			object.x -= dx;
			object.y -= dy;
			objects.push( object );
			break;
		
		case TYPE_NODE:
			object = _nodes.get( objectData.id );
			object.anchor.x -= dx;
			object.anchor.y -= dy;
			object.x -= dx;
			object.y -= dy;
			objects.push( object );
			break;

		case TYPE_CLUSTER:
			object = _clusters.get( objectData.id );
			
			for( var iter of object.vertices ) {
				var node = _nodes.get( iter[ 0 ] );
				node.anchor.x -= dx;
				node.anchor.y -= dy;
				node.x -= dx;
				node.y -= dy;
				objects.push( node );
			}
			
			break;
			
		default:
			break;
	}

	
	return objects;
}

// vertice: [{ x: 0, y: 0 }, { x: 25, y: 50 }, { x: 50, y: 0 }]

export function trySelectObject( point ) {
	var object;
	var iter;
	
	for( iter of _pins ) {
		object = iter[ 1 ];
		if( Vertices.contains( object.body.vertices, point ) ) {
			return {
				primaryType: object.primaryType,
				id: object.id
			}
		}
	}
	
	for( iter of _nodes ) {
		object = iter[ 1 ];
		if( Vertices.contains( object.body.vertices, point ) ) {
			return {
				primaryType: object.primaryType,
				id: object.id
			}
		}
	}
	
	for( iter of _clusters ) {
		object = iter[ 1 ];
		if( Vertices.contains( object.hull, point ) ) {
			return {
				primaryType: object.primaryType,
				id: object.id
			}
		}
	}
	
	return null;
}


export function setEngine( engine ) {
	_bodies = engine.world.bodies;
	_engine = engine;
}

export function drawClusters( ctx, camera ) {

	ctx.save();
	
	if ( ctx.setLineDash !== undefined )   ctx.setLineDash([30,10]);
	if ( ctx.mozDash !== undefined )       ctx.mozDash = [30,10];

	for( var cluster of _clusters ) {
		cluster = cluster[ 1 ];
		
		var firstVertex = null
		
		ctx.beginPath( );
		ctx.fillStyle = "#f2f2f2";
		
		for( var i = 0; i < cluster.hull.length; ++i ) {
			
			var vertex = cluster.hull[ i ];
			if( !firstVertex ) {
				ctx.moveTo( vertex.x - camera.x, vertex.y - camera.y );
				firstVertex = vertex;
				continue;
			}
			
			ctx.lineTo( vertex.x - camera.x, vertex.y - camera.y );
		}
	
		if( firstVertex ) {
			ctx.lineTo( firstVertex.x - camera.x, firstVertex.y - camera.y );
		}
		
		ctx.closePath( );
		ctx.fill( );
		
		ctx.strokeStyle = "black";
        ctx.lineWidth = 5;

        ctx.stroke();
	}
	
	ctx.restore();
}

export function drawLines( ctx, camera ) {
	ctx.save();
	for( var line of _lines ) {
		line = line[ 1 ];
		if( line.path ) {
			curve( ctx, camera, line.path );
		}
	}
	ctx.restore();
}

export function drawNodes( ctx, camera ) {
	ctx.save();
	for( var node of _nodes ) {
		node = node[ 1 ];
		
		ctx.beginPath( );
		ctx.fillStyle = "#666666";
		
        ctx.arc( node.body.position.x - camera.x, node.body.position.y - camera.y, node.radius, 0, 2 * Math.PI );
        
		ctx.closePath();
		ctx.fill( );
		
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
		if ( ctx.setLineDash !== undefined )   ctx.setLineDash([30,10]);
		if ( ctx.mozDash !== undefined )       ctx.mozDash = [30,10];


        ctx.stroke();
	}
	ctx.restore();
}


export function drawPins( ctx, camera ) {
	ctx.save();
	for( var pin of _pins ) {
		pin = pin[ 1 ];
		
		ctx.beginPath( );
		ctx.fillStyle = pin.color || "black";
		
        ctx.arc( pin.body.position.x - camera.x, pin.body.position.y - camera.y, pin.radius, 0, 2 * Math.PI );
        
		ctx.closePath();
		ctx.fill( );
		
		ctx.strokeStyle = "red";
        ctx.lineWidth = 10;
        ctx.stroke();
	}
	ctx.restore();
}

export function updateHulls() {
	_dirtyClusters.forEach(cluster => {
		updateHull( cluster );
	});
	_dirtyClusters.clear();
}

function updateHull( cluster ) {
		
	var vertices = [ ];
	for( var verIter of cluster.vertices ) {
		const vs = verIter[ 1 ];
		const point = Vertices.centre( vs );

		const limit = vs.length;
		const skip = 2;

		for( var i = 0; i < limit; i += skip ) {
			var vertex = Object.assign( { }, verIter[ 1 ][ i ] );
			var delta = Vector.sub( vertex, point );
			vertex.x = point.x + delta.x * 6;
			vertex.y = point.y + delta.y * 6;
			vertices.push( vertex );
		}
	}

	cluster.hull = Vertices.hull( vertices );
}

function setToCluster( node ) {
	var cluster = _clusters.get( node.clusterId );

	if( !cluster ) {
		cluster = {
			primaryType: TYPE_CLUSTER,
			id: node.clusterId,
			vertices: new Map( )
		};
		_clusters.set( node.clusterId, cluster );
	}

	cluster.vertices.set( node.id, node.body.vertices );
	
	//updateHull( cluster );

	_dirtyClusters.add( cluster );
}

function delFromCluster( node ) {
	var cluster = _clusters.get( node.clusterId );
	if( cluster && cluster.vertices ) {
		cluster.vertices.delete( node.id );
		
		if( cluster.size === 0 ) {
			_clusters.delete( node.clusterId );
		} else {
			//updateHull( cluster );

			_dirtyClusters.add( cluster );
		}
	}
}


export function updateLinePaths( ) {

	for( var line of _lines ) {
		line = line[ 1 ];
		
		var parent = line.parentType === "node" ? _nodes.get( line.parentId ) : _pins.get( line.parentId );
		if( !parent ) {
			return;
		}
		
		var child = line.childType === "node" ? _nodes.get( line.childId ) : _pins.get( line.childId );
		if( !child ) {
			return;
		}
		
		line.path = findPath( _bodies, parent.body, child.body );
	}
}




export function updateNode( node ) {
	const translation = Vector.sub( node.anchor, node.body.position );
	Body.translate( node.body, translation );
	var oldNode = _nodes.get( node.id );
	_nodes.set( node.id, node );

	if( oldNode && oldNode.clusterId && !node.clusterId ) {
		delFromCluster( oldNode );
	}
	
	if( node.clusterId ) {
		setToCluster( node );
	}
	
	updateLinePaths( );
}


export function delNode( node ) {
	var oldNode = _nodes.get( node.id );	
	_nodes.delete( node.id );
	
	if( oldNode.clusterId ) {
		delFromCluster( oldNode );
	}
	
	updateLinePaths( );
}

export function updatePin( pin ) {
	const translation = Vector.sub( pin.anchor, pin.body.position );
	Body.translate( pin.body, translation );
	_pins.set( pin.id, pin );
	updateLinePaths( );
}

export function delPin( pin ) {	
	_pins.delete( pin.id )
	updateLinePaths( );
}

export function updateLine( line ) {
	_lines.set( line.id, line );
	updateLinePaths( );
}

export function delLine( line ) {
	_lines.delete( line.id );
}

export function updateCluster( cluster ) {
	var current = _clusters.get( cluster.id );
	
	if( current ) {
		Object.assign( current, cluster );
	}
	else {
		cluster.vertices = new Map( );
		_clusters.set( cluster.id, cluster );
	}
}


export function nodes( ) {
	return _nodes;
}

export function pins( ) {
	return _pins;
}

export function clusters( ) {
	return _clusters;
}

export function lines( ) {
	return _lines;
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

function compareCollisionsTo( startBounds ) {
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

function halfWidth(bounds) {
	return (bounds.max.x - bounds.min.x) / 2;
}

function halfHeight(bounds) {
	return (bounds.max.y - bounds.min.y) / 2;
}

export function findPath( bodies, startBody, endBody ) {
	
	// var startPoint = Vector.create(
		// centerX(startBody.bounds),
		// centerY(startBody.bounds)
	// );
	
	// var endPoint = Vector.create(
		// centerX(endBody.bounds),
		// centerY(endBody.bounds)
	// );

	var startPoint = startBody.position;
	var endPoint = endBody.position;
	
	var path = [ startPoint.x, startPoint.y ];

	
	// Add the body ids to set in order to avoid never ending loop...
	var bodyIdSet = new Set();
	bodyIdSet.add( startBody.id );
	bodyIdSet.add( endBody.id );
	
	findWayPoint( bodies, startBody.bounds, startPoint, endPoint, path, bodyIdSet );

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
		
		findWayPoint( bodies, startBody.bounds, startPoint, middlePoint, path, bodyIdSet );
		
		if( path.length === oldPathLength ) {
			findWayPoint( bodies, startBody.bounds, middlePoint, endPoint, path, bodyIdSet );
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


function findWayPoint( bodies, startBounds, startPoint, endPoint, path, bodyIdSet ) {
	
	var collisions = Query.ray( bodies, startPoint, endPoint );
	collisions.sort( compareCollisionsTo( startBounds ) );
	
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
		findWayPoint( bodies, startBounds, startPoint, middlePoint, path, bodyIdSet );
		
		// Do the push...
		path.push( middlePoint.x );
		path.push( middlePoint.y );
	
		// Forward check...
		var testPath = [ ];
		findWayPoint( bodies, startBounds, middlePoint, endPoint, testPath, bodyIdSet );
		
		if( testPath.length !== 0 && ( shortestPath.length === 0 || shortestPath.length > testPath.length ) ) {
			shortestPath = testPath;
		}
	}
	
	for( var i = 0; i < shortestPath.length; ++i ) {
		path.push( shortestPath[ i ] );
	}
}





// var graph = [
  // {
    // weight: 1,
    // poly: [
      // { x: 10, y: 10 },
      // { x: 40, y: 10 },
      // { x: 40, y: 40 },
      // { x: 10, y: 40 }
    // ],
    // neighbours: [1]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 40, y: 10 },
      // { x: 100, y: 10 },
      // { x: 100, y: 40 },
      // { x: 40, y: 40 }
    // ],
    // neighbours: [0,2]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 100, y: 10 },
      // { x: 130, y: 10 },
      // { x: 130, y: 40 },
      // { x: 100, y: 40 }
    // ],
    // neighbours: [1,3,6]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 100, y: 40 },
      // { x: 130, y: 40 },
      // { x: 130, y: 70 },
      // { x: 100, y: 70 }
    // ],
    // neighbours: [2,4]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 100, y: 70 },
      // { x: 130, y: 70 },
      // { x: 130, y: 100 },
      // { x: 100, y: 100 }
    // ], 
    // neighbours: [3,5]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 130, y: 70 },
      // { x: 160, y: 70 },
      // { x: 160, y: 100 },
      // { x: 130, y: 100 }
    // ],
    // neighbours: [4,9]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 130, y: 10 },
      // { x: 160, y: 10 },
      // { x: 160, y: 40 },
      // { x: 130, y: 40 }
    // ],
    // neighbours: [2,7]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 160, y: 10 },
      // { x: 190, y: 10 },
      // { x: 190, y: 40 },
      // { x: 160, y: 40 }
    // ],
    // neighbours: [6,8]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 160, y: 40 },
      // { x: 190, y: 40 },
      // { x: 190, y: 70 },
      // { x: 160, y: 70 }
    // ],
    // neighbours: [7,9]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 160, y: 70 },
      // { x: 190, y: 70 },
      // { x: 190, y: 100 },
      // { x: 160, y: 100 }
    // ],
    // neighbours: [5,8,10]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 190, y: 70 },
      // { x: 220, y: 70 },
      // { x: 220, y: 100 },
      // { x: 190, y: 100 }
    // ],
    // neighbours: [9,11]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 220, y: 70 },
      // { x: 250, y: 70 },
      // { x: 250, y: 100 },
      // { x: 220, y: 100 }
    // ],
    // neighbours: [10,12]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 220, y: 100 },
      // { x: 250, y: 100 },
      // { x: 250, y: 130 },
      // { x: 220, y: 130 }
    // ],
    // neighbours: [11,13]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 220, y: 130 },
      // { x: 250, y: 130 },
      // { x: 300, y: 160 },
      // { x: 200, y: 160 }
    // ],
    // neighbours: [12,14]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 200, y: 160 },
      // { x: 300, y: 160 },
      // { x: 300, y: 200 },
      // { x: 200, y: 200 }
    // ],
    // neighbours: [13,15]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 200, y: 200 },
      // { x: 300, y: 200 },
      // { x: 250, y: 300 }
    // ],
    // neighbours: [14,16,17]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 300, y: 200 },
      // { x: 350, y: 200 },
      // { x: 400, y: 250 },
      // { x: 350, y: 300 },
      // { x: 250, y: 300 }
    // ],
    // neighbours: [15]
  // }, {
    // weight: 1,
    // poly: [
      // { x: 200, y: 200 },
      // { x: 250, y: 300 },
      // { x: 200, y: 300 },
      // { x: 150, y: 250 }
    // ],
    // neighbours: [15]
  // }
// ];




// function heuristic(dx,dy) {
  // return Math.sqrt(dx * dx + dy * dy);
// }




// function findPath(start, end, graph) {
  
  // var closedSet = [];
  // var openSet = [start];
  // var path = [];
  // var current = -1;
  
  // if (start === -1 || end === -1) {
    // return path;
  // }
  
  // var hScores = {};
  // var gScores = {}, gScore;
  // gScore = 0;
  // gScores[start] = 0;
  
  // var fScores = {};
  // hScores[start] = heuristic(
    // Math.abs(centerPoly(graph[start].poly).x - centerPoly(graph[end].poly).x),
    // Math.abs(centerPoly(graph[start].poly).y - centerPoly(graph[end].poly).y)
  // );
  // fScores[start] = gScores[start] + hScores[start];
  
  // var i;
  // while (openSet.length > 0) {
    
    // if (openSet.length === 1) {
      
      // current = openSet.pop();
      
    // } else {
      
      // var fScore = Number.MAX_VALUE, min = 0;
      // for (i = 0; i < openSet.length; i++) {
        
        // current = openSet[i];
        // if (current in fScores) {
          
          // fScore = Math.min(fScores[current],fScore);
          // if (fScore === fScores[current]) {
            // min = i;
          // }
          
        // } else {
          
          // if (!(current in hScores)) {
            // hScores[current] = heuristic(
              // Math.abs(centerPoly(graph[current].poly).x - centerPoly(graph[end].poly).x),
              // Math.abs(centerPoly(graph[current].poly).y - centerPoly(graph[end].poly).y)
            // );
          // }

          // fScores[current] = gScores[current] + hScores[current];
          // fScore = Math.min(fScores[current],fScore);
          // if (fScore === fScores[current]) {
            // min = i;
          // }
          
        // }
        
      // }
      
      // var removed = openSet.splice(min,1);
      // current = removed[0];
      
    // }
    
    // //current = openSet.pop();
    // closedSet.push(current);
    
    // if (current === end) {
      // path.push(current);
      // return path;
    // }
    
    // var neighbours = graph[current].neighbours;
    // for (i = 0; i < neighbours.length; i++) {
      
      // var neighbour = neighbours[i];
      // if (closedSet.indexOf(neighbour) > -1) {
        // continue;
      // }
      
      // gScore = gScores[current] + (graph[neighbour].weight - graph[current].weight);
      // if (openSet.indexOf(neighbour) < 0 || gScore < gScores[neighbour]) {
        
        // if (current !== start) {
          // path.push(current);
        // }
        
        // gScores[neighbour] = gScore;
        // hScores[neighbour] = heuristic(
          // Math.abs(centerPoly(graph[neighbour].poly).x - centerPoly(graph[end].poly).x),
          // Math.abs(centerPoly(graph[neighbour].poly).y - centerPoly(graph[end].poly).y)
        // );
        
        // fScores[neighbour] = gScores[neighbour] + hScores[neighbour];
        // if (openSet.indexOf(neighbour) < 0) {
          
          // openSet.push(neighbour);
        // }
        
      // } 
      
    // }
    
  // }
  
  // return [];
  
// }








/*!	Curve function for canvas 2.3.6
	 *	(c) Epistemex 2013-2016
	 *	www.epistemex.com
	 *	License: MIT
	 */

	/**
	 * Draws a cardinal spline through given point array. Points must be arranged
	 * as: [x1, y1, x2, y2, ..., xn, yn]. It adds the points to the current path.
	 *
	 * There must be a minimum of two points in the input array but the function
	 * is only useful where there are three points or more.
	 *
	 *
	 * The points for the cardinal spline are returned as a new array.
	 *
	 * @param {Array} points - point array
	 * @param {Number} [tension=0.5] - tension. Typically between [0.0, 1.0] but can be exceeded
	 * @param {Number} [numOfSeg=25] - number of segments between two points (line resolution)
	 * @param {Boolean} [close=false] - Close the ends making the line continuous
	 * @returns {Float32Array} New array with the calculated points that was added to the path
	 */
	function curve(ctx, camera, points, tension, numOfSeg, close) {

		'use strict';

		if (typeof points === "undefined" || points.length < 2) return new Float32Array(0);

		// options or defaults
		tension = typeof tension === "number" ? tension : 0.5;
		numOfSeg = typeof numOfSeg === "number" ? numOfSeg : 25;

		var pts,															// for cloning point array
			i = 1,
			l = points.length,
			rPos = 0,
			rLen = (l-2) * numOfSeg + 2 + (close ? 2 * numOfSeg: 0),
			res = new Float32Array(rLen),
			cache = new Float32Array((numOfSeg + 2) << 2),
			cachePtr = 4;

		pts = points.slice(0);

		if (close) {
			pts.unshift(points[l - 1]);										// insert end point as first point
			pts.unshift(points[l - 2]);
			pts.push(points[0], points[1]); 								// first point as last point
		}
		else {
			pts.unshift(points[1]);											// copy 1. point and insert at beginning
			pts.unshift(points[0]);
			pts.push(points[l - 2], points[l - 1]);							// duplicate end-points
		}

		// cache inner-loop calculations as they are based on t alone
		cache[0] = 1;														// 1,0,0,0

		for (; i < numOfSeg; i++) {

			var st = i / numOfSeg,
				st2 = st * st,
				st3 = st2 * st,
				st23 = st3 * 2,
				st32 = st2 * 3;

			cache[cachePtr++] =	st23 - st32 + 1;							// c1
			cache[cachePtr++] =	st32 - st23;								// c2
			cache[cachePtr++] =	st3 - 2 * st2 + st;							// c3
			cache[cachePtr++] =	st3 - st2;									// c4
		}

		cache[++cachePtr] = 1;												// 0,1,0,0

		// calc. points
		parse(pts, cache, l, tension);

		if (close) {
			pts = [];
			pts.push(points[l - 4], points[l - 3],
					 points[l - 2], points[l - 1], 							// second last and last
					 points[0], points[1],
					 points[2], points[3]); 								// first and second
			parse(pts, cache, 4, tension);
		}

		function parse(pts, cache, l, tension) {

			for (var i = 2, t; i < l; i += 2) {

				var pt1 = pts[i],
					pt2 = pts[i+1],
					pt3 = pts[i+2],
					pt4 = pts[i+3],

					t1x = (pt3 - pts[i-2]) * tension,
					t1y = (pt4 - pts[i-1]) * tension,
					t2x = (pts[i+4] - pt1) * tension,
					t2y = (pts[i+5] - pt2) * tension,
					c = 0, c1, c2, c3, c4;

				for (t = 0; t < numOfSeg; t++) {

					c1 = cache[c++];
					c2 = cache[c++];
					c3 = cache[c++];
					c4 = cache[c++];

					res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
					res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
				}
			}
		}

		// add last point
		l = close ? 0 : points.length - 2;
		res[rPos++] = points[l++];
		res[rPos] = points[l];

		ctx.lineWidth = 6;
		ctx.strokeStyle = "#333";
		ctx.beginPath();
		ctx.moveTo(res[0] - camera.x, res[1] - camera.y);
		// add lines to path
		for(i = 2, l = res.length; i < l; i += 2)
			ctx.lineTo(res[i] - camera.x, res[i+1] - camera.y);

		ctx.stroke();
		return res
	}