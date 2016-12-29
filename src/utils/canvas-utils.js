import { getTimestamp } from "../utils/time-utils";

let _imageCache = new Map();

// TODO: implement image garbage collection

export function clear(ctx, {color = "#FFF"} = {}) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function createRenderer(ctx, {camera = {x: 0, y: 0}} = {}) {
    
    function rect({x = 0, y = 0, w = 10, h = 10, color = "#000"} = {}) {
        const px = x - camera.x;
        const py = y - camera.y;

        ctx.fillStyle = color;
        ctx.fillRect(px - w/2, py - h/2, w, h);
    }

    function circle({
            x = 0,
            y = 0,
            r = 5,
            color = "#000",
            imageURL = null,
            strokeColor = null,
            strokeWidth = 0} = {})
        {
        const px = x - camera.x;
        const py = y - camera.y;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, 2 * Math.PI);
        ctx.closePath();

        let hasImage = false;
        if (imageURL) {
            const img = tryGetImage(imageURL);

            if (img) {
                const { width, height } = img;

                ctx.save();
                ctx.clip();
                ctx.drawImage(img, 0, 0, width, height, px-r, py-r, 2*r, 2*r);
                ctx.restore();

                hasImage = true;
            }
        } 
        if (!hasImage) {
            ctx.fillStyle = color;
            ctx.fill();
        }

        if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor || color;
            ctx.lineWidth = strokeWidth;

            ctx.stroke();
        }
    }

    function line({
			start = {x: 0, y: 0},
			end = {x: 0, y: 0},
			lineWidth = 10,
			color = "#000"} = {})
	{
        const sx = start.x - camera.x;
        const sy = start.y - camera.y;
        const ex = end.x - camera.x;
        const ey = end.y - camera.y;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.closePath();

        ctx.strokeStyle = color;
        ctx.stroke();
    }
	
	function bezierCurve({sx = 0, sy = 0, cp1x = 0, cp1y = 0, cp2x = 0, cp2y = 0, ex = 0, ey = 0} = {}) {
		const psx = sx - camera.x;
        const psy = sy - camera.y;
        const pex = ex - camera.x;
        const pey = ey - camera.y;
		const pcp1x = cp1x - camera.x;
		const pcp1y = cp1y - camera.y;
		const pcp2x = cp2x - camera.x;
		const pcp2y = cp2y - camera.y;
		
		ctx.lineWidth = 6;
		ctx.strokeStyle = "#333";
		ctx.beginPath();
		ctx.moveTo(psx, psy);
		ctx.bezierCurveTo(pcp1x, pcp1y, pcp2x, pcp2y, pex, pey);
		ctx.stroke();
	}
	
    function text({
            text = "",
            x = 0,
            y = 0,
            align = "start",
            baseline = "alphabetic",
            color = "#000",
            font = "24px verdana",
            ignoreCamera = false} = {})
    {
        const px = ignoreCamera ? x : x - camera.x;
        const py = ignoreCamera ? y : y - camera.y;

        ctx.font = font;
        ctx.fillStyle = color;

        ctx.textAlign = align;
        ctx.textBaseline = baseline;

        ctx.fillText(text.toString(), px, py);
    }

    function measureText(text) {
        return ctx.measureText(text);
    }

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
	function curve(points, tension, numOfSeg, close) {

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
	
    return {
        rect,
        circle,
        line,
        text,
		bezierCurve,
        curve,
        measureText,
    };
}

export function transformToCamera(camera, position) {
    return {
        x: position.x + camera.x,
        y: position.y + camera.y,
    }
}

export  function tryGetImage(src) {
    const cacheData = _imageCache[src];

    if (cacheData) {
        if (cacheData.image) {
            return cacheData.image;
        }
        cacheData.lastAccess = getTimestamp();

    } else {
        let img = new Image();
    
        img.onload = function() {
            _imageCache[src] = Object.assign({}, cacheData, {
                image: img
            });
        }
        img.src = src;

        _imageCache[src] = {
            lastAccess: getTimestamp()
        };
    }
    return null;
}



