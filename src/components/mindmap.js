// Presenter for the Mindmap
import React, { createClass } from "react";
import createMindmap from "./mindmap-canvas";
import Hammer from "react-hammerjs";
import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_IMAGE,
    NODE_TYPE_TEXT,
	TYPE_NODE,
	TYPE_LINE,
	TYPE_NONE
} from "../constants/types";

import {
	NODE_RADIUS,
	NODE_TXT_BOX_WIDTH,
	NODE_TXT_BOX_HEIGHT
} from "../constants/values";

let _ignoreOpenNodeInDblTap = true;
let _pressedObj = null;
let _selectedObj = null;

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
		if(e.touches.length === 1 && _pressedObj) {
			const point = calculatePosition(this.canvas, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
		}
	},
	
    handleMouseMove: function(e) {
		if(e.touches.length === 1 && _pressedObj) {
			const point = calculatePosition(this.canvas, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
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
	/*
	    _actions.addNode = props.tryAddNode(data);
		_actions.addLine = props.tryAddLine(data);
        _actions.updateNode = props.tryUpdateNode(id, data);
		_actions.updateLine = props.tryUpdateLine(id,data);
        _actions.removeNode = props.tryRemoveNode(id);
		_actions.removeLine = props.tryRemoveLine(id);
        _actions.openNode = props.openNode(id);
	*/
	
	handleTap: function(e) {
		_ignoreOpenNodeInDblTap = false;
		// Try selecting and if selected object was selected already open it.. unselect if fails...
		console.log("TAP on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");
		const point = calculatePosition(this.canvas, e.center.x, e.center.y);
		_pressedObj = trySelectNode(point, this.props.nodes);
		if(_selectedObj && _pressedObj && _selectedObj.type === TYPE_NODE && _pressedObj.type === TYPE_NODE && _selectedObj.id === _pressedObj.id) {
			this.props.openNode(_pressedObj.id);
			_ignoreOpenNodeInDblTap = true;
		}
		
		_selectedObj = _pressedObj;
	},

	handleDoubleTap: function(e) {
		console.log("DOUBLE TAP on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");

		if(_ignoreOpenNodeInDblTap) return;
		
		const point = calculatePosition(this.canvas, e.center.x, e.center.y);
		_pressedObj = trySelectNode(point, this.props.nodes);
		
		if(_selectedObj && _pressedObj && _selectedObj.type === TYPE_NODE && _pressedObj.type === TYPE_NODE && _selectedObj.id === _pressedObj.id) {
			this.props.openNode(_pressedObj.id);
			return;
		}

		
		props.tryAddNode({
			title: "parent example",
			type: NODE_TYPE_UNDEFINED,
			imgURL: "http://xpenology.org/wp-content/themes/qaengine/img/default-thumbnail.jpg",
			x: point.x,
			y: point.y
		});
	},

	handlePress: function(e) {
		console.log("PRESS on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");
		const point = calculatePosition(this.canvas, e.center.x, e.center.y);
		_pressedObj = trySelectNode(point, this.props.nodes);
	}
});

function calculatePosition(canvas, clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();

    return {
        x: clientX - bounds.left,
        y: clientY - bounds.top
    };
}

function trySelectNode(point, nodes) {
	nodes.forEach(
		function(value, key, map) {
			console.log("m[" + key + "]");
		
			if(pointInsideCircle(point, value.x, value.y, NODE_RADIUS)) {		

				return {
					type: TYPE_NODE,
					id: key
					//data: value
				};
			}
		}
	);
	return null;
}

function pointInsideCircle(point, circleX, circleY, circleR) {
	const dist = Math.sqrt((circleX - point.x) ** 2 + (circleY - point.y) ** 2);
    return dist <= circleR;
}

function pointInsideRect(point, rectX, rectY, rectW, rectH) {
	const left =  circleX - rectW / 2;
	const right = circleX + rectW / 2;
	const top = circleY - rectH / 2;
	const btm = circleY + rectH / 2;
	
	return left <= point.x && point.x <= right && top <= point.y && point.y <= btm;
}

export default MindMap;
