import React, { createClass } from "react";
import { fromJS } from "immutable";

import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_TEXT,
    NODE_TYPE_IMAGE
} from "../constants/types";

const NodeView = createClass({
    getInitialState: function() {
        const { nodeID, node } = this.props;
        
        return {
            nodeID,
            node
        };
    },

    componentWillReceiveProps: function(nextProps) {
        const { nodeID, node } = nextProps;

        if (nodeID !== this.state.nodeID || !this.state.node) {
            this.setState({
                nodeID,
                node
            });
        }
    },

    render: function() {
        const { goToParentBoard } = this.props;
        const { node } = this.state;

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(255,255,255,0.75)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end"
                }}
                onClick={ goToParentBoard }>

                { node ? 
                    <div
                        style={{
                            backgroundColor: "#fff",
                            width: 600,
                            boxShadow: "0 20px 70px 0 rgba(0, 0, 0, 0.2)"
                        }}
                        onClick={ (e) => e.stopPropagation() }>

                        { this.renderNodeTitle() }
                        <div
                            style={{
                                height: "60vh"
                            }}>
                            { this.renderNodeContent() }
                        </div>
                    </div>
                : null }
            </div>
        );
    },

    renderNodeTitle: function() {
        const { node } = this.state;

        return (
             <div
                className="node-title">
                <input
                    className="node-title-input"
                    value={node.get("title") || ""}
                    placeholder="Click to edit title..."
                    onChange={(e) => {
                        const { value } = e.target;
                        updateNode(node.set("title", value));
                    }}/>
            </div>
        );
    },

    renderNodeContent: function() {
        const { node } = this.state;

        switch (node.get("type")) {
        case NODE_TYPE_TEXT:
        {
            const text = node.get("text");

            return (
                <textarea
                    rows="12"
                    cols="60"
                    value={ text || "" }
                    onChange={(e) => {
                        const { value } = e.target;
                        updateNode(node.set("text", value));
                    }}/>
            );
        }
        case NODE_TYPE_IMAGE:
        {
            const imgURL = node.get("imgURL");

            return (
                <div>
                    <img
                        style={{
                            display: "block",
                            maxWidth: "75vw",
                            maxHeight: "75vh",
                        }}
                        src={imgURL}/>
                    <input
                        value={ imgURL || "" }
                        placeholder="input image URL"
                        onChange={(e) => {
                            const { value } = e.target;
                            updateNode(node.set("imgURL", value));
                        }}/>
                </div>
            );
        }
        default:
            return (
                <div>
                    <div>Select node type</div>
                    <button
                        onClick={ () => this.setNodeType(NODE_TYPE_TEXT) }>
                        Text
                    </button>
                    <button
                        onClick={ () => this.setNodeType(NODE_TYPE_IMAGE) }>
                        Image
                    </button>
                </div>
            );
        }
    },

    setNodeType: function(type) {
        // no-op, old code
    },
});

export default NodeView;
