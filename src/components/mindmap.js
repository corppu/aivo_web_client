import React, { createClass } from "react";

import createMindmap from "./mindmap-canvas";
import Hammer from "react-hammerjs";

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
		<Hammer onTap={this.handleTap} onDoubleTap={this.handleDoubleTap} onPress={this.handlePress}>
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
					onTouchMove={this.handleTouchMove} // MOVE
					onMouseMove={this.handleMouseMove} // MOVE
					onMouseUp={this.handleMouseEnd} // END
                    onMouseLeave={this.handleMouseEnd} // END
					onTouchEnd={this.handleTouchEnd} // END
					onTouchCancel={this.handleTouchEnd} // END
					/>
                {children}
            </div>
		</Hammer>
        )
    },
	
	handleTouchMove: function(e) {
		// TODO: Try moving the selected object from the map... use the pointer identifier as key...
		const { clientX, clientY } = e.changedTouches[0];
        if (this.mindmap) {
            this.mindmap.onInputMove({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }
	},
	
    handleMouseMove: function(e) {
		// TODO: Try moving the selected object from the map... use "mouse" as the key...
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
    },
	
	handleTouchEnd: function(e) {
		const { clientX, clientY } = e.changedTouches[0];
        if (this.mindmap) {
            this.mindmap.onInputEnd({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }
	},

	handleMouseEnd: function(e) {
		const { clientX, clientY } = e;
        if (this.mindmap) {
            this.mindmap.onInputEnd({
                position: calculatePosition(this.canvas, clientX, clientY)
            });
        }
    },
	
	handleTap: function(e) {
		// Try selecting and if selected object was selected already open it.. unselect if fails...
		console.log("TAP on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");
	},

	handleDoubleTap: function(e) {
		// TODO: Try selecting object from mindmap-canvas.js... Open the object or if none selected create one... 
		console.log("DOUBLE TAP on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");
	},

	handlePress: function(e) {
		// TODO: Try selecting object from mindmap-canvas.js... Bind the object to the pointer identifier. 
		console.log("PRESS on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");
		
		// TODO: Remove this hack...
		this.mindmap.onInputStart({
			position: calculatePosition(this.canvas, e.center.x, e.center.y)
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
