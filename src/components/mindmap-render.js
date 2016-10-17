import { drawRect, drawCircle } from "../utils/canvas-utils"

export default function(ctx, props) {
    props.nodes.forEach((node) => {
       drawCircle(ctx, {x: node.x, y: node.y, r: 20})
    })
}
