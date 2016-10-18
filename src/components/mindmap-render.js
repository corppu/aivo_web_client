import { clear, drawCircle } from "../utils/canvas-utils"

export default function(ctx, state) {
    clear(ctx)

    state.nodes.forEach((node) => {
        drawCircle(ctx, {
            x: node.body.position.x,
            y: node.body.position.y,
            r: node.radius
        })
    })
}
