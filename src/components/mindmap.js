import React, { createClass } from "react"

import MindMapRender from "./mindmap-render"

const MindMap = createClass({
    componentDidMount: function() {
        const ctx = this.refs.canvas.getContext("2d")

        this.__running = true

        const renderLoop = () => {
            if (!this.__running) {
                return
            }
            const props = this.props

            MindMapRender(ctx, props)
            requestAnimationFrame(renderLoop)
        }
        requestAnimationFrame(renderLoop)   
    },

    componentWillUnmount: function() {
        this.__running = false
    },
    
    render: function() {    
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh"
                }}>

                <canvas
                    ref="canvas"
                    width={1000}
                    height={1000}/>
            </div>
        )
    }
})

export default MindMap
