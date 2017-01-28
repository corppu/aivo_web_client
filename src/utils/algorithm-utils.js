import { Bounds, Query, Vector } from "matter-js";

const DIVIDER_WIDTH = 100;

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
// function compareCollisionsTo( startPoint ) {
	// return function ( collisionA, collisionB ) {
		
		// var distA = 
			// vecDistance(
					// startPoint, 
					// Vector.create( centerX( collisionA.body.bounds ), centerY( collisionA.body.bounds ) )
			// );
		// var distB = 
			// vecDistance(
					// startPoint, 
					// Vector.create( centerX( collisionB.body.bounds ), centerY( collisionB.body.bounds ) )
			// );
			
		// if( distA < distB ) {
			// return -1;
		// }

		// if( distB < distA ) { 
			// return 1;
		// }
		
		// return 0;
	// }
// }



function halfWidth(bounds) {
	return bounds.max.x - bounds.min.x;
}

function halfHeight(bounds) {
	return bounds.max.y - bounds.min.y;
}

// function findControlPoint(startBounds, middleBounds, endBounds, path) {
	// var left = middleBounds.max.x < startBounds.min.x;
	// var right = startBounds.max.x < middleBounds.min.x;
	// var top = middleBounds.max.y < startBounds.min.y;
	// var bottom = startBounds.max.y < middleBounds.min.y;
	
	// var point = [centerX(middleBounds), centerY(middleBounds)];
	
	// if(top) {
		// point[0] += halfWidth(middleBounds)
	// }
	
	// if(bottom) {
		// point[0] -= halfWidth(middleBounds)
	// }
	
	// if(right) {
		// point[1] -= halfHeight(middleBounds)
	// }
	
	// if(left) {
		// point[1] += halfHeight(middleBounds)
	// }
	
	// var collisions = Query.ray( bodies, middlePoint, endPoint );
	// collisions.sort( compareCollisionsTo( startBody) );
	// return path.concat( point );
// }



export function findPath(bodies, startBody, endBody) {
	
	var startPoint = Vector.create(
		centerX(startBody.bounds),
		centerY(startBody.bounds)
	);
	
	var endPoint = Vector.create(
		centerX(endBody.bounds),
		centerY(endBody.bounds)
	);
	
	var path = [ startPoint.x, startPoint.y ];
	
	// for(var i = 2; i < collisions.length; ++i) {
		// //path = path.concat([centerX(collisions[i].body.bounds), centerY(collisions[i].body.bounds)])
		// path = path.concat(findControlPoint(collisions[i-2].body.bounds, collisions[i-1].body.bounds, collisions[i].body.bounds));
	// }
	
	// path = path.concat([endPoint.x, endPoint.y]);
	
	// if(path.length < 4) {
		// path = [centerX(startBody.bounds), centerY(startBody.bounds), centerX(endBody.bounds), centerY(endBody.bounds)];
	// }
	n = 0;
	findWayPoint( bodies, startBody.bounds, startPoint, endPoint, path );
	path.push( endPoint.x );
	path.push( endPoint.y );
	return path;
}

var n = 0;
function findWayPoint( bodies, startBounds, startPoint, endPoint, path ) {
	console.log(++n);
	var collisions = Query.ray( bodies, startPoint, endPoint, DIVIDER_WIDTH );
	collisions.sort( compareCollisionsTo( startBounds ) );
	
	var shortestPath = [ ];
	
	for( var i = 0; i < collisions.length; ++i ) {
		var middleBounds = collisions[ i ].body.bounds;
		if( Bounds.contains( middleBounds, startPoint ) ||
			Bounds.contains( middleBounds, endPoint )
		) {
			continue;
		}
		
		var middlePoint = Vector.create(
			centerX( middleBounds ),
			centerY( middleBounds )
		);
		
		var testPath = [ ];
	
		var left = middlePoint.x < startPoint.x;
		var right = startPoint.x < middlePoint.x;
		var top = middlePoint.y < startPoint.y;
		var bottom = startPoint.y < middlePoint.y;
		
		if( right ) {
			middlePoint.y -= halfHeight( middleBounds );
		}
		
		if( left ) {
			middlePoint.y -= halfHeight( middleBounds );
		}
		
		if( top ) {
			middlePoint.x += halfWidth( middleBounds );
		}
		
		if( right ) {
			middlePoint.x -= halfWidth( middleBounds );
		}
		
		path.push( middlePoint.x );
		path.push( middlePoint.y );
	
		var testPath = [ ];
		findWayPoint( bodies, startBounds, middlePoint, endPoint, testPath );
		
		if( shortestPath.length === 0 || shortestPath.length > testPath.length ) {
			shortestPath = testPath;
		}
	}
	
	for( var i = 0; i < shortestPath.length; ++i ) {
		path.push( shortestPath[ i ] );
	}
}
