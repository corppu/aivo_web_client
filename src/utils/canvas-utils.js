
export function clear(ctx, {color = "#FFF"} = {}) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function drawRect(ctx, {x = 0, y = 0, w = 10, h = 10, color = "#000"} = {}) {
    ctx.fillStyle = color
    ctx.fillRect(x - w/2, y - h/2, w, h)
}

export function drawCircle(ctx, {x = 0, y = 0, r = 5, color = "#000"} = {}) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)

    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = color
    ctx.stroke()
}
