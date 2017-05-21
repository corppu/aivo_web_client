import React, { createClass } from "react";
import { fromJS } from "immutable";

import NodeViewText from "./node-view-text";
import NodeViewFile from "./node-view-file";

import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_TEXT,
    NODE_TYPE_FILE
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
                    className="node-title-input node-input"
                    value={title || ""}
                    placeholder="Click to edit title..."
                    onChange={(e) => {
                        const { value } = e.target;
                        
                        this.updateState({
                            title: value
                        })
                    }}/>
            </div>
        );
    },

    renderNodeContent: function() {
        const { updateNode } = this.props;
        const { node } = this.state;

        switch (node.get("type") || null) {
        case NODE_TYPE_TEXT:
            return <NodeViewText
                {...this.state}
                updateState={this.updateState}/>

        case NODE_TYPE_FILE:
            return <NodeViewFile
                {...this.state}
                updateState={this.updateState}/>

        default:
            return (
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: "bold"
                    }}>
                    NODE TYPE NOT DEFINED
                </div>
            );
        }
    },

    updateState: function(update) {
        const { updateNode } = this.props;
        const { node } = this.state;

        let nextNode = node;
        Object.keys(update).forEach(k => {
            nextNode = nextNode.set(k, update[k]);
        });
        if (nextNode !== node) {
            updateNode(nextNode);
        }
        this.setState(update);
    }
});

export default NodeView;

function propsToState(props) {
  const { nodeID, node } = props;
        
    return {
        nodeID,
        node,

        title: node ? node.get("title") : null,
        text: node ? node.get("text") : null,
        imgURL: node ? node.get("imgURL") : null
    };
}
