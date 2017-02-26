// Convex hull - Grahams algorithm by Toni "corppu" Korpela
// Worst O(n^2) when all points are on the hull...
var _innerMap = new Map( );
var _outerMap = new Map( );
var _outerPath = [ ];
var _topMost = null;

function compareByAngle( valueA, valueB ) {
	var topPos = _topMost.body.position;
	var posA = valueA.body.position;
	var posB = valueB.body.position;
	
	valueA.angle = Math.atan2( topPos.y - posA.y, topPos.x - posA.x );
	valueB.angle = Math.atan2( topPos.y - posB.y, topPos.x - posB.x );
	
	if( valueA.angle < valueB.angle ) {
		return -1;
	}
	
	else if( valueA.angle > valueB.angle ) {
		return 1;
	}
	
	return 0;
}	

	
function isInside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point.x, y = point.y;
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}


function add( value ) {
	
	var posA = value.body.position;
	if( _outerPath && isInside( posA, _outerPath ) {
		_innerMap.set( value.body.id, value );
		return;
	}
	
	
	if( !_topMost ||
		_topMost.body.position.y > posA.y ||
		( _topMost.body.position.y === posA.y && _topMost.body.position.x > posA.x )
	) {
		_topMost = value;
		
		// Everything has to be sorted with the new angle
		_outerMap = new Map( [ _innerMap, _outerMap ] ).sort( compareByAngle );
	}
	
	_outerMap.set( value.body.id, value );
	
	filterOuterMap();
}
/*The algorithm proceeds by considering each of the points in the sorted array
 in sequence. For each point, it is first determined whether traveling
 from the two points immediately preceding this point constitutes making 
 a left turn or a right turn. If a right turn, 
 the second-to-last point is not part of the convex hull,
 and lies 'inside' it. The same determination is then made for the set of the 
 latest point and the two points that immediately precede the point found to 
 have been inside the hull, and is repeated until a "left turn" set is 
 encountered, at which point the algorithm moves on to the next point 
 in the set of points in the sorted array minus any points that were found to 
 be inside the hull; there is no need to consider these points again. 
 (If at any stage the three points are collinear, one may opt either to
 discard or to report it, since in some applications it is required to find 
 all points on the boundary of the convex hull.)
*/
function filter() {
	var prevPos = null;
	for( var currPos of _outerMap ) {
		if( !lastPoint ) {
			lastPos = currPos[ 1 ].body.position;
		}
		switch( compareByAngle( prevPos, currPos ) {
			case 1:
				break;
			case -1:
				break;
			default:
				break;
		};		
	}
}


function del( id ) {
	
}

function draw( ctx ) {
	
}