import React, { createClass } from "react"

import createMindmap from "./mindmap-canvas"

const MindMap = createClass({
    componentWillMount: function() {
        const { tryOpenBoard } = this.props;
        tryOpenBoard();
    },

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
        const { tryOpenBoard } = nextProps;
        tryOpenBoard();

        if (this.mindmap) {
            this.mindmap.updateProps(nextProps)
        }
    },
    
    render: function() {
        const { children } = this.props;

        return (
            <div>
                <canvas
                    ref={(canvas) => { this.canvas = canvas; }}
                    width={1000}
                    height={1000}
					onTouchStart={this.handleTouchStart}
					onTouchEnd={this.handleTouchEnd}
					onTouchCancel={this.handleTouchCancel}
					onTouchMove={this.handleTouchMove}
                    onMouseDown={this.handleInputDown}
                    onMouseUp={this.handleInputUp}
                    onMouseLeave={this.handleInputUp}
                    onMouseMove={this.handleInputMove}/>

                {children}
            </div>
        )
    },

	
	handleTouchStart: function(e) {
		const { clientX, clientY } = e.changedTouches[0]
        if (this.mindmap) {
            this.mindmap.onInputStart({
                position: calculatePosition(this.canvas, clientX, clientY)
            })
        }		
	},
	
	handleTouchEnd: function(e) {
		const { clientX, clientY } = e.changedTouches[0]
        if (this.mindmap) {
            this.mindmap.onInputEnd({
                position: calculatePosition(this.canvas, clientX, clientY)
            })
        }
	},
	
	handleTouchCancel: function(e) {
		const { clientX, clientY } = e.changedTouches[0]
        if (this.mindmap) {
            this.mindmap.onInputEnd({
                position: calculatePosition(this.canvas, clientX, clientY)
            })
        }
	},
	
	handleTouchMove: function(e) {
		const { clientX, clientY } = e.changedTouches[0]
        if (this.mindmap) {
            this.mindmap.onInputMove({
                position: calculatePosition(this.canvas, clientX, clientY)
            })
        }	
	},
	
    handleInputDown: function(e) {
		const { clientX, clientY } = e
        if (this.mindmap) {
            this.mindmap.onInputStart({
                position: calculatePosition(this.canvas, clientX, clientY)
            })
        }
    },

    handleInputUp: function(e) {
		const { clientX, clientY } = e
        if (this.mindmap) {
            this.mindmap.onInputEnd({
                position: calculatePosition(this.canvas, clientX, clientY)
            })
        }
    },

    handleInputMove: function(e) {
		const { clientX, clientY } = e
        if (this.mindmap) {
            this.mindmap.onInputMove({
                position: calculatePosition(this.canvas, clientX, clientY)
            })
        }
    }
})

function calculatePosition(canvas, clientX, clientY) {
    const bounds = canvas.getBoundingClientRect()

    return {
        x: clientX - bounds.left,
        y: clientY - bounds.top
    }
}

export default MindMap
