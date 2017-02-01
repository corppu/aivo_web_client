import { Bounds, Query, Vector } from "matter-js";

const DIVIDER_WIDTH = 40;

let clusters = new Map();
// let cluster = {
	// id: new Date().now(),
	// bodies: new Set(),
	// leftMost: null,
	// rightMost: null,
	// topMost: null,
	// bottomMost: null
// }

function findClusterEdges( cluster ) {
	
	
}


function onNodeMove( node ) {
	if ( !node.cluster ) {
		node.cluster = {
			id: new Date().now,
			nodes: new Map()
		};
		
		node.cluster.bodies[ node.id ] = node;
		node.cluster.topMost = node;
		node.cluster.bottomMost = node;
		node.cluster.leftMost = node;
		node.cluster.rightMost = node;
	}
	
	
}

function onNodeRemove( node ) {
	if ( !node.cluster ) {
		throw("something odd is going on as node.cluster is not found on removal");
	}
	
	if( node.cluster.bodies.size == 1 ) {
		clusters.remove( node.cluster.id );
		return;
	}
	
	node.cluster.nodes.remove( node.id );
	
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
	
	var startPoint = Vector.create(
		centerX(startBody.bounds),
		centerY(startBody.bounds)
	);
	
	var endPoint = Vector.create(
		centerX(endBody.bounds),
		centerY(endBody.bounds)
	);
	
	// var alignment = pointAlignment(startPoint, endPoint);
	//console.log(alignment);
	// alignment = boundsAlignment(startBody.bounds, endBody.bounds);
	//console.log(alignment);
	
	var path = [ startPoint.x, startPoint.y ];

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
		if ( bodyIdSet.has( collisions[ i ].body.id ) )  {
			continue;
		} 
		
		var middleBounds = collisions[ i ].body.bounds;

		// if( Bounds.contains( middleBounds, startPoint ) ||
			// Bounds.contains( middleBounds, endPoint )
		// ) {
			// continue;
		// }
		
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
