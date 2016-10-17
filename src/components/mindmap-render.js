
export default function(ctx, props) {
    props.nodes.forEach((node) => {
        ctx.fillRect(node.x, node.y, 10, 10)
    })
}
