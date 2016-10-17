import React, { createClass } from "react"

import init from "./mindmap-init"
import update from "./mindmap-update"
import render from "./mindmap-render"

const MindMap = createClass({
    componentDidMount: function() {
        const ctx = this.refs.canvas.getContext("2d")
        var state = init()

        this.__running = true

        const renderLoop = () => {
            if (!this.__running) {
                return
            }
            const props = this.props

            state = update(props, state)
            render(ctx, state)

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
