import React, { createClass } from "react";

import createMindmap from "./mindmap-canvas";

const MindMap = createClass({
    getInitialState: function() {
        const { innerWidth, innerHeight } = window;

        return {
            width: innerWidth,
            height: innerHeight
        };
    },

    componentWillMount: function() {
        const { tryOpenBoard } = this.props;
        tryOpenBoard();
    },

    componentDidMount: function() {
        const ctx = this.canvas.getContext("2d");
        
        this.mindmap = createMindmap();
        this.mindmap.updateProps(this.props);

        const renderLoop = () => {
            if (!this.mindmap) {
                return;
            }
            this.mindmap.update();
            this.mindmap.render(ctx);

            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);

        window.addEventListener("resize", this.handleResize);
    },

    componentWillUnmount: function() {
        this.mindmap = null;

        window.removeEventListener("resize", this.handleResize);
    },

    componentWillReceiveProps: function(nextProps) {
        const { tryOpenBoard } = nextProps;
        tryOpenBoard();

        if (this.mindmap) {
            this.mindmap.updateProps(nextProps);
        }
    },
    
    render: function() {
        const { children } = this.props;
        const { width, height } = this.state;

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                    cursor: "default",
                    zIndex: -1
                }}>

                <canvas
                    ref={(canvas) => { this.canvas = canvas; }}
                    width={width}
                    height={height}
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
		const { clientX, clientY } = e.changedTouches[0];
        if (this.mindmap) {
            this.mindmap.onInputStart({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }		
	},
	
	handleTouchEnd: function(e) {
		const { clientX, clientY } = e.changedTouches[0];
        if (this.mindmap) {
            this.mindmap.onInputEnd({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }
	},
	
	handleTouchCancel: function(e) {
		const { clientX, clientY } = e.changedTouches[0];
        if (this.mindmap) {
            this.mindmap.onInputEnd({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }
	},
	
	handleTouchMove: function(e) {
		const { clientX, clientY } = e.changedTouches[0];
        if (this.mindmap) {
            this.mindmap.onInputMove({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }	
	},
	
    handleInputDown: function(e) {
		const { clientX, clientY } = e;
        if (this.mindmap) {
            this.mindmap.onInputStart({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }
    },

    handleInputUp: function(e) {
		const { clientX, clientY } = e;
        if (this.mindmap) {
            this.mindmap.onInputEnd({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }
    },

    handleInputMove: function(e) {
		const { clientX, clientY } = e;
        if (this.mindmap) {
            this.mindmap.onInputMove({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }
    },

    handleResize: function() {
        const { innerWidth, innerHeight } = window;

        this.setState({
            width: innerWidth,
            height: innerHeight
        });
    }
});

function calculatePosition(canvas, clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();

    return {
        x: clientX - bounds.left,
        y: clientY - bounds.top
    };
}

export default MindMap;
