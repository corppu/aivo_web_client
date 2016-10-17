import { drawCircle } from "../utils/canvas-utils"

export default function(ctx, state) {
    state.nodes.forEach((node) => {
       drawCircle(ctx, {x: node.x, y: node.y, r: 20})
    })
}
