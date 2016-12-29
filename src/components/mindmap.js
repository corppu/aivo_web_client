// Presenter for the Mindmap
import React, { createClass } from "react";
import createMindmap from "./mindmap-canvas";
import Hammer from "react-hammerjs";

import MindMapToolbar from "./mindmap-toolbar";

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

let _pressedObj = null;
let _selectedObj = null;
let _lastPoint = {x: 0, y: 0};

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
			<div>
				<MindMapToolbar/>
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
							onTouchStart={this.handleTouchStart}
							onMouseDown={this.handleMouseDown}
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
			</div>
        )
    },

	handleTouchStart: function(e) {
		if(e.touches.length > 1) return;
		_lastPoint = calculatePoint(this.canvas, this.mindmap.getCamera(), e.changedTouches[0].clientX, e.changedTouches[0].clientY);
	},
	
	handleMouseDown: function(e) {
		_lastPoint = calculatePoint(this.canvas, this.mindmap.getCamera(), e.clientX, e.clientY);
	},
	
	handleMoveNode: function(point) {
		const value = this.props.nodes.get(_pressedObj.id);
		this.props.tryUpdateNode(
			_pressedObj.id, 
			{
				type: value.get("type") || NODE_TYPE_UNDEFINED,
				x: point.x,
				y: point.y,
				title: value.get("title"),
				text: value.get("text") || null,
				imgURL: value.get("imgURL") || null	
			}
		);
	},
	
	handleMoveCamera: function(point) {
		this.mindmap.moveCameraBy(_lastPoint.x - point.x, _lastPoint.y - point.y);
		_lastPoint = point;
	},
	
	handleTouchMove: function(e) {
		const point = calculatePoint(this.canvas, this.mindmap.getCamera(), e.changedTouches[0].clientX, e.changedTouches[0].clientY);

		if(e.touches.length === 1 && _pressedObj) {
			
			if(_pressedObj.type === TYPE_NODE) {
				this.handleMoveNode(point);
			}
			
		} 
		
		else if(e.touches.length === 1 && !_pressedObj) {
			this.handleMoveCamera(point);
		}
	},
	
    handleMouseMove: function(e) {
		if(e.button === 2) {
			const point = calculatePoint(this.canvas, this.mindmap.getCamera(), e.clientX, e.clientY);

			if(_pressedObj) {
				if(_pressedObj.type === TYPE_NODE) {
					this.handleMoveNode(point);
				}
			}
			else {
				this.handleMoveCamera(point);
			}
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
		_pressedObj = null;
	},

	handleMouseEnd: function(e) {
		_pressedObj = null;
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
		console.log("TAP on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");
		
		const point = calculatePoint(this.canvas, this.mindmap.getCamera(), e.center.x, e.center.y);
		
		_selectedObj = trySelectNode(point, this.props.nodes);
	},

	handleDoubleTap: function(e) {
		console.log("DOUBLE TAP on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");
		
		const point = calculatePoint(this.canvas, this.mindmap.getCamera(), e.center.x, e.center.y);
		
		if(_selectedObj && _selectedObj.type === TYPE_NODE) {
			const value = this.props.nodes.get(_selectedObj.id);
			if(!value) {
				_selectedObj = null;
				return;
			}
			if(pointInCircle(point.x, point.y, value.get("x"), value.get("y"), NODE_RADIUS)) {
				this.props.openNode(_selectedObj.id);
			}
		}

		else if(!_selectedObj) {
			this.props.tryAddNode({
				title: "parent example",
				type: NODE_TYPE_UNDEFINED,
				imgURL: "http://xpenology.org/wp-content/themes/qaengine/img/default-thumbnail.jpg",
				x: point.x,
				y: point.y
			});
		}
	},

	handlePress: function(e) {
		console.log("PRESS on (" + e.center.x.toString() + "," + e.center.y.toString() + ")");
		const point = calculatePoint(this.canvas, this.mindmap.getCamera(), e.center.x, e.center.y);
		_selectedObj = trySelectNode(point, this.props.nodes);
		_pressedObj = _selectedObj;
		
		if(_pressedObj) {
			console.log("Pressed object: " + _pressedObj.type + " " + _pressedObj.id);
		}
	}
});

function calculatePoint(canvas, camera, clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();

    return {
        x: (clientX - bounds.left) + camera.x,
        y: (clientY - bounds.top) + camera.y
    };
}

function trySelectNode(point, nodes) {
	let rVal = null;
	
	for (var [key, value] of nodes) {
		if(pointInCircle(point.x, point.y, value.get("x"), value.get("y"), NODE_RADIUS)) {
			rVal = {
				type: TYPE_NODE,
				id: key,
			}
			
			console.log("Node selected: " + key);
			break;
		}
	}
	
	return rVal;
}

// x,y is the point to test
// cx, cy is circle center, and radius is circle radius
function pointInCircle(x, y, cx, cy, radius) {
	var distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
	return distancesquared <= radius * radius;
}

function pointInRect(point, rectX, rectY, rectW, rectH) {
	const left =  rectX - rectW / 2;
	const right = rectX + rectW / 2;
	const top = rectY - rectH / 2;
	const btm = rectY + rectH / 2;
	
	return (left <= point.x && point.x <= right && top <= point.y && point.y <= btm);
}

export default MindMap;
