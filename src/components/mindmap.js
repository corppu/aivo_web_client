import React, { createClass } from "react";

import createMindmap from "./mindmap-canvas";
import * as kakka from "./mindmap-canvas-data";
import MindMapToolbar from "./mindmap-toolbar";
import MindMapNodeToolbar from "../containers/mindmap-node-toolbar";

import { createAction, updateAction } from "../utils/input-utils";

import {
    LONGPRESS_TIMEOUT,
    PRESS_DELTA_THRESHOLD,
    DOUBLE_INPUT_TIMEOUT
} from "../constants/config";

const MindMap = createClass({
    getInitialState: function() {
        const { innerWidth, innerHeight } = window;

        this.canvas = null;
        this.mindmap = null;

        this.longPressTimeout = null;
        this.prevInputAction = null;
        this.inputAction = null;

        return {
            width: innerWidth,
            height: innerHeight,
            selection: null,
            canvasCamera: null,
        };
    },

    componentWillMount: function() {
        const { tryOpenBoard } = this.props;
        tryOpenBoard();
    },

    componentDidMount: function() {
        const ctx = this.canvas.getContext("2d");
        
        this.mindmap = createMindmap();
        this.mindmap.updateProps(Object.assign({}, this.props, {
            updateSelection: this.handleSelectionUpdate
        }));

        const renderLoop = () => {
            if (!this.mindmap) {
                return;
            }
            this.mindmap.update();
            this.mindmap.render(ctx);

            this.checkCamera(this.mindmap.getCamera());
            
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
            this.mindmap.updateProps(Object.assign({}, nextProps, {
                updateSelection: this.handleSelectionUpdate
            }));
        }
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        return true; //false; // TODO: logic for this for slight performance gain
    },
    
    render: function() {
        const { children } = this.props;
        const { width, height } = this.state;

        return (
			<div>
				<MindMapToolbar/>
                { this.renderNodeToolbar() }
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
						onTouchMove={this.handleTouchMove}
						onTouchEnd={this.handleTouchEnd}
						onTouchCancel={this.handleTouchEnd}
						onMouseDown={this.handleMouseStart}
						onMouseUp={this.handleMouseEnd}
						onMouseLeave={this.handleMouseEnd}
						onMouseMove={this.handleMouseMove}
						/>
					{children}
				</div>
			</div>
        )
    },

    renderNodeToolbar: function() {
        const { selection, canvasCamera } = this.state;

        if (!selection) {
            return null;
        }
        return (
            <MindMapNodeToolbar
                canvasCamera={canvasCamera}
                {...selection}/>
        );
    },

	handleTouchStart: function(e) {
        this.handleInputStart(e.changedTouches[0]);
	},
	
	handleTouchEnd: function(e) {
		this.handleInputEnd(e.changedTouches[0]);        
	},
	
	handleTouchMove: function(e) {
		this.handleInputMove(e.changedTouches[0]);      
	},
	
    handleMouseStart: function(e) {
		this.handleInputStart(e);
    },

    handleMouseEnd: function(e) {
		this.handleInputEnd(e);
    },

    handleMouseMove: function(e) {
		this.handleInputMove(e);
    },

    handleInputStart: function({ clientX, clientY }) {
        if (!this.mindmap || !this.mindmap.onInputStart) {
            return;
        }
        if (this.inputAction) {
            this.handleInputEnd( { x: clientX, y: clientY });
        }
        
        // long press logic
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
        }
        this.longPressTimeout = window.setTimeout(() => {
            if (!this.mindmap || !this.mindmap.onLongPress || !this.inputAction) {
                return;
            }
            if (this.inputAction.deltaMagnitude <= PRESS_DELTA_THRESHOLD) {
                const nextData = this.mindmap.onLongPress(this.inputAction);
                if (nextData !== undefined) {
                    this.inputAction.data = nextData;
                }
            }
        }, LONGPRESS_TIMEOUT * 1000);

        this.inputAction = createAction(calculatePosition(this.canvas, clientX, clientY));
        this.inputAction.data = this.mindmap.onInputStart(this.inputAction, this.prevInputAction);
    },

    handleInputEnd: function({ clientX, clientY }) {
        if (!this.mindmap || !this.mindmap.onInputEnd || !this.inputAction) {
            return;
        }
        this.inputAction = updateAction(this.inputAction,
                calculatePosition(this.canvas, clientX, clientY));

        this.mindmap.onInputEnd(this.inputAction, this.prevInputAction);

        this.prevInputAction = this.inputAction;
        this.inputAction = null;
    },

    handleInputMove: function({ clientX, clientY }) {
        if (!this.mindmap || !this.mindmap.onInputMove || !this.inputAction) {
            return;
        }
        this.inputAction = updateAction(this.inputAction,
                calculatePosition(this.canvas, clientX, clientY));

        const nextData = this.mindmap.onInputMove(this.inputAction, this.prevInputAction);
        if (nextData !== undefined) {
            this.inputAction.data = nextData;
        }
    },

    handleSelectionUpdate: function(selection) {
        this.setState({
            selection
        });
    },

    handleResize: function() {
        const { innerWidth, innerHeight } = window;

        this.setState({
            width: innerWidth,
            height: innerHeight
        });
    },

    checkCamera: function(camera) {
        const { canvasCamera } = this.state;

        if (!canvasCamera
                || camera.x != canvasCamera.x
                || camera.y != canvasCamera.y)
            {
            this.setState({
                canvasCamera: Object.assign({}, camera)
            });
        }
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
