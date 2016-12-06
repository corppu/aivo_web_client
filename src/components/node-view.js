import React, { createClass } from "react";

const NodeView = createClass({
    render: function() {
        const { node } = this.props;

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                { node ? 
                    <div
                        style={{
                            padding: 20,
                            backgroundColor: "white"
                        }}>
                        TESTING! { node.get("title") }
                    </div>
                : null }
            </div>
        );
    }
});

export default NodeView;
