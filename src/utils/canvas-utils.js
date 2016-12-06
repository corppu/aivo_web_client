
export function clear(ctx, {color = "#FFF"} = {}) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function createRenderer(ctx, {camera = {x: 0, y: 0}} = {}) {
    
    function rect({x = 0, y = 0, w = 10, h = 10, color = "#000"} = {}) {
        const px = x - camera.x
        const py = y - camera.y

        ctx.fillStyle = color
        ctx.fillRect(px - w/2, py - h/2, w, h)
    }

    function circle({
            x = 0,
            y = 0,
            r = 5,
            color = "#000",
            strokeColor = null,
            strokeWidth = 0} = {})
        {
        const px = x - camera.x
        const py = y - camera.y

        ctx.beginPath()
        ctx.arc(px, py, r, 0, 2 * Math.PI)

        ctx.fillStyle = color
        ctx.fill()

        if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor || color
            ctx.lineWidth = strokeWidth

            ctx.stroke()
        }
    }

	function circleImg({
            img,
			x = 0,
            y = 0,
            r = 5,
            color = "#000",
            strokeColor = null,
            strokeWidth = 0} = {})
        {
        const px = x - camera.x
        const py = y - camera.y

		ctx.save();
        ctx.beginPath()
        ctx.arc(px, py, r, 0, 2 * Math.PI)
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(img, px, py);
        if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor || color
            ctx.lineWidth = strokeWidth
            ctx.stroke()
        }
				ctx.restore();

    }
	
    function line({start = {x: 0, y: 0}, end = {x: 0, y: 0}, color = "#000"} = {}) {
        const sx = start.x - camera.x
        const sy = start.y - camera.y
        const ex = end.x - camera.x
        const ey = end.y - camera.y

        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)

        ctx.strokeStyle = color
        ctx.stroke()
    }

    function text({
            text = "",
            x = 0,
            y = 0,
            align = "start",
            baseline = "alphabetic",
            color = "#000",
            font = "24px Verdana"} = {})        
    {
        ctx.font = font
        ctx.fillStyle = color

        ctx.textAlign = align
        ctx.textBaseline = baseline

        ctx.fillText(text.toString(), x, y)
    }

    function measureText(text) {
        return ctx.measureText(text)
    }

    return {
        rect,
        circle,
		circleImg,
        line,
        text,
        
        measureText
    }
}
