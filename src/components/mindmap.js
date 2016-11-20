import React, { createClass } from "react"

import createMindmap from "./mindmap-canvas"

const MindMap = createClass({
    componentDidMount: function() {
        const ctx = this.refs.canvas.getContext("2d")
        
        this.mindmap = createMindmap()
        this.mindmap.updateProps(this.props)

        const renderLoop = () => {
            if (!this.mindmap) {
                return
            }
            this.mindmap.update()
            this.mindmap.render(ctx)

            requestAnimationFrame(renderLoop)
        }
        requestAnimationFrame(renderLoop)
    },

    componentWillUnmount: function() {
        this.mindmap = null
    },

    componentWillReceiveProps: function(nextProps) {
        if (this.mindmap) {
            this.mindmap.updateProps(nextProps)
        }
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
