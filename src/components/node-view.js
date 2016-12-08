import React, { createClass } from "react";

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
        const { node, goToParentBoard } = this.props;

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(255,255,255,0.9333)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
                onClick={ goToParentBoard }>

                { node ? 
                    <div
                        style={{
                            borderRadius: 5,
                            backgroundColor: "#fff",
                            boxShadow: "0px 5px 15px 2.5px #ddd",
                            overflow: "hidden"
                        }}>
                        <div
                            style={{
                                padding: "10px 20px", 
                                backgroundColor: "#1e90ff",
                                color: "#fff",
                                fontWeight: "bold"
                            }}>
                            { node.get("title") }
                        </div>
                        <div
                            style={{
                                margin: 20
                            }}>
                            { this.renderNodeContent() }
                        </div>
                    </div>
                : null }
            </div>
        );
    },

    renderNodeContent: function() {
        const { node } = this.state;

        switch (node.get("type")) {
        default:
            return <div>typeless node!</div>
        }
    }
});

export default NodeView;
