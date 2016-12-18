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

    function line({start = {x: 0, y: 0}, end = {x: 0, y: 0}, lineWidth = 10, color = "#000"} = {}) {
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

    return {
        rect,
        circle,
        line,
        text,
		bezierCurve,
        
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
