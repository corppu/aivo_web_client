import React, { createClass } from "react"

import createMindmap from "./mindmap-canvas"

const MindMap = createClass({
    componentDidMount: function() {
        const ctx = this.canvas.getContext("2d")
        
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
                    ref={(canvas) => { this.canvas = canvas; }}
                    width={1000}
                    height={1000}

                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onMouseMove={this.handleMouseMove}/>
            </div>
        )
    },

    handleMouseDown: function(e) {
        if (this.mindmap) {
            this.mindmap.onTouchStart({
                position: calculatePosition(this.canvas, e)
            })
        }
    },

    handleMouseUp: function(e) {
        if (this.mindmap) {
            this.mindmap.onTouchEnd({
                position: calculatePosition(this.canvas, e)
            })
        }
    },

    handleMouseMove: function(e) {
        if (this.mindmap) {
            this.mindmap.onTouchMove({
                position: calculatePosition(this.canvas, e)
            })
        }
    }
})

function calculatePosition(canvas, e) {
    const { clientX, clientY } = e
    const bounds = canvas.getBoundingClientRect()

    return {
        x: clientX - bounds.left,
        y: clientY - bounds.top
    }
}

export default MindMap
