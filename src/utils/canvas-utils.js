
export function drawRect(ctx, {x = 0, y = 0, w = 10, h = 10}) {
    ctx.fillRect(x - w/2, y - h/2, w, h)
}

export function drawCircle(ctx, {x = 0, y = 0, r = 5}) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)

    ctx.fill()
    ctx.stroke()
}
