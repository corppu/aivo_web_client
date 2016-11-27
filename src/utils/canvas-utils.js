
export function clear(ctx, {color = "#FFF"} = {}) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function createRenderer(ctx, {camera = {x: 0, y: 0}} = {}) {
    
    function rect(ctx, {x = 0, y = 0, w = 10, h = 10, color = "#000"} = {}) {
        x -= camera.x
        y -= camera.y

        ctx.fillStyle = color
        ctx.fillRect(x - w/2, y - h/2, w, h)
    }

    function circle(ctx, {x = 0, y = 0, r = 5, color = "#000"} = {}) {
        x -= camera.x
        y -= camera.y

        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)

        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = color
        ctx.stroke()
    }

    return {
        rect,
        circle
    }
}
