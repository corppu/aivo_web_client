import React, { createClass } from "react";

const NodeView = createClass({
    render: function() {
        const { id } = this.props;

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "white",
                    opacity: 0.95,
                }}>
                TESTING! { id }
            </div>
        );
    }
});

export default NodeView;
