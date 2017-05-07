import React, { createClass } from "react";
import { fromJS } from "immutable";

import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_TEXT,
    NODE_TYPE_IMAGE
} from "../constants/types";

const NodeView = createClass({
    getInitialState: function() {
        return propsToState(this.props);
    },

    componentWillReceiveProps: function(nextProps) {
        const { nodeID, node } = nextProps;

        if (nodeID !== this.state.nodeID || !this.state.node) {
            this.setState(propsToState(nextProps));
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
                            borderTopLeftRadius: 13,
                            borderTopRightRadius: 13,
                            backgroundColor: "#fff",
                            width: 568,
                            overflow: "hidden",
                            boxShadow: "0 20px 70px 0 rgba(0, 0, 0, 0.2)"
                        }}
                        onClick={ (e) => e.stopPropagation() }>

                        { this.renderNodeHeader() }
                        <div
                            style={{
                                padding: "0 48px",
                                height: "60vh",
                                minHeight: 632
                            }}>
                            { this.renderNodeTitle() }
                            { this.renderNodeContent() }
                        </div>
                    </div>
                : null }
            </div>
        );
    },

    renderNodeHeader: function() {
        const { goToParentBoard } = this.props;
        
        return (
            <div>
                <div
                    style={{
                        padding: "7px 14px",
                        fontSize: 26,
                        color: "#aaaaaa"
                    }}>
                    <i
                        className="fa fa-times pointer"
                        onClick={ goToParentBoard }/>
                </div>
                <div
                    style={{
                        height: 1,
                        backgroundColor: "#d8d8d8"
                    }}/>
            </div>
        );
    },

    renderNodeTitle: function() {
        const { updateNode } = this.props;
        const { node, title } = this.state;

        return (
             <div>
                <input
                    className="node-title-input"
                    value={title || ""}
                    placeholder="Click to edit title..."
                    onChange={(e) => {
                        const { value } = e.target;
                        
                        this.setState({
                            title: value
                        });
                        updateNode(node.set("title", value));
                    }}/>
            </div>
        );
    },

    renderNodeContent: function() {
        const { updateNode } = this.props;
        const { node } = this.state;

        switch (node.get("type")) {
        case NODE_TYPE_TEXT:
        {
            const { text } = this.state;

            return (
                <textarea
                    style={{
                        border: "none",
                        overflow: "auto",
                        outline: "none",
                        resize: "none",

                        WebkitBoxShadow: "none",
                        MozBoxShadow: "none",
                        boxShadow: "none",

                        width: "100%",
                        height: "100%",
                    }}
                    placeholder="Click to edit text..."
                    value={ text || "" }
                    onChange={(e) => {
                        const { value } = e.target;
                        
                        this.setState({
                            text: value
                        });
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

function propsToState(props) {
  const { nodeID, node } = props;
        
    return {
        nodeID,
        node,

        title: node ? node.get("title") : null,
        text: node ? node.get("text") : null
    };
}
