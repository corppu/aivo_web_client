
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

    function circle({x = 0, y = 0, r = 5, color = "#000"} = {}) {
        const px = x - camera.x
        const py = y - camera.y

        ctx.beginPath()
        ctx.arc(px, py, r, 0, 2 * Math.PI)

        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = color
        ctx.stroke()
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
        ctx.store()
    }

    function text({
            text = "",
            x = 0,
            y = 0,
            align = "start",
            baseline = "hanging",
            color = "#000",
            font = "24px Verdana"})        
    {
        ctx.font = font
        ctx.fillStyle = color

        ctx.textAlign = align
        ctx.textBaseline = baseline

        ctx.fillText(text.toString(), x, y)
    }

    return {
        rect,
        circle,
        line,
        text
    }
}
